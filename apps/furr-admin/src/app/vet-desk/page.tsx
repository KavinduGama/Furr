'use client';

import { useState } from 'react';

// Mock data
const PENDING_VETS = [
  { id: 'vet_req_001', name: 'Dr. Emily Chen', regNumber: 'VET-88321', district: 'Kandy', email: 'emily.chen@example.com', submittedAt: '2026-08-10T10:30:00Z' },
  { id: 'vet_req_002', name: 'Dr. Michael Perera', regNumber: 'VET-44910', district: 'Colombo', email: 'm.perera@example.com', submittedAt: '2026-08-09T14:20:00Z' },
];

export default function VetDesk() {
  const [vets, setVets] = useState(PENDING_VETS);

  const handleApprove = (id: string) => {
    setVets(vets.filter(v => v.id !== id));
  };

  const handleReject = (id: string) => {
    setVets(vets.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-black text-[#02202B] tracking-tight">Vet Desk</h1>
        <p className="text-stone-500 mt-1">Review and verify veterinarian registration applications.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider border-b border-stone-200">
                <th className="p-4 font-bold">Applicant</th>
                <th className="p-4 font-bold">Reg. Number</th>
                <th className="p-4 font-bold">District</th>
                <th className="p-4 font-bold">Submitted</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {vets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500">No pending applications.</td>
                </tr>
              ) : (
                vets.map((vet) => (
                  <tr key={vet.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#02202B]">{vet.name}</p>
                      <p className="text-xs text-stone-500">{vet.email}</p>
                    </td>
                    <td className="p-4 font-mono text-sm">{vet.regNumber}</td>
                    <td className="p-4 text-sm text-stone-700">{vet.district}</td>
                    <td className="p-4 text-sm text-stone-500">{new Date(vet.submittedAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleApprove(vet.id)} className="bg-[#EEFAF5] text-[#2A6A51] hover:bg-[#D1F0E0] px-3 py-1.5 rounded-md text-sm font-bold transition-colors">Approve</button>
                      <button onClick={() => handleReject(vet.id)} className="bg-[#FFF3E0] text-[#E65100] hover:bg-[#FFE0B2] px-3 py-1.5 rounded-md text-sm font-bold transition-colors">Reject</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
