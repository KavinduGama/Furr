import { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildTimeline, VaccinationRecord, MedicationPlan, WeightEntry } from '../health';

describe('Health Timeline Builder', () => {
  it('combines and sorts multiple health records chronologically descending', () => {
    const mockVaccination: VaccinationRecord = {
      id: 'v1',
      petId: 'max',
      ownerUid: 'uid1',
      vaccineType: 'Rabies',
      customVaccineName: 'Rabisin',
      administeredOn: '2026-08-01',
      provenance: 'VET_VERIFIED',
      createdByUid: 'uid1',
      isArchived: false,
      batchNumber: 'B123',
      clinic: 'Colombo Pet Hospital',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    };

    const mockWeight: WeightEntry = {
      id: 'w1',
      petId: 'max',
      ownerUid: 'uid1',
      value: 28.5,
      unit: 'kg',
      measuredOn: '2026-08-10',
      createdByUid: 'uid1',
      createdAt: '2026-08-10T00:00:00Z',
      updatedAt: '2026-08-10T00:00:00Z',
    };

    const mockMedication: MedicationPlan = {
      id: 'm1',
      petId: 'max',
      ownerUid: 'uid1',
      medicationName: 'Amoxicillin',
      doseInstruction: '250mg tablet with meal',
      frequency: { kind: 'daily', times: ['08:00', '20:00'] },
      startAt: '2026-08-05',
      endAt: '2026-08-12',
      isActive: true,
      createdByUid: 'uid1',
      createdAt: '2026-08-05T00:00:00Z',
      updatedAt: '2026-08-05T00:00:00Z',
    };

    const timeline = buildTimeline(
      [mockVaccination],
      [mockMedication],
      [mockWeight],
      [],
      []
    );

    assert.strictEqual(timeline.length, 3);
    // Should be sorted most recent first: Aug 10 (weight), Aug 05 (medication), Aug 01 (vaccination)
    assert.strictEqual(timeline[0].kind, 'weight');
    assert.strictEqual(timeline[0].date, '2026-08-10');
    assert.strictEqual(timeline[1].kind, 'medication');
    assert.strictEqual(timeline[1].date, '2026-08-05');
    assert.strictEqual(timeline[2].kind, 'vaccination');
    assert.strictEqual(timeline[2].date, '2026-08-01');
  });

  it('handles empty arrays gracefully', () => {
    const timeline = buildTimeline([], [], [], []);
    assert.deepStrictEqual(timeline, []);
  });
});
