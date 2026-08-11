'use client';

import { useState } from 'react';

const MOCK_USERS = [
  { id: 'usr_81920', phone: '+94771234567', role: 'owner', status: 'ACTIVE', lastLogin: '2026-08-10T19:00:00Z', petsCount: 2 },
  { id: 'usr_11929', email: 'dr.smith@example.com', role: 'vet', status: 'ACTIVE', lastLogin: '2026-08-09T11:00:00Z' },
  { id: 'usr_55912', phone: '+94719876543', role: 'owner', status: 'SUSPENDED', lastLogin: '2026-07-20T10:00:00Z', petsCount: 1 },
];

export default function UserSupportDesk() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = MOCK_USERS.filter(u => 
    u.id.includes(searchTerm) || 
    (u.phone && u.phone.includes(searchTerm)) || 
    (u.email && u.email.includes(searchTerm))
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-black text-[#02202B] tracking-tight">User Support</h1>
        <p className="text-stone-500 mt-1">Manage user accounts and investigate issues (No private pet data exposed).</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden p-6">
        <div className="mb-6 flex gap-4">
          <input 
            type="text" 
            placeholder="Search by ID, Phone, or Email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#62A48C]"
          />
          <button className="bg-[#02202B] hover:bg-[#033345] text-white font-bold px-6 py-2 rounded-lg transition-colors">
            Search
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider border-b border-stone-200">
              <th className="p-4 font-bold">User</th>
              <th className="p-4 font-bold">Role</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Details</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-stone-500">No users found.</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-[#02202B] font-mono text-sm">{user.id}</p>
                    <p className="text-xs text-stone-500">{user.phone || user.email}</p>
                  </td>
                  <td className="p-4 text-sm">
                    <span className="bg-stone-100 text-stone-700 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.status === 'ACTIVE' ? (
                      <span className="text-[#62A48C] text-xs font-bold flex items-center gap-1">
                        <span className="w-2 h-2 bg-[#62A48C] rounded-full"></span> Active
                      </span>
                    ) : (
                      <span className="text-[#E65100] text-xs font-bold flex items-center gap-1">
                        <span className="w-2 h-2 bg-[#E65100] rounded-full"></span> Suspended
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-stone-500">
                    <p>Last Login: {new Date(user.lastLogin).toLocaleDateString()}</p>
                    {user.petsCount !== undefined && <p>Registered Pets: {user.petsCount}</p>}
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-sm font-bold text-[#62A48C] hover:text-[#2A6A51] bg-[#EEFAF5] hover:bg-[#D1F0E0] px-4 py-2 rounded-lg transition-colors">
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
