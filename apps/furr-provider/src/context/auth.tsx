import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, signOut as firebaseSignOut, DEV_BYPASS_CODE } from '@furr/firebase';

interface ProviderAuthContextType {
  user: { uid: string; phone: string } | null;
  isLoading: boolean;
  signInDev: (phone?: string) => void;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const ProviderAuthContext = createContext<ProviderAuthContextType | undefined>(undefined);

export function ProviderAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ uid: string; phone: string } | null>({
    uid: 'prov-1',
    phone: '+94 77 123 4567',
  });
  const [isLoading, setIsLoading] = useState(false);

  const signInDev = (phone: string = '+94 77 123 4567') => {
    setUser({
      uid: 'prov-1',
      phone,
    });
  };

  const signOut = async () => {
    try {
      await firebaseSignOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setUser(null);
  };

  return (
    <ProviderAuthContext.Provider
      value={{
        user,
        isLoading,
        signInDev,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </ProviderAuthContext.Provider>
  );
}

export function useProviderAuth() {
  const context = useContext(ProviderAuthContext);
  if (!context) {
    throw new Error('useProviderAuth must be used within a ProviderAuthProvider');
  }
  return context;
}
