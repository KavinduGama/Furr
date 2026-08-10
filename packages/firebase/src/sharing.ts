// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Access Grant repository  (SHR-001/002)
//
//  In dev-bypass mode: generates a fake 6-digit code, stores
//  everything in memory. In production, Firestore stores the grant
//  and a Cloud Function would handle one-time redemption.
// ─────────────────────────────────────────────────────────────

import type { AccessGrant, ShareCategory, GrantDuration } from '@furr/core';

const IS_DEV_BYPASS = typeof process !== 'undefined' && !process.env?.EXPO_PUBLIC_FIREBASE_API_KEY;

let devGrants: AccessGrant[] = [];

function devId(): string {
  return `dev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Generate a random 6-char alphanumeric code (uppercase) */
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I ambiguity
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const grantPath = (uid: string) => `ownerGrants/${uid}/grants`;

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
  void (async () => {
    const { getFirestore, collection, query, orderBy, onSnapshot } = await import('firebase/firestore');
    const db = getFirestore();
    const q = query(collection(db, grantPath(ownerUid)), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => { onUpdate(snap.docs.map((d) => d.data() as AccessGrant)); });
  })();
  return () => {};
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
