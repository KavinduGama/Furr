'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  firebaseOptionsFromEnvironment,
  initFirebase,
  signInWithEmail,
  signOut,
  subscribeToAuthState,
} from '@furr/firebase';

// ── Initialise Firebase at module scope ───────────────────────
// This mirrors the pattern used in furr-vet/context/auth.tsx.
// Calling initFirebase here (outside the component) means it runs once when
// the module is first imported, not on every component mount. This avoids
// React StrictMode double-invocation and ensures Firebase is ready before
// the first render.
const firebaseConfigured = initFirebase(
  firebaseOptionsFromEnvironment({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }),
);

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'signed-out' | 'denied' | 'allowed'>(
    firebaseConfigured ? 'loading' : 'denied',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    firebaseConfigured ? null : 'Firebase configuration is required for the admin workspace.',
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured) return;

    const unsubscribe = subscribeToAuthState(async (user) => {
      if (!user) {
        setStatus('signed-out');
        return;
      }
      const token = await user.getIdTokenResult();
      if (token.claims.admin === true) {
        setStatus('allowed');
        setError(null);
      } else {
        setStatus('denied');
        setError('This account does not have the Furr administrator role.');
        await signOut();
      }
    });
    return unsubscribe;
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signInWithEmail(email.trim(), password);
    } catch {
      setError('We could not sign you in. Check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'allowed') return <>{children}</>;
  if (status === 'loading') return <div className="admin-loading">Checking administrator access…</div>;

  return (
    <section className="admin-gate">
      <div>
        <p className="eyebrow">INTERNAL WORKSPACE</p>
        <h1>Operations, with the right safeguards.</h1>
        <p>Only users with the Firebase <code>admin</code> claim can access Furr operations. This keeps owner and professional data out of a public dashboard.</p>
      </div>
      <form className="admin-login-card" onSubmit={submit}>
        <p className="eyebrow">ADMIN SIGN IN</p>
        <h2>Continue securely</h2>
        <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label>
        <label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required /></label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button type="submit" disabled={submitting || status !== 'signed-out'}>{submitting ? 'Signing in…' : 'Sign in'}</button>
        <p>Need access? Ask a platform owner to grant the administrator role.</p>
      </form>
    </section>
  );
}
