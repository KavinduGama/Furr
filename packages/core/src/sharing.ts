// ─────────────────────────────────────────────────────────────
//  @furr/core — Sharing, Reminders domain types
// ─────────────────────────────────────────────────────────────

// ── Access Grant (SHR-001/002) ────────────────────────────────

export type ShareCategory =
  | 'summary'
  | 'vaccinations'
  | 'medications'
  | 'timeline'
  | 'weight'
  | 'documents';

export const SHARE_CATEGORIES: { key: ShareCategory; label: string; description: string }[] = [
  { key: 'summary', label: 'Pet summary', description: 'Basic profile and overview' },
  { key: 'vaccinations', label: 'Vaccinations', description: 'Full vaccination history' },
  { key: 'medications', label: 'Medications', description: 'Active medication plans' },
  { key: 'timeline', label: 'Health timeline', description: 'All chronological records' },
  { key: 'weight', label: 'Weight history', description: 'Weight trend and entries' },
  { key: 'documents', label: 'Documents', description: 'Selected uploaded files' },
];

/** Duration options for a professional access grant */
export type GrantDuration = '24h' | '7d';

export type GrantStatus = 'active' | 'expired' | 'revoked' | 'redeemed';

export type AccessGrant = {
  id: string;
  petId: string;
  ownerUid: string;
  /** Short one-time redemption code shown as QR + text — expires after 15 min */
  redemptionCode: string;
  /** ISO timestamp when the redemption code expires (15 min from creation) */
  codeExpiresAt: string;
  purpose: 'veterinary_care';
  categories: ShareCategory[];
  duration: GrantDuration;
  /** ISO timestamp when the access grant itself expires (after redemption) */
  grantExpiresAt?: string;
  status: GrantStatus;
  /** Set after a professional redeems the code */
  redeemedByUid?: string;
  redeemedByName?: string;
  redeemedByClinic?: string;
  redeemedAt?: string;
  revokedAt?: string;
  revokedByUid?: string;
  createdAt: string;
  updatedAt: string;
};

// ── Reminder (REM-001/002) ────────────────────────────────────

export type ReminderType =
  | 'vaccination_due'
  | 'medication_dose'
  | 'follow_up'
  | 'manual';

export type ReminderStatus =
  | 'scheduled'
  | 'due'
  | 'delivered'
  | 'completed'
  | 'skipped'
  | 'snoozed'
  | 'cancelled';

export type Reminder = {
  id: string;
  petId: string;
  ownerUid: string;
  type: ReminderType;
  title: string;
  body: string;
  /** ISO datetime when the reminder should fire */
  scheduledAt: string;
  status: ReminderStatus;
  /** Expo notification identifier — set after scheduling */
  notificationId?: string;
  /** ID of the source record (vaccinationId, medicationId, etc.) */
  sourceId?: string;
  snoozedUntil?: string;
  completedAt?: string;
  skippedAt?: string;
  skipReason?: string;
  createdAt: string;
  updatedAt: string;
};
