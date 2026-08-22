// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Phone OTP auth service
//
//  Uses the Firebase Web JS SDK (firebase@12+).
//  Designed for Expo Go compatibility (no native modules required).
// ─────────────────────────────────────────────────────────────

import {
  getAuth,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type Auth,
  type User,
  type UserCredential,
  type ConfirmationResult,
} from 'firebase/auth';
import { getApp } from 'firebase/app';

// ── reCAPTCHA verifier singleton (web only) ──────────────────

let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Creates (or reuses) an invisible reCAPTCHA verifier.
 * Must be called in a browser context with a mounted DOM element.
 * On React Native, Firebase uses an invisible reCAPTCHA via a web view.
 *
 * @param containerId - ID of an empty <div> in the DOM (web only).
 */
export function getRecaptchaVerifier(containerId = 'recaptcha-container'): RecaptchaVerifier {
  if (recaptchaVerifier) return recaptchaVerifier;

  const auth = getAuth(getApp());
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved — OTP will be sent
    },
    'expired-callback': () => {
      // Reset verifier — call .clear() to remove the DOM element, then null the reference
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
      recaptchaVerifier = null;
    },
  });

  return recaptchaVerifier;
}

/** Clear the verifier — call after auth errors or on unmount. */
export function clearRecaptchaVerifier(): void {
  recaptchaVerifier?.clear();
  recaptchaVerifier = null;
}

// ── Phone OTP ────────────────────────────────────────────────

/**
 * Send a phone OTP.
 * Returns a ConfirmationResult whose `confirm(code)` verifies the OTP.
 *
 * Throws with a typed error code (Firebase AuthError) on failure.
 */
export async function sendPhoneOtp(
  phoneE164: string,
  recaptchaContainerId = 'recaptcha-container',
): Promise<ConfirmationResult> {
  const auth = getAuth(getApp());
  const verifier = getRecaptchaVerifier(recaptchaContainerId);
  return signInWithPhoneNumber(auth, phoneE164, verifier);
}

/**
 * Verify the OTP code from the confirmation result.
 * Returns the signed-in Firebase User on success.
 *
 * Throws FirebaseError with code 'auth/invalid-verification-code'
 * or 'auth/code-expired' on failure.
 */
export async function verifyOtp(
  confirmationResult: ConfirmationResult,
  code: string,
): Promise<User> {
  const result = await confirmationResult.confirm(code);
  return result.user;
}

/** Sign in a professional, customer or administrator using Firebase email/password auth. */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(getAuth(getApp()), email, password);
  return result.user;
}

/** Create a new customer or administrator account using Firebase email/password auth. */
export async function createUserWithEmail(email: string, password: string, displayName?: string): Promise<User> {
  const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
  const result = await createUserWithEmailAndPassword(getAuth(getApp()), email, password);
  if (displayName && result.user) {
    try {
      await updateProfile(result.user, { displayName });
    } catch {
      // ignore
    }
  }
  return result.user;
}

export type { User as AuthUser };

// ── Session ──────────────────────────────────────────────────

/** Sign out the current user. Clears all local session state. */
export async function signOut(): Promise<void> {
  const auth = getAuth(getApp());
  clearRecaptchaVerifier();
  await firebaseSignOut(auth);
}

/**
 * Subscribe to Firebase auth state changes.
 * Returns the unsubscribe function — always call it on cleanup.
 *
 * @example
 * useEffect(() => subscribeToAuthState(setUser), []);
 */
export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  const auth: Auth = getAuth(getApp());
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the currently signed-in Firebase user synchronously.
 * Returns null if not authenticated or Firebase not initialised.
 */
export function getCurrentUser(): User | null {
  try {
    return getAuth(getApp()).currentUser;
  } catch {
    return null;
  }
}

// ── Dev bypass (no Firebase config) ─────────────────────────

/**
 * A mock ConfirmationResult used when Firebase is not configured in development.
 * Automatically disabled in production environments (MED-001).
 */
const DEV_BYPASS_CODE = '123456';

export class DevConfirmationResult implements ConfirmationResult {
  verificationId = 'dev-bypass';

  async confirm(code: string): Promise<UserCredential> {
    if (process.env.NODE_ENV === 'production') {
      throw Object.assign(new Error('Dev bypass is disabled in production'), { code: 'auth/operation-not-allowed' });
    }
    if (code !== DEV_BYPASS_CODE) {
      throw Object.assign(new Error('Wrong OTP'), { code: 'auth/invalid-verification-code' });
    }
    // Return a minimal mock UserCredential in local development
    const mockUser = {
      uid: 'dev-uid-local',
      phoneNumber: '+94770000000',
      displayName: 'Dev Pet Owner',
      email: null,
      emailVerified: false,
      isAnonymous: false,
    } as unknown as User;
    return {
      user: mockUser,
      providerId: 'phone',
      operationType: 'signIn',
    } as UserCredential;
  }
}
