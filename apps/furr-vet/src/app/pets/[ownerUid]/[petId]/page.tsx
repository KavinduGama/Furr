'use client';

import { useAuth } from '@/context/auth';
import { useEffect, useState, use } from 'react';
import { getPet, getGrant } from '@furr/firebase';
import type { Pet, AccessGrant } from '@furr/core';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PetViewPage({ params }: { params: Promise<{ ownerUid: string; petId: string }> }) {
  const { ownerUid, petId } = use(params);
  const searchParams = useSearchParams();
  const grantId = searchParams.get('grantId');
  const { firebaseUser, isLoading } = useAuth();
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [grant, setGrant] = useState<AccessGrant | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoading) return;
    if (!firebaseUser) {
      setError('You must be logged in.');
      setIsFetching(false);
      return;
    }
    if (!grantId) {
      setError('No grant ID provided.');
      setIsFetching(false);
      return;
    }

    async function load() {
      try {
        const g = await getGrant(grantId as string);
        if (!g) throw new Error('Grant not found');
        if (g.status !== 'active' || g.redeemedByUid !== firebaseUser?.uid) {
          throw new Error('Access denied or expired');
        }
        
        // In real app, we'd check `g.accessExpiresAt` here as well
        const now = new Date().toISOString();
        if (g.accessExpiresAt && g.accessExpiresAt < now) {
          throw new Error('Access grant has expired');
        }

        setGrant(g);

        const p = await getPet(ownerUid, petId);
        if (!p) throw new Error('Pet not found');
        setPet(p);
      } catch (err: any) {
        setError(err.message || 'Could not load pet data');
      } finally {
        setIsFetching(false);
      }
    }

    load();
  }, [isLoading, firebaseUser, grantId, ownerUid, petId]);

  if (isFetching || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#62A48C] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-stone-500 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (error || !pet || !grant) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-black text-[#02202B]">Access Denied</h1>
        <p className="text-stone-500">{error}</p>
        <Link href="/" className="inline-block mt-4 text-[#62A48C] font-bold hover:underline">
          &larr; Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link href="/" className="text-sm font-bold text-stone-400 hover:text-[#02202B] inline-flex items-center gap-2">
        &larr; Dashboard
      </Link>

      {/* Pet Header */}
      <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#EBF6FF] flex items-center justify-center text-4xl">
            {pet.species === 'cat' ? '🐈' : '🐕'}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-[#EEFAF5] text-[#2A6A51] text-xs font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#2A6A51] rounded-full animate-pulse"></span>
                Active Session
              </span>
              <span className="text-stone-400 text-sm font-medium">
                Expires {new Date(grant.accessExpiresAt || '').toLocaleTimeString()}
              </span>
            </div>
            <h1 className="text-3xl font-black text-[#02202B]">{pet.name}</h1>
            <p className="text-stone-500 mt-1">{pet.breed || 'Mixed'} · {pet.sex || 'Unknown'} · ID: {pet.id.slice(0, 8)}</p>
          </div>
        </div>
        <button className="bg-[#02202B] hover:bg-[#033345] text-white font-bold px-6 py-3 rounded-lg shadow-md transition-colors">
          + Add Clinical Record
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
             <h2 className="text-lg font-black text-[#02202B] mb-6 border-b border-stone-100 pb-4">Unified Timeline</h2>
             
             {/* Mock Timeline */}
             <div className="space-y-6">
               <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-[#FFF3E0] flex items-center justify-center shrink-0">
                    <span className="text-[#E65100]">⚠️</span>
                 </div>
                 <div>
                   <h4 className="font-bold text-[#02202B]">Severe Allergic Reaction</h4>
                   <p className="text-sm text-stone-500 mt-1">Owner logged symptom: "Vomiting and severe hives after trying a new chicken treat."</p>
                   <p className="text-xs font-bold text-stone-400 mt-2 uppercase tracking-wider">Owner Entered · Aug 9, 2026</p>
                 </div>
               </div>

               <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-[#EBF6FF] flex items-center justify-center shrink-0">
                    <span className="text-[#2D8EC8]">💉</span>
                 </div>
                 <div>
                   <div className="flex items-center gap-2">
                     <h4 className="font-bold text-[#02202B]">Rabies Vaccination</h4>
                     <span className="bg-[#EEFAF5] text-[#2A6A51] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Vet Verified</span>
                   </div>
                   <p className="text-sm text-stone-500 mt-1">Administered by Dr. Sarah Smith (VET-12345). Next due Aug 2027.</p>
                   <p className="text-xs font-bold text-stone-400 mt-2 uppercase tracking-wider">Aug 1, 2026</p>
                 </div>
               </div>
             </div>
          </div>

        </div>

        {/* Right Col */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-[#E65100]/20 p-6">
            <h3 className="font-black text-[#E65100] mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Allergies & Flags
            </h3>
            <ul className="space-y-3">
              <li className="bg-[#FFF3E0] rounded-lg p-3 border border-[#E65100]/20">
                <p className="font-bold text-[#E65100] text-sm">Chicken Protein</p>
                <p className="text-xs text-[#E65100]/80 mt-1">Causes severe gastrointestinal distress.</p>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h3 className="font-black text-[#02202B] mb-4">Active Medications</h3>
            <ul className="space-y-4">
              <li className="border-b border-stone-100 pb-4 last:border-0 last:pb-0">
                <p className="font-bold text-[#02202B] text-sm">Bravecto</p>
                <p className="text-xs text-stone-500 mt-1">1 Chew every 12 weeks for Flea/Tick prevention.</p>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
