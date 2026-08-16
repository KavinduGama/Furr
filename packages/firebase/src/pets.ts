// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Firestore pet repository
//
//  All Firestore calls are wrapped here. The owner app never
//  imports from 'firebase/firestore' directly — only from here.
//  Dev bypass is active when no Firebase config is detected.
// ─────────────────────────────────────────────────────────────

import type { Pet } from '@furr/core';
import { IS_DEV_BYPASS } from './env';

let devPets: Pet[] = [];
const devSubscribers = new Set<{ ownerUid: string; onUpdate: (pets: Pet[]) => void }>();

function notifyDevSubscribers(): void {
  for (const subscriber of devSubscribers) {
    subscriber.onUpdate(devPets.filter((pet) => pet.ownerUid === subscriber.ownerUid && pet.status === 'active'));
  }
}

function toIso(value: unknown, fallback: string): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return fallback;
}

function normalisePet(data: Record<string, unknown>, id: string): Pet {
  const now = new Date().toISOString();
  return {
    ...data,
    id,
    createdAt: toIso(data.createdAt, now),
    updatedAt: toIso(data.updatedAt, now),
  } as Pet;
}

function devId(): string {
  return `dev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Firestore paths ───────────────────────────────────────────

// Collection: users/{uid}/pets/{petId}
function petsPath(ownerUid: string) {
  return `users/${ownerUid}/pets`;
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
    const subscriber = { ownerUid, onUpdate };
    devSubscribers.add(subscriber);
    notifyDevSubscribers();
    return () => devSubscribers.delete(subscriber);
  }

  // Real Firestore — lazy-import to avoid bundling when not needed
  let unsubscribe: (() => void) | undefined;
  let active = true;
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
      unsubscribe = onSnapshot(q, (snap) => {
        const pets = snap.docs.map((d) => normalisePet(d.data(), d.id));
        onUpdate(pets);
      }, () => active && onUpdate([]));
    } catch (err) {
      console.error('[furr/firebase] subscribeToPets error', err);
      onUpdate([]);
    }
  })();

  return () => { active = false; unsubscribe?.(); };
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
    notifyDevSubscribers();
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
    notifyDevSubscribers();
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

/**
 * Get a specific pet.
 */
export async function getPet(ownerUid: string, petId: string): Promise<Pet | null> {
  if (IS_DEV_BYPASS) {
    return devPets.find((p) => p.ownerUid === ownerUid && p.id === petId) || null;
  }
  const { getFirestore, doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(getFirestore(), petsPath(ownerUid), petId));
  if (!snap.exists()) return null;
  return snap.data() as Pet;
}
