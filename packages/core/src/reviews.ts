// ─────────────────────────────────────────────────────────────
//  @furr/core — Universal Reviews, Ratings & Reputation Engine
// ─────────────────────────────────────────────────────────────

export type ReviewTargetType = 'product' | 'provider' | 'clinic' | 'vet';

export type UniversalReview = {
  id: string;
  targetId: string;
  targetType: ReviewTargetType;
  targetTitle: string;
  authorUid: string;
  authorName: string;
  authorAvatarUrl?: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  photoUrls?: string[];
  tags?: string[]; // e.g. ["Punctual", "Gentle with anxious pets", "Quick Shipping"]
  verifiedPurchaseOrBooking: boolean;
  referenceId?: string; // orderId or bookingId
  helpfulCount: number;
  helpfulUids?: string[];
  responseFromTarget?: {
    authorName: string;
    comment: string;
    respondedAt: string;
  };
  status: 'published' | 'hidden' | 'flagged';
  createdAt: string;
  updatedAt?: string;
};

export type RatingBreakdown = {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  percentage5Star: number;
};

/**
 * Calculates accurate aggregated rating score and star distribution.
 */
export function calculateRatingBreakdown(reviews: UniversalReview[]): RatingBreakdown {
  const published = reviews.filter((r) => r.status !== 'hidden');
  const total = published.length;

  if (total === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      percentage5Star: 0,
    };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  for (const rev of published) {
    const star = Math.min(5, Math.max(1, Math.round(rev.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[star] = (distribution[star] || 0) + 1;
    sum += rev.rating;
  }

  const average = Number((sum / total).toFixed(1));
  const percentage5Star = Math.round((distribution[5] / total) * 100);

  return {
    averageRating: average,
    totalReviews: total,
    distribution,
    percentage5Star,
  };
}

/**
 * Validates a submitted review before saving to Firestore.
 */
export function validateReviewInput(
  rating: number,
  comment: string
): { valid: boolean; error?: string } {
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return { valid: false, error: 'Rating must be a score between 1 and 5 stars' };
  }
  if (!comment || comment.trim().length < 5) {
    return { valid: false, error: 'Please write at least 5 characters for your review' };
  }
  return { valid: true };
}
