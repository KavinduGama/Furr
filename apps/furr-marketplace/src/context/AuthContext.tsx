'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  subscribeToAuthState,
  signInWithEmail,
  createUserWithEmail,
  signOut,
  type AuthUser,
} from '@furr/firebase';
import '@/lib/firebase';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuthState((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = async (email: string, pass: string) => {
    await signInWithEmail(email, pass);
  };

  const signUp = async (email: string, pass: string, name?: string) => {
    await createUserWithEmail(email, pass, name);
  };

  const logout = async () => {
    await signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
