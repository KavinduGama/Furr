import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateDistanceKm,
  isProviderAvailable,
  SRI_LANKA_LOCATIONS,
  SERVICE_CATEGORIES,
  type ServiceProvider,
} from '../services';

describe('Service Provider Geospatial & Availability Tests', () => {
  it('calculates realistic Sri Lankan inter-district distances', () => {
    const colombo = SRI_LANKA_LOCATIONS.find((l) => l.id === 'colombo')!;
    const kandy = SRI_LANKA_LOCATIONS.find((l) => l.id === 'kandy')!;
    const galle = SRI_LANKA_LOCATIONS.find((l) => l.id === 'galle')!;

    const distColomboKandy = calculateDistanceKm(colombo, kandy);
    const distColomboGalle = calculateDistanceKm(colombo, galle);

    // Colombo to Kandy as the crow flies is ~94 km
    assert.ok(distColomboKandy > 80 && distColomboKandy < 110, `Colombo-Kandy distance was ${distColomboKandy}`);
    // Colombo to Galle as the crow flies is ~105 km
    assert.ok(distColomboGalle > 90 && distColomboGalle < 130, `Colombo-Galle distance was ${distColomboGalle}`);
  });

  it('validates provider operating days correctly with isProviderAvailable', () => {
    const mockProvider: ServiceProvider = {
      id: 'prov-test',
      name: 'Weekend Sitter',
      bio: 'Available weekends only',
      category: 'sitting',
      rating: 5.0,
      reviewCount: 10,
      latitude: 6.9271,
      longitude: 79.8612,
      address: '123 Main St',
      city: 'Colombo',
      experienceYears: 3,
      services: [],
      availableDays: ['Sat', 'Sun'],
      availableHours: { start: '09:00', end: '17:00' },
      isVerified: true,
      phone: '+94771122334',
    };

    // 2026-08-22 is a Saturday
    assert.strictEqual(isProviderAvailable(mockProvider, '2026-08-22'), true);
    // 2026-08-23 is a Sunday
    assert.strictEqual(isProviderAvailable(mockProvider, '2026-08-23'), true);
    // 2026-08-24 is a Monday
    assert.strictEqual(isProviderAvailable(mockProvider, '2026-08-24'), false);
  });

  it('contains all 6 core pet service categories with metadata', () => {
    const categoryIds = SERVICE_CATEGORIES.map((c) => c.id);
    assert.ok(categoryIds.includes('grooming'));
    assert.ok(categoryIds.includes('boarding'));
    assert.ok(categoryIds.includes('sitting'));
    assert.ok(categoryIds.includes('walking'));
    assert.ok(categoryIds.includes('training'));
    assert.ok(categoryIds.includes('transport'));
    assert.strictEqual(SERVICE_CATEGORIES.length, 6);
  });
});
