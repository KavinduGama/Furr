'use client';

import React, { useState } from 'react';
import { useAdmin, AuditLogEntry } from '@/context/AdminContext';

export default function AuditLogsPage() {
  const { auditLogs } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | AuditLogEntry['category']>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#02202B] tracking-tight">Security &amp; Audit Trail</h1>
          <p className="text-stone-500 text-sm mt-1">
            Immutable operational event ledger recording all staff actions, practitioner verifications, and status changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-stone-700">Live Recording Stream</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
          <input
            type="text"
            placeholder="Search audit trail by keyword, administrator, or action details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#006B78]"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 bg-white p-2 rounded-2xl border border-stone-200 shadow-sm">
          {(['ALL', 'VET', 'CLINIC', 'MARKETPLACE', 'SERVICES', 'COMMUNITY', 'USER', 'FINANCE', 'SECURITY'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition ${
                categoryFilter === cat
                  ? 'bg-[#02202B] text-white'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm divide-y divide-stone-100 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-stone-400 font-medium text-xs">
            No audit logs found matching your filter criteria.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-stone-50/60 transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    log.category === 'VET' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    log.category === 'MARKETPLACE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    log.category === 'USER' ? 'bg-red-50 text-red-700 border border-red-200' :
                    log.category === 'CLINIC' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    log.category === 'FINANCE' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                    log.category === 'SECURITY' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                    'bg-stone-100 text-stone-700'
                  }`}>
                    {log.category}
                  </span>
                  <span className="font-bold text-stone-900 text-xs">{log.action}</span>
                </div>
                <p className="text-xs text-stone-600 font-medium">{log.details}</p>
                <p className="text-[10px] text-stone-400 font-mono">
                  Triggered by: {log.adminName} ({log.adminEmail})
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-mono text-xs font-semibold text-stone-500 block">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="text-[10px] text-stone-400">
                  {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
