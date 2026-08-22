import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ProfessionalProfile } from '@furr/core';
import {
  devProfessionalProfiles,
  getProfessionalProfile,
  signInWithEmail,
  signOut as firebaseSignOut,
  subscribeToAuthState,
  IS_DEV_BYPASS,
} from '@furr/firebase';

type VetAuthContextValue = {
  user: { uid: string; email: string | null } | null;
  profile: ProfessionalProfile | null;
  isOnDuty: boolean;
  setIsOnDuty: (val: boolean) => void;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const VetAuthContext = createContext<VetAuthContextValue | null>(null);

export function VetAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ uid: string; email: string | null } | null>(null);
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuthState(async (fbUser: { uid: string; email: string | null } | null) => {
      if (fbUser) {
        setUser({ uid: fbUser.uid, email: fbUser.email });
        const p = await getProfessionalProfile(fbUser.uid);
        if (p) {
          setProfile(p);
        } else if (IS_DEV_BYPASS) {
          setProfile(devProfessionalProfiles[0]);
        } else {
          // Non-vet authenticated user in production (HIGH-014)
          setProfile(null);
        }
      } else {
        if (IS_DEV_BYPASS) {
          // Dev bypass default profile only in development (CRIT-002)
          setUser({ uid: devProfessionalProfiles[0].uid, email: devProfessionalProfiles[0].email });
          setProfile(devProfessionalProfiles[0]);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async (email: string, pass: string) => {
    try {
      await signInWithEmail(email, pass);
    } catch (err) {
      if (IS_DEV_BYPASS) {
        // Dev fallback in local dev only
        const found = devProfessionalProfiles.find(
          (p: ProfessionalProfile) => p.email.toLowerCase() === email.toLowerCase()
        ) || devProfessionalProfiles[0];
        setUser({ uid: found.uid, email: found.email });
        setProfile(found);
      } else {
        // In production, throw error (CRIT-003)
        throw err;
      }
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    await firebaseSignOut().catch(() => {});
  };

  return (
    <VetAuthContext.Provider
      value={{
        user,
        profile,
        isOnDuty,
        setIsOnDuty,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </VetAuthContext.Provider>
  );
}

export function useVetAuth() {
  const ctx = useContext(VetAuthContext);
  if (!ctx) throw new Error('useVetAuth must be used inside <VetAuthProvider>');
  return ctx;
}
