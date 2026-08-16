'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import type { AccessGrant, Pet } from '@furr/core';
import { getPet, getVetActiveGrants, redeemGrant } from '@furr/firebase';
import { useAuth } from '@/context/auth';

function GrantRow({ grant }: { grant: AccessGrant }) {
  const [pet, setPet] = useState<Pet | null>(null);

  useEffect(() => {
    void getPet(grant.ownerUid, grant.petId).then(setPet);
  }, [grant.ownerUid, grant.petId]);

  if (!pet) return null;

  return (
    <li className="record-row">
      <span className="pet-kind">{pet.species}</span>
      <div className="record-copy">
        <strong>{pet.name}</strong>
        <span>{pet.breed || 'Mixed breed'} · access ends {new Date(grant.grantExpiresAt ?? '').toLocaleString()}</span>
      </div>
      <Link className="button button-secondary" href={`/pets/${grant.ownerUid}/${grant.petId}?grantId=${grant.id}`}>
        Open record
      </Link>
    </li>
  );
}

function SignInPanel() {
  const { error, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch {
      setLocalError('We could not sign you in. Check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-intro">
        <p className="eyebrow">FURR PROFESSIONAL</p>
        <h1>A calmer way to review a pet’s record.</h1>
        <p>Use a time-limited owner access code. Furr only shows information the owner has explicitly shared with you.</p>
        <div className="trust-list">
          <span>Verified practitioner access</span>
          <span>Owner-controlled categories</span>
          <span>Automatic expiry</span>
        </div>
      </div>
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">SECURE SIGN IN</p>
        <h2>Welcome back</h2>
        <p>Sign in with the email linked to your verified professional profile.</p>
        <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label>
        <label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required /></label>
        {(localError || error) && <p className="form-error" role="alert">{localError || error}</p>}
        <button className="button button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Signing in…' : 'Sign in to workspace'}
        </button>
        <p className="quiet">Need a professional profile? Contact Furr support for verification.</p>
      </form>
    </section>
  );
}

export default function VetDashboard() {
  const { profile, firebaseUser, isLoading, isPreview, signOut } = useAuth();
  const [code, setCode] = useState('');
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    if (firebaseUser?.uid && profile) void getVetActiveGrants(firebaseUser.uid).then(setGrants);
  }, [firebaseUser?.uid, profile]);

  const redeem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firebaseUser || code.length !== 6) return;
    setError(null);
    setIsRedeeming(true);
    try {
      const grant = await redeemGrant(code, firebaseUser.uid);
      setGrants((current) => [grant, ...current.filter((item) => item.id !== grant.id)]);
      setCode('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'This code could not be redeemed.');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (isLoading) return <div className="page-state"><span className="spinner" /> Checking your workspace…</div>;
  if (!profile) return <SignInPanel />;

  return (
    <div className="portal-page">
      <section className="workspace-hero">
        <div>
          <p className="eyebrow">{isPreview ? 'LOCAL PREVIEW' : 'VERIFIED PROFESSIONAL'}</p>
          <h1>Good to see you, {profile.fullName.split(' ')[0]}.</h1>
          <p>{profile.registrationNumber} · {profile.district} · {profile.clinicId ? 'Clinic profile' : 'Independent practitioner'}</p>
        </div>
        <button className="text-button" onClick={() => void signOut()}>{isPreview ? 'Preview mode' : 'Sign out'}</button>
      </section>

      <div className="workspace-grid">
        <section className="panel code-panel">
          <p className="eyebrow">OWNER ACCESS</p>
          <h2>Open a shared record</h2>
          <p>Enter the six-character code provided by the pet owner. Each code can be used once.</p>
          <form onSubmit={redeem} className="code-form">
            <label className="sr-only" htmlFor="access-code">Owner access code</label>
            <input id="access-code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} placeholder="ABC123" maxLength={6} autoComplete="one-time-code" />
            <button className="button button-primary" disabled={isRedeeming || code.length !== 6} type="submit">{isRedeeming ? 'Opening…' : 'Open record'}</button>
          </form>
          {error && <p className="form-error" role="alert">{error}</p>}
        </section>

        <aside className="privacy-note">
          <strong>Privacy by default</strong>
          <p>The owner decides which categories are shared. Access closes automatically when the grant expires or is revoked.</p>
        </aside>
      </div>

      <section className="panel records-panel">
        <div className="panel-heading"><div><p className="eyebrow">CURRENT ACCESS</p><h2>Shared pet records</h2></div><span>{grants.length} open</span></div>
        {grants.length ? <ul className="record-list">{grants.map((grant) => <GrantRow key={grant.id} grant={grant} />)}</ul> : (
          <div className="empty-state"><h3>No records open yet</h3><p>Ask the owner to create a share code from their Furr mobile app, then enter it above.</p></div>
        )}
      </section>
    </div>
  );
}
