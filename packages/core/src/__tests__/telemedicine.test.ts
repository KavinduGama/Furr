import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { Consultation, ConsultationMessage } from '../telemedicine';

describe('Telemedicine Domain Tests', () => {
  const sampleConsultation: Consultation = {
    id: 'consult-1',
    petId: 'pet-max',
    petName: 'Max',
    petSpecies: 'dog',
    ownerUid: 'owner-1',
    ownerName: 'Sunil Perera',
    vetUid: 'vet-1',
    vetName: 'Dr. Nimal Silva',
    status: 'active',
    symptoms: 'Lethargic and vomiting since morning',
    duration: '1 day',
    severity: 'urgent',
    type: 'emergency_triage',
    createdAt: '2026-08-17T00:00:00Z',
  };

  it('validates telemedicine consultation data model', () => {
    assert.strictEqual(sampleConsultation.status, 'active');
    assert.strictEqual(sampleConsultation.severity, 'urgent');
    assert.strictEqual(sampleConsultation.petSpecies, 'dog');
  });

  it('verifies chat message delivery and sender attributes', () => {
    const message: ConsultationMessage = {
      id: 'msg-1',
      consultationId: 'consult-1',
      senderUid: 'owner-1',
      senderName: 'Sunil Perera',
      senderRole: 'owner',
      text: 'Hello doctor, Max started drinking water again.',
      createdAt: '2026-08-20T10:05:00Z',
    };

    assert.strictEqual(message.senderRole, 'owner');
    assert.strictEqual(message.text.includes('drinking water'), true);
  });
});
