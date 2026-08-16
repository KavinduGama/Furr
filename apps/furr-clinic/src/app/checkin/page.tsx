'use client';

import React, { useState } from 'react';

export default function PatientCheckInPage() {
  const [accessCode, setAccessCode] = useState('');
  const [selectedVet, setSelectedVet] = useState('Dr. Sarah Smith');
  const [room, setRoom] = useState('Room 1');
  const [reason, setReason] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;
    setIsSuccess(true);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Intake &amp; Check-In</h1>
        <p className="text-slate-500 text-sm mt-1">
          Scan or enter the owner&apos;s Furr QR code / 6-digit access grant to admit the patient and route to duty staff.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Intake Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Patient Admission Form</h2>

          {isSuccess ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <h3 className="font-bold text-emerald-900 text-lg">Patient Admitted Successfully</h3>
              <p className="text-xs text-emerald-700">
                Grant code <strong>{accessCode.toUpperCase()}</strong> redeemed. Patient routed to {room} with {selectedVet}.
              </p>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setAccessCode('');
                  setReason('');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition mt-2"
              >
                Intake Another Patient
              </button>
            </div>
          ) : (
            <form onSubmit={handleCheckIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Owner Access Grant Code (QR / 6-Char)
                </label>
                <input
                  type="text"
                  placeholder="e.g. A9B2X7"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full font-mono font-bold tracking-widest uppercase rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Provided by the pet owner in the Furr mobile app under &apos;Share with Vet&apos;.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Attending Vet
                  </label>
                  <select
                    value={selectedVet}
                    onChange={(e) => setSelectedVet(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option>Dr. Sarah Smith</option>
                    <option>Dr. Emily Chen</option>
                    <option>Dr. Michael Perera</option>
                    <option>Triage Tech Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Consult Room
                  </label>
                  <select
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option>Room 1</option>
                    <option>Room 2</option>
                    <option>Triage Bay A</option>
                    <option>Surgery Prep</option>
                    <option>Lobby / Waiting</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Visit Reason / Presenting Complaint
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Annual booster vaccines, ear itching, post-op suture removal..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-sm"
              >
                Confirm Admission &amp; Open Record
              </button>
            </form>
          )}
        </div>

        {/* QR Scanner / Quick Guide Box */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
            <span className="text-xs font-black text-sky-400 uppercase tracking-widest">Intake Hardware</span>
            <h3 className="font-bold text-lg">Barcode / 2D Scanner Ready</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Standard USB or Bluetooth 2D barcode scanners will automatically enter the 6-character grant code directly into the input field above.
            </p>
            <div className="border border-dashed border-slate-700 rounded-xl p-6 text-center bg-slate-800/40">
              <span className="text-slate-400 text-xs block font-mono">Ready for optical scan...</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Emergency / Unregistered Intake</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              If an emergency patient arrives without a Furr account, click below to generate an immediate temporary clinic chart.
            </p>
            <button className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-lg transition w-full">
              Create Temporary Emergency Chart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
