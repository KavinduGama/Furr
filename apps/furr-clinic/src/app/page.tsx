'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClinic } from '@/context/ClinicContext';

export default function ClinicOverviewPage() {
  const { activeQueue, stats } = useClinic();
  const router = useRouter();

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Banner / Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-sky-400">Clinic Operations</span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">Today’s Hospital Flow</h1>
          <p className="text-slate-300 text-sm mt-1">Live patient admissions, staff duty allocation, and emergency queue.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/checkin"
            className="bg-sky-500 hover:bg-sky-400 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-2"
          >
            <span>+</span> Admit Patient
          </Link>
          <Link
            href="/appointments"
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition"
          >
            Day Calendar
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Queue</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{stats.activeCheckIns}</p>
          <p className="text-xs text-sky-600 font-medium mt-1">Patients on site</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Today</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{stats.scheduledToday}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Appointments booked</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vets &amp; Nurses on Shift</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{stats.vetsOnDuty}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Active staff</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Today</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{stats.surgeriesCompleted}</p>
          <p className="text-xs text-purple-600 font-medium mt-1">Consults &amp; procedures</p>
        </div>
      </div>

      {/* Live Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Admitted Patients Queue</h2>
            <p className="text-xs text-slate-500">Real-time status of patients currently in triage, consultation, and prep.</p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-y border-slate-100 text-xs uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="p-4 pl-6">Token</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Chief Complaint</th>
                <th className="p-4">Assigned Clinician</th>
                <th className="p-4">Location / State</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeQueue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 pl-6 font-mono font-bold text-sky-600">{item.id}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{item.petName}</p>
                    <p className="text-xs text-slate-400">{item.species}</p>
                  </td>
                  <td className="p-4 text-slate-700">
                    <p className="font-medium">{item.ownerName}</p>
                    <p className="text-[11px] text-slate-400">Arrived: {item.timeArrived}</p>
                  </td>
                  <td className="p-4 text-slate-600 max-w-xs">{item.reason}</td>
                  <td className="p-4">
                    <span className="text-slate-800 font-medium">{item.assignedVet}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {item.room}
                      </span>
                      <span
                        className={`text-[11px] font-bold ${
                          item.status === 'In Consultation'
                            ? 'text-emerald-600'
                            : item.status === 'Triage / Vitals'
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => router.push(`/records?search=${encodeURIComponent(item.petName)}`)}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition"
                    >
                      View Chart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
