'use client';

import React, { useState } from 'react';
import { useAdmin, VetApplicant } from '@/context/AdminContext';

export default function VetDeskPage() {
  const { vets, approveVet, rejectVet } = useAdmin();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedVet, setSelectedVet] = useState<VetApplicant | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVets = vets
    .filter((v) => v.status === activeTab)
    .filter(
      (v) =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.district.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleOpenReject = (vet: VetApplicant) => {
    setSelectedVet(vet);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (selectedVet && rejectReason.trim()) {
      rejectVet(selectedVet.id, rejectReason.trim());
      setShowRejectModal(false);
      setSelectedVet(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#02202B] tracking-tight">Vet Verification Desk</h1>
          <p className="text-stone-500 text-sm mt-1">
            Review SLVC licensing, degree qualifications, and clinic affiliations for veterinary doctors.
          </p>
        </div>

        <div className="flex gap-2 bg-stone-200/60 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'pending'
                ? 'bg-white text-[#02202B] shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Pending ({vets.filter((v) => v.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'approved'
                ? 'bg-white text-[#02202B] shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Verified ({vets.filter((v) => v.status === 'approved').length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'rejected'
                ? 'bg-white text-[#02202B] shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Rejected ({vets.filter((v) => v.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex gap-4">
        <input
          type="text"
          placeholder="Filter by practitioner name, SLVC registration #, or district..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B78]"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs font-bold text-stone-500 hover:text-stone-800 px-3 py-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider border-b border-stone-200">
              <th className="p-4 font-bold">Practitioner</th>
              <th className="p-4 font-bold">SLVC Reg. #</th>
              <th className="p-4 font-bold">Specialization &amp; Clinic</th>
              <th className="p-4 font-bold">District</th>
              <th className="p-4 font-bold">Submitted Date</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredVets.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-stone-400 font-medium">
                  No {activeTab} veterinarian applications found.
                </td>
              </tr>
            ) : (
              filteredVets.map((vet) => (
                <tr key={vet.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-[#02202B]">{vet.name}</p>
                    <p className="text-xs text-stone-500">{vet.email} · {vet.phone}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
                      {vet.regNumber}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-stone-800 text-xs">{vet.specialization}</p>
                    <p className="text-[11px] text-[#006B78] font-bold">{vet.clinicAffiliation} ({vet.yearsOfExperience} yrs exp)</p>
                  </td>
                  <td className="p-4 text-xs font-semibold text-stone-700">{vet.district}</td>
                  <td className="p-4 text-xs text-stone-500">
                    {new Date(vet.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedVet(vet)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 transition"
                      >
                        Inspect Files
                      </button>

                      {vet.status === 'pending' && (
                        <>
                          <button
                            onClick={() => approveVet(vet.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleOpenReject(vet)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Inspect Detail Modal */}
      {selectedVet && !showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#006B78] uppercase">SLVC Practitioner Profile</span>
                <h2 className="text-2xl font-black text-[#02202B]">{selectedVet.name}</h2>
                <p className="text-xs text-stone-500 font-mono mt-0.5">Registration: {selectedVet.regNumber}</p>
              </div>
              <button
                onClick={() => setSelectedVet(null)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center font-bold hover:bg-stone-200"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
                <span className="font-bold text-stone-400 uppercase tracking-wider block mb-1">Email & Phone</span>
                <p className="font-bold text-stone-900">{selectedVet.email}</p>
                <p className="text-stone-600 mt-0.5">{selectedVet.phone}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
                <span className="font-bold text-stone-400 uppercase tracking-wider block mb-1">District & Location</span>
                <p className="font-bold text-stone-900">{selectedVet.district}, Sri Lanka</p>
                <p className="text-stone-600 mt-0.5">{selectedVet.clinicAffiliation}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
                <span className="font-bold text-stone-400 uppercase tracking-wider block mb-1">Clinical Specialty</span>
                <p className="font-bold text-stone-900">{selectedVet.specialization}</p>
                <p className="text-stone-600 mt-0.5">{selectedVet.yearsOfExperience} Years Clinical Practice</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
                <span className="font-bold text-stone-400 uppercase tracking-wider block mb-1">Verification Status</span>
                <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] ${
                  selectedVet.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                  selectedVet.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedVet.status}
                </span>
                {selectedVet.rejectionReason && (
                  <p className="text-red-700 text-[11px] mt-1 font-medium">Reason: {selectedVet.rejectionReason}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-stone-900 text-sm mb-3">Submitted Accreditation Documents</h3>
              <div className="space-y-2">
                {selectedVet.documents.map((doc, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">📄</span>
                      <div>
                        <p className="font-bold text-stone-900">{doc.type}</p>
                        <p className="text-[10px] text-stone-500 font-mono">{doc.name}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-white border border-stone-200 rounded-lg text-stone-700 font-bold hover:bg-stone-50 cursor-pointer">
                      Preview Document
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
              <button
                onClick={() => setSelectedVet(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700"
              >
                Close
              </button>
              {selectedVet.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      approveVet(selectedVet.id);
                      setSelectedVet(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    Grant SLVC Verification
                  </button>
                  <button
                    onClick={() => handleOpenReject(selectedVet)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
                  >
                    Reject Application
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && selectedVet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <h2 className="text-xl font-black text-[#02202B]">Reject Vet Application</h2>
            <p className="text-xs text-stone-500">
              Specify the reason for rejecting <span className="font-bold text-stone-800">{selectedVet.name}</span>. This feedback will be recorded in the audit trail.
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. SLVC registration number mismatch with government registry..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
