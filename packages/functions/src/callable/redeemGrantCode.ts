import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import type { AccessGrant } from '@furr/core';

export interface RedeemGrantInput {
  code: string;
}

export interface RedeemGrantResponse {
  success: boolean;
  grant: AccessGrant;
}

/**
 * Callable function for veterinarians to redeem an owner-generated 6-character
 * access grant code. Uses transactions to prevent race conditions (HIGH-005)
 * and includes rate-limiting against brute force attacks (MED-005).
 */
export const redeemGrantCode = onCall<RedeemGrantInput>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in as a veterinary professional.');
  }

  const callerUid = request.auth.uid;
  const code = request.data.code?.trim().toUpperCase();
  if (!code || code.length < 6) {
    throw new HttpsError('invalid-argument', 'A valid 6-character redemption code is required.');
  }

  const db = admin.firestore();
  const now = new Date();

  // Rate Limiting (MED-005): Max 10 attempts per 5 minutes per user
  const rateLimitRef = db.collection('grant_redemption_attempts').doc(callerUid);
  const rateLimitDoc = await rateLimitRef.get();
  if (rateLimitDoc.exists) {
    const data = rateLimitDoc.data()!;
    const lastAttemptTime = new Date(data.lastAttemptAt || 0).getTime();
    const isWithinWindow = now.getTime() - lastAttemptTime < 5 * 60 * 1000;
    if (isWithinWindow && data.count >= 10) {
      throw new HttpsError(
        'resource-exhausted',
        'Too many redemption attempts. Please wait 5 minutes before trying again.'
      );
    }
  }

  // Find the grant document reference first
  const grantsQuery = await db
    .collectionGroup('grants')
    .where('redemptionCode', '==', code)
    .limit(1)
    .get();

  if (grantsQuery.empty) {
    // Record failed attempt for rate limiting
    await rateLimitRef.set({
      callerUid,
      count: admin.firestore.FieldValue.increment(1),
      lastAttemptAt: now.toISOString(),
    }, { merge: true });
    throw new HttpsError('not-found', 'Invalid access code or code does not exist.');
  }

  const grantDocRef = grantsQuery.docs[0].ref;

  // Execute read-check-update inside an atomic transaction (HIGH-005)
  const resultGrant = await db.runTransaction(async (transaction) => {
    const grantDoc = await transaction.get(grantDocRef);
    if (!grantDoc.exists) {
      throw new HttpsError('not-found', 'Access grant document was deleted.');
    }

    const grantData = grantDoc.data() as AccessGrant;

    if (grantData.status === 'redeemed') {
      if (
        grantData.redeemedByUid === callerUid &&
        grantData.grantExpiresAt &&
        new Date(grantData.grantExpiresAt) > now
      ) {
        return grantData;
      }
      throw new HttpsError('failed-precondition', 'This access code has already been redeemed by another practitioner.');
    }

    if (grantData.status !== 'active') {
      throw new HttpsError('failed-precondition', `This access code is ${grantData.status}.`);
    }

    if (new Date(grantData.codeExpiresAt) < now) {
      transaction.update(grantDocRef, { status: 'expired', updatedAt: now.toISOString() });
      throw new HttpsError('deadline-exceeded', 'This access code has expired. Please ask the owner for a new code.');
    }

    // Calculate grant expiry based on duration ('24h' | '7d')
    const durationMs = grantData.duration === '7d' ? 7 * 86400000 : 86400000;
    const grantExpiresAt = new Date(now.getTime() + durationMs).toISOString();

    const updatedFields = {
      status: 'redeemed' as const,
      redeemedByUid: callerUid,
      redeemedAt: now.toISOString(),
      grantExpiresAt,
      updatedAt: now.toISOString(),
    };

    transaction.update(grantDocRef, updatedFields);

    // Also write deterministic doc ID for direct Firestore security rules (CRIT-010)
    const directGrantRef = db.doc(`users/${grantData.ownerUid}/grants/${callerUid}_${grantData.petId}`);
    transaction.set(directGrantRef, {
      ...grantData,
      ...updatedFields,
      id: `${callerUid}_${grantData.petId}`,
    }, { merge: true });

    return {
      ...grantData,
      ...updatedFields,
    };
  });

  // Reset rate limiting on successful redemption
  await rateLimitRef.delete().catch(() => {});

  return {
    success: true,
    grant: resultGrant,
  };
});
