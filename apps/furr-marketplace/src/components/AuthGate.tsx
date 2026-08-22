'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface AuthGateProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
}

export function AuthGate({
  children,
  fallbackTitle = 'Please sign in to continue',
  fallbackSubtitle = 'Sign in or create an account to view your past orders, manage addresses, and complete checkout.',
}: AuthGateProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-stone-500">
        <div className="w-10 h-10 border-3 border-indigo-200 border-t-[#7B61FF] rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-stone-600">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-stone-200 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-50 text-[#7B61FF] flex items-center justify-center text-2xl mx-auto mb-4">
          🔐
        </div>
        <h2 className="text-xl font-black text-stone-900 mb-2">{fallbackTitle}</h2>
        <p className="text-xs text-stone-500 mb-6 leading-relaxed">
          {fallbackSubtitle}
        </p>
        <div className="flex flex-col gap-2.5">
          <Link
            href="/auth"
            className="w-full py-3 rounded-2xl bg-[#7B61FF] hover:bg-[#5A3EE5] text-white font-extrabold text-xs transition shadow-md shadow-indigo-500/20"
          >
            Sign In / Sign Up
          </Link>
          <Link
            href="/products"
            className="w-full py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold text-xs transition"
          >
            Continue Browsing
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
