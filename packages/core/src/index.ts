// ─────────────────────────────────────────────────────────────
//  @furr/core — domain types, validation, and provenance rules
// ─────────────────────────────────────────────────────────────

// ── Health record types ───────────────────────────────────────
export type {
  VaccinationRecord,
  VaccineType,
  MedicationPlan,
  FrequencyPattern,
} from './health';
export { VACCINE_TYPES } from './health';

// ── Roles ────────────────────────────────────────────────────

export type AppRole = 'owner' | 'professional' | 'clinic_operator' | 'admin';

export const roles: Record<AppRole, string> = {
  owner: 'Pet owner',
  professional: 'Veterinary professional',
  clinic_operator: 'Clinic operator',
  admin: 'Furr administrator',
};

// ── Record provenance states ──────────────────────────────────

/** Every health record must carry one of these — never a plain boolean. */
export type RecordProvenance =
  | 'OWNER_ENTERED'
  | 'OWNER_ENTERED_WITH_DOCUMENT'
  | 'CLINIC_UPLOADED'
  | 'VET_VERIFIED'
  | 'VET_AUTHORED'
  | 'SUPERSEDED'
  | 'DISPUTED';

// ── User / Auth ───────────────────────────────────────────────

/** Auth state while the phone OTP flow is in progress. */
export type PhoneAuthStep = 'idle' | 'sending' | 'sent' | 'verifying' | 'error';

/**
 * Stored in Firestore at `ownerProfiles/{uid}`.
 * Only the minimum fields needed — no DOB, NIC, or full address in MVP.
 */
export type OwnerProfile = {
  uid: string;
  /** The name shown in greetings and exports. */
  displayName: string | null;
  /** Normalised E.164 phone number e.g. "+94771234567". */
  phoneE164: string;
  /** Verified email for recovery/notifications — optional. */
  email?: string;
  emailVerified?: boolean;
  /** Sri Lankan district (from ADM-003 reference list). */
  district?: string;
  /** IANA timezone string. Default: "Asia/Colombo". */
  timezone: string;
  notificationsEnabled: boolean;
  /** ISO 8601 timestamp when current terms were accepted. */
  termsAcceptedAt: string;
  /** Version of terms accepted e.g. "2026-08-01". */
  termsVersion: string;
  /** Firestore server timestamp — never client-generated. */
  createdAt: string;
  accountStatus: 'active' | 'suspended' | 'pending_deletion' | 'deleted';
};

// ── Pet ───────────────────────────────────────────────────────

export type PetSpecies = 'dog' | 'cat';
export type PetSex = 'male' | 'female' | 'unknown';

export type Pet = {
  id: string;
  ownerUid: string;
  name: string;
  species: PetSpecies;
  sex: PetSex;
  /** Breed name or "Mixed / Unknown". */
  breed?: string;
  /** ISO 8601 date. May be estimated (day = 01 if only month/year known). */
  birthDate?: string;
  birthDateIsEstimated?: boolean;
  colour?: string;
  microchipNumber?: string;
  isNeutered?: boolean;
  generalNote?: string;
  /** Firebase Storage path for the pet photo. */
  photoPath?: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  /** UI only — first letter of name for avatar fallback. */
  avatarLabel: string;
};

// ── Health Records ────────────────────────────────────────────

export type HealthRecordCategory =
  | 'vaccination'
  | 'medication'
  | 'observation'
  | 'weight'
  | 'document'
  | 'professional_visit'
  | 'allergy_condition';

export type HealthRecord = {
  id: string;
  petId: string;
  ownerUid: string;
  category: HealthRecordCategory;
  title: string;
  /** ISO 8601 date or datetime. */
  occurredAt: string;
  provenance: RecordProvenance;
  /** UID of whoever created this record. */
  createdByUid: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

// ── Phone normalisation ───────────────────────────────────────

/**
 * Normalise a raw phone input to E.164.
 * Handles Sri Lankan numbers: strips spaces, dashes, and parentheses.
 * If the number starts with 0 (local format), replaces with +94.
 *
 * Returns null if the result is not a plausibly valid E.164 string.
 */
export function normalisePhone(raw: string, defaultCountryCode = '94'): string | null {
  // Strip all whitespace, dashes, dots, parentheses
  const stripped = raw.replace(/[\s\-().]/g, '');

  let e164: string;

  if (stripped.startsWith('+')) {
    e164 = stripped;
  } else if (stripped.startsWith('00')) {
    e164 = '+' + stripped.slice(2);
  } else if (stripped.startsWith('0')) {
    // Local format — prepend country code
    e164 = '+' + defaultCountryCode + stripped.slice(1);
  } else if (/^\d{7,15}$/.test(stripped)) {
    e164 = '+' + defaultCountryCode + stripped;
  } else {
    return null;
  }

  // Basic E.164 sanity: + followed by 7–15 digits
  if (/^\+\d{7,15}$/.test(e164)) return e164;
  return null;
}

/**
 * Returns true if the string looks like a valid E.164 phone number.
 */
export function isValidE164(phone: string): boolean {
  return /^\+\d{7,15}$/.test(phone);
}

/**
 * Format E.164 for display e.g. "+94771234567" → "+94 77 123 4567"
 * Simple Sri Lankan formatting — extend for other locales later.
 */
export function formatPhoneDisplay(e164: string): string {
  // Sri Lankan mobile: +94 XX XXX XXXX
  const lk = e164.match(/^\+94(\d{2})(\d{3})(\d{4})$/);
  if (lk) return `+94 ${lk[1]} ${lk[2]} ${lk[3]}`;
  return e164;
}

// ── Demo data (dev/prototype only) ───────────────────────────

export const demoPets: Pet[] = [
  {
    id: 'max',
    ownerUid: 'demo-uid',
    name: 'Max',
    species: 'dog',
    sex: 'male',
    breed: 'Golden Retriever',
    birthDate: '2024-02-10',
    status: 'active',
    avatarLabel: 'M',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'luna',
    ownerUid: 'demo-uid',
    name: 'Luna',
    species: 'cat',
    sex: 'female',
    breed: 'Domestic Shorthair',
    birthDate: '2023-06-04',
    status: 'active',
    avatarLabel: 'L',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  },
];

export const demoRecords: HealthRecord[] = [
  {
    id: 'record-1',
    petId: 'max',
    ownerUid: 'demo-uid',
    category: 'vaccination',
    title: 'Rabies vaccination',
    occurredAt: '2026-08-03',
    provenance: 'VET_VERIFIED',
    createdByUid: 'demo-uid',
    isArchived: false,
    createdAt: '2026-08-03T10:00:00Z',
    updatedAt: '2026-08-03T10:00:00Z',
  },
  {
    id: 'record-2',
    petId: 'max',
    ownerUid: 'demo-uid',
    category: 'medication',
    title: 'Omega-3 supplement',
    occurredAt: '2026-08-10',
    provenance: 'OWNER_ENTERED',
    createdByUid: 'demo-uid',
    isArchived: false,
    createdAt: '2026-08-10T08:00:00Z',
    updatedAt: '2026-08-10T08:00:00Z',
  },
  {
    id: 'record-3',
    petId: 'luna',
    ownerUid: 'demo-uid',
    category: 'weight',
    title: 'Weight logged: 4.8 kg',
    occurredAt: '2026-08-07',
    provenance: 'OWNER_ENTERED',
    createdByUid: 'demo-uid',
    isArchived: false,
    createdAt: '2026-08-07T09:00:00Z',
    updatedAt: '2026-08-07T09:00:00Z',
  },
];
