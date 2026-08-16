// ─────────────────────────────────────────────────────────────
//  @furr/core — Telemedicine & Vet Consultation types
// ─────────────────────────────────────────────────────────────

export type ConsultationType = 'chat' | 'emergency_triage' | 'follow_up';
export type ConsultationStatus = 'waiting' | 'active' | 'completed' | 'cancelled';

export interface ConsultationMessage {
  id: string;
  consultationId: string;
  senderUid: string;
  senderRole: 'owner' | 'vet';
  senderName: string;
  text: string;
  imageUrls?: string[];
  createdAt: string;
}

export interface VetPrescriptionItem {
  medicationName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions: string;
  marketplaceProductId?: string;
}

export interface Consultation {
  id: string;
  ownerUid: string;
  ownerName: string;
  petId: string;
  petName: string;
  petSpecies: string;
  petBreed?: string;
  petAgeYears?: number;
  symptoms: string;
  duration: string;
  severity: 'mild' | 'moderate' | 'urgent';
  photoUrls?: string[];
  type: ConsultationType;
  status: ConsultationStatus;
  vetUid?: string;
  vetName?: string;
  vetClinicName?: string;
  summary?: string;
  prescriptions?: VetPrescriptionItem[];
  createdAt: string;
  closedAt?: string;
}
