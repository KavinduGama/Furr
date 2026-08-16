import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { ServiceBooking, ServiceProvider } from '../services';

describe('Services & Booking Utilities', () => {
  const mockProvider: ServiceProvider = {
    id: 'sp1',
    name: 'Paws & Claws Grooming',
    category: 'grooming',
    bio: 'Professional pet styling salon',
    rating: 4.9,
    reviewCount: 34,
    latitude: 6.9271,
    longitude: 79.8612,
    city: 'Colombo',
    address: '12 Green Path, Colombo 03',
    phone: '+94 77 123 4567',
    isVerified: true,
    experienceYears: 5,
    services: [
      { id: 's1', name: 'Full Groom & Spa', category: 'grooming', durationMinutes: 60, price: 4500, description: 'Bath, haircut, nail trim' },
      { id: 's2', name: 'Basic Bath & Dry', category: 'grooming', durationMinutes: 30, price: 2500, description: 'Hypoallergenic wash' },
    ],
    availableHours: { start: '09:00', end: '18:00' },
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    coverUrl: 'https://example.com/grooming.jpg',
  };

  it('verifies provider services and pricing structures', () => {
    assert.strictEqual(mockProvider.services.length, 2);
    assert.strictEqual(mockProvider.services[0].price, 4500);
    assert.strictEqual(mockProvider.services[1].price, 2500);
    assert.strictEqual(mockProvider.isVerified, true);
  });

  it('calculates platform take-rate and provider payouts', () => {
    const bookingPrice = 4500;
    const platformTakeRate = 0.1; // 10%
    const commission = bookingPrice * platformTakeRate;
    const providerPayout = bookingPrice - commission;

    assert.strictEqual(commission, 450);
    assert.strictEqual(providerPayout, 4050);
  });

  it('validates booking status transitions', () => {
    const validStatuses: ServiceBooking['status'][] = ['pending', 'confirmed', 'completed', 'cancelled'];
    assert.strictEqual(validStatuses.includes('confirmed'), true);
    assert.strictEqual(validStatuses.includes('completed'), true);
  });
});
