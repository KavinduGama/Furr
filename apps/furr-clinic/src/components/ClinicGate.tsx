'use client';

import React, { useState, FormEvent } from 'react';
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

export function ClinicHeaderBar({ onSignOut }: { onSignOut: () => void }) {
  const { currentBranch, setBranch, operator, setOperator } = useClinic();
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="clinic-header flex items-center justify-between px-8 py-4 bg-white border-b border-stone-200 shadow-2xs">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-stone-900 leading-tight">
            {currentBranch.name}
          </h2>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Branch: <strong className="text-stone-700">{currentBranch.code}</strong></span>
            <span>·</span>
            <span>{currentBranch.city}</span>
          </div>
        </div>

        {/* Branch Selector */}
        <div className="relative">
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-xl hover:bg-sky-100 transition flex items-center gap-1.5"
          >
            <span>🏥 Switch Branch</span>
            <span className="text-[10px]">▾</span>
          </button>

          {showBranchMenu && (
            <div className="absolute left-0 top-10 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-3 py-1">
                Hospital Network Locations
              </p>
              {CLINIC_BRANCHES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setBranch(b);
                    setShowBranchMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex flex-col ${
                    currentBranch.id === b.id ? 'bg-sky-50 font-bold text-sky-900' : 'hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <span className="font-bold">{b.name}</span>
                  <span className="text-[10px] text-stone-400">{b.location}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Operator Menu */}
      <div className="flex items-center gap-3 relative">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-black text-stone-900">{operator.name}</p>
          <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
            {operator.role}
          </span>
        </div>

        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-9 h-9 rounded-xl bg-sky-700 text-white font-black text-xs flex items-center justify-center hover:bg-sky-800 transition shadow-sm"
        >
          {operator.name.charAt(0)}
        </button>

        {showProfileMenu && (
          <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-2 border-b border-stone-100 mb-2">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Active Staff Profile</p>
              <p className="text-xs font-black text-stone-900 mt-0.5">{operator.email}</p>
            </div>

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
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState(CLINIC_BRANCHES[0].id);
  const [email, setEmail] = useState('admin@colombocentral.lk');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const branch = CLINIC_BRANCHES.find((b) => b.id === selectedBranchId) || CLINIC_BRANCHES[0];
      setBranch(branch);
      setOperator({
        name: 'Nalinda Jayasuriya',
        email,
        role: 'Clinic Administrator',
      });
      setIsAuthenticated(true);
      setSubmitting(false);
    }, 300);
  };

  const handleDevBypass = (op: ClinicOperator, branch: ClinicBranch) => {
    setBranch(branch);
    setOperator(op);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100">
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
              Patient intake queue, appointments scheduling, and clinic files.
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
                {CLINIC_BRANCHES.map((b) => (
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-sky-700 hover:bg-sky-800 text-white py-3 rounded-xl font-bold text-sm transition shadow-sm"
            >
              {submitting ? 'Authenticating Staff…' : 'Sign in to Clinic Terminal'}
            </button>
          </form>

          <div className="border-t border-stone-100 pt-4 text-center space-y-2">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Quick Dev Terminal Sign-In
            </p>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => handleDevBypass(DEV_OPERATORS[0], CLINIC_BRANCHES[0])}
                className="text-xs font-bold text-sky-800 hover:underline bg-sky-50 py-2 px-3 rounded-xl transition"
              >
                🏥 Enter as Nalinda (Admin · Colombo Central)
              </button>
              <button
                type="button"
                onClick={() => handleDevBypass(DEV_OPERATORS[1], CLINIC_BRANCHES[0])}
                className="text-xs font-bold text-stone-700 hover:underline bg-stone-100 py-2 px-3 rounded-xl transition"
              >
                💉 Enter as Sister Dilani (Triage Nurse)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
      <ClinicHeaderBar onSignOut={() => setIsAuthenticated(false)} />
      <div className="p-8 flex-1">{children}</div>
    </div>
  );
}
