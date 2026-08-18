import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAdoptionApplication,
  calculateRatingBreakdown,
  validateReviewInput,
  type UniversalReview,
} from '../index';

describe('Adoption Application Validator', () => {
  it('validates a complete and correct adoption application', () => {
    const res = validateAdoptionApplication({
      applicantName: 'Anuki Fernando',
      applicantPhone: '+94 77 123 4567',
      applicantDistrict: 'Colombo',
      housingType: 'own_house',
      dailyHoursAlone: 3,
      reasonForAdopting: 'We have a large garden and want to give a rescued puppy a forever loving home.',
    });
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.errors.length, 0);
  });

  it('detects missing required fields and invalid hours', () => {
    const res = validateAdoptionApplication({
      applicantName: '',
      applicantPhone: '',
      applicantDistrict: '',
      dailyHoursAlone: 25, // invalid
      reasonForAdopting: 'too short',
    });
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes('name')));
    assert.ok(res.errors.some((e) => e.includes('phone')));
    assert.ok(res.errors.some((e) => e.includes('Housing type')));
    assert.ok(res.errors.some((e) => e.includes('hours')));
  });
});

describe('Reviews & Ratings Breakdown Engine', () => {
  it('calculates average and distribution accurately across multiple reviews', () => {
    const mockReviews: UniversalReview[] = [
      {
        id: 'rev-1',
        targetId: 'prod-1',
        targetType: 'product',
        targetTitle: 'Maxi Adult Food',
        authorUid: 'u1',
        authorName: 'Kasun',
        rating: 5,
        comment: 'Excellent food, my dog loves it!',
        verifiedPurchaseOrBooking: true,
        helpfulCount: 2,
        status: 'published',
        createdAt: '2026-08-10T10:00:00Z',
      },
      {
        id: 'rev-2',
        targetId: 'prod-1',
        targetType: 'product',
        targetTitle: 'Maxi Adult Food',
        authorUid: 'u2',
        authorName: 'Tharindu',
        rating: 4,
        comment: 'Great quality, fast delivery.',
        verifiedPurchaseOrBooking: true,
        helpfulCount: 0,
        status: 'published',
        createdAt: '2026-08-11T12:00:00Z',
      },
      {
        id: 'rev-3',
        targetId: 'prod-1',
        targetType: 'product',
        targetTitle: 'Maxi Adult Food',
        authorUid: 'u3',
        authorName: 'Spam User',
        rating: 1,
        comment: 'Spam comment',
        verifiedPurchaseOrBooking: false,
        helpfulCount: 0,
        status: 'hidden', // Should be excluded from calculation
        createdAt: '2026-08-12T12:00:00Z',
      },
    ];

    const breakdown = calculateRatingBreakdown(mockReviews);
    assert.strictEqual(breakdown.totalReviews, 2);
    assert.strictEqual(breakdown.averageRating, 4.5);
    assert.strictEqual(breakdown.distribution[5], 1);
    assert.strictEqual(breakdown.distribution[4], 1);
    assert.strictEqual(breakdown.distribution[1], 0);
    assert.strictEqual(breakdown.percentage5Star, 50);
  });

  it('validates review inputs correctly', () => {
    assert.strictEqual(validateReviewInput(5, 'Wonderful service by the groomer!').valid, true);
    assert.strictEqual(validateReviewInput(0, 'Test').valid, false);
    assert.strictEqual(validateReviewInput(5, 'abc').valid, false);
  });
});
