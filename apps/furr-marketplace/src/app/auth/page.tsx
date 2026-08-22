'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthPage() {
  const router = useRouter();
  const { user, signIn, signUp } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  if (user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-stone-200 text-center space-y-4">
        <div className="text-3xl">👋</div>
        <h2 className="text-xl font-black text-stone-900">You are already signed in</h2>
        <p className="text-xs text-stone-500">{user.email}</p>
        <Link
          href="/products"
          className="inline-block px-6 py-2.5 rounded-full text-xs font-black text-white bg-[#7B61FF]"
        >
          Go to Marketplace
        </Link>
      </div>
    );
  }

  const sanitizeAuthError = (err: any) => {
    const code = err?.code || '';
    if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential') || code.includes('invalid-login-credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (code.includes('email-already-in-use')) {
      return 'An account with this email already exists.';
    }
    if (code.includes('weak-password')) {
      return 'Password should be at least 6 characters.';
    }
    return err?.message || 'Authentication failed. Please check your credentials.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
      router.push('/products');
    } catch (err: any) {
      setError(sanitizeAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    if (!isDev) return;
    setError('');
    setLoading(true);
    try {
      await signIn('owner@furr.lk', 'password123');
      router.push('/products');
    } catch {
      try {
        await signUp('owner@furr.lk', 'password123', 'Demo Pet Parent');
        router.push('/products');
      } catch (e: any) {
        setError(sanitizeAuthError(e));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xs space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7B61FF] to-[#5A3EE5] flex items-center justify-center text-white font-black text-xl shadow-md mx-auto">
            🐾
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            {isRegister ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-stone-500">
            {isRegister
              ? 'Join Furr to track orders, save pet profiles & get discounts.'
              : 'Sign in to access your orders and saved checkout details.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">Full Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Kasun Perera"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none focus:border-[#7B61FF]"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none focus:border-[#7B61FF]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none focus:border-[#7B61FF]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[#7B61FF] hover:bg-[#5A3EE5] text-white font-extrabold text-xs transition shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle between login and register */}
        <div className="text-center text-xs text-stone-500">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="font-bold text-[#7B61FF] hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="font-bold text-[#7B61FF] hover:underline cursor-pointer"
              >
                Register Now
              </button>
            </span>
          )}
        </div>

        {/* Quick Demo button - gated strictly behind development environment (CRIT-008) */}
        {isDev && (
          <div className="pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer"
            >
              ⚡ Quick Sign In as Demo Pet Parent (Dev Only)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
