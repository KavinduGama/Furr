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

// ── Allergies & Conditions (HLT-002) ──────────────────────────

export type HealthFlagType = 'allergy' | 'condition';
export type HealthFlagStatus = 'active' | 'inactive' | 'unknown';

export type HealthFlag = {
  id: string;
  petId: string;
  ownerUid: string;
  type: HealthFlagType;
  title: string;
  status: HealthFlagStatus;
  startedOn?: string; // YYYY-MM-DD
  notes?: string;
  provenance: 'OWNER_ENTERED' | 'VET_VERIFIED';
  createdAt: string;
  updatedAt: string;
};

// ── Documents ─────────────────────────────────────────────────

export const DOC_TYPES = [
  'vaccination_card',
  'prescription',
  'lab_report',
  'visit_summary',
  'other',
] as const;

export type DocType = (typeof DOC_TYPES)[number];

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  vaccination_card: 'Vaccination card',
  prescription: 'Prescription',
  lab_report: 'Lab report',
  visit_summary: 'Visit summary',
  other: 'Other document',
};

export type PetDocument = {
  id: string;
  petId: string;
  ownerUid: string;
  docType: DocType;
  mimeType: string;
  originalFileName: string;
  /** Firebase Storage path (private — never expose directly). */
  storagePath: string;
  /** Signed download URL (short-lived — fetch on demand). */
  downloadUrl: string;
  fileSizeBytes: number;
  notes?: string;
  uploadedByUid: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

// ── Unified timeline item ─────────────────────────────────────

export type TimelineFilter = 'all' | 'vaccinations' | 'medications' | 'weight' | 'observations' | 'documents';

export type TimelineItem =
  | { kind: 'vaccination'; date: string; record: VaccinationRecord }
  | { kind: 'medication'; date: string; plan: MedicationPlan }
  | { kind: 'weight'; date: string; entry: WeightEntry }
  | { kind: 'observation'; date: string; observation: HealthObservation }
  | { kind: 'document'; date: string; document: PetDocument };

/** Merge and sort all health record types into a single timeline array. */
export function buildTimeline(
  vaccinations: VaccinationRecord[],
  medications: MedicationPlan[],
  weights: WeightEntry[],
  observations: HealthObservation[],
  documents: PetDocument[] = [],
): TimelineItem[] {
  const safeSlice = (s: string | undefined | null): string => {
    if (!s || s.length < 10) return s || '1970-01-01';
    return s.slice(0, 10);
  };

  const items: TimelineItem[] = [
    ...vaccinations.map((r) => ({ kind: 'vaccination' as const, date: r.administeredOn, record: r })),
    ...medications.map((m) => ({ kind: 'medication' as const, date: safeSlice(m.startAt), plan: m })),
    ...weights.map((w) => ({ kind: 'weight' as const, date: w.measuredOn, entry: w })),
    ...observations.map((o) => ({ kind: 'observation' as const, date: o.observedOn, observation: o })),
    ...documents.map((d) => ({ kind: 'document' as const, date: safeSlice(d.createdAt), document: d })),
  ];
  return items.sort((a, b) => b.date.localeCompare(a.date));
}
