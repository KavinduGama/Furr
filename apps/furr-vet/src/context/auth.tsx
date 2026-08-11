'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ProfessionalProfile } from '@furr/core';
import { getProfessionalProfile } from '@furr/firebase'; // I will implement this in firebase package next

type AuthContextValue = {
  firebaseUser: { uid: string; email: string } | null;
  profile: ProfessionalProfile | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  profile: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<{ uid: string; email: string } | null>(null);
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dev-bypass mock auth for Vet Portal
    const mockUid = 'vet_dev_001';
    setFirebaseUser({ uid: mockUid, email: 'dr.smith@example.com' });
    
    getProfessionalProfile(mockUid).then((p) => {
      setProfile(p);
      setIsLoading(false);
    }).catch((e) => {
      console.error(e);
      setIsLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
