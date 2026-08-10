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

export function firebaseOptionsFromEnvironment(
  environment: Record<string, string | undefined>,
): FirebaseOptions | null {
  const values = requiredFirebaseKeys.map((key) => environment[key]);
  if (values.some((value) => !value)) return null;

  return {
    apiKey: environment.EXPO_PUBLIC_FIREBASE_API_KEY!,
    authDomain: environment.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: environment.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: environment.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    appId: environment.EXPO_PUBLIC_FIREBASE_APP_ID!,
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
  signOut,
  subscribeToAuthState,
  getCurrentUser,
  clearRecaptchaVerifier,
  DevConfirmationResult,
  DEV_BYPASS_CODE,
} from './auth';

// ── Re-exports from pet repository ───────────────────────────

export {
  subscribeToPets,
  createPet,
  updatePet,
  archivePet,
  restorePet,
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
} from './health';
