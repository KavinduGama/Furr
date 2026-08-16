// ─────────────────────────────────────────────────────────────
//  @furr/core — Advanced Daily Care, Feeding & Activity types
// ─────────────────────────────────────────────────────────────

export interface FeedingSchedule {
  id: string;
  petId: string;
  ownerUid: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodBrand: string;
  portion: string; // e.g. "1.5 cups" or "200g"
  time: string; // HH:mm format
  notes?: string;
}

export interface FeedingLog {
  id: string;
  petId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  fedAt: string;
  fedByUid: string;
  fedByName: string;
  amount: string;
}

export interface WalkActivity {
  id: string;
  petId: string;
  ownerUid: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  distanceKm: number;
  steps?: number;
  avgPaceMinPerKm?: number;
  coordinates?: { latitude: number; longitude: number }[];
  poopCount?: number;
  peeCount?: number;
  notes?: string;
}

export interface TrainingLog {
  id: string;
  petId: string;
  ownerUid: string;
  commandName: string; // e.g. "Sit", "Stay", "Heel"
  successRatePercent: number;
  durationMinutes: number;
  notes?: string;
  loggedAt: string;
}
