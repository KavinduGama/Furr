// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Vaccination + Medication repositories
// ─────────────────────────────────────────────────────────────

import type { VaccinationRecord, MedicationPlan } from '@furr/core';

const IS_DEV_BYPASS = typeof process !== 'undefined' && !process.env?.EXPO_PUBLIC_FIREBASE_API_KEY;

// ── Dev-bypass in-memory stores ───────────────────────────────

let devVaccinations: VaccinationRecord[] = [];
let devMedications: MedicationPlan[] = [];

function devId(): string {
  return `dev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Firestore paths ───────────────────────────────────────────

const vacPath = (uid: string, petId: string) => `ownerPets/${uid}/pets/${petId}/vaccinations`;
const medPath = (uid: string, petId: string) => `ownerPets/${uid}/pets/${petId}/medications`;

// ─────────────────────────────────────────────────────────────
//  Vaccinations
// ─────────────────────────────────────────────────────────────

export function subscribeToVaccinations(
  ownerUid: string,
  petId: string,
  onUpdate: (records: VaccinationRecord[]) => void,
): () => void {
  if (IS_DEV_BYPASS) {
    onUpdate(devVaccinations.filter((v) => v.petId === petId && !v.isArchived));
    return () => {};
  }
  void (async () => {
    const { getFirestore, collection, query, where, orderBy, onSnapshot } = await import(
      'firebase/firestore'
    );
    const db = getFirestore();
    const q = query(
      collection(db, vacPath(ownerUid, petId)),
      where('isArchived', '==', false),
      orderBy('administeredOn', 'desc'),
    );
    return onSnapshot(q, (snap) => {
      onUpdate(snap.docs.map((d) => d.data() as VaccinationRecord));
    });
  })();
  return () => {};
}

export async function createVaccination(
  ownerUid: string,
  petId: string,
  data: Omit<VaccinationRecord, 'id' | 'petId' | 'ownerUid' | 'createdAt' | 'updatedAt'>,
): Promise<VaccinationRecord> {
  const now = new Date().toISOString();
  if (IS_DEV_BYPASS) {
    const rec: VaccinationRecord = { ...data, id: devId(), petId, ownerUid, createdAt: now, updatedAt: now };
    devVaccinations = [...devVaccinations, rec];
    return rec;
  }
  const { getFirestore, collection, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const db = getFirestore();
  const ref = doc(collection(db, vacPath(ownerUid, petId)));
  const rec: VaccinationRecord = { ...data, id: ref.id, petId, ownerUid, createdAt: now, updatedAt: now };
  await setDoc(ref, { ...rec, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return rec;
}

export async function updateVaccination(
  ownerUid: string,
  petId: string,
  vacId: string,
  updates: Partial<Omit<VaccinationRecord, 'id' | 'petId' | 'ownerUid' | 'createdAt'>>,
): Promise<void> {
  const now = new Date().toISOString();
  if (IS_DEV_BYPASS) {
    devVaccinations = devVaccinations.map((v) => v.id === vacId ? { ...v, ...updates, updatedAt: now } : v);
    return;
  }
  const { getFirestore, doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  await updateDoc(doc(getFirestore(), vacPath(ownerUid, petId), vacId), { ...updates, updatedAt: serverTimestamp() });
}

export async function archiveVaccination(ownerUid: string, petId: string, vacId: string): Promise<void> {
  return updateVaccination(ownerUid, petId, vacId, { isArchived: true });
}

// ─────────────────────────────────────────────────────────────
//  Medications
// ─────────────────────────────────────────────────────────────

export function subscribeToMedications(
  ownerUid: string,
  petId: string,
  onUpdate: (plans: MedicationPlan[]) => void,
): () => void {
  if (IS_DEV_BYPASS) {
    onUpdate(devMedications.filter((m) => m.petId === petId && m.isActive));
    return () => {};
  }
  void (async () => {
    const { getFirestore, collection, query, where, orderBy, onSnapshot } = await import(
      'firebase/firestore'
    );
    const db = getFirestore();
    const q = query(
      collection(db, medPath(ownerUid, petId)),
      where('isActive', '==', true),
      orderBy('startAt', 'desc'),
    );
    return onSnapshot(q, (snap) => {
      onUpdate(snap.docs.map((d) => d.data() as MedicationPlan));
    });
  })();
  return () => {};
}

export async function createMedication(
  ownerUid: string,
  petId: string,
  data: Omit<MedicationPlan, 'id' | 'petId' | 'ownerUid' | 'createdAt' | 'updatedAt'>,
): Promise<MedicationPlan> {
  const now = new Date().toISOString();
  if (IS_DEV_BYPASS) {
    const plan: MedicationPlan = { ...data, id: devId(), petId, ownerUid, createdAt: now, updatedAt: now };
    devMedications = [...devMedications, plan];
    return plan;
  }
  const { getFirestore, collection, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const db = getFirestore();
  const ref = doc(collection(db, medPath(ownerUid, petId)));
  const plan: MedicationPlan = { ...data, id: ref.id, petId, ownerUid, createdAt: now, updatedAt: now };
  await setDoc(ref, { ...plan, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return plan;
}

export async function deactivateMedication(ownerUid: string, petId: string, medId: string): Promise<void> {
  const now = new Date().toISOString();
  if (IS_DEV_BYPASS) {
    devMedications = devMedications.map((m) => m.id === medId ? { ...m, isActive: false, updatedAt: now } : m);
    return;
  }
  const { getFirestore, doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  await updateDoc(doc(getFirestore(), medPath(ownerUid, petId), medId), { isActive: false, updatedAt: serverTimestamp() });
}
