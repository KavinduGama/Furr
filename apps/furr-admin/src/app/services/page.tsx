"use client";

import React, { useState } from "react";
import { INITIAL_PROVIDERS, INITIAL_BOOKINGS } from "@furr/firebase";
import type { ServiceProvider, ServiceBooking } from "@furr/core";

export default function AdminServicesPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>(INITIAL_PROVIDERS);
  const [bookings, setBookings] = useState<ServiceBooking[]>(INITIAL_BOOKINGS);

  const toggleVerifyProvider = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isVerified: !p.isVerified } : p))
    );
  };

  const updateBookingStatus = (id: string, status: ServiceBooking["status"]) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[#10242D] tracking-tight">Services & Provider Desk</h1>
        <p className="text-stone-500 text-sm mt-1">Verify local groomers, sitters, and walkers. Monitor live client bookings.</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Providers</span>
          <p className="text-2xl font-black text-[#10242D] mt-1">{providers.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Verified Specialists</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{providers.filter((p) => p.isVerified).length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active Bookings</span>
          <p className="text-2xl font-black text-[#006B78] mt-1">{bookings.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Commission Earned</span>
          <p className="text-2xl font-black text-amber-600 mt-1">Rs 4,800</p>
        </div>
      </div>

      {/* Providers Management */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h2 className="font-bold text-[#10242D]">Registered Specialists & Verification</h2>
        </div>
        <div className="divide-y divide-stone-100">
          {providers.map((p) => (
            <div key={p.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden border border-stone-200">
                  <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{p.name}</span>
                    {p.isVerified && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">{p.address}, {p.city} · Category: <span className="capitalize font-semibold text-[#006B78]">{p.category}</span></p>
                  <p className="text-xs text-stone-400 mt-1">{p.services.length} services listed · Rating: ⭐ {p.rating} ({p.reviewCount} reviews)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleVerifyProvider(p.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    p.isVerified
                      ? "bg-stone-100 hover:bg-stone-200 text-stone-700"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {p.isVerified ? "Revoke Verification" : "Approve & Verify"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bookings Queue */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-100 bg-stone-50">
          <h2 className="font-bold text-[#10242D]">Client Appointment Bookings</h2>
        </div>
        <div className="divide-y divide-stone-100">
          {bookings.map((b) => (
            <div key={b.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="font-bold text-stone-900">{b.serviceName}</span>
                <p className="text-xs text-stone-500 mt-0.5">Pet: <span className="font-semibold text-stone-800">{b.petName}</span> · Provider: {b.providerName}</p>
                <p className="text-xs text-stone-400 mt-1">Scheduled for: {b.date} at {b.timeSlot} · Total: Rs {b.price.toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 uppercase">
                  {b.status}
                </span>
                <button
                  onClick={() => updateBookingStatus(b.id, "completed")}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800"
                >
                  Mark Completed
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
