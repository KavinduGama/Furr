'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import type { ServiceBooking } from '@furr/core';

export default function AdminServicesPage() {
  const { providers, toggleVerifyProvider, bookings, updateBookingStatus } = useAdmin();
  const [activeTab, setActiveTab] = useState<'providers' | 'bookings'>('providers');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredProviders = providers.filter((p) => {
    if (categoryFilter === 'all') return true;
    return p.category === categoryFilter;
  });

  const totalBookingRevenue = bookings.reduce((sum, b) => sum + b.price, 0);
  const platformCommission = totalBookingRevenue * 0.1; // 10% platform take-rate

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#02202B] tracking-tight">Services &amp; Specialist Desk</h1>
          <p className="text-stone-500 text-sm mt-1">
            Groomer, sitter, walker, and trainer network administration, service accreditation, and live appointments.
          </p>
        </div>

        <div className="flex gap-2 bg-stone-200/60 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('providers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'providers' ? 'bg-white text-[#02202B] shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Specialists ({providers.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'bookings' ? 'bg-white text-[#02202B] shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Bookings Queue ({bookings.length})
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Specialists</span>
          <p className="text-2xl font-black text-[#02202B] mt-1">{providers.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Verified Badges</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {providers.filter((p) => p.isVerified).length} Verified
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Booking Volume</span>
          <p className="text-2xl font-black text-[#006B78] mt-1">Rs {totalBookingRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Platform Take-Rate (10%)</span>
          <p className="text-2xl font-black text-amber-600 mt-1">Rs {platformCommission.toLocaleString()}</p>
        </div>
      </div>

      {activeTab === 'providers' ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['all', 'grooming', 'boarding', 'sitting', 'walking', 'training', 'transport'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                  categoryFilter === cat ? 'bg-[#02202B] text-white' : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProviders.map((p) => (
              <div key={p.id} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4 hover:border-stone-300 transition">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      className="w-14 h-14 rounded-2xl object-cover bg-stone-100 border border-stone-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-[#02202B]">{p.name}</h3>
                        {p.isVerified && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            VERIFIED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{p.address}, {p.city}</p>
                      <p className="text-xs text-stone-400 mt-0.5">Category: <span className="capitalize font-bold text-[#006B78]">{p.category}</span> · ⭐ {p.rating} ({p.reviewCount} reviews)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 text-xs space-y-1">
                  <p className="font-bold text-stone-400 uppercase tracking-wider text-[10px]">Offered Services</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.services.map((s) => (
                      <span key={s.id} className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 font-semibold text-[11px]">
                        {s.name} (Rs {s.price})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => toggleVerifyProvider(p.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                      p.isVerified
                        ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {p.isVerified ? 'Revoke Verification Badge' : 'Grant Verified Specialist Badge'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm divide-y divide-stone-100 overflow-hidden">
            {bookings.map((b) => (
              <div key={b.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-stone-50/50 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#02202B]">{b.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      b.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      b.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-[#02202B] mt-1">{b.serviceName}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Pet: <span className="font-bold text-stone-800">{b.petName}</span> · Provider: <span className="font-semibold text-stone-700">{b.providerName}</span>
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    Scheduled: <span className="font-semibold text-stone-700">{b.date} at {b.timeSlot}</span> · Total: Rs {b.price.toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => updateBookingStatus(b.id, 'confirmed')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => updateBookingStatus(b.id, 'in_progress')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => updateBookingStatus(b.id, 'completed')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => updateBookingStatus(b.id, 'cancelled')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
