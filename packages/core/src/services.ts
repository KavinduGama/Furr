// ─────────────────────────────────────────────────────────────
//  @furr/core — Services & Booking domain models
// ─────────────────────────────────────────────────────────────

export type ServiceCategory = 
  | 'grooming'
  | 'boarding'
  | 'sitting'
  | 'walking'
  | 'training'
  | 'transport';

export const SERVICE_CATEGORIES: { id: ServiceCategory; title: string; subtitle: string; icon: string }[] = [
  { id: 'grooming', title: 'Pet Grooming', subtitle: 'Spa, bath, haircut & nails', icon: 'cut' },
  { id: 'boarding', title: 'Pet Boarding', subtitle: 'Overnight hotel & resort', icon: 'home' },
  { id: 'sitting', title: 'Pet Sitting', subtitle: 'In-home visits & care', icon: 'heart' },
  { id: 'walking', title: 'Dog Walking', subtitle: 'Daily walks & exercise', icon: 'walk' },
  { id: 'training', title: 'Training & Behavior', subtitle: 'Obedience & puppy social', icon: 'school' },
  { id: 'transport', title: 'Pet Transport', subtitle: 'Vet visits & pet taxi', icon: 'car' },
];

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  durationMinutes: number;
  price: number;
  description?: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio: string;
  category: ServiceCategory;
  rating: number;
  reviewCount: number;
  distanceKm?: number;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  experienceYears: number;
  services: ServiceItem[];
  availableDays: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  availableHours: { start: string; end: string }; // e.g. { start: '08:00', end: '18:00' }
  isVerified: boolean;
  phone: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceBooking {
  id: string;
  ownerUid: string;
  petId: string;
  petName: string;
  petSpecies: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: ServiceCategory;
  price: number;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. '10:00 AM'
  specialNotes?: string;
  status: BookingStatus;
  createdAt: string;
}

export function calculateDistanceKm(
  pointA: { latitude: number; longitude: number },
  pointB: { latitude: number; longitude: number }
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((pointB.latitude - pointA.latitude) * Math.PI) / 180;
  const dLon = ((pointB.longitude - pointA.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pointA.latitude * Math.PI) / 180) *
      Math.cos((pointB.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

