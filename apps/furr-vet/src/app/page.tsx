'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth';
import { useState, useEffect } from 'react';
import { getPet, redeemGrant, getVetActiveGrants } from '@furr/firebase';
import type { AccessGrant, Pet } from '@furr/core';

function GrantRow({ grant }: { grant: AccessGrant }) {
  const [pet, setPet] = useState<Pet | null>(null);

  useEffect(() => {
    getPet(grant.ownerUid, grant.petId).then(setPet);
  }, [grant.ownerUid, grant.petId]);

  if (!pet) return null;

  return (
    <div className="p-6 flex items-center justify-between hover:bg-stone-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#EBF6FF] flex items-center justify-center text-xl">
          {pet.species === 'cat' ? '🐈' : '🐕'}
        </div>
        <div>
          <h4 className="font-bold text-[#02202B] text-lg">{pet.name}</h4>
          <p className="text-sm text-stone-500">
            {pet.breed || 'Mixed'} · Expires {new Date(grant.accessExpiresAt || '').toLocaleString()}
          </p>
        </div>
      </div>
      <Link href={`/pets/${grant.ownerUid}/${grant.petId}?grantId=${grant.id}`} className="text-sm font-bold text-[#62A48C] hover:text-[#2A6A51] bg-[#EEFAF5] hover:bg-[#D1F0E0] px-4 py-2 rounded-lg transition-colors">
        View Records
      </Link>
    </div>
  );
}

export default function VetDashboard() {
  const { profile, isLoading, firebaseUser } = useAuth();
  const [code, setCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState('');
  const [grants, setGrants] = useState<AccessGrant[]>([]);

  useEffect(() => {
    if (firebaseUser?.uid) {
      getVetActiveGrants(firebaseUser.uid).then(setGrants);
    }
  }, [firebaseUser?.uid]);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (code.length !== 6) {
      setError('Please enter a valid 6-character code.');
      return;
    }
    if (!firebaseUser) return;
    
    setIsRedeeming(true);
    try {
      const grant = await redeemGrant(code, firebaseUser.uid);
      setGrants((prev) => [grant, ...prev.filter(g => g.id !== grant.id)]);
      setCode('');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code. Please verify with the pet owner.');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#62A48C] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-stone-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-black text-[#02202B]">Access Denied</h1>
        <p className="mt-2 text-stone-500">You must be logged in as a verified veterinarian to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#02202B] rounded-2xl p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#62A48C] text-[#EEFAF5] text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
              {profile.status}
            </span>
            <span className="text-[#A3ADB0] text-sm">ID: {profile.registrationNumber}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">{profile.fullName}</h1>
          <p className="text-[#A3ADB0] mt-1">{profile.clinicId ? 'Clinic Associated' : 'Independent Practitioner'} · {profile.district}</p>
        </div>
        
        {/* Redeem Card inside Banner */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 w-full sm:w-auto min-w-[320px] border border-white/10">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/.w3.org/2000/svg" className="h-5 w-5 text-[#62A48C]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
              <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
            </svg>
            Redeem Access Code
          </h3>
          <form onSubmit={handleRedeem} className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. 8X9A2F" 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="bg-white/90 text-[#02202B] font-mono text-center font-bold text-lg rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-[#62A48C] placeholder:text-stone-400"
            />
            <button 
              type="submit"
              disabled={isRedeeming || code.length !== 6}
              className="bg-[#E65100] hover:bg-[#CC4800] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-4 py-2 rounded-lg transition-colors"
            >
              {isRedeeming ? '...' : 'Open'}
            </button>
          </form>
          {error && <p className="text-red-400 text-xs mt-2 font-medium">{error}</p>}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Active Grants */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#02202B]">Currently Authorised Pets</h2>
            <span className="text-stone-500 text-sm font-medium">Auto-refreshes</span>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            {grants.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/.w3.org/2000/svg" className="h-12 w-12 text-stone-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="text-lg font-bold text-[#02202B]">No active sessions</h3>
                <p className="text-stone-500 mt-1 max-w-sm">
                  When a pet owner shares their record with you, it will appear here for the duration of the grant.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-200">
                {grants.map((grant) => (
                  <GrantRow key={grant.id} grant={grant} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Recent Activity */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-[#02202B]">Your Recent Activity</h2>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <div className="space-y-6">
              {/* Mock Activity List */}
              <div className="relative pl-4 border-l-2 border-[#ECE9E2]">
                <div className="absolute w-3 h-3 bg-[#62A48C] rounded-full -left-[7px] top-1 border-2 border-white"></div>
                <p className="text-sm font-bold text-[#02202B]">Vaccination Logged</p>
                <p className="text-xs text-stone-500 mt-1">Rabies (1-year) for Max (Dog)</p>
                <p className="text-xs text-stone-400 mt-1">Today at 10:42 AM</p>
              </div>
              <div className="relative pl-4 border-l-2 border-[#ECE9E2]">
                <div className="absolute w-3 h-3 bg-stone-300 rounded-full -left-[7px] top-1 border-2 border-white"></div>
                <p className="text-sm font-bold text-[#02202B]">Condition Added</p>
                <p className="text-xs text-stone-500 mt-1">Arthritis for Bella (Cat)</p>
                <p className="text-xs text-stone-400 mt-1">Yesterday at 4:15 PM</p>
              </div>
              <div className="relative pl-4 border-l-2 border-transparent">
                <div className="absolute w-3 h-3 bg-stone-300 rounded-full -left-[7px] top-1 border-2 border-white"></div>
                <p className="text-sm font-bold text-[#02202B]">Profile Verified</p>
                <p className="text-xs text-stone-500 mt-1">Welcome to Furr Professional!</p>
                <p className="text-xs text-stone-400 mt-1">Aug 1, 2026</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
