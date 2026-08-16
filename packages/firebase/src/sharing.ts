// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Access Grant repository  (SHR-001/002)
//
//  In dev-bypass mode: generates a fake 6-digit code, stores
//  everything in memory. In production, Firestore stores the grant
//  and a Cloud Function would handle one-time redemption.
// ─────────────────────────────────────────────────────────────

import type { AccessGrant, ShareCategory, GrantDuration } from '@furr/core';

const IS_DEV_BYPASS = typeof process !== 'undefined' && !process.env?.EXPO_PUBLIC_FIREBASE_API_KEY && !process.env?.NEXT_PUBLIC_FIREBASE_API_KEY;

let devGrants: AccessGrant[] = [];

function devId(): string {
  return `dev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Generate a random 6-char alphanumeric code (uppercase) */
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I ambiguity
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const grantPath = (uid: string) => `users/${uid}/grants`;

// ─────────────────────────────────────────────────────────────
//  Create grant  (SHR-001)
// ─────────────────────────────────────────────────────────────

export async function createAccessGrant(
  ownerUid: string,
  petId: string,
  categories: ShareCategory[],
  duration: GrantDuration,
): Promise<AccessGrant> {
  const now = new Date();
  const nowIso = now.toISOString();

  // Redemption code expires in 15 minutes
  const codeExpiry = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

  const grant: AccessGrant = {
    id: devId(),
    petId,
    ownerUid,
    redemptionCode: generateCode(),
    codeExpiresAt: codeExpiry,
    purpose: 'veterinary_care',
    categories,
    duration,
    status: 'active',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  if (IS_DEV_BYPASS) {
    devGrants = [grant, ...devGrants];
    return grant;
  }

  const { getFirestore, collection, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const db = getFirestore();
  const ref = doc(collection(db, grantPath(ownerUid)));
  const firestoreGrant = { ...grant, id: ref.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  await setDoc(ref, firestoreGrant);
  return { ...grant, id: ref.id };
}

// ─────────────────────────────────────────────────────────────
//  Subscribe to grants  (SHR-002)
// ─────────────────────────────────────────────────────────────

export function subscribeToGrants(
  ownerUid: string,
  onUpdate: (grants: AccessGrant[]) => void,
): () => void {
  if (IS_DEV_BYPASS) {
    // Also auto-expire codes in dev mode
    const tick = () => {
      const now = new Date().toISOString();
      devGrants = devGrants.map((g) => {
        if (g.status === 'active' && g.codeExpiresAt < now && !g.redeemedAt) {
          return { ...g, status: 'expired' as const, updatedAt: now };
        }
        return g;
      });
      onUpdate(devGrants.filter((g) => g.ownerUid === ownerUid));
    };
    tick();
    const interval = setInterval(tick, 10000); // refresh every 10s in dev
    return () => clearInterval(interval);
  }
  // Capture the real unsubscribe so it can be called on cleanup.
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, orderBy, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(collection(db, grantPath(ownerUid)), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snap) => {
        onUpdate(snap.docs.map((d) => d.data() as AccessGrant));
      });
    } catch (err) {
      console.error('[furr/firebase] subscribeToGrants error', err);
      if (active) onUpdate([]);
    }
  })();

  return () => {
    active = false;
    unsubscribe?.();
  };
}

// ─────────────────────────────────────────────────────────────
//  Revoke grant  (SHR-002)
// ─────────────────────────────────────────────────────────────

export async function revokeGrant(ownerUid: string, grantId: string): Promise<void> {
  const now = new Date().toISOString();
  if (IS_DEV_BYPASS) {
    devGrants = devGrants.map((g) =>
      g.id === grantId ? { ...g, status: 'revoked' as const, revokedAt: now, revokedByUid: ownerUid, updatedAt: now } : g,
    );
    return;
  }
  const { getFirestore, doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  await updateDoc(doc(getFirestore(), grantPath(ownerUid), grantId), {
    status: 'revoked',
    revokedAt: now,
    revokedByUid: ownerUid,
    updatedAt: serverTimestamp(),
  });
}

// ─────────────────────────────────────────────────────────────
//  Vet Portal: Redeem grant (PRO-002)
// ─────────────────────────────────────────────────────────────

export async function redeemGrant(code: string, vetUid: string): Promise<AccessGrant> {
  const now = new Date().toISOString();
  if (IS_DEV_BYPASS) {
    const grantIndex = devGrants.findIndex(
      (g) => g.redemptionCode === code && g.status === 'active' && g.codeExpiresAt > now && !g.redeemedAt
    );
    if (grantIndex === -1) throw new Error('Invalid or expired code');
    
    const durationMs = devGrants[grantIndex].duration === '7d'
      ? 7 * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;
    const grantExpiresAt = new Date(Date.now() + durationMs).toISOString();
    
    const redeemedGrant: AccessGrant = {
      ...devGrants[grantIndex],
      redeemedAt: now,
      redeemedByUid: vetUid,
      grantExpiresAt,
      status: 'redeemed',
      updatedAt: now,
    };
    devGrants[grantIndex] = redeemedGrant;
    return redeemedGrant;
  }
  
  // Real Firestore logic would use a Cloud Function because we need to query by code across all users,
  // or use a root collection for `redemptionCodes` -> point to owner grant.
  // For MVP, we will rely on Dev-Bypass.
  throw new Error('Not implemented for real Firestore yet (requires Cloud Functions)');
}

export async function getVetActiveGrants(vetUid: string): Promise<AccessGrant[]> {
  const now = new Date().toISOString();
  if (IS_DEV_BYPASS) {
    return devGrants.filter(
      (g) => g.redeemedByUid === vetUid && g.status === 'redeemed' && g.grantExpiresAt && g.grantExpiresAt > now
    );
  }
  return [];
}

export async function getGrant(grantId: string): Promise<AccessGrant | null> {
  if (IS_DEV_BYPASS) {
    return devGrants.find((g) => g.id === grantId) || null;
  }
  return null; // For MVP, dev bypass only
}
