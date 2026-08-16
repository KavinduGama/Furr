"use client";

import React, { useState } from "react";
import { INITIAL_MEETUPS, INITIAL_QUESTIONS, INITIAL_LOST_ALERTS } from "@furr/firebase";
import type { PetMeetup, ForumQuestion, LostPetAlert } from "@furr/core";

export default function AdminCommunityPage() {
  const [meetups, setMeetups] = useState<PetMeetup[]>(INITIAL_MEETUPS);
  const [questions, setQuestions] = useState<ForumQuestion[]>(INITIAL_QUESTIONS);
  const [alerts, setAlerts] = useState<LostPetAlert[]>(INITIAL_LOST_ALERTS);

  const toggleSponsorMeetup = (id: string) => {
    setMeetups((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isSponsored: !m.isSponsored } : m))
    );
  };

  const resolveLostAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "resolved" } : a))
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[#10242D] tracking-tight">Community & Emergency Alerts</h1>
        <p className="text-stone-500 text-sm mt-1">Moderate local pet meetups, forum questions, and Lost Pet Amber alerts.</p>
      </div>

      {/* Lost Pet Radar Alerts */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-100 bg-red-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            <h2 className="font-black text-red-950">Active Lost Pet Alerts ({alerts.filter((a) => a.status === 'active').length})</h2>
          </div>
        </div>
        <div className="divide-y divide-stone-100">
          {alerts.map((a) => (
            <div key={a.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                {a.photoUrl && (
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                    <img src={a.photoUrl} alt={a.petName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{a.petName} ({a.species})</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${a.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-stone-100 text-stone-600'}`}>
                      {a.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">Last seen: {a.lastSeenAddress}, {a.lastSeenCity}</p>
                  <p className="text-xs text-stone-400">Owner: {a.ownerName} ({a.ownerPhone}) · Reward: {a.rewardAmount || 'None'}</p>
                </div>
              </div>

              {a.status === 'active' && (
                <button
                  onClick={() => resolveLostAlert(a.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Mark as Reunited / Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Local Meetups */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-100 bg-stone-50">
          <h2 className="font-bold text-[#10242D]">Local Pet Walks & Meetups</h2>
        </div>
        <div className="divide-y divide-stone-100">
          {meetups.map((m) => (
            <div key={m.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900">{m.title}</span>
                  {m.isSponsored && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                      SPONSORED
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-1">{m.locationName}, {m.city} · Date: {m.date} at {m.time}</p>
                <p className="text-xs text-stone-400">Host: {m.creatorName} · {m.rsvpCount} Attending</p>
              </div>

              <button
                onClick={() => toggleSponsorMeetup(m.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800"
              >
                {m.isSponsored ? "Remove Brand Sponsor" : "Attach Brand Sponsor Tag"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
