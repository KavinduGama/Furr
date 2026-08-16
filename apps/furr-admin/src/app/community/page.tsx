'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';

export default function AdminCommunityPage() {
  const { meetups, toggleSponsorMeetup, questions, deleteQuestion, lostAlerts, resolveLostAlert } = useAdmin();
  const [activeTab, setActiveTab] = useState<'alerts' | 'meetups' | 'forum'>('alerts');

  const activeAlerts = lostAlerts.filter((a) => a.status === 'active');
  const resolvedAlerts = lostAlerts.filter((a) => a.status === 'resolved');

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#02202B] tracking-tight">Community &amp; Emergency Alerts</h1>
          <p className="text-stone-500 text-sm mt-1">
            Lost Pet Amber alert broadcasts, community meetup sponsorships, and public forum moderation.
          </p>
        </div>

        <div className="flex gap-2 bg-stone-200/60 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'alerts' ? 'bg-white text-[#02202B] shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {activeAlerts.length > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>}
            Amber Alerts ({activeAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('meetups')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'meetups' ? 'bg-white text-[#02202B] shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Pet Walks &amp; Meetups ({meetups.length})
          </button>
          <button
            onClick={() => setActiveTab('forum')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'forum' ? 'bg-white text-[#02202B] shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Forum Q&amp;A ({questions.length})
          </button>
        </div>
      </div>

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-5 flex justify-between items-center">
            <div>
              <p className="text-xs font-black text-red-950 uppercase tracking-wider">Amber Radar Active Broadcast System</p>
              <p className="text-xs text-red-800 mt-0.5">
                When active, push notifications are dispatched to all Furr app users in the 5km vicinity of the reported location.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-black text-xs">
              {activeAlerts.length} BROADCASTING
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lostAlerts.map((alert) => (
              <div key={alert.id} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4 hover:border-stone-300 transition">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-4">
                    {alert.photoUrl && (
                      <img
                        src={alert.photoUrl}
                        alt={alert.petName}
                        className="w-16 h-16 rounded-2xl object-cover bg-stone-100 border border-stone-200"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-[#02202B]">{alert.petName}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          alert.status === 'active' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {alert.status === 'active' ? '🚨 LOST' : '✓ REUNITED'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 capitalize">{alert.species} · {alert.breed}</p>
                      <p className="text-xs text-stone-700 font-semibold mt-0.5">Last seen: {alert.lastSeenAddress}, {alert.lastSeenCity}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px]">Owner Information</span>
                    <span className="text-emerald-700 font-bold">Reward: {alert.rewardAmount ? `Rs ${alert.rewardAmount}` : 'None'}</span>
                  </div>
                  <p className="font-bold text-stone-800 mt-1">{alert.ownerName} · 📞 {alert.ownerPhone}</p>
                  <p className="text-stone-500 text-[11px] mt-1">{alert.description}</p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                  {alert.status === 'active' ? (
                    <button
                      onClick={() => resolveLostAlert(alert.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
                    >
                      Mark as Reunited &amp; Stop Broadcast
                    </button>
                  ) : (
                    <span className="text-xs text-stone-400 font-bold py-2">Case Closed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'meetups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meetups.map((m) => (
            <div key={m.id} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4 hover:border-stone-300 transition">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-[#02202B]">{m.title}</h3>
                    {m.isSponsored && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                        ⭐ SPONSORED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-1">{m.locationName}, {m.city}</p>
                  <p className="text-xs text-stone-700 font-semibold mt-1">🗓️ {m.date} at {m.time}</p>
                </div>

                <span className="px-3 py-1 bg-stone-100 rounded-xl text-xs font-black text-stone-700">
                  {m.rsvpCount} Attending
                </span>
              </div>

              <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-2xl border border-stone-100">{m.description}</p>

              <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                <span className="text-[11px] text-stone-400 font-medium">Organized by {m.creatorName}</span>
                <button
                  onClick={() => toggleSponsorMeetup(m.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    m.isSponsored
                      ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                  }`}
                >
                  {m.isSponsored ? 'Remove Brand Sponsor' : 'Attach Brand Sponsor'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'forum' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm divide-y divide-stone-100 overflow-hidden">
          {questions.map((q) => (
            <div key={q.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-stone-50/50 transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-[#006B78]/10 text-[#006B78]">
                    {q.category}
                  </span>
                  <span className="text-xs text-stone-400">Asked by {q.authorName}</span>
                </div>
                <h4 className="text-base font-black text-[#02202B] mt-1.5">{q.title}</h4>
                <p className="text-xs text-stone-600 mt-1 line-clamp-2">{q.details}</p>
                <p className="text-[11px] text-stone-400 mt-2 font-semibold">
                  💬 {q.answersCount} Answers
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteQuestion(q.id)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition"
                >
                  Delete Post
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
