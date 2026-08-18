"use strict";
// ─────────────────────────────────────────────────────────────
//  @furr/core — Universal Reviews, Ratings & Reputation Engine
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRatingBreakdown = calculateRatingBreakdown;
exports.validateReviewInput = validateReviewInput;
/**
 * Calculates accurate aggregated rating score and star distribution.
 */
function calculateRatingBreakdown(reviews) {
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
        const star = Math.min(5, Math.max(1, Math.round(rev.rating)));
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
function validateReviewInput(rating, comment) {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return { valid: false, error: 'Rating must be a score between 1 and 5 stars' };
    }
    if (!comment || comment.trim().length < 5) {
        return { valid: false, error: 'Please write at least 5 characters for your review' };
    }
    return { valid: true };
}
//# sourceMappingURL=reviews.js.map