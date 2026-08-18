"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  INITIAL_CONSULTATIONS,
  INITIAL_MESSAGES,
  subscribeToAllActiveConsultations,
  subscribeToConsultationMessages,
  sendConsultationMessage,
  updateConsultationStatus,
} from "@furr/firebase";
import type { Consultation, ConsultationMessage, VetPrescriptionItem } from "@furr/core";
import { useAuth } from "@/context/auth";

export default function VetConsultsDeskPage() {
  const { profile } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>(INITIAL_CONSULTATIONS);
  const [selectedConsult, setSelectedConsult] = useState<Consultation>(INITIAL_CONSULTATIONS[0]);
  const [messages, setMessages] = useState<ConsultationMessage[]>(
    INITIAL_MESSAGES[INITIAL_CONSULTATIONS[0].id] || []
  );
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxForm, setRxForm] = useState<VetPrescriptionItem>({
    medicationName: "",
    dosage: "",
    frequency: "Once daily",
    durationDays: 5,
    instructions: "",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to all incoming consultations stream
  useEffect(() => {
    const unsub = subscribeToAllActiveConsultations((list) => {
      setConsultations(list);
      // Keep selectedConsult in sync if it exists in updated list
      if (selectedConsult) {
        const found = list.find((c) => c.id === selectedConsult.id);
        if (found) setSelectedConsult(found);
      } else if (list.length > 0) {
        setSelectedConsult(list[0]);
      }
    });
    return () => unsub();
  }, [selectedConsult?.id]);

  // Subscribe to messages of active consultation
  useEffect(() => {
    if (!selectedConsult?.id) return;
    const unsub = subscribeToConsultationMessages(selectedConsult.id, (msgs) => {
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    });
    return () => unsub();
  }, [selectedConsult?.id]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConsult || isSending) return;

    const text = replyText.trim();
    setReplyText("");
    setIsSending(true);

    try {
      const senderUid = profile?.uid || "vet-duty";
      const senderName = profile?.fullName || "Dr. Sarah Weerasinghe, BVSc";

      await sendConsultationMessage({
        consultationId: selectedConsult.id,
        senderUid,
        senderRole: "vet",
        senderName,
        text,
      });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (err) {
      console.warn("Failed to send vet response:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleIssuePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsult || !rxForm.medicationName.trim()) return;

    const updatedPrescriptions = [...(selectedConsult.prescriptions || []), rxForm];
    await updateConsultationStatus(selectedConsult.id, {
      prescriptions: updatedPrescriptions,
      vetUid: profile?.uid || "vet-101",
      vetName: profile?.fullName || "Dr. Sarah Weerasinghe, BVSc",
      vetClinicName: "Colombo Veterinary Hospital",
    });

    // Post an announcement message in the chat
    const senderUid = profile?.uid || "vet-duty";
    const senderName = profile?.fullName || "Dr. Sarah Weerasinghe, BVSc";
    await sendConsultationMessage({
      consultationId: selectedConsult.id,
      senderUid,
      senderRole: "vet",
      senderName,
      text: `📋 Official Digital Prescription issued: ${rxForm.medicationName} (${rxForm.dosage}, ${rxForm.frequency} for ${rxForm.durationDays} days). Available in your case details.`,
    });

    setShowRxModal(false);
    setRxForm({
      medicationName: "",
      dosage: "",
      frequency: "Once daily",
      durationDays: 5,
      instructions: "",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-[#10242D] tracking-tight">Telehealth Duty Desk</h1>
          <p className="text-stone-500 text-sm mt-1">Live triage, asynchronous owner chat, and digital prescription issuance.</p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          Duty Status: Live Telehealth Stream Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[740px]">
        {/* Queue List */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
            <h3 className="font-bold text-[#10242D] text-sm">Incoming Case Queue</h3>
            <span className="text-xs font-bold text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded-full">
              {consultations.length} Cases
            </span>
          </div>
          <div className="divide-y divide-stone-100 overflow-y-auto flex-1">
            {consultations.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedConsult(c)}
                className={`p-4 cursor-pointer transition ${
                  selectedConsult?.id === c.id ? "bg-[#E6F4F5] border-l-4 border-l-[#006B78]" : "hover:bg-stone-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-stone-900 text-sm">{c.petName}</span>
                    <span className="text-xs text-stone-400 font-medium ml-2">({c.petSpecies})</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    c.severity === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {c.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">{c.symptoms}</p>
                <div className="flex justify-between items-center mt-3 text-[11px] text-stone-400">
                  <span>Owner: {c.ownerName}</span>
                  <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Chat & Case Consultation Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col overflow-hidden">
          {/* Case Header */}
          <div className="p-4 border-b border-stone-100 bg-[#FAF9F5] flex justify-between items-center">
            <div>
              <h2 className="font-bold text-[#10242D] text-base">
                Case: {selectedConsult.petName} ({selectedConsult.petBreed || "Mixed Breed"})
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Owner: <span className="font-semibold text-stone-700">{selectedConsult.ownerName}</span> · Duration: {selectedConsult.duration}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowRxModal(true)}
                className="bg-[#006B78] hover:bg-[#00525C] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                <span>💊</span> Issue Prescription
              </button>
              <span className="text-xs px-2.5 py-1 rounded-full font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Session
              </span>
            </div>
          </div>

          {/* Active Prescriptions Banner if any */}
          {selectedConsult.prescriptions && selectedConsult.prescriptions.length > 0 && (
            <div className="bg-sky-50 border-b border-sky-100 p-3 px-6 text-xs flex items-center gap-3 overflow-x-auto">
              <span className="font-bold text-sky-800 flex-shrink-0">Issued Prescriptions:</span>
              {selectedConsult.prescriptions.map((rx, idx) => (
                <span key={idx} className="bg-white text-sky-900 border border-sky-200 px-2.5 py-1 rounded-lg font-medium flex-shrink-0 shadow-2xs">
                  💊 {rx.medicationName} ({rx.dosage}, {rx.frequency})
                </span>
              ))}
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-stone-50/50">
            {messages.map((m) => {
              const isVet = m.senderRole === "vet";
              return (
                <div key={m.id} className={`flex flex-col ${isVet ? "items-end" : "items-start"}`}>
                  <span className="text-[11px] font-bold text-stone-400 mb-1 px-1">{m.senderName}</span>
                  <div
                    className={`max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      isVet
                        ? "bg-[#006B78] text-white rounded-br-none"
                        : "bg-white text-stone-800 border border-stone-200 rounded-bl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 px-1">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="p-4 border-t border-stone-200 bg-white flex gap-3">
            <input
              type="text"
              placeholder="Type medical response, advice or follow-up question..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={isSending}
              className="flex-1 rounded-xl border border-stone-300 px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#006B78]"
            />
            <button
              type="submit"
              disabled={!replyText.trim() || isSending}
              className="bg-[#006B78] hover:bg-[#00525C] disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-sm transition"
            >
              {isSending ? "Sending..." : "Send Reply"}
            </button>
          </form>
        </div>
      </div>

      {/* Issue Prescription Modal */}
      {showRxModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">💊</span>
                <h3 className="text-lg font-black text-stone-900">Issue Digital Prescription</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRxModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 font-bold text-sm flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-500 mb-4">
              Prescription for <span className="font-bold text-stone-700">{selectedConsult.petName}</span>. This will be officially signed under your veterinary credentials and sent directly to the owner.
            </p>

            <form onSubmit={handleIssuePrescription} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">Medication Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin / Clavulanate 250mg"
                  value={rxForm.medicationName}
                  onChange={(e) => setRxForm({ ...rxForm, medicationName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">Dosage</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 tablet (12.5mg/kg)"
                    value={rxForm.dosage}
                    onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">Frequency</label>
                  <select
                    value={rxForm.frequency}
                    onChange={(e) => setRxForm({ ...rxForm, frequency: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily (every 12 hrs)">Twice daily (every 12 hrs)</option>
                    <option value="Three times daily (every 8 hrs)">Three times daily (every 8 hrs)</option>
                    <option value="As needed for pain">As needed for pain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">Course Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  required
                  value={rxForm.durationDays}
                  onChange={(e) => setRxForm({ ...rxForm, durationDays: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">Administration Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Administer with food. Complete entire course even if symptoms resolve."
                  value={rxForm.instructions}
                  onChange={(e) => setRxForm({ ...rxForm, instructions: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#006B78] hover:bg-[#00525C] text-white font-bold py-2.5 rounded-xl text-sm transition shadow-sm"
                >
                  Confirm & Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
