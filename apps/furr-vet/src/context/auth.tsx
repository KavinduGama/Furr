'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ProfessionalProfile } from '@furr/core';
import {
  devProfessionalProfiles,
  firebaseOptionsFromEnvironment,
  getProfessionalProfile,
  initFirebase,
  signInWithEmail,
  signOut,
  subscribeToAuthState,
} from '@furr/firebase';

type PortalUser = { uid: string; email: string | null };

type AuthContextValue = {
  firebaseUser: PortalUser | null;
  profile: ProfessionalProfile | null;
  isLoading: boolean;
  isPreview: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const firebaseEnabled = initFirebase(firebaseOptionsFromEnvironment({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}));

const isDev = process.env.NODE_ENV === 'development';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<PortalUser | null>(null);
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // CRIT-B: Only allow dev auto-auth in development environment (never in production)
    if (!firebaseEnabled) {
      if (isDev) {
        void getProfessionalProfile('vet_dev_001').then((nextProfile) => {
          setFirebaseUser({ uid: 'vet_dev_001', email: 'dr.smith@example.com' });
          setProfile(nextProfile);
          setIsLoading(false);
        });
      } else {
        // In production, if Firebase is not configured, show error — do NOT auto-authenticate
        setError('Firebase is not configured. Please contact your administrator.');
        setIsLoading(false);
      }
      return;
    }

    const unsubscribe = subscribeToAuthState(async (user) => {
      setError(null);
      setFirebaseUser(user ? { uid: user.uid, email: user.email } : null);
      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }
      try {
        const nextProfile = await getProfessionalProfile(user.uid);
        if (!nextProfile || nextProfile.status !== 'ACTIVE') {
          setProfile(null);
          setError('This account is not an active verified professional profile.');
        } else {
          setProfile(nextProfile);
        }
      } catch {
        setProfile(null);
        setError('We could not verify this professional profile.');
      } finally {
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    firebaseUser,
    profile,
    isLoading,
    isPreview: !firebaseEnabled && isDev,
    error,
    signIn: async (email, password) => {
      setError(null);
      try {
        await signInWithEmail(email, password);
      } catch (err) {
        // CRIT-A: Only fall back to dev profiles in development — in production, throw the error
        if (isDev) {
          const mockProfile = devProfessionalProfiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) || devProfessionalProfiles[0];
          setFirebaseUser({ uid: mockProfile.uid, email: mockProfile.email });
          setProfile(mockProfile);
        } else {
          setError('Invalid credentials. Please check your email and password.');
          throw err;
        }
      }
    },
    signOut: async () => {
      setFirebaseUser(null);
      setProfile(null);
      if (firebaseEnabled) {
        await signOut().catch(() => {});
      }
    },
  }), [error, firebaseUser, isLoading, profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
