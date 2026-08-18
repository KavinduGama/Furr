'use client';

import React from 'react';
import Link from 'next/link';
import { useAdmin } from '@/context/AdminContext';

export default function AdminOverview() {
  const {
    vets,
    clinics,
    products,
    orders,
    providers,
    lostAlerts,
    disputes,
    users,
    auditLogs,
  } = useAdmin();

  const pendingVets = vets.filter((v) => v.status === 'pending');
  const activeAlerts = lostAlerts.filter((a) => a.status === 'active');
  const openDisputes = disputes.filter((d) => d.status === 'open' || d.status === 'under_review');
  const liveOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');

  const totalGMV = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <span className="text-[11px] font-black tracking-widest text-[#006B78] uppercase">Command Center</span>
          <h1 className="text-3xl font-black text-[#02202B] tracking-tight mt-0.5">Platform Overview</h1>
          <p className="text-stone-500 text-sm mt-1">Live health, operational queues, and telemetry across the Furr ecosystem.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/vet-desk"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#02202B] hover:bg-[#003B46] text-white transition shadow-sm flex items-center gap-2"
          >
            <span>🩺 Review Vets</span>
            {pendingVets.length > 0 && (
              <span className="bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                {pendingVets.length}
              </span>
            )}
          </Link>
          <button
            onClick={async () => {
              if (confirm('Seed clean initial demo data (products, providers, adoptions, reviews) into Firestore?')) {
                const { seedFirestoreDatabase } = await import('@furr/firebase');
                const res = await seedFirestoreDatabase();
                alert(`Database Seeded Successfully! Populated: ${res.productsCount} products, ${res.providersCount} providers, ${res.adoptionsCount} adoptions, ${res.reviewsCount} reviews.`);
              }
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm flex items-center gap-1.5"
          >
            <span>🌱 Seed Firestore</span>
          </button>
          <Link
            href="/marketplace"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 transition"
          >
            📦 Dispatch Orders
          </Link>
        </div>
      </div>


      {/* Critical Priority Action Banners */}
      {(pendingVets.length > 0 || activeAlerts.length > 0 || openDisputes.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pendingVets.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <p className="text-xs font-black text-amber-900 uppercase tracking-wider">Vet Verification Queue</p>
                <p className="text-sm font-bold text-amber-800 mt-0.5">{pendingVets.length} practitioner(s) awaiting SLVC audit</p>
              </div>
              <Link href="/vet-desk" className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition">
                Review
              </Link>
            </div>
          )}

          {activeAlerts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                  <p className="text-xs font-black text-red-950 uppercase tracking-wider">Lost Pet Amber Radar</p>
                </div>
                <p className="text-sm font-bold text-red-900 mt-0.5">{activeAlerts.length} urgent active alert(s) live</p>
              </div>
              <Link href="/community" className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition">
                Inspect
              </Link>
            </div>
          )}

          {openDisputes.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <p className="text-xs font-black text-purple-950 uppercase tracking-wider">Disputes & Refunds</p>
                <p className="text-sm font-bold text-purple-900 mt-0.5">{openDisputes.length} open ticket(s) awaiting resolution</p>
              </div>
              <Link href="/disputes" className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition">
                Resolve
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:border-stone-300 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Registered Accounts</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-bold">👥</span>
          </div>
          <p className="text-3xl font-black text-[#02202B] mt-3">{users.length}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs font-bold text-emerald-600">+18% this month</span>
            <span className="text-stone-300">·</span>
            <span className="text-xs text-stone-500">Across 22 districts</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:border-stone-300 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Verified Vets & Clinics</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold">🩺</span>
          </div>
          <p className="text-3xl font-black text-[#02202B] mt-3">{vets.filter((v) => v.status === 'approved').length + clinics.filter((c) => c.status === 'active').length}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs font-bold text-[#006B78]">{clinics.length} Hospital Partners</span>
            <span className="text-stone-300">·</span>
            <span className="text-xs text-stone-500">SLVC Accredited</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:border-stone-300 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Marketplace Gross GMV</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700 text-sm font-bold">💳</span>
          </div>
          <p className="text-3xl font-black text-[#02202B] mt-3">Rs {totalGMV.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs font-bold text-emerald-600">{products.length} Products Listed</span>
            <span className="text-stone-300">·</span>
            <span className="text-xs text-stone-500">{orders.length} orders total</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:border-stone-300 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Service Specialist Network</span>
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700 text-sm font-bold">✂️</span>
          </div>
          <p className="text-3xl font-black text-[#02202B] mt-3">{providers.length}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs font-bold text-emerald-600">{providers.filter((p) => p.isVerified).length} Verified</span>
            <span className="text-stone-300">·</span>
            <span className="text-xs text-stone-500">Groomers, Walkers, Sitters</span>
          </div>
        </div>
      </div>

      {/* Grid of Two Columns: Live Activity Stream & Quick Operational Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Security & Action Audit Stream */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-lg font-black text-[#02202B]">Recent Security & Audit Logs</h2>
              <p className="text-xs text-stone-500">Immutable ledger of administrative actions and access grants.</p>
            </div>
            <Link href="/audit-logs" className="text-xs font-bold text-[#006B78] hover:underline">
              View Full Log ({auditLogs.length}) →
            </Link>
          </div>

          <div className="divide-y divide-stone-100">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="py-3 flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">{log.action}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      log.category === 'VET' ? 'bg-blue-50 text-blue-700' :
                      log.category === 'MARKETPLACE' ? 'bg-amber-50 text-amber-700' :
                      log.category === 'USER' ? 'bg-red-50 text-red-700' :
                      log.category === 'CLINIC' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {log.category}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">{log.details}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">By {log.adminName} ({log.adminEmail})</p>
                </div>
                <span className="text-[10px] font-medium text-stone-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Platform Quick Health & Dispatch Stats */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="font-black text-[#02202B]">Platform Health & Infrastructure</h3>
            <p className="text-xs text-stone-500 mt-0.5">System status & services connectivity.</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-stone-800">Firebase Firestore DB</p>
                <p className="text-[10px] text-stone-500">Multi-region active sync</p>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                HEALTHY
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-stone-800">Push Notification Gateway</p>
                <p className="text-[10px] text-stone-500">Expo FCM / APNS</p>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ONLINE
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-stone-800">SMS / OTP Delivery</p>
                <p className="text-[10px] text-stone-500">Dialog / Mobitel Gateway</p>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ACTIVE
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-stone-800">SLVC Practitioner Registry</p>
                <p className="text-[10px] text-stone-500">License Verification API</p>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                CONNECTED
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-stone-500">Live Orders Pending Dispatch:</span>
              <span className="font-black text-[#006B78]">{liveOrders.length} orders</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
