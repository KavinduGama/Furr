// ─────────────────────────────────────────────────────────────
//  @furr/firebase — public exports
// ─────────────────────────────────────────────────────────────

import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';

// ── Config ───────────────────────────────────────────────────

export const requiredFirebaseKeys = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const;

/**
 * Build FirebaseOptions from environment variables.
 * Supports both EXPO_PUBLIC_ (React Native) and NEXT_PUBLIC_ (Next.js) prefixes.
 */
export function firebaseOptionsFromEnvironment(
  environment: Record<string, string | undefined>,
): FirebaseOptions | null {
  // Try EXPO_PUBLIC_ first, then NEXT_PUBLIC_ (for web portals)
  const apiKey = environment.EXPO_PUBLIC_FIREBASE_API_KEY || environment.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = environment.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || environment.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = environment.EXPO_PUBLIC_FIREBASE_PROJECT_ID || environment.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = environment.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || environment.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const appId = environment.EXPO_PUBLIC_FIREBASE_APP_ID || environment.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !appId) return null;

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: storageBucket || '',
    appId,
  };
}


// ── Init ─────────────────────────────────────────────────────

/**
 * Initialise Firebase. Safe to call multiple times — only initialises once.
 * Returns true if using a real Firebase config, false if in dev-bypass mode.
 */
export function initFirebase(options: FirebaseOptions | null): boolean {
  if (!options) return false;
  if (getApps().length === 0) {
    initializeApp(options);
  }
  return true;
}

// ── Re-exports from auth service ─────────────────────────────

export {
  sendPhoneOtp,
  verifyOtp,
  signInWithEmail,
  signOut,
  subscribeToAuthState,
  getCurrentUser,
  clearRecaptchaVerifier,
  DevConfirmationResult,
  DEV_BYPASS_CODE,
} from './auth';

export { getOwnerProfile, saveOwnerProfile, createOwnerProfile } from './owner-profile';

// ── Re-exports from pet repository ───────────────────────────

export {
  subscribeToPets,
  createPet,
  updatePet,
  archivePet,
  restorePet,
  getPet,
} from './pets';

// ── Re-exports from health repositories ──────────────────────

export {
  subscribeToVaccinations,
  createVaccination,
  updateVaccination,
  archiveVaccination,
  subscribeToMedications,
  createMedication,
  deactivateMedication,
  subscribeToWeightEntries,
  createWeightEntry,
  deleteWeightEntry,
  subscribeToObservations,
  createObservation,
  subscribeToFlags,
  createFlag,
} from './health';

// ── Re-exports from storage ───────────────────────────────────

export type { UploadInput } from './storage';
export {
  uploadDocument,
  subscribeToDocuments,
  archiveDocument,
} from './storage';

// ── Re-exports from sharing ───────────────────────────────────

export {
  createAccessGrant,
  subscribeToGrants,
  revokeGrant,
  redeemGrant,
  getVetActiveGrants,
  getGrant,
} from './sharing';

// ── Re-exports from vet ───────────────────────────────────────

export {
  getProfessionalProfile,
  devProfessionalProfiles,
} from './vet';

// ── Re-exports from reminders ─────────────────────────────────

export * from './routines';
export * from './expenses';
export * from './marketplace';
export * from './services';
export * from './telemedicine';
export * from './community';
export * from './care';
export * from './lostfound';

// Reminders live at `@furr/firebase/src/reminders` because they import the
// Expo-only notification runtime. Keeping that out of this entry point keeps
// the shared package safe to import from the Next.js portals.
