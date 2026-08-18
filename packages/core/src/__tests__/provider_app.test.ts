import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateProviderEarnings,
  calculatePlatformCommission,
  isProviderAvailable,
  SERVICE_CATEGORIES,
  ServiceProvider,
  ServiceBooking,
  calculateDistanceKm,
} from '../index';

test('Provider App Domain & Earnings Engine', async (t) => {
  await t.test('calculates multi-revenue earnings and platform commission deductions accurately', () => {
    // Services: 15,000 LKR (10% platform fee = 1,500 LKR, net = 13,500 LKR)
    // Products: 20,000 LKR (8% platform fee = 1,600 LKR, net = 18,400 LKR)
    // Tips: 1,000 LKR (0% fee, net = 1,000 LKR)
    const breakdown = calculateProviderEarnings(15000, 20000, 1000, 10, 8);

    assert.equal(breakdown.serviceRevenue, 15000);
    assert.equal(breakdown.productRevenue, 20000);
    assert.equal(breakdown.tipsReceived, 1000);
    assert.equal(breakdown.platformFees, 3100);
    assert.equal(breakdown.netPayout, 32900);
  });

  await t.test('verifies provider multi-role support and category mapping', () => {
    const mockProvider: ServiceProvider = {
      id: 'prov-multi-1',
      name: 'Colombo Pet Masters',
      bio: 'Grooming salon and pet walking collective',
      category: 'grooming',
      providerRoles: ['grooming', 'walking', 'sitting'],
      isMarketplaceVendor: true,
      rating: 4.9,
      reviewCount: 38,
      latitude: 6.9271,
      longitude: 79.8612,
      address: 'Havelock Town',
      city: 'Colombo 05',
      experienceYears: 6,
      isVerified: true,
      phone: '+94 77 123 4567',
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      availableHours: { start: '08:00', end: '18:00' },
      services: [
        { id: 's1', name: 'Bath & Groom', category: 'grooming', durationMinutes: 60, price: 4500 },
        { id: 's2', name: 'Morning Pack Walk', category: 'walking', durationMinutes: 45, price: 2000 },
      ],
      onlineStatus: 'online',
      bankDetails: {
        bankName: 'Commercial Bank',
        accountNumber: '8001234567',
        branch: 'Havelock',
        holderName: 'Colombo Pet Masters LLC',
      },
    };

    assert.equal(mockProvider.providerRoles?.length, 3);
    assert.equal(mockProvider.isMarketplaceVendor, true);
    assert.equal(mockProvider.onlineStatus, 'online');
    assert.equal(mockProvider.bankDetails?.bankName, 'Commercial Bank');
  });

  await t.test('validates booking completion report and pet temperament ratings', () => {
    const completedBooking: ServiceBooking = {
      id: 'book-completed-1',
      ownerUid: 'owner-1',
      petId: 'pet-1',
      petName: 'Rocky',
      petSpecies: 'dog',
      petBreed: 'Labrador',
      providerId: 'prov-1',
      providerName: 'Happy Paws',
      serviceId: 'srv-walk-1',
      serviceName: '60-Min Neighborhood Walk',
      serviceCategory: 'walking',
      price: 2500,
      platformFee: 250,
      providerPayout: 2250,
      date: '2026-08-18',
      timeSlot: '08:30 AM',
      status: 'completed',
      completionNotes: 'Rocky had high energy, completed full 3.5km route without issues.',
      completionPhotoUrls: ['https://example.com/walk-rocky.jpg'],
      walkStats: {
        distanceMeters: 3500,
        durationSeconds: 3600,
      },
      petBehaviorRating: 'friendly',
      createdAt: '2026-08-18T03:00:00Z',
    };

    assert.equal(completedBooking.status, 'completed');
    assert.equal(completedBooking.walkStats?.distanceMeters, 3500);
    assert.equal(completedBooking.petBehaviorRating, 'friendly');
    assert.equal(completedBooking.providerPayout, 2250);
  });
});
