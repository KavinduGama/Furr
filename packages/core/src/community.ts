// ─────────────────────────────────────────────────────────────
//  @furr/core — Community, Meetups & Forums types
// ─────────────────────────────────────────────────────────────

export interface PetMeetup {
  id: string;
  creatorUid: string;
  creatorName: string;
  title: string;
  description: string;
  targetSpecies: 'dog' | 'cat' | 'all';
  targetBreeds?: string[];
  locationName: string;
  address: string;
  city: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. 09:00 AM
  rsvpCount: number;
  rsvpUids: string[];
  isSponsored?: boolean;
  sponsorName?: string;
  createdAt: string;
}

export interface ForumAnswer {
  id: string;
  authorUid: string;
  authorName: string;
  authorRole: 'owner' | 'vet' | 'trainer' | 'admin';
  text: string;
  upvotes: number;
  upvotedUids: string[];
  createdAt: string;
}

export interface ForumQuestion {
  id: string;
  authorUid: string;
  authorName: string;
  petSpecies?: 'dog' | 'cat';
  category: 'Health' | 'Training' | 'Diet' | 'Behavior' | 'General';
  title: string;
  details: string;
  answersCount: number;
  answers: ForumAnswer[];
  createdAt: string;
}

export interface PlaydateProfile {
  id: string;
  petId: string;
  ownerUid: string;
  ownerName: string;
  petName: string;
  species: 'dog' | 'cat';
  breed: string;
  size: 'small' | 'medium' | 'large';
  energyLevel: 'low' | 'moderate' | 'high';
  temperament: string;
  city: string;
  distanceKm?: number;
}
