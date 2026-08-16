'use client';

import React, { useState } from 'react';
import { useAdmin, ClinicRegistration } from '@/context/AdminContext';

export default function ClinicsAdminPage() {
  const { clinics, approveClinic, suspendClinic, addClinic } = useAdmin();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    regNumber: '',
    district: 'Colombo',
    address: '',
    phone: '',
    email: '',
    type: '24/7 Emergency Hospital' as ClinicRegistration['type'],
    operatingHours: '24 Hours / 7 Days',
    staffCount: 5,
    status: 'active' as ClinicRegistration['status'],
    chiefMedicalOfficer: '',
    emergencyIntakeReady: true,
  });

  const filteredClinics = clinics.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.regNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.regNumber || !formData.chiefMedicalOfficer) return;
    addClinic(formData);
    setShowAddModal(false);
    setFormData({
      name: '',
      regNumber: '',
      district: 'Colombo',
      address: '',
      phone: '',
      email: '',
      type: '24/7 Emergency Hospital',
      operatingHours: '24 Hours / 7 Days',
      staffCount: 5,
      status: 'active',
      chiefMedicalOfficer: '',
      emergencyIntakeReady: true,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#02202B] tracking-tight">Clinics &amp; Hospital Registry</h1>
          <p className="text-stone-500 text-sm mt-1">
            Manage partner veterinary hospitals, accredited clinical facilities, and emergency intake floor readiness.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#02202B] hover:bg-[#003B46] text-white transition shadow-sm flex items-center gap-2"
        >
          <span>🏥 Register New Clinic</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Partner Clinics</span>
          <p className="text-2xl font-black text-[#02202B] mt-1">{clinics.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">24/7 Emergency Readiness</span>
          <p className="text-2xl font-black text-red-600 mt-1">
            {clinics.filter((c) => c.emergencyIntakeReady).length} Facilities
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Pending Accreditation</span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {clinics.filter((c) => c.status === 'pending_verification').length} Facilities
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex gap-4">
        <input
          type="text"
          placeholder="Search by clinic name, district, or registration code..."
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

      {/* Clinic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredClinics.map((clinic) => (
          <div key={clinic.id} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4 hover:border-stone-300 transition">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 border border-stone-200">
                    {clinic.regNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    clinic.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                    clinic.status === 'pending_verification' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {clinic.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#02202B] mt-2">{clinic.name}</h3>
                <p className="text-xs text-stone-500">{clinic.address}, {clinic.district}</p>
              </div>

              {clinic.emergencyIntakeReady && (
                <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-red-50 text-red-700 border border-red-200">
                  🚨 24/7 INTAKE
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-3 rounded-2xl border border-stone-100">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Chief Medical Officer</span>
                <p className="font-bold text-stone-800 mt-0.5">{clinic.chiefMedicalOfficer}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Facility Type</span>
                <p className="font-bold text-stone-800 mt-0.5">{clinic.type}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Hours &amp; Roster</span>
                <p className="font-medium text-stone-700 mt-0.5">{clinic.operatingHours} ({clinic.staffCount} Staff)</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Contact Phone</span>
                <p className="font-medium text-stone-700 mt-0.5">{clinic.phone}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              {clinic.status === 'pending_verification' && (
                <button
                  onClick={() => approveClinic(clinic.id)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
                >
                  Approve Accreditation
                </button>
              )}
              {clinic.status === 'active' && (
                <button
                  onClick={() => suspendClinic(clinic.id)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition"
                >
                  Suspend Facility
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Clinic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h2 className="text-xl font-black text-[#02202B]">Register Partner Clinic</h2>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-600 uppercase tracking-wider block mb-1">Clinic / Hospital Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Negombo Veterinary Specialty Hospital"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-600 uppercase tracking-wider block mb-1">Accreditation Reg. #</label>
                  <input
                    required
                    type="text"
                    value={formData.regNumber}
                    onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                    placeholder="CLIN-NGB-0012"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-600 uppercase tracking-wider block mb-1">District</label>
                  <input
                    required
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Gampaha / Colombo"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-600 uppercase tracking-wider block mb-1">Chief Medical Officer (SLVC Vet)</label>
                <input
                  required
                  type="text"
                  value={formData.chiefMedicalOfficer}
                  onChange={(e) => setFormData({ ...formData, chiefMedicalOfficer: e.target.value })}
                  placeholder="Dr. Samantha Wickrama (SLVC-9912)"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-600 uppercase tracking-wider block mb-1">Address</label>
                <input
                  required
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="12 Beach Road, Negombo"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-600 uppercase tracking-wider block mb-1">Phone</label>
                  <input
                    required
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+94 31 222 3344"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-600 uppercase tracking-wider block mb-1">Email</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@negombovet.lk"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="emergency"
                  checked={formData.emergencyIntakeReady}
                  onChange={(e) => setFormData({ ...formData, emergencyIntakeReady: e.target.checked })}
                  className="rounded text-[#006B78]"
                />
                <label htmlFor="emergency" className="font-bold text-stone-800 text-xs">
                  Equipped for 24/7 Trauma &amp; Emergency Intake
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#02202B] hover:bg-[#003B46] text-white"
                >
                  Register Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
