'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ClinicOverviewPage() {
  const [todayStats] = useState({
    activeCheckIns: 5,
    scheduledToday: 14,
    vetsOnDuty: 4,
    surgeriesCompleted: 2,
  });

  const [activeQueue] = useState([
    {
      id: 'Q-101',
      petName: 'Milo',
      species: 'Dog (Golden Retriever)',
      ownerName: 'Sunil Jayawardena',
      timeArrived: '09:15 AM',
      assignedVet: 'Dr. Sarah Smith',
      status: 'In Consultation',
      room: 'Room 2',
      reason: 'Routine Vaccination & Heartworm Check',
    },
    {
      id: 'Q-102',
      petName: 'Bella',
      species: 'Cat (Persian)',
      ownerName: 'Ananya Fernando',
      timeArrived: '09:40 AM',
      assignedVet: 'Dr. Emily Chen',
      status: 'Triage / Vitals',
      room: 'Triage Bay A',
      reason: 'Lethargy & Reduced Appetite',
    },
    {
      id: 'Q-103',
      petName: 'Rocky',
      species: 'Dog (German Shepherd)',
      ownerName: 'Kasun Bandara',
      timeArrived: '10:05 AM',
      assignedVet: 'Unassigned',
      status: 'Waiting Area',
      room: 'Lobby',
      reason: 'Minor Paw Cut (Post-Walk)',
    },
  ]);

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
            className="bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm px-5 py-3 rounded-xl transition shadow-sm inline-flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Intake New Patient
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Check-ins</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-slate-900">{todayStats.activeCheckIns}</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">3 in waiting</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Appointments Today</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-slate-900">{todayStats.scheduledToday}</span>
            <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">9 remaining</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vets on Duty</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-slate-900">{todayStats.vetsOnDuty}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">All rooms active</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Procedures Completed</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-slate-900">{todayStats.surgeriesCompleted}</span>
            <span className="text-xs font-bold text-slate-500">Day schedule</span>
          </div>
        </div>
      </div>

      {/* Live Floor Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Hospital Floor &amp; Waiting Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time status of patients currently in the clinic.</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse"></span>
            Live Queue Sync
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider font-bold">
                <th className="p-4 pl-6">Queue ID</th>
                <th className="p-4">Patient &amp; Species</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Reason / Triage</th>
                <th className="p-4">Assigned Practitioner</th>
                <th className="p-4">Room &amp; Status</th>
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
                      <span className={`text-[11px] font-bold ${
                        item.status === 'In Consultation' ? 'text-emerald-600' :
                        item.status === 'Triage / Vitals' ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition">
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
