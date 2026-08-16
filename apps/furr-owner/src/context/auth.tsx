import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { type ConfirmationResult, type User } from 'firebase/auth';
import {
  subscribeToAuthState,
  signOut as firebaseSignOut,
  getOwnerProfile,
} from '@furr/firebase';
import type { OwnerProfile } from '@furr/core';

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';

interface AuthContextValue {
  /** The raw Firebase user — null if not signed in. */
  firebaseUser: User | null;
  /** The Firestore owner profile — null until loaded or if new user. */
  profile: OwnerProfile | null;
  /** Overall auth readiness. "loading" = first check not done yet. */
  status: AuthStatus;
  /** Convenience: true while status === 'loading'. */
  isLoading: boolean;
  /** True when the user is signed in AND has a display name set. */
  isOnboarded: boolean;
  /**
   * Called by the name-setup screen after creating the Firestore profile.
   * Lets us avoid a refetch by injecting the new profile directly.
   */
  setProfile: (profile: OwnerProfile) => void;
  /** Keeps the non-serialisable Firebase OTP confirmation between auth screens. */
  otpConfirmation: ConfirmationResult | null;
  setOtpConfirmation: (confirmation: ConfirmationResult | null) => void;
  /** Keeps the phone number with its verification session when web routing drops query params. */
  otpPhone: string | null;
  setOtpPhone: (phone: string | null) => void;
  /** Allows local UI review without granting production access. */
  isLocalPreview: boolean;
  /** True only after the development-only preview entry was selected. */
  isPreviewSession: boolean;
  startPreviewSession: (phoneE164: string) => void;
  /** Sign out and clear all state. */
  signOut: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────
//  Context
// ─────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─────────────────────────────────────────────────────────────
//  Dev bypass helpers
//  When Firebase is not configured, we use a local mock user so
//  all screens can be developed/tested without credentials.
// ─────────────────────────────────────────────────────────────

const IS_DEV_BYPASS = !process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const IS_LOCAL_PREVIEW = process.env.NODE_ENV === 'development';

const DEV_MOCK_PROFILE: OwnerProfile = {
  uid: 'dev-uid-local',
  displayName: null,           // null triggers name-setup screen
  phoneE164: '+94770000000',
  timezone: 'Asia/Colombo',
  notificationsEnabled: true,
  termsAcceptedAt: new Date().toISOString(),
  termsVersion: '2026-08-01',
  createdAt: new Date().toISOString(),
  accountStatus: 'active',
};

// ─────────────────────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────────────────────

export function AuthProvider({ children }: PropsWithChildren) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfileState] = useState<OwnerProfile | null>(null);
  const [otpConfirmation, setOtpConfirmation] = useState<ConfirmationResult | null>(null);
  const [otpPhone, setOtpPhone] = useState<string | null>(null);
  const [isPreviewSession, setIsPreviewSession] = useState(false);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // ── Subscribe to Firebase auth state ────────────────────────
  useEffect(() => {
    if (IS_DEV_BYPASS) {
      // In dev bypass, start unauthenticated so the welcome/auth screens show
      setStatus('unauthenticated');
      return;
    }

    const unsubscribe = subscribeToAuthState(async (user) => {
      setIsPreviewSession(false);
      setFirebaseUser(user);

      if (!user) {
        setProfileState(null);
        setStatus('unauthenticated');
        return;
      }

      // User is signed in — try to fetch their owner profile from Firestore
      try {
        const fetchedProfile = await getOwnerProfile(user.uid);
        setProfileState(fetchedProfile);
      } catch {
        // Profile fetch failed; treat as new user (profile = null)
        setProfileState(null);
      }

      setStatus('authenticated');
    });

    return unsubscribe;
  }, []);

  const setProfile = useCallback((newProfile: OwnerProfile) => {
    if (IS_DEV_BYPASS) {
      setFirebaseUser({
        uid: newProfile.uid,
        phoneNumber: newProfile.phoneE164,
        displayName: newProfile.displayName,
      } as User);
    }
    setProfileState(newProfile);
    setStatus('authenticated');
  }, []);

  const startPreviewSession = useCallback((phoneE164: string) => {
    if (!IS_LOCAL_PREVIEW) return;
    const previewProfile: OwnerProfile = {
      ...DEV_MOCK_PROFILE,
      uid: 'local-preview-owner',
      displayName: 'Preview owner',
      phoneE164,
    };
    setFirebaseUser({
      uid: previewProfile.uid,
      phoneNumber: previewProfile.phoneE164,
      displayName: previewProfile.displayName,
    } as User);
    setProfileState(previewProfile);
    setIsPreviewSession(true);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    if (IS_DEV_BYPASS) {
      setFirebaseUser(null);
      setProfileState(null);
      setOtpConfirmation(null);
      setOtpPhone(null);
      setIsPreviewSession(false);
      setStatus('unauthenticated');
      return;
    }
    await firebaseSignOut();
    // onAuthStateChanged will handle clearing state
  }, []);

  const isOnboarded = !!profile?.displayName;

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      profile,
      status,
      isLoading: status === 'loading',
      isOnboarded,
      setProfile,
      otpConfirmation,
      setOtpConfirmation,
      otpPhone,
      setOtpPhone,
      isLocalPreview: IS_LOCAL_PREVIEW,
      isPreviewSession,
      startPreviewSession,
      signOut,
    }),
    [firebaseUser, profile, status, isOnboarded, setProfile, otpConfirmation, otpPhone, isPreviewSession, startPreviewSession, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// ─────────────────────────────────────────────────────────────
//  Dev bypass sign-in (called from auth/otp.tsx after mock verify)
// ─────────────────────────────────────────────────────────────

export function useDevBypass() {
  return { IS_DEV_BYPASS, DEV_MOCK_PROFILE };
}

