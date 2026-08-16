import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ProfessionalProfile } from '@furr/core';
import {
  devProfessionalProfiles,
  getProfessionalProfile,
  signInWithEmail,
  signOut as firebaseSignOut,
  subscribeToAuthState,
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
    // Check auth or default to dev profile
    const unsub = subscribeToAuthState(async (fbUser: { uid: string; email: string | null } | null) => {
      if (fbUser) {
        setUser({ uid: fbUser.uid, email: fbUser.email });
        const p = await getProfessionalProfile(fbUser.uid);
        setProfile(p || devProfessionalProfiles[0]);
      } else {
        // Dev default profile
        setUser({ uid: devProfessionalProfiles[0].uid, email: devProfessionalProfiles[0].email });
        setProfile(devProfessionalProfiles[0]);
      }
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async (email: string, pass: string) => {
    try {
      await signInWithEmail(email, pass);
    } catch {
      // Dev fallback
      const found = devProfessionalProfiles.find((p: ProfessionalProfile) => p.email.toLowerCase() === email.toLowerCase()) || devProfessionalProfiles[0];
      setUser({ uid: found.uid, email: found.email });
      setProfile(found);
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
