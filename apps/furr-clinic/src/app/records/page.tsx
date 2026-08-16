'use client';

import React, { useState } from 'react';

export default function ClinicRecordsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [records] = useState([
    {
      id: 'REC-5512',
      petName: 'Max',
      species: 'Dog (Golden Retriever)',
      ownerName: 'Sunil Jayawardena',
      phone: '+94 77 123 4567',
      lastVisit: '2026-08-14',
      primaryVet: 'Dr. Sarah Smith',
      activeConditions: ['Seasonal Allergies'],
    },
    {
      id: 'REC-5513',
      petName: 'Luna',
      species: 'Cat (Domestic Shorthair)',
      ownerName: 'Devinda Perera',
      phone: '+94 71 987 6543',
      lastVisit: '2026-08-11',
      primaryVet: 'Dr. Emily Chen',
      activeConditions: ['None / Healthy'],
    },
    {
      id: 'REC-5514',
      petName: 'Rocky',
      species: 'Dog (German Shepherd)',
      ownerName: 'Kasun Bandara',
      phone: '+94 70 555 1234',
      lastVisit: '2026-08-16',
      primaryVet: 'Dr. Michael Perera',
      activeConditions: ['Paw Laceration'],
    },
  ]);

  const filteredRecords = records.filter(
    (r) =>
      r.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinic Patient Medical Files</h1>
          <p className="text-slate-500 text-sm mt-1">Search patient history, clinical discharge notes, and hospital lab attachments.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex gap-3">
        <input
          type="text"
          placeholder="Search by Patient Name, Owner Name, Phone Number or Record ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider font-bold">
              <th className="p-4 pl-6">Chart ID</th>
              <th className="p-4">Patient &amp; Species</th>
              <th className="p-4">Owner &amp; Contact</th>
              <th className="p-4">Primary Practitioner</th>
              <th className="p-4">Active Conditions</th>
              <th className="p-4">Last Visit</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 transition">
                <td className="p-4 pl-6 font-mono font-bold text-sky-600">{r.id}</td>
                <td className="p-4">
                  <p className="font-bold text-slate-900">{r.petName}</p>
                  <p className="text-xs text-slate-400">{r.species}</p>
                </td>
                <td className="p-4">
                  <p className="font-medium text-slate-900">{r.ownerName}</p>
                  <p className="text-xs text-slate-500">{r.phone}</p>
                </td>
                <td className="p-4 text-slate-700">{r.primaryVet}</td>
                <td className="p-4">
                  {r.activeConditions.map((c, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                      {c}
                    </span>
                  ))}
                </td>
                <td className="p-4 text-slate-500">{new Date(r.lastVisit).toLocaleDateString()}</td>
                <td className="p-4 pr-6 text-right">
                  <button className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg transition">
                    Open File
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
