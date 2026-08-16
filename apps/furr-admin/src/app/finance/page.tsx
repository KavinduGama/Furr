'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';

export default function FinanceAdminPage() {
  const { payouts, settlePayout, orders, bookings } = useAdmin();
  const [downloading, setDownloading] = useState(false);

  const marketplaceGMV = orders.reduce((sum, o) => sum + o.total, 0);
  const serviceBookingGMV = bookings.reduce((sum, b) => sum + b.price, 0);
  const totalGMV = marketplaceGMV + serviceBookingGMV;
  const platformRevenue = (marketplaceGMV * 0.1) + (serviceBookingGMV * 0.1); // 10% platform take-rate

  const pendingPayouts = payouts.filter((p) => p.status === 'pending');
  const pendingPayoutsTotal = pendingPayouts.reduce((sum, p) => sum + p.netPayout, 0);

  const handleExportCSV = () => {
    setDownloading(true);
    try {
      const headers = ['Payout Ref,Vendor Name,Type,Period,Gross Volume,Platform Fee,Net Payout,Bank Account,Status'];
      const rows = payouts.map(
        (p) =>
          `"${p.id}","${p.vendorName}","${p.type}","${p.period}",${p.grossRevenue},${p.platformFee},${p.netPayout},"${p.bankAccount}","${p.status}"`
      );
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `furr_finance_settlements_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#02202B] tracking-tight">Finance &amp; Vendor Settlements</h1>
          <p className="text-stone-500 text-sm mt-1">
            Platform revenue ledger, vendor payout escrow, and marketplace seller settlements.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={downloading}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#02202B] hover:bg-[#003B46] text-white transition shadow-sm flex items-center gap-2"
        >
          <span>📊 {downloading ? 'Generating Statement…' : 'Export Financial CSV'}</span>
        </button>
      </div>

      {/* KPI Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Gross Platform GMV</span>
          <p className="text-3xl font-black text-[#02202B] mt-2">Rs {totalGMV.toLocaleString()}</p>
          <p className="text-xs text-stone-500 mt-2">E-Commerce + Booking Volume</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Platform Take-Rate (10%)</span>
          <p className="text-3xl font-black text-emerald-600 mt-2">Rs {platformRevenue.toLocaleString()}</p>
          <p className="text-xs text-emerald-700 font-bold mt-2">+15% vs previous cycle</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Furr+ Subscription MRR</span>
          <p className="text-3xl font-black text-[#006B78] mt-2">Rs 624,000</p>
          <p className="text-xs text-stone-500 mt-2">1,250 Active Paid Members</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Pending Payout Escrow</span>
          <p className="text-3xl font-black text-amber-600 mt-2">Rs {pendingPayoutsTotal.toLocaleString()}</p>
          <p className="text-xs text-amber-700 font-bold mt-2">{pendingPayouts.length} disbursements ready</p>
        </div>
      </div>

      {/* Vendor Payouts Desk */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex justify-between items-center pb-3 border-b border-stone-100">
          <div>
            <h2 className="text-lg font-black text-[#02202B]">Vendor &amp; Specialist Settlement Batches</h2>
            <p className="text-xs text-stone-500">Bi-weekly disbursement transfers for marketplace merchants and service providers.</p>
          </div>
        </div>

        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider border-b border-stone-200">
              <th className="p-4 font-bold">Payout Ref</th>
              <th className="p-4 font-bold">Vendor / Specialist</th>
              <th className="p-4 font-bold">Period</th>
              <th className="p-4 font-bold">Gross Volume</th>
              <th className="p-4 font-bold">Platform Fee</th>
              <th className="p-4 font-bold">Net Payout</th>
              <th className="p-4 font-bold">Bank Account</th>
              <th className="p-4 font-bold text-right">Status / Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {payouts.map((p) => (
              <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                <td className="p-4 font-mono text-xs font-bold text-[#02202B]">{p.id}</td>
                <td className="p-4">
                  <p className="font-bold text-stone-900">{p.vendorName}</p>
                  <span className="text-[10px] uppercase font-bold text-stone-400">{p.type}</span>
                </td>
                <td className="p-4 text-xs text-stone-600">{p.period}</td>
                <td className="p-4 text-xs font-bold text-stone-800">Rs {p.grossRevenue.toLocaleString()}</td>
                <td className="p-4 text-xs text-stone-500">- Rs {p.platformFee.toLocaleString()}</td>
                <td className="p-4 text-sm font-black text-[#02202B]">Rs {p.netPayout.toLocaleString()}</td>
                <td className="p-4 text-xs text-stone-600 font-mono">{p.bankAccount}</td>
                <td className="p-4 text-right">
                  {p.status === 'pending' ? (
                    <button
                      onClick={() => settlePayout(p.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                    >
                      Disburse Payout
                    </button>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-stone-100 text-stone-600">
                      Settled ✓
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
