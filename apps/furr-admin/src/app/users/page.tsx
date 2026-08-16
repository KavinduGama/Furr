'use client';

import React, { useState } from 'react';
import { useAdmin, AdminUserAccount } from '@/context/AdminContext';

export default function UserSupportDesk() {
  const { users, toggleUserStatus, changeUserRole } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AdminUserAccount['role']>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUserAccount | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.phone && u.phone.includes(searchTerm)) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#02202B] tracking-tight">User Directory &amp; Support</h1>
          <p className="text-stone-500 text-sm mt-1">
            Search user identities, manage permissions, resolve support inquiries, and control account standing.
          </p>
        </div>

        <div className="flex gap-2 bg-stone-200/60 p-1 rounded-2xl">
          {(['all', 'owner', 'vet', 'clinic_staff', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                roleFilter === r ? 'bg-white text-[#02202B] shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex gap-4">
        <input
          type="text"
          placeholder="Search by User ID, Name, Phone (+94...), or Email..."
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

      {/* Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider border-b border-stone-200">
              <th className="p-4 font-bold">Account / User</th>
              <th className="p-4 font-bold">Assigned Role</th>
              <th className="p-4 font-bold">Standing</th>
              <th className="p-4 font-bold">Last Activity</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-stone-50/80 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-[#02202B]">{user.name}</p>
                  <p className="text-xs text-stone-500 font-mono">{user.id} · {user.email || user.phone}</p>
                </td>
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) => changeUserRole(user.id, e.target.value as AdminUserAccount['role'])}
                    className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs font-bold text-stone-800 uppercase"
                  >
                    <option value="owner">Pet Owner</option>
                    <option value="vet">Veterinarian</option>
                    <option value="clinic_staff">Clinic Staff</option>
                    <option value="admin">Administrator</option>
                  </select>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-xs text-stone-500">
                  <p>Last seen: {new Date(user.lastLogin).toLocaleDateString()}</p>
                  <p className="text-[10px] text-stone-400">Joined: {user.joinedDate}</p>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800"
                    >
                      Inspect Profile
                    </button>
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        user.status === 'ACTIVE'
                          ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {user.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#006B78] uppercase">User Profile Inspection</span>
                <h2 className="text-xl font-black text-[#02202B]">{selectedUser.name}</h2>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-stone-400 hover:text-stone-700 text-lg font-bold">✕</button>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-xs space-y-2">
              <p><span className="font-bold text-stone-500">User ID:</span> <span className="font-mono">{selectedUser.id}</span></p>
              <p><span className="font-bold text-stone-500">Contact:</span> {selectedUser.email || 'N/A'} · {selectedUser.phone || 'N/A'}</p>
              <p><span className="font-bold text-stone-500">Platform Role:</span> <span className="uppercase font-bold text-[#006B78]">{selectedUser.role}</span></p>
              <p><span className="font-bold text-stone-500">Account Status:</span> <span className="font-bold">{selectedUser.status}</span></p>
              <p><span className="font-bold text-stone-500">Registered Pets:</span> {selectedUser.petsCount || 0} pet profiles</p>
              <p><span className="font-bold text-stone-500">Account Created:</span> {selectedUser.joinedDate}</p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  toggleUserStatus(selectedUser.id);
                  setSelectedUser(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  selectedUser.status === 'ACTIVE' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {selectedUser.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
