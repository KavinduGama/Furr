import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToAuthState, getCurrentUser, signOut as firebaseSignOut } from '@furr/firebase';

interface ProviderAuthContextType {
  user: { uid: string; phone: string; email?: string } | null;
  isLoading: boolean;
  signInDev: (phone?: string) => void;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const ProviderAuthContext = createContext<ProviderAuthContextType | undefined>(undefined);

export function ProviderAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ uid: string; phone: string; email?: string } | null>(() => {
    const current = getCurrentUser();
    if (current) {
      return {
        uid: current.uid,
        phone: current.phoneNumber || '+94 77 123 4567',
        email: current.email || undefined,
      };
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          phone: firebaseUser.phoneNumber || '+94 77 123 4567',
          email: firebaseUser.email || undefined,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInDev = (phone: string = '+94 77 123 4567') => {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Dev authentication is disabled in production.');
      return;
    }
    setUser({
      uid: 'prov-' + Date.now().toString(36),
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
