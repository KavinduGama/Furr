// ─────────────────────────────────────────────────────────────
//  @furr/core — Vaccination and Medication domain types
// ─────────────────────────────────────────────────────────────

import type { RecordProvenance } from './index';

// ── Vaccination ───────────────────────────────────────────────

/** Standard reference vaccine types shown in the picker. */
export const VACCINE_TYPES = [
  'Rabies',
  'Canine Distemper (DA2PP)',
  'Bordetella (Kennel Cough)',
  'Canine Influenza',
  'Leptospirosis',
  'Feline Panleukopenia (FVRCP)',
  'Feline Leukemia (FeLV)',
  'Feline Herpesvirus',
  'Feline Calicivirus',
  'Other',
] as const;

export type VaccineType = (typeof VACCINE_TYPES)[number];

export type VaccinationRecord = {
  id: string;
  petId: string;
  ownerUid: string;
  /** Standard type or "Other". */
  vaccineType: VaccineType;
  /** If vaccineType === "Other", the custom name entered. */
  customVaccineName?: string;
  /** ISO 8601 date — required. Cannot be in the future. */
  administeredOn: string;
  /** ISO 8601 date — must be after administeredOn if set. */
  nextDueOn?: string;
  /** Free-text vet name (not a verified identity in MVP). */
  veterinarian?: string;
  clinic?: string;
  batchNumber?: string;
  certificateNumber?: string;
  notes?: string;
  /** Firebase Storage path of any attached document/image. */
  documentPath?: string;
  provenance: RecordProvenance;
  /** Firestore UID of whoever created this record. */
  createdByUid: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

// ── Medication ────────────────────────────────────────────────

export type FrequencyPattern =
  | { kind: 'once' }
  | { kind: 'every_n_hours'; hours: number }
  | { kind: 'daily'; times: string[] }          // array of "HH:MM" strings
  | { kind: 'weekly'; days: number[]; times: string[] }; // 0=Sun…6=Sat

export type MedicationPlan = {
  id: string;
  petId: string;
  ownerUid: string;
  medicationName: string;
  doseInstruction: string;
  frequency: FrequencyPattern;
  /** ISO 8601 datetime. */
  startAt: string;
  /** ISO 8601 datetime — null means ongoing. */
  endAt?: string;
  prescribingVet?: string;
  prescribingClinic?: string;
  reason?: string;
  notes?: string;
  documentPath?: string;
  isActive: boolean;
  createdByUid: string;
  createdAt: string;
  updatedAt: string;
};
