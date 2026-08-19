'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useClinic, CLINIC_BRANCHES, type ClinicBranch, type ClinicOperator } from '@/context/ClinicContext';

const DEV_OPERATORS: ClinicOperator[] = [
  {
    name: 'Nalinda Jayasuriya',
    email: 'admin@colombocentral.lk',
    role: 'Clinic Administrator',
  },
  {
    name: 'Sister Dilani Fernando',
    email: 'triage@colombocentral.lk',
    role: 'Triage Nurse',
  },
  {
    name: 'Kavindi Perera',
    email: 'reception@colombocentral.lk',
    role: 'Reception & Intake Desk',
  },
];

function ClinicHeaderBar({ onSignOut }: { onSignOut: () => void }) {
  const { currentBranch, operator, setOperator, setBranch } = useClinic();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <header className="h-16 bg-white border-b border-stone-200 px-8 flex items-center justify-between z-10 sticky top-0 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-700 text-white font-black text-sm flex items-center justify-center shadow-sm">
            C
          </div>
          <div>
            <h1 className="text-sm font-black text-stone-900 leading-tight">Furr Clinic Portal</h1>
            <p className="text-[10px] font-bold text-sky-700 uppercase tracking-widest leading-none">
              Hospital Operations Desk
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-stone-200 mx-2" />

        {/* Branch Selector */}
        <div className="relative">
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 transition"
          >
            <span>🏥 {currentBranch?.name || 'Clinic Branch'}</span>
            <span className="text-[10px] text-stone-400">▼</span>
          </button>

          {showBranchMenu && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-3 py-1">
                Select Facility Branch
              </p>
              {CLINIC_BRANCHES.map((b: ClinicBranch) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setBranch(b);
                    setShowBranchMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition ${
                    b.id === currentBranch?.id
                      ? 'bg-sky-50 text-sky-800'
                      : 'hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <p>{b.name}</p>
                  <p className="text-[10px] font-normal text-stone-400">{b.location}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Operator & Profile Menu */}
      <div className="relative">
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-stone-100 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
            {operator?.name?.charAt(0) || 'U'}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-stone-800 leading-tight">{operator?.name || 'Clinic Operator'}</p>
            <p className="text-[10px] font-semibold text-stone-400 leading-none">{operator?.role || 'Staff'}</p>
          </div>
        </button>

        {showProfileMenu && (
          <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50">
            <div className="px-3 py-2 border-b border-stone-100 mb-1">
              <p className="text-xs font-bold text-stone-800">{operator?.name}</p>
              <p className="text-[10px] text-stone-400">{operator?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md text-[9px] font-bold">
                {operator?.role}
              </span>
            </div>

            {/* Dev persona switcher gated strictly behind development environment (HIGH-002) */}
            {isDev && (
              <>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-3 mb-1">
                  Switch Staff Persona (Dev)
                </p>
                <div className="space-y-1 mb-2">
                  {DEV_OPERATORS.map((op, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setOperator(op);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-stone-50 rounded-lg text-stone-800 transition"
                    >
                      👤 {op.name} ({op.role})
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="border-t border-stone-100 pt-2">
              <button
                onClick={() => {
                  onSignOut();
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export function ClinicGate({ children }: { children: React.ReactNode }) {
  const { setBranch, setOperator } = useClinic();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(CLINIC_BRANCHES[0].id);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { subscribeToAuthState } = await import('@furr/firebase');
        const unsub = subscribeToAuthState(async (user) => {
          if (!active) return;
          if (user) {
            try {
              const token = await user.getIdTokenResult();
              const isClinic =
                token.claims.clinic_admin === true ||
                token.claims.vet === true ||
                token.claims.admin === true ||
                token.claims.role === 'clinic_admin' ||
                token.claims.role === 'vet' ||
                process.env.NODE_ENV === 'development';

              if (isClinic) {
                const branch = CLINIC_BRANCHES.find((b) => b.id === selectedBranchId) || CLINIC_BRANCHES[0];
                setBranch(branch);
                setOperator({
                  name: user.displayName || user.email?.split('@')[0] || 'Clinic Staff',
                  email: user.email || 'staff@clinic.furr.lk',
                  role: 'Clinic Administrator',
                });
                setIsAuthenticated(true);
                setError(null);
              } else {
                setIsAuthenticated(false);
                setError('Access Denied: Account lacks authorized clinical privileges.');
              }
            } catch {
              setIsAuthenticated(false);
            }
          } else {
            setIsAuthenticated(false);
          }
        });
        unsubscribeRef.current = unsub;
      } catch {
        // Fallback
      }
    })();

    // Cleanup subscription to prevent memory leak (MED-007)
    return () => {
      active = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [selectedBranchId, setBranch, setOperator]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { signInWithEmail } = await import('@furr/firebase');
      const user = await signInWithEmail(email.trim(), password);
      const token = await user.getIdTokenResult();
      const isClinic =
        token.claims.clinic_admin === true ||
        token.claims.vet === true ||
        token.claims.admin === true ||
        token.claims.role === 'clinic_admin' ||
        token.claims.role === 'vet' ||
        process.env.NODE_ENV === 'development';

      if (!isClinic) {
        setError('Access Denied: Your account does not have clinical staff privileges.');
        setIsAuthenticated(false);
        return;
      }

      const branch = CLINIC_BRANCHES.find((b) => b.id === selectedBranchId) || CLINIC_BRANCHES[0];
      setBranch(branch);
      setOperator({
        name: user.displayName || email.split('@')[0] || 'Clinic Staff',
        email,
        role: 'Clinic Administrator',
      });
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err?.message || 'Invalid clinic staff credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { signOut } = await import('@furr/firebase');
      await signOut();
    } catch {
      // Ignored
    }
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100 w-full">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-sky-700 rounded-2xl text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
              C
            </div>
            <p className="text-xs font-black tracking-widest text-sky-700 uppercase mt-4">
              Veterinary Hospital Workspace
            </p>
            <h1 className="text-2xl font-black text-stone-900 mt-1">Furr Clinic System</h1>
            <p className="text-xs text-stone-500 mt-1">
              Patient intake queue, appointments scheduling, and clinic medical files.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Hospital Branch
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                {CLINIC_BRANCHES.map((b: ClinicBranch) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Staff Email
              </label>
              <input
                type="email"
                required
                placeholder="staff@clinic.furr.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-sky-700 hover:bg-sky-800 text-white py-3 rounded-xl font-bold text-sm transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Authenticating Staff…' : 'Sign in to Clinic Terminal'}
            </button>
          </form>

          <div className="border-t border-stone-100 pt-4 text-center">
            <p className="text-[11px] text-stone-400">
              Authorized clinical personnel access only. All actions are logged.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
      <ClinicHeaderBar onSignOut={handleSignOut} />
      <div className="p-8 flex-1">{children}</div>
    </div>
  );
}
