import type { OwnerProfile } from '@furr/core';

const IS_DEV_BYPASS = typeof process !== 'undefined'
  && !process.env?.EXPO_PUBLIC_FIREBASE_API_KEY
  && !process.env?.NEXT_PUBLIC_FIREBASE_API_KEY;

function toIso(value: unknown, fallback: string): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return fallback;
}

export async function getOwnerProfile(uid: string): Promise<OwnerProfile | null> {
  if (IS_DEV_BYPASS) return null;

  const { getFirestore, doc, getDoc } = await import('firebase/firestore');
  const snapshot = await getDoc(doc(getFirestore(), 'users', uid));
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return { ...data, uid, createdAt: toIso(data.createdAt, new Date().toISOString()) } as OwnerProfile;
}

/**
 * Persist the owner profile to Firestore.
 *
 * Uses `setDoc` with `{ merge: true }` but intentionally omits `createdAt`
 * from the payload so it is only ever written by the initial `create` path
 * in the auth flow (Cloud Function or first-save logic). This prevents
 * profile updates from overwriting the original account creation timestamp.
 */
export async function saveOwnerProfile(profile: OwnerProfile): Promise<void> {
  if (IS_DEV_BYPASS) return;

  const { getFirestore, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const { uid, createdAt: _createdAt, ...rest } = profile; // exclude createdAt
  await setDoc(doc(getFirestore(), 'users', uid), {
    ...rest,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Write the initial owner profile when the account is first created.
 * Unlike `saveOwnerProfile`, this sets `createdAt` using a server timestamp.
 * Call this ONCE from the name-setup screen after phone verification.
 */
export async function createOwnerProfile(profile: OwnerProfile): Promise<void> {
  if (IS_DEV_BYPASS) return;

  const { getFirestore, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const { uid, ...data } = profile;
  await setDoc(doc(getFirestore(), 'users', uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
