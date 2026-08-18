// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Universal Reviews & Ratings Firestore Service
// ─────────────────────────────────────────────────────────────

import type { UniversalReview, ReviewTargetType } from '@furr/core';

export const INITIAL_REVIEWS: UniversalReview[] = [
  {
    id: 'rev-1',
    targetId: 'prod-1',
    targetType: 'product',
    targetTitle: 'Royal Canin Maxi Adult Dry Dog Food',
    authorUid: 'user-1',
    authorName: 'Dharshana Fernando',
    rating: 5,
    title: 'Top Quality Nutrition',
    comment: 'My German Shepherd has been on this food for 6 months. Coat is shiny and digestion is excellent. Very fast delivery from Colombo Pet Mart.',
    verifiedPurchaseOrBooking: true,
    helpfulCount: 8,
    status: 'published',
    createdAt: '2026-08-01T12:00:00Z',
  },
  {
    id: 'rev-2',
    targetId: 'prov-1',
    targetType: 'provider',
    targetTitle: 'Paws & Bubbles Luxury Grooming Spa',
    authorUid: 'user-2',
    authorName: 'Anuki Jayawardena',
    rating: 5,
    title: 'Super Gentle with Anxious Dogs',
    comment: 'My Maltese usually hates getting her nails clipped, but the groomer here was so patient and calm. Highly recommend!',
    verifiedPurchaseOrBooking: true,
    tags: ['Patient', 'Clean Facility', 'Gentle Handling'],
    helpfulCount: 5,
    status: 'published',
    createdAt: '2026-08-05T14:30:00Z',
  },
];

/**
 * Subscribe to reviews for a specific target (product, provider, clinic, vet).
 */
export function subscribeToTargetReviews(
  targetId: string,
  onUpdate: (reviews: UniversalReview[]) => void
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, where, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(
        collection(db, 'reviews'),
        where('targetId', '==', targetId),
        where('status', '==', 'published')
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            const fallback = INITIAL_REVIEWS.filter((r) => r.targetId === targetId);
            onUpdate(fallback);
            return;
          }
          const list: UniversalReview[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as UniversalReview);
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onUpdate(list);
        },
        (error) => {
          console.warn('Reviews subscription error:', error);
          const fallback = INITIAL_REVIEWS.filter((r) => r.targetId === targetId);
          onUpdate(fallback);
        }
      );

      if (!active && unsubscribe) unsubscribe();
    } catch (e) {
      console.warn('Reviews fallback:', e);
      const fallback = INITIAL_REVIEWS.filter((r) => r.targetId === targetId);
      onUpdate(fallback);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

/**
 * Create a new review in Firestore.
 */
export async function createUniversalReview(
  reviewData: Omit<UniversalReview, 'id' | 'createdAt' | 'helpfulCount' | 'status'>
): Promise<UniversalReview> {
  const newRev: UniversalReview = {
    ...reviewData,
    id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    helpfulCount: 0,
    status: 'published',
    createdAt: new Date().toISOString(),
  };

  try {
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore();
    await setDoc(doc(db, 'reviews', newRev.id), newRev);
  } catch (e) {
    console.warn('Review saved locally:', e);
    INITIAL_REVIEWS.unshift(newRev);
  }

  return newRev;
}

/**
 * Vote helpful on a review.
 */
export async function voteReviewHelpful(reviewId: string, userUid: string): Promise<void> {
  try {
    const { getFirestore, doc, updateDoc, increment, arrayUnion } = await import('firebase/firestore');
    const db = getFirestore();
    const ref = doc(db, 'reviews', reviewId);
    await updateDoc(ref, {
      helpfulCount: increment(1),
      helpfulUids: arrayUnion(userUid),
    });
  } catch (e) {
    console.warn('Vote helpful error:', e);
    const rev = INITIAL_REVIEWS.find((r) => r.id === reviewId);
    if (rev) rev.helpfulCount += 1;
  }
}
