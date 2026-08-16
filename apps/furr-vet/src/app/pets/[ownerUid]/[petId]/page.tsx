'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { AccessGrant, Pet } from '@furr/core';
import { getGrant, getPet } from '@furr/firebase';
import { useAuth } from '@/context/auth';
import { HealthDataViewer } from '@/components/HealthDataViewer';

const categoryNames: Record<AccessGrant['categories'][number], string> = {
  summary: 'Pet summary',
  vaccinations: 'Vaccinations',
  medications: 'Medications',
  timeline: 'Health timeline',
  weight: 'Weight history',
  documents: 'Documents',
};

export default function PetViewPage({ params }: { params: Promise<{ ownerUid: string; petId: string }> }) {
  const { ownerUid, petId } = use(params);
  const grantId = useSearchParams().get('grantId');
  const { firebaseUser, isLoading } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [grant, setGrant] = useState<AccessGrant | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const missingAccess = !firebaseUser ? 'You must be signed in as a verified professional.' : !grantId ? 'No owner access grant was supplied.' : null;

  useEffect(() => {
    if (isLoading || missingAccess || !grantId || !firebaseUser) return;
    const requestedGrantId = grantId;
    const viewerUid = firebaseUser.uid;
    async function loadRecord() {
      try {
        const nextGrant = await getGrant(requestedGrantId);
        if (
          !nextGrant ||
          nextGrant.status !== 'redeemed' ||
          nextGrant.redeemedByUid !== viewerUid ||
          nextGrant.ownerUid !== ownerUid ||
          nextGrant.petId !== petId
        ) {
          throw new Error('This shared record is no longer available or URL parameters do not match grant.');
        }
        if (nextGrant.grantExpiresAt && new Date(nextGrant.grantExpiresAt).getTime() < Date.now()) {
          throw new Error('This owner access grant has expired.');
        }
        const nextPet = await getPet(ownerUid, petId);
        if (!nextPet) throw new Error('This pet record could not be found.');
        setGrant(nextGrant);
        setPet(nextPet);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'We could not open this shared record.');
      } finally {
        setIsFetching(false);
      }
    }
    void loadRecord();
  }, [firebaseUser, grantId, isLoading, missingAccess, ownerUid, petId]);

  if (isLoading || (!missingAccess && isFetching)) return <div className="page-state"><span className="spinner" /> Verifying owner access…</div>;
  if (missingAccess || error || !pet || !grant) {
    return <div className="page-state"><h1>Record unavailable</h1><p>{missingAccess || error || 'This owner access grant is no longer available.'}</p><Link className="button button-secondary" href="/">Return to workspace</Link></div>;
  }

  return (
    <div className="portal-page">
      <Link className="back-link" href="/">← Shared records</Link>
      <section className="workspace-hero record-hero">
        <div>
          <p className="eyebrow">OWNER-SHARED PET RECORD</p>
          <h1>{pet.name}</h1>
          <p>{pet.species} · {pet.breed || 'Mixed breed'} · {pet.sex}</p>
        </div>
        <div className="access-meta"><strong>Access ends</strong><span>{new Date(grant.grantExpiresAt ?? '').toLocaleString()}</span></div>
      </section>

      <section className="panel records-panel">
        <p className="eyebrow">SHARING SCOPE</p>
        <h2>What this owner has shared</h2>
        <p className="scope-copy">Only the categories below are available for this time-limited session. Anything outside them remains private to the owner.</p>
        <div className="scope-list">{grant.categories.map((category) => <span key={category}>{categoryNames[category]}</span>)}</div>
      </section>

      <section className="privacy-note record-note">
        <strong>Verified Clinical Practitioner Session</strong>
        <p>You have active practitioner authorization to view this medical record and record clinical examination notes directly to the patient's chronological health timeline.</p>
      </section>
      
      <HealthDataViewer ownerUid={ownerUid} petId={petId} categories={grant.categories} />
    </div>
  );
}
