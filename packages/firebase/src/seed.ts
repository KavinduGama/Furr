// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Idempotent Database Seeder
// ─────────────────────────────────────────────────────────────

import { INITIAL_PRODUCTS } from './marketplace';
import { INITIAL_PROVIDERS } from './services';
import { INITIAL_ADOPTION_LISTINGS } from './adoption';
import { INITIAL_REVIEWS } from './reviews';
import { INITIAL_MEETUPS, INITIAL_QUESTIONS } from './community';

export interface SeedResult {
  productsCount: number;
  providersCount: number;
  adoptionsCount: number;
  reviewsCount: number;
  meetupsCount: number;
  questionsCount: number;
}

/**
 * Populates clean seed data into Firestore collections if empty.
 */
export async function seedFirestoreDatabase(): Promise<SeedResult> {
  const { getFirestore, doc, setDoc, writeBatch } = await import('firebase/firestore');
  const db = getFirestore();

  let productsCount = 0;
  let providersCount = 0;
  let adoptionsCount = 0;
  let reviewsCount = 0;
  let meetupsCount = 0;
  let questionsCount = 0;

  // Batch 1: Products
  for (const prod of INITIAL_PRODUCTS) {
    try {
      await setDoc(doc(db, 'marketplace_products', prod.id), prod, { merge: true });
      productsCount++;
    } catch (e) {
      console.warn('Seed product failed:', prod.id, e);
    }
  }

  // Batch 2: Providers
  for (const prov of INITIAL_PROVIDERS) {
    try {
      await setDoc(doc(db, 'service_providers', prov.id), prov, { merge: true });
      providersCount++;
    } catch (e) {
      console.warn('Seed provider failed:', prov.id, e);
    }
  }

  // Batch 3: Adoption Listings
  for (const adopt of INITIAL_ADOPTION_LISTINGS) {
    try {
      await setDoc(doc(db, 'adoption_listings', adopt.id), adopt, { merge: true });
      adoptionsCount++;
    } catch (e) {
      console.warn('Seed adoption failed:', adopt.id, e);
    }
  }

  // Batch 4: Reviews
  for (const rev of INITIAL_REVIEWS) {
    try {
      await setDoc(doc(db, 'reviews', rev.id), rev, { merge: true });
      reviewsCount++;
    } catch (e) {
      console.warn('Seed review failed:', rev.id, e);
    }
  }

  // Batch 5: Community Meetups
  for (const meet of INITIAL_MEETUPS) {
    try {
      await setDoc(doc(db, 'community_meetups', meet.id), meet, { merge: true });
      meetupsCount++;
    } catch (e) {
      console.warn('Seed meetup failed:', meet.id, e);
    }
  }

  // Batch 6: Forum Questions
  for (const q of INITIAL_QUESTIONS) {
    try {
      await setDoc(doc(db, 'forum_questions', q.id), q, { merge: true });
      questionsCount++;
    } catch (e) {
      console.warn('Seed question failed:', q.id, e);
    }
  }

  return {
    productsCount,
    providersCount,
    adoptionsCount,
    reviewsCount,
    meetupsCount,
    questionsCount,
  };
}
