import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { type User } from 'firebase/auth';
import {
  subscribeToAuthState,
  signOut as firebaseSignOut,
  getCurrentUser,
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
  const [status, setStatus] = useState<AuthStatus>('loading');

  // ── Subscribe to Firebase auth state ────────────────────────
  useEffect(() => {
    if (IS_DEV_BYPASS) {
      // In dev bypass, start unauthenticated so the welcome/auth screens show
      setStatus('unauthenticated');
      return;
    }

    const unsubscribe = subscribeToAuthState(async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setProfileState(null);
        setStatus('unauthenticated');
        return;
      }

      // User is signed in — try to fetch their owner profile from Firestore
      try {
        const fetchedProfile = await fetchOwnerProfile(user.uid);
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
    setProfileState(newProfile);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    if (IS_DEV_BYPASS) {
      setFirebaseUser(null);
      setProfileState(null);
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
      signOut,
    }),
    [firebaseUser, profile, status, isOnboarded, setProfile, signOut],
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

// ─────────────────────────────────────────────────────────────
//  Firestore profile fetch (stub — will wire real Firestore later)
// ─────────────────────────────────────────────────────────────

async function fetchOwnerProfile(uid: string): Promise<OwnerProfile | null> {
  // TODO: Replace with real Firestore call:
  // const doc = await getDoc(doc(db, 'ownerProfiles', uid));
  // return doc.exists() ? (doc.data() as OwnerProfile) : null;

  // For now, return null so the name-setup screen is always shown on first sign-in
  void uid;
  return null;
}
