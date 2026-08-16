'use client';

import React, { useState } from 'react';
import { useAdmin, DisputeTicket } from '@/context/AdminContext';

export default function DisputesAdminPage() {
  const { disputes, resolveDispute } = useAdmin();
  const [selectedDispute, setSelectedDispute] = useState<DisputeTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  const filteredDisputes = disputes.filter((d) => {
    if (filter === 'open') return d.status === 'open' || d.status === 'under_review';
    if (filter === 'resolved') return d.status === 'resolved' || d.status === 'dismissed';
    return true;
  });

  const handleResolve = (action: 'refund' | 'dismiss' | 'resolve') => {
    if (selectedDispute && resolutionNotes.trim()) {
      resolveDispute(selectedDispute.id, resolutionNotes.trim(), action);
      setSelectedDispute(null);
      setResolutionNotes('');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#02202B] tracking-tight">Disputes &amp; Trust Resolution</h1>
          <p className="text-stone-500 text-sm mt-1">
            Investigate customer complaints, damaged delivery claims, service disputes, and trigger refunds.
          </p>
        </div>

        <div className="flex gap-2 bg-stone-200/60 p-1 rounded-2xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filter === 'all' ? 'bg-white text-[#02202B] shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Tickets ({disputes.length})
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filter === 'open' ? 'bg-white text-[#02202B] shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Pending Action ({disputes.filter((d) => d.status === 'open' || d.status === 'under_review').length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filter === 'resolved' ? 'bg-white text-[#02202B] shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Resolved ({disputes.filter((d) => d.status === 'resolved' || d.status === 'dismissed').length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm divide-y divide-stone-100 overflow-hidden">
        {filteredDisputes.length === 0 ? (
          <div className="p-12 text-center text-stone-400 font-medium">
            No dispute tickets found in this view.
          </div>
        ) : (
          filteredDisputes.map((d) => (
            <div key={d.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-stone-50/50 transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-[#02202B]">{d.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    d.status === 'open' ? 'bg-red-100 text-red-800' :
                    d.status === 'under_review' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {d.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-stone-400 font-medium">Ref: {d.referenceId}</span>
                </div>

                <h3 className="text-base font-black text-[#02202B] mt-1.5">{d.reason}</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Complainant: <span className="font-bold text-stone-800">{d.complainantName}</span> ({d.complainantRole}) vs. Defendant: <span className="font-bold text-stone-800">{d.defendantName}</span>
                </p>
                {d.amount && (
                  <p className="text-xs text-[#006B78] font-bold mt-1">Claim Amount: Rs {d.amount.toLocaleString()}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedDispute(d);
                    setResolutionNotes(d.resolutionNotes || '');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#02202B] hover:bg-[#003B46] text-white transition shadow-sm"
                >
                  Inspect &amp; Resolve
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolution Drawer Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-black tracking-widest text-stone-400 uppercase">Dispute Review</span>
                <h2 className="text-xl font-black text-[#02202B]">{selectedDispute.id}</h2>
              </div>
              <button onClick={() => setSelectedDispute(null)} className="text-stone-400 hover:text-stone-700 text-lg font-bold">✕</button>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-xs space-y-2">
              <p><span className="font-bold text-stone-500">Complaint Reason:</span> {selectedDispute.reason}</p>
              <p><span className="font-bold text-stone-500">Complainant:</span> {selectedDispute.complainantName} ({selectedDispute.complainantRole})</p>
              <p><span className="font-bold text-stone-500">Defendant / Seller:</span> {selectedDispute.defendantName}</p>
              {selectedDispute.amount && (
                <p><span className="font-bold text-stone-500">Disputed Amount:</span> Rs {selectedDispute.amount.toLocaleString()}</p>
              )}
            </div>

            <div>
              <label className="font-bold text-stone-700 text-xs uppercase tracking-wider block mb-1">
                Admin Resolution Notes &amp; Action Justification
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Detail the outcome of this dispute investigation (e.g. Issued 100% refund due to courier damaged goods)..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#006B78]"
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setSelectedDispute(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!resolutionNotes.trim()}
                onClick={() => handleResolve('dismiss')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-200 hover:bg-stone-300 text-stone-800 disabled:opacity-50"
              >
                Dismiss Complaint
              </button>
              <button
                type="button"
                disabled={!resolutionNotes.trim()}
                onClick={() => handleResolve('refund')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-50"
              >
                Approve Refund &amp; Settle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
