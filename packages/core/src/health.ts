// ─────────────────────────────────────────────────────────────
//  @furr/core — Vaccination, Medication, Weight domain types
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

// ── Weight ────────────────────────────────────────────────────

export type WeightUnit = 'kg' | 'lbs';

export type WeightEntry = {
  id: string;
  petId: string;
  ownerUid: string;
  /** Weight value in the chosen unit. */
  value: number;
  unit: WeightUnit;
  /** ISO 8601 date the weight was measured. */
  measuredOn: string;
  /** Optional free-text context e.g. "after summer diet" */
  note?: string;
  createdByUid: string;
  createdAt: string;
  updatedAt: string;
};

// ── Health Observation (stub for HLT-001) ────────────────────

export type ObservationCategory =
  | 'symptom'
  | 'behaviour'
  | 'appetite'
  | 'energy'
  | 'digestion'
  | 'skin_coat'
  | 'injury'
  | 'other';

export type ObservationSeverity = 'mild' | 'moderate' | 'concerning';

export type HealthObservation = {
  id: string;
  petId: string;
  ownerUid: string;
  category: ObservationCategory;
  description: string;
  severity?: ObservationSeverity;
  observedOn: string;
  documentPath?: string;
  provenance: 'OWNER_ENTERED';
  createdByUid: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

// ── Unified timeline item ─────────────────────────────────────

export type TimelineFilter = 'all' | 'vaccinations' | 'medications' | 'weight' | 'observations';

export type TimelineItem =
  | { kind: 'vaccination'; date: string; record: VaccinationRecord }
  | { kind: 'medication'; date: string; plan: MedicationPlan }
  | { kind: 'weight'; date: string; entry: WeightEntry }
  | { kind: 'observation'; date: string; observation: HealthObservation };

/** Merge and sort all health record types into a single timeline array. */
export function buildTimeline(
  vaccinations: VaccinationRecord[],
  medications: MedicationPlan[],
  weights: WeightEntry[],
  observations: HealthObservation[],
): TimelineItem[] {
  const items: TimelineItem[] = [
    ...vaccinations.map((r) => ({ kind: 'vaccination' as const, date: r.administeredOn, record: r })),
    ...medications.map((m) => ({ kind: 'medication' as const, date: m.startAt.slice(0, 10), plan: m })),
    ...weights.map((w) => ({ kind: 'weight' as const, date: w.measuredOn, entry: w })),
    ...observations.map((o) => ({ kind: 'observation' as const, date: o.observedOn, observation: o })),
  ];
  // Sort descending — most recent first
  return items.sort((a, b) => b.date.localeCompare(a.date));
}
