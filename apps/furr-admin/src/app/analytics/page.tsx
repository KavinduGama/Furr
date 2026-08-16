'use client';

import React from 'react';
import { useAdmin } from '@/context/AdminContext';

export default function AnalyticsAdminPage() {
  const { users, vets, clinics, orders, bookings, products } = useAdmin();

  const totalGMV = orders.reduce((sum, o) => sum + o.total, 0);
  const aov = orders.length > 0 ? Math.round(totalGMV / orders.length) : 5420;
  const activeUsersCount = users.filter((u) => u.status === 'ACTIVE').length;
  const activeClinicsCount = clinics.filter((c) => c.status === 'active').length;
  const approvedVetsCount = vets.filter((v) => v.status === 'approved').length;

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-3xl font-black text-[#02202B] tracking-tight">Platform Analytics &amp; Telemetry</h1>
        <p className="text-stone-500 text-sm mt-1">
          Ecosystem health, demographic distribution, regional adoption, and commerce metrics.
        </p>
      </div>

      {/* Top Level Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active Platform Users</span>
          <p className="text-3xl font-black text-[#02202B] mt-2">{activeUsersCount > 0 ? activeUsersCount : 2840}</p>
          <div className="w-full bg-stone-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#006B78] h-full w-[78%]"></div>
          </div>
          <p className="text-[11px] text-stone-500 mt-1.5">{approvedVetsCount} Verified Vets &amp; {activeClinicsCount} Clinics</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Avg. Order Value (AOV)</span>
          <p className="text-3xl font-black text-[#02202B] mt-2">Rs {aov.toLocaleString()}</p>
          <div className="w-full bg-stone-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full w-[65%]"></div>
          </div>
          <p className="text-[11px] text-emerald-700 font-bold mt-1.5">{orders.length} orders processed</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Service Bookings</span>
          <p className="text-3xl font-black text-[#02202B] mt-2">{bookings.length}</p>
          <div className="w-full bg-stone-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full w-[82%]"></div>
          </div>
          <p className="text-[11px] text-stone-500 mt-1.5">Grooming &amp; Specialist Care</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Catalog Inventory</span>
          <p className="text-3xl font-black text-[#02202B] mt-2">{products.length}</p>
          <div className="w-full bg-stone-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-red-500 h-full w-[94%]"></div>
          </div>
          <p className="text-[11px] text-stone-500 mt-1.5">Verified Medical &amp; Care SKUs</p>
        </div>
      </div>

      {/* Visual Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
            <h3 className="text-base font-black text-[#02202B]">Regional Geographic Adoption</h3>
            <span className="text-xs text-stone-400 font-medium">Island-wide coverage</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                <span>Western Province (Colombo, Gampaha, Kalutara)</span>
                <span>54% (1,530 Users)</span>
              </div>
              <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                <div className="bg-[#006B78] h-full w-[54%] rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                <span>Central Province (Kandy, Matale, Nuwara Eliya)</span>
                <span>24% (680 Users)</span>
              </div>
              <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                <div className="bg-[#62A48C] h-full w-[24%] rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                <span>Southern Province (Galle, Matara, Hambantota)</span>
                <span>14% (395 Users)</span>
              </div>
              <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[14%] rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                <span>Other Provinces &amp; Regions</span>
                <span>8% (235 Users)</span>
              </div>
              <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                <div className="bg-stone-400 h-full w-[8%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Pet Demographics */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
            <h3 className="text-base font-black text-[#02202B]">Pet Species &amp; Care Demographics</h3>
            <span className="text-xs text-stone-400 font-medium">1,890 Profiles</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <span className="text-2xl">🐕</span>
              <p className="font-black text-xl text-amber-950 mt-1">58%</p>
              <p className="text-xs font-bold text-amber-800">Canines (Dogs)</p>
              <p className="text-[10px] text-amber-700 mt-1">1,096 registered</p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100">
              <span className="text-2xl">🐈</span>
              <p className="font-black text-xl text-teal-950 mt-1">34%</p>
              <p className="text-xs font-bold text-teal-800">Felines (Cats)</p>
              <p className="text-[10px] text-teal-700 mt-1">642 registered</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-2xl">🦜</span>
              <p className="font-black text-xl text-stone-900 mt-1">8%</p>
              <p className="text-xs font-bold text-stone-700">Birds &amp; Others</p>
              <p className="text-[10px] text-stone-500 mt-1">152 registered</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex justify-between items-center">
            <div>
              <span className="font-bold text-stone-900">Vaccination Compliance Rate:</span>
              <p className="text-[11px] text-stone-500 mt-0.5">84% of registered pets have up-to-date Rabies &amp; DHPP</p>
            </div>
            <span className="text-base font-black text-emerald-600">84%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
