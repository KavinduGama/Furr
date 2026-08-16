// ─────────────────────────────────────────────────────────────
//  @furr/core — Lost & Found, Alerts and Pet ID types
// ─────────────────────────────────────────────────────────────

export interface LostPetAlert {
  id: string;
  petId: string;
  ownerUid: string;
  ownerName: string;
  ownerPhone: string;
  petName: string;
  species: 'dog' | 'cat';
  breed?: string;
  colour: string;
  lastSeenAddress: string;
  lastSeenCity: string;
  lastSeenTime: string;
  latitude: number;
  longitude: number;
  rewardAmount?: string;
  photoUrl?: string;
  description: string;
  status: 'active' | 'resolved';
  createdAt: string;
}

export interface FoundPetReport {
  id: string;
  reporterUid: string;
  reporterName: string;
  reporterPhone: string;
  species: 'dog' | 'cat';
  colour: string;
  foundAddress: string;
  foundCity: string;
  foundTime: string;
  photoUrl?: string;
  description: string;
  currentCareStatus: 'with_me' | 'at_shelter' | 'at_vet';
  shelterOrVetName?: string;
  status: 'open' | 'matched' | 'resolved';
  createdAt: string;
}

export interface PetDigitalId {
  petId: string;
  name: string;
  species: 'dog' | 'cat';
  breed?: string;
  colour?: string;
  microchipNumber?: string;
  emergencyContactName: string;
  emergencyPhone: string;
  vetName?: string;
  vetPhone?: string;
  allergies?: string[];
  publicBio?: string;
  qrCodeUrl: string;
}
