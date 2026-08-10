// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Firestore pet repository
//
//  All Firestore calls are wrapped here. The owner app never
//  imports from 'firebase/firestore' directly — only from here.
//  Dev bypass is active when no Firebase config is detected.
// ─────────────────────────────────────────────────────────────

import type { Pet } from '@furr/core';

// ── Dev-bypass in-memory store ────────────────────────────────

const IS_DEV_BYPASS = typeof process !== 'undefined' && !process.env?.EXPO_PUBLIC_FIREBASE_API_KEY;

let devPets: Pet[] = [];

function devId(): string {
  return `dev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Firestore paths ───────────────────────────────────────────

// Collection: ownerPets/{uid}/pets/{petId}
function petsPath(ownerUid: string) {
  return `ownerPets/${ownerUid}/pets`;
}

// ── Repository ───────────────────────────────────────────────

/**
 * Subscribe to all active (non-archived) pets for an owner.
 * Returns an unsubscribe function.
 */
export function subscribeToPets(
  ownerUid: string,
  onUpdate: (pets: Pet[]) => void,
): () => void {
  if (IS_DEV_BYPASS) {
    // Synchronously return current dev pets, then do nothing more
    onUpdate([...devPets]);
    return () => {};
  }

  // Real Firestore — lazy-import to avoid bundling when not needed
  void (async () => {
    try {
      const { getFirestore, collection, query, where, orderBy, onSnapshot } = await import(
        'firebase/firestore'
      );
      const db = getFirestore();
      const q = query(
        collection(db, petsPath(ownerUid)),
        where('status', '==', 'active'),
        orderBy('createdAt', 'asc'),
      );
      const unsub = onSnapshot(q, (snap) => {
        const pets = snap.docs.map((d) => d.data() as Pet);
        onUpdate(pets);
      });
      return unsub;
    } catch (err) {
      console.error('[furr/firebase] subscribeToPets error', err);
      onUpdate([]);
      return () => {};
    }
  })();

  return () => {};
}

/**
 * Create a new pet document.
 * Returns the created pet (with server-assigned id and timestamps).
 */
export async function createPet(
  ownerUid: string,
  data: Omit<Pet, 'id' | 'ownerUid' | 'createdAt' | 'updatedAt'>,
): Promise<Pet> {
  const now = new Date().toISOString();

  if (IS_DEV_BYPASS) {
    const pet: Pet = {
      ...data,
      id: devId(),
      ownerUid,
      createdAt: now,
      updatedAt: now,
    };
    devPets = [...devPets, pet];
    return pet;
  }

  const { getFirestore, collection, doc, setDoc, serverTimestamp } = await import(
    'firebase/firestore'
  );
  const db = getFirestore();
  const ref = doc(collection(db, petsPath(ownerUid)));
  const pet: Pet = {
    ...data,
    id: ref.id,
    ownerUid,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(ref, { ...pet, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return pet;
}

/**
 * Update permitted fields on an existing pet.
 */
export async function updatePet(
  ownerUid: string,
  petId: string,
  updates: Partial<Omit<Pet, 'id' | 'ownerUid' | 'createdAt'>>,
): Promise<void> {
  const now = new Date().toISOString();

  if (IS_DEV_BYPASS) {
    devPets = devPets.map((p) =>
      p.id === petId ? { ...p, ...updates, updatedAt: now } : p,
    );
    return;
  }

  const { getFirestore, doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  const db = getFirestore();
  await updateDoc(doc(db, petsPath(ownerUid), petId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Archive a pet (soft delete). Records remain intact.
 */
export async function archivePet(ownerUid: string, petId: string): Promise<void> {
  return updatePet(ownerUid, petId, { status: 'archived' });
}

/**
 * Restore an archived pet.
 */
export async function restorePet(ownerUid: string, petId: string): Promise<void> {
  return updatePet(ownerUid, petId, { status: 'active' });
}
