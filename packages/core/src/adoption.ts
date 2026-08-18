// ─────────────────────────────────────────────────────────────
//  @furr/core — Adoption Platform & Rescue Network Types
// ─────────────────────────────────────────────────────────────

import type { PetSpecies, PetSex } from './index';

export type AdoptionStatus = 'available' | 'pending' | 'adopted' | 'fostered';

export type ListingType = 'shelter' | 'rescue_org' | 'individual_rehoming';

export type AdoptionListing = {
  id: string;
  shelterId: string;
  shelterName: string;
  shelterVerified?: boolean;
  shelterPhone?: string;
  shelterEmail?: string;
  listingType: ListingType;
  petName: string;
  species: PetSpecies;
  sex: PetSex;
  breed: string;
  ageEstimate: string; // e.g. "4 months", "2 years"
  approximateDob?: string;
  size: 'small' | 'medium' | 'large' | 'giant';
  colour?: string;
  photoUrls: string[];
  coverPhotoUrl: string;
  description: string;
  story?: string;
  temperamentTraits: string[]; // e.g. ["Good with kids", "Crate trained", "Needs quiet home", "Playful"]
  medicalSummary: {
    isVaccinated: boolean;
    isNeutered: boolean;
    isDewormed: boolean;
    isMicrochipped: boolean;
    specialNeeds?: string;
  };
  location: {
    district: string;
    city: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  adoptionFeeLkr: number; // 0 for free adoption
  status: AdoptionStatus;
  createdAt: string;
  updatedAt?: string;
  applicationsCount?: number;
};

export type ApplicationStatus = 'submitted' | 'under_review' | 'interview_scheduled' | 'home_check' | 'approved' | 'rejected' | 'withdrawn';

export type AdoptionApplication = {
  id: string;
  listingId: string;
  petName: string;
  applicantUid: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  applicantDistrict: string;
  applicantAddress: string;
  housingType: 'own_house' | 'rent_house' | 'apartment' | 'other';
  hasFencedGarden: boolean;
  hasOtherPets: boolean;
  otherPetsDetails?: string;
  hasChildren: boolean;
  childrenAges?: string;
  experienceLevel: 'first_time' | 'experienced' | 'lifelong_owner';
  dailyHoursAlone: number;
  veterinarianReference?: {
    clinicName: string;
    vetName?: string;
    phone: string;
  };
  reasonForAdopting: string;
  status: ApplicationStatus;
  reviewerNotes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type ShelterProfile = {
  id: string;
  name: string;
  registrationNumber?: string;
  contactPerson: string;
  phone: string;
  email: string;
  district: string;
  city: string;
  address: string;
  logoUrl?: string;
  coverUrl?: string;
  bio: string;
  isVerified: boolean;
  activeListingsCount: number;
  successfulAdoptionsCount: number;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    branchName: string;
  };
  createdAt: string;
};

/**
 * Basic application validator to ensure applicant meets minimum contact & safety criteria.
 */
export function validateAdoptionApplication(
  app: Partial<AdoptionApplication>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!app.applicantName?.trim()) errors.push('Applicant name is required');
  if (!app.applicantPhone?.trim()) errors.push('Contact phone number is required');
  if (!app.applicantDistrict?.trim()) errors.push('District is required');
  if (!app.housingType) errors.push('Housing type must be selected');
  if (app.dailyHoursAlone === undefined || app.dailyHoursAlone < 0 || app.dailyHoursAlone > 24) {
    errors.push('Valid daily hours alone must be specified (0-24)');
  }
  if (!app.reasonForAdopting?.trim() || app.reasonForAdopting.length < 10) {
    errors.push('Please provide a brief reason for adopting (at least 10 characters)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
