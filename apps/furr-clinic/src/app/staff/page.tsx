'use client';

import React, { useState } from 'react';
import { useClinic } from '@/context/ClinicContext';

export default function ClinicStaffPage() {
  const { staff } = useClinic();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDept, setNewDept] = useState('');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    alert(`Added ${newName} (${newRole || 'Practitioner'}) to clinic staff roster.`);
    setShowAddModal(false);
    setNewName('');
    setNewRole('');
    setNewDept('');
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinic Staff &amp; Practitioners</h1>
          <p className="text-slate-500 text-sm mt-1">Manage duty rosters, verify practitioner credentials, and view caseloads.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition shadow-sm self-start sm:self-auto"
        >
          + Add Staff / Practitioner
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Add Staff Member</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Full Name &amp; Degree</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Nimal Silva, BVSc"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Role / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Veterinary Surgeon"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Inpatient &amp; Surgery"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-sm"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {staff.map((member) => (
          <div key={member.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{member.name}</h3>
                <p className="text-xs text-sky-600 font-bold">{member.role}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Dept: {member.department}</p>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  member.status === 'On Duty'
                    ? 'bg-emerald-100 text-emerald-700'
                    : member.status === 'In Surgery'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {member.status}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs text-slate-500">
              <span>Shift: {member.shift}</span>
              <span className="font-bold text-slate-700">{member.casesToday} Patients Handled Today</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
