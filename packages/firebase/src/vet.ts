import type { ProfessionalProfile, ProfessionalStatus } from '@furr/core';

const IS_DEV_BYPASS = typeof process !== 'undefined' && !process.env?.NEXT_PUBLIC_FIREBASE_API_KEY && !process.env?.EXPO_PUBLIC_FIREBASE_API_KEY;

// Mock Dev Data
export const devProfessionalProfiles: ProfessionalProfile[] = [
  {
    uid: 'vet_dev_001',
    fullName: 'Dr. Sarah Smith',
    registrationNumber: 'VET-12345',
    email: 'dr.smith@example.com',
    phone: '+94771234567',
    district: 'Colombo',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export async function getProfessionalProfile(uid: string): Promise<ProfessionalProfile | null> {
  if (IS_DEV_BYPASS) {
    return devProfessionalProfiles.find((p) => p.uid === uid) || null;
  }
  const { getFirestore, doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(getFirestore(), 'professionals', uid));
  if (!snap.exists()) return null;
  return snap.data() as ProfessionalProfile;
}
