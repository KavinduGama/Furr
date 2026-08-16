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
 * access grant code. This performs a secure collectionGroup query across all
 * owner grant subcollections.
 */
export const redeemGrantCode = onCall<RedeemGrantInput>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in as a veterinary professional.');
  }

  const code = request.data.code?.trim().toUpperCase();
  if (!code || code.length < 6) {
    throw new HttpsError('invalid-argument', 'A valid 6-character redemption code is required.');
  }

  const db = admin.firestore();
  const now = new Date();

  const grantsQuery = await db
    .collectionGroup('grants')
    .where('redemptionCode', '==', code)
    .limit(1)
    .get();

  if (grantsQuery.empty) {
    throw new HttpsError('not-found', 'Invalid access code or code does not exist.');
  }

  const grantDoc = grantsQuery.docs[0];
  const grantData = grantDoc.data() as AccessGrant;

  if (grantData.status === 'redeemed') {
    // If already redeemed by this same vet and still valid, allow re-entry
    if (
      grantData.redeemedByUid === request.auth.uid &&
      grantData.grantExpiresAt &&
      new Date(grantData.grantExpiresAt) > now
    ) {
      return { success: true, grant: grantData };
    }
    throw new HttpsError('failed-precondition', 'This access code has already been redeemed.');
  }

  if (grantData.status !== 'active') {
    throw new HttpsError('failed-precondition', `This access code is ${grantData.status}.`);
  }

  if (new Date(grantData.codeExpiresAt) < now) {
    await grantDoc.ref.update({ status: 'expired' });
    throw new HttpsError('deadline-exceeded', 'This access code has expired. Please ask the owner for a new code.');
  }

  // Calculate grant expiry based on duration ('24h' | '7d')
  const durationMs = grantData.duration === '7d' ? 7 * 86400000 : 86400000;
  const grantExpiresAt = new Date(now.getTime() + durationMs).toISOString();

  const updatedFields = {
    status: 'redeemed' as const,
    redeemedByUid: request.auth.uid,
    redeemedAt: now.toISOString(),
    grantExpiresAt,
    updatedAt: now.toISOString(),
  };

  await grantDoc.ref.update(updatedFields);

  const updatedGrant: AccessGrant = {
    ...grantData,
    ...updatedFields,
  };

  return {
    success: true,
    grant: updatedGrant,
  };
});
