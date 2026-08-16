"use client";

import React, { useState } from "react";
import { INITIAL_CONSULTATIONS, INITIAL_MESSAGES } from "@furr/firebase";
import type { Consultation, ConsultationMessage } from "@furr/core";

export default function VetConsultsDeskPage() {
  const [consultations] = useState<Consultation[]>(INITIAL_CONSULTATIONS);
  const [selectedConsult, setSelectedConsult] = useState<Consultation>(INITIAL_CONSULTATIONS[0]);
  const [messages, setMessages] = useState<ConsultationMessage[]>(
    INITIAL_MESSAGES[INITIAL_CONSULTATIONS[0].id] || []
  );
  const [replyText, setReplyText] = useState("");

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newMsg: ConsultationMessage = {
      id: "vet-msg-" + Date.now(),
      consultationId: selectedConsult.id,
      senderUid: "vet-duty",
      senderRole: "vet",
      senderName: "Dr. Sarah Weerasinghe, BVSc",
      text: replyText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setReplyText("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-[#10242D] tracking-tight">Telehealth Duty Desk</h1>
          <p className="text-stone-500 text-sm mt-1">Live triage, asynchronous owner chat, and digital prescription issuance.</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          Duty Status: On Call
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[720px]">
        {/* Queue List */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-stone-100 bg-stone-50">
            <h3 className="font-bold text-[#10242D] text-sm">Incoming Case Queue</h3>
          </div>
          <div className="divide-y divide-stone-100 overflow-y-auto flex-1">
            {consultations.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedConsult(c);
                  setMessages(INITIAL_MESSAGES[c.id] || []);
                }}
                className={`p-4 cursor-pointer transition ${
                  selectedConsult?.id === c.id ? "bg-[#E6F4F5] border-l-4 border-l-[#006B78]" : "hover:bg-stone-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-stone-900 text-sm">{c.petName}</span>
                    <span className="text-xs text-stone-400 font-medium ml-2">({c.petSpecies})</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
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
              <h2 className="font-bold text-[#10242D]">Case: {selectedConsult.petName} ({selectedConsult.petBreed || "Mixed Breed"})</h2>
              <p className="text-xs text-stone-500">Owner: {selectedConsult.ownerName} · Duration: {selectedConsult.duration}</p>
            </div>
            <div className="text-right">
              <span className="text-xs px-2.5 py-1 rounded-full font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Consultation
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-stone-50/50">
            {messages.map((m) => {
              const isVet = m.senderRole === "vet";
              return (
                <div key={m.id} className={`flex flex-col ${isVet ? "items-end" : "items-start"}`}>
                  <span className="text-[11px] font-bold text-stone-400 mb-1">{m.senderName}</span>
                  <div
                    className={`max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      isVet ? "bg-[#006B78] text-white rounded-br-none" : "bg-white text-stone-800 border border-stone-200 rounded-bl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="p-4 border-t border-stone-200 bg-white flex gap-3">
            <input
              type="text"
              placeholder="Type medical response, advice or follow-up question..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 rounded-xl border border-stone-300 px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#006B78]"
            />
            <button
              type="submit"
              className="bg-[#006B78] hover:bg-[#00525C] text-white font-bold px-6 py-3 rounded-xl text-sm transition"
            >
              Send Reply
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
