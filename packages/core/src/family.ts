// ─────────────────────────────────────────────────────────────
//  @furr/core — Family, Household & Multi-User Sharing types
// ─────────────────────────────────────────────────────────────

export type HouseholdRole = 'owner' | 'caregiver' | 'viewer';

export interface HouseholdMember {
  uid: string;
  name: string;
  emailOrPhone: string;
  role: HouseholdRole;
  avatarUrl?: string;
  joinedAt: string;
  allowedPetIds: string[]; // empty array = all pets
}

export interface Household {
  id: string;
  ownerUid: string;
  householdName: string;
  members: HouseholdMember[];
  createdAt: string;
}

export interface InsuranceQuoteRequest {
  petSpecies: 'dog' | 'cat';
  petAgeYears: number;
  breed: string;
  coverageLevel: 'basic' | 'standard' | 'comprehensive';
  estimatedMonthlyLkr: number;
}
