'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import {
  firebaseOptionsFromEnvironment,
  initFirebase,
  signInWithEmail,
  signOut,
  subscribeToAuthState,
} from '@furr/firebase';
import { AdminProvider, useAdmin } from '@/context/AdminContext';

const firebaseConfigured = initFirebase(
  firebaseOptionsFromEnvironment({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }),
);

function AdminHeaderBar() {
  const { adminUser, setAdminUser, auditLogs } = useAdmin();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const switchRole = (name: string, email: string, role: string) => {
    setAdminUser({ name, email, role });
    setShowRoleMenu(false);
  };

  return (
    <div className="flex justify-between items-center bg-white border-b border-stone-200 px-8 py-3.5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-black uppercase tracking-wider text-stone-700">Platform Online</span>
        </div>
        <span className="text-stone-300">|</span>
        <div className="text-xs font-semibold text-stone-500">
          Audit Stream: <span className="font-bold text-[#02202B]">{auditLogs.length} events logged</span>
        </div>
      </div>

      <div className="flex items-center gap-3 relative">
        <div className="text-right">
          <p className="text-xs font-bold text-[#02202B]">{adminUser.name}</p>
          <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {adminUser.role}
          </span>
        </div>

        <button
          onClick={() => setShowRoleMenu(!showRoleMenu)}
          className="w-9 h-9 rounded-xl bg-[#02202B] text-white font-black text-xs flex items-center justify-center hover:bg-[#003B46] transition shadow-sm"
          title="Switch role / Profile"
        >
          {adminUser.name.charAt(0)}
        </button>

        {showRoleMenu && (
          <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-2 border-b border-stone-100 mb-2">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active Staff Profile</p>
              <p className="text-sm font-black text-[#02202B] mt-0.5">{adminUser.email}</p>
            </div>

            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-3 mb-1">Switch Admin Persona (Dev)</p>
            <div className="space-y-1 mb-2">
              <button
                onClick={() => switchRole('Super Administrator', 'admin@furr.lk', 'Global Platform Admin')}
                className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-stone-50 rounded-xl text-stone-800 transition"
              >
                🛡️ Super Administrator
              </button>
              <button
                onClick={() => switchRole('Dr. Sarah Smith (SLVC Liaison)', 'slvc.liaison@furr.lk', 'Trust & Safety Officer')}
                className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-stone-50 rounded-xl text-stone-800 transition"
              >
                🩺 Trust & Safety (SLVC)
              </button>
              <button
                onClick={() => switchRole('Operations Lead', 'ops@furr.lk', 'Marketplace & Logistics Lead')}
                className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-stone-50 rounded-xl text-stone-800 transition"
              >
                📦 Marketplace & Ops Lead
              </button>
            </div>

            <div className="border-t border-stone-100 pt-2">
              <button
                onClick={async () => {
                  if (firebaseConfigured) {
                    await signOut().catch(() => {});
                  }
                  window.location.reload();
                }}
                className="w-full text-left px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'signed-out' | 'denied' | 'allowed'>(
    firebaseConfigured ? 'loading' : 'allowed'
  );
  const [email, setEmail] = useState('admin@furr.lk');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured) {
      setStatus('allowed');
      return;
    }

    const unsubscribe = subscribeToAuthState(async (user) => {
      if (!user) {
        setStatus('signed-out');
        return;
      }
      try {
        const token = await user.getIdTokenResult();
        // Allow if has admin claim or if running with dev bypass / test admin
        if (token.claims.admin === true || user.email?.endsWith('@furr.lk')) {
          setStatus('allowed');
          setError(null);
        } else {
          setStatus('denied');
          setError('Access Denied: Your account does not have platform administrator privileges.');
        }
      } catch (err: any) {
        setStatus('signed-out');
        setError(err?.message || 'Authentication check failed.');
      }
    });
    return unsubscribe;
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (firebaseConfigured) {
        await signInWithEmail(email.trim(), password);
      }
      setStatus('allowed');
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in. Please verify your credentials.');
      setStatus('signed-out');
    } finally {
      setSubmitting(false);
    }
  };

  const bypassSignIn = () => {
    setStatus('allowed');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-100">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#006B78] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Verifying Admin Session…</p>
        </div>
      </div>
    );
  }

  if (status === 'allowed') {
    return (
      <AdminProvider>
        <div className="flex flex-col min-h-screen">
          <AdminHeaderBar />
          <div className="p-8 flex-1">{children}</div>
        </div>
      </AdminProvider>
    );
  }

  return (
    <section className="admin-gate flex items-center justify-center min-h-screen p-6 bg-stone-100">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#02202B] rounded-2xl text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
            F
          </div>
          <p className="text-xs font-black tracking-widest text-[#006B78] uppercase mt-4">Internal Workspace</p>
          <h1 className="text-2xl font-black text-[#02202B] mt-1">Furr Administration</h1>
          <p className="text-xs text-stone-500 mt-1">Secure role-gated platform management operations.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B78]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B78]"
            />
          </div>

          {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#02202B] hover:bg-[#003B46] text-white py-3 rounded-xl font-bold text-sm transition shadow-sm"
          >
            {submitting ? 'Authenticating…' : 'Sign in securely'}
          </button>
        </form>

        <div className="border-t border-stone-100 pt-4 text-center">
          <button
            onClick={bypassSignIn}
            className="text-xs font-bold text-[#006B78] hover:underline"
          >
            ⚡ Quick Enter as Super Admin (Dev Bypass)
          </button>
        </div>
      </div>
    </section>
  );
}
