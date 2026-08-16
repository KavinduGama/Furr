import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { FeedingSchedule, WalkActivity, TrainingLog } from '../care';

describe('Daily Care, Feeding & Activity Tests', () => {
  const sampleFeeding: FeedingSchedule = {
    id: 'f1',
    petId: 'max',
    ownerUid: 'uid1',
    mealType: 'breakfast',
    foodBrand: 'Royal Canin Maxi',
    portion: '200g',
    time: '07:30',
    notes: 'Mix with warm water',
  };

  const sampleWalk: WalkActivity = {
    id: 'w1',
    petId: 'max',
    ownerUid: 'uid1',
    startTime: '2026-08-17T06:30:00Z',
    endTime: '2026-08-17T07:15:00Z',
    durationMinutes: 45,
    distanceKm: 3.2,
    steps: 4200,
    poopCount: 1,
    peeCount: 3,
  };

  const sampleTraining: TrainingLog = {
    id: 't1',
    petId: 'max',
    ownerUid: 'uid1',
    commandName: 'Heel & Stay',
    successRatePercent: 85,
    durationMinutes: 15,
    notes: 'Good focus with liver treats',
    loggedAt: '2026-08-17T08:00:00Z',
  };

  it('validates feeding schedule structure and portion parameters', () => {
    assert.strictEqual(sampleFeeding.mealType, 'breakfast');
    assert.strictEqual(sampleFeeding.time, '07:30');
    assert.strictEqual(sampleFeeding.portion, '200g');
  });

  it('calculates walk statistics and pace metrics', () => {
    assert.strictEqual(sampleWalk.durationMinutes, 45);
    assert.strictEqual(sampleWalk.distanceKm, 3.2);
    const pace = sampleWalk.durationMinutes / sampleWalk.distanceKm;
    assert.strictEqual(Math.round(pace * 10) / 10, 14.1); // ~14.1 min/km
  });

  it('verifies training log progress metrics', () => {
    assert.strictEqual(sampleTraining.commandName, 'Heel & Stay');
    assert.strictEqual(sampleTraining.successRatePercent >= 80, true);
    assert.strictEqual(sampleTraining.durationMinutes, 15);
  });
});
