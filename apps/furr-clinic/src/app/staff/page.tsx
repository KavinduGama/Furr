'use client';

import React, { useState } from 'react';

export default function ClinicStaffPage() {
  const [staffMembers] = useState([
    {
      id: 'STF-01',
      name: 'Dr. Sarah Smith, BVSc',
      role: 'Senior Veterinarian & Surgeon',
      regNumber: 'VET-12345',
      shift: 'Morning & Afternoon (08:00 - 16:00)',
      status: 'On Duty (Room 1)',
      patientsSeenToday: 6,
    },
    {
      id: 'STF-02',
      name: 'Dr. Emily Chen, DVM',
      role: 'Veterinary Physician',
      regNumber: 'VET-88321',
      shift: 'Full Day (09:00 - 17:00)',
      status: 'On Duty (Room 2)',
      patientsSeenToday: 4,
    },
    {
      id: 'STF-03',
      name: 'Dr. Michael Perera, BVSc',
      role: 'Veterinary Surgeon',
      regNumber: 'VET-44910',
      shift: 'Surgery Block (11:00 - 19:00)',
      status: 'In Surgery Unit',
      patientsSeenToday: 2,
    },
    {
      id: 'STF-04',
      name: 'Chaminda Silva',
      role: 'Head Veterinary Technician',
      regNumber: 'TECH-009',
      shift: 'Triage & Diagnostics (08:00 - 16:00)',
      status: 'On Duty (Lab / Triage)',
      patientsSeenToday: 11,
    },
  ]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinic Staff &amp; Practitioners</h1>
          <p className="text-slate-500 text-sm mt-1">Manage duty rosters, verify practitioner credentials, and view caseloads.</p>
        </div>
        <button className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition shadow-sm self-start sm:self-auto">
          + Add Staff / Practitioner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {staffMembers.map((member) => (
          <div key={member.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{member.name}</h3>
                <p className="text-xs text-sky-600 font-bold">{member.role}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">SLVC Reg: {member.regNumber}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                member.status.includes('On Duty') ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {member.status}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs text-slate-500">
              <span>Shift: {member.shift}</span>
              <span className="font-bold text-slate-700">{member.patientsSeenToday} Patients Handled</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
