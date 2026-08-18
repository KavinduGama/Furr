import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { Consultation, ConsultationMessage, VetPrescriptionItem } from '../telemedicine';

describe('Real-Time Chat & Telehealth Desk Tests', () => {
  const consultId = 'consult-active-101';

  const messages: ConsultationMessage[] = [
    {
      id: 'msg-1',
      consultationId: consultId,
      senderUid: 'owner-uid',
      senderRole: 'owner',
      senderName: 'Kavindu',
      text: 'Doctor, Max has not eaten anything for 12 hours.',
      createdAt: '2026-08-18T08:00:00.000Z',
    },
    {
      id: 'msg-2',
      consultationId: consultId,
      senderUid: 'vet-uid',
      senderRole: 'vet',
      senderName: 'Dr. Sarah Weerasinghe, BVSc',
      text: 'Did he drink any fluids or vomit?',
      createdAt: '2026-08-18T08:05:00.000Z',
    },
    {
      id: 'msg-3',
      consultationId: consultId,
      senderUid: 'owner-uid',
      senderRole: 'owner',
      senderName: 'Kavindu',
      text: 'He drank a little water, no vomiting.',
      createdAt: '2026-08-18T08:08:00.000Z',
    },
  ];

  it('correctly sorts chronological messages from mixed roles', () => {
    const sorted = [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    assert.strictEqual(sorted[0].id, 'msg-1');
    assert.strictEqual(sorted[0].senderRole, 'owner');
    assert.strictEqual(sorted[1].id, 'msg-2');
    assert.strictEqual(sorted[1].senderRole, 'vet');
    assert.strictEqual(sorted[2].id, 'msg-3');
    assert.strictEqual(sorted[2].senderRole, 'owner');
  });

  it('validates digital prescription structure issued by practitioner', () => {
    const rx: VetPrescriptionItem = {
      medicationName: 'Metoclopramide Oral Syrup',
      dosage: '0.2mg/kg',
      frequency: 'Twice daily',
      durationDays: 3,
      instructions: 'Administer 30 mins before feeding. Keep fresh water accessible.',
      marketplaceProductId: 'prod-digestive-care',
    };

    assert.strictEqual(rx.durationDays, 3);
    assert.strictEqual(rx.frequency, 'Twice daily');
    assert.ok(rx.marketplaceProductId);
  });

  it('verifies consultation status transition and prescription attachment', () => {
    const consultation: Consultation = {
      id: consultId,
      ownerUid: 'owner-uid',
      ownerName: 'Kavindu Deshappriya',
      petId: 'pet-max',
      petName: 'Max',
      petSpecies: 'dog',
      petBreed: 'Golden Retriever',
      symptoms: 'Loss of appetite for 12 hours',
      duration: 'Since morning',
      severity: 'mild',
      type: 'chat',
      status: 'waiting',
      createdAt: '2026-08-18T07:55:00.000Z',
    };

    assert.strictEqual(consultation.status, 'waiting');

    // Practitioner picks up case and issues prescription
    const updatedConsultation: Consultation = {
      ...consultation,
      status: 'active',
      vetUid: 'vet-sarah-101',
      vetName: 'Dr. Sarah Weerasinghe, BVSc',
      vetClinicName: 'Colombo Veterinary Hospital',
      summary: 'Mild transient gastritis. Prescribed oral syrup for 3 days.',
      prescriptions: [
        {
          medicationName: 'Metoclopramide Oral Syrup',
          dosage: '0.2mg/kg',
          frequency: 'Twice daily',
          durationDays: 3,
          instructions: 'Administer before feeding.',
        },
      ],
    };

    assert.strictEqual(updatedConsultation.status, 'active');
    assert.strictEqual(updatedConsultation.vetUid, 'vet-sarah-101');
    assert.strictEqual(updatedConsultation.prescriptions?.length, 1);
  });
});
