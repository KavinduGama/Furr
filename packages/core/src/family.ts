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

export type FamilyRole = 'owner' | 'coparent' | 'sitter' | 'vet';

export interface FamilyMember {
  id: string;
  petId: string;
  ownerUid: string;
  memberName: string;
  memberEmail?: string;
  memberPhone?: string;
  role: FamilyRole;
  permissions: {
    canEditHealth: boolean;
    canLogCare: boolean;
    canBookServices: boolean;
    canViewExpenses: boolean;
    canManageMembers: boolean;
  };
  joinedAt: string;
}

export interface InsurancePolicy {
  id: string;
  petId: string;
  providerName: string;
  policyNumber: string;
  coverageType: 'basic' | 'standard' | 'comprehensive';
  annualLimitLkr: number;
  deductibleLkr: number;
  monthlyPremiumLkr: number;
  startDate: string;
  endDate: string;
  emergencyHelpline: string;
  coveredCategories: string[];
}

export interface InsuranceClaim {
  id: string;
  policyId: string;
  petId: string;
  claimDate: string;
  incidentDescription: string;
  claimAmountLkr: number;
  receiptUrls: string[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed';
  submittedAt: string;
}

export interface InsuranceQuoteRequest {
  petSpecies: 'dog' | 'cat';
  petAgeYears: number;
  breed: string;
  coverageLevel: 'basic' | 'standard' | 'comprehensive';
  estimatedMonthlyLkr: number;
}
