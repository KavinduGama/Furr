'use client';

import React, { useState } from 'react';

export default function ClinicAppointmentsPage() {
  const [appointments] = useState([
    {
      id: 'APT-901',
      time: '10:30 AM',
      petName: 'Rocky',
      species: 'Dog',
      ownerName: 'Kasun Bandara',
      vet: 'Dr. Sarah Smith',
      type: 'General Checkup',
      status: 'Confirmed',
    },
    {
      id: 'APT-902',
      time: '11:15 AM',
      petName: 'Luna',
      species: 'Cat',
      ownerName: 'Devinda Perera',
      vet: 'Dr. Emily Chen',
      type: 'Rabies Booster Vaccine',
      status: 'Confirmed',
    },
    {
      id: 'APT-903',
      time: '02:00 PM',
      petName: 'Shadow',
      species: 'Dog',
      ownerName: 'Rashmi Senanayake',
      vet: 'Dr. Michael Perera',
      type: 'Dental Cleaning',
      status: 'Arrived',
    },
    {
      id: 'APT-904',
      time: '03:30 PM',
      petName: 'Oreo',
      species: 'Cat',
      ownerName: 'Nirosha Fernando',
      vet: 'Dr. Sarah Smith',
      type: 'Post-Op Followup',
      status: 'Pending Intake',
    },
  ]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Appointments Calendar</h1>
          <p className="text-slate-500 text-sm mt-1">Manage scheduled physical visits, surgery blocks, and diagnostic slots.</p>
        </div>
        <button className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition shadow-sm self-start sm:self-auto">
          + Book Walk-in / Slot
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled for Today (Colombo Central)</span>
          <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
            {appointments.length} Total Bookings
          </span>
        </div>

        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider font-bold">
              <th className="p-4 pl-6">Time</th>
              <th className="p-4">Patient &amp; Owner</th>
              <th className="p-4">Practitioner</th>
              <th className="p-4">Visit Type</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-slate-50 transition">
                <td className="p-4 pl-6 font-bold font-mono text-slate-900">{apt.time}</td>
                <td className="p-4">
                  <p className="font-bold text-slate-900">{apt.petName} <span className="text-xs font-normal text-slate-400">({apt.species})</span></p>
                  <p className="text-xs text-slate-500">Owner: {apt.ownerName}</p>
                </td>
                <td className="p-4 text-slate-700 font-medium">{apt.vet}</td>
                <td className="p-4 text-slate-600">{apt.type}</td>
                <td className="p-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    apt.status === 'Arrived' ? 'bg-emerald-100 text-emerald-700' :
                    apt.status === 'Confirmed' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {apt.status}
                  </span>
                </td>
                <td className="p-4 pr-6 text-right space-x-2">
                  <button className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg transition">
                    Admit
                  </button>
                  <button className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg transition">
                    Reschedule
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
