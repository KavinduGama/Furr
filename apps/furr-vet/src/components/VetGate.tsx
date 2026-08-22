'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth';
import { devProfessionalProfiles } from '@furr/firebase';

const isDev = process.env.NODE_ENV === 'development';

function VetHeaderBar() {
  const { profile, signOut, signIn } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="bg-[#FFFEFC] border-b border-[#E8E6E0] sticky top-0 z-50 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#006B78] rounded-xl flex items-center justify-center shadow-xs">
            <span className="text-white font-black text-sm">F</span>
          </div>
          <div>
            <span className="font-black text-lg tracking-tight text-[#10242D] block">
              FURR <span className="text-[#66757C] font-medium text-sm">VET</span>
            </span>
          </div>
        </div>

        <nav className="flex gap-4 items-center">
          <Link
            href="/"
            className="text-sm font-bold text-[#10242D] hover:text-[#006B78] px-3 py-1.5 rounded-lg transition"
          >
            Access Desk
          </Link>
          <Link
            href="/consults"
            className="text-sm font-bold text-[#006B78] bg-[#E6F4F5] hover:bg-[#d5eeef] px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Telehealth Desk
          </Link>

          {/* Practitioner Profile Badge & Menu */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2.5 bg-stone-50 border border-stone-200 hover:bg-stone-100 px-3 py-1.5 rounded-xl text-left transition"
            >
              <div className="w-7 h-7 rounded-lg bg-[#006B78] text-white font-bold text-xs flex items-center justify-center">
                {profile?.fullName?.charAt(0) || 'V'}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-black text-stone-900 leading-tight">
                  {profile?.fullName || 'Dr. Sarah Weerasinghe'}
                </p>
                <p className="text-[10px] text-stone-500 font-semibold">
                  SLVC: {profile?.registrationNumber || 'SLVC-8924'}
                </p>
              </div>
              <span className="text-xs text-stone-400">▾</span>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-stone-100 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                      Verified Clinical License
                    </span>
                  </div>
                  <p className="text-xs font-bold text-stone-900">{profile?.fullName}</p>
                  <p className="text-[11px] text-stone-500">{profile?.district} · Reg: {profile?.registrationNumber}</p>
                </div>

                {/* Dev practitioner switcher — only visible in development (HIGH-A) */}
                {isDev && (
                  <>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-3 mb-1">
                      Switch Practitioner (Dev)
                    </p>
                    <div className="space-y-1 mb-2">
                      {devProfessionalProfiles.map((p) => (
                        <button
                          key={p.uid}
                          onClick={() => {
                            signIn(p.email, 'password');
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-stone-50 rounded-lg text-stone-800 transition"
                        >
                          🩺 {p.fullName} ({p.registrationNumber})
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className="border-t border-stone-100 pt-2">
                  <button
                    onClick={() => {
                      signOut();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export function VetGate({ children }: { children: React.ReactNode }) {
  const { profile, isLoading, error, signIn } = useAuth();
  const [email, setEmail] = useState('dr.weerasinghe@colombovet.lk');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDevBypass = (devEmail: string) => {
    signIn(devEmail, 'password');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF9F5]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#006B78] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Verifying Clinical Credentials…</p>
        </div>
      </div>
    );
  }

  if (profile) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
        <VetHeaderBar />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF9F5]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#006B78] rounded-2xl text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
            F
          </div>
          <p className="text-xs font-black tracking-widest text-[#006B78] uppercase mt-4">
            Veterinary Professional Network
          </p>
          <h1 className="text-2xl font-black text-[#10242D] mt-1">Furr Clinical Portal</h1>
          <p className="text-xs text-stone-500 mt-1">
            Secure health record access and digital telehealth duty desk.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
              Registered Practitioner Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B78]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B78]"
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#006B78] hover:bg-[#00525C] text-white py-3 rounded-xl font-bold text-sm transition shadow-sm"
          >
            {submitting ? 'Verifying Practitioner…' : 'Sign in with SLVC Credentials'}
          </button>
        </form>

        {/* Quick Dev Sign-In — only visible in development (HIGH-A) */}
        {isDev && (
          <div className="border-t border-stone-100 pt-4 text-center space-y-2">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Quick Dev Practitioner Sign-In
            </p>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => handleDevBypass('dr.weerasinghe@colombovet.lk')}
                className="text-xs font-bold text-[#006B78] hover:underline bg-[#E6F4F5] py-2 px-3 rounded-xl transition"
              >
                🩺 Enter as Dr. Sarah Weerasinghe (SLVC-8924)
              </button>
              <button
                type="button"
                onClick={() => handleDevBypass('dr.silva@kandypetcare.lk')}
                className="text-xs font-bold text-stone-700 hover:underline bg-stone-100 py-2 px-3 rounded-xl transition"
              >
                🩺 Enter as Dr. Nuwan Silva (SLVC-7719)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
