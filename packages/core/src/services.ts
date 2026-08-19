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
  providerRoles?: ServiceCategory[];
  isMarketplaceVendor?: boolean;
  rating: number;
  reviewCount: number;
  distanceKm?: number;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  district?: string;
  experienceYears: number;
  services: ServiceItem[];
  availableDays: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  availableHours: { start: string; end: string }; // e.g. { start: '08:00', end: '18:00' }
  isVerified: boolean;
  phone: string;
  onlineStatus?: 'online' | 'offline' | 'busy';
  portfolioUrls?: string[];
  certificationUrls?: string[];
  nicNumber?: string;
  businessRegistration?: string;
  serviceRadius?: number;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    branch: string;
    holderName?: string;
  };
  walletDetails?: {
    type: 'genie' | 'frimi' | 'ezcash';
    phoneNumber: string;
  };
  metrics?: {
    totalBookings: number;
    completionRate: number;
    acceptanceRate: number;
    avgResponseMinutes: number;
    avgRating: number;
  };
  vacationMode?: boolean;
  vacationMessage?: string;
  blockedDates?: string[];
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceBooking {
  id: string;
  ownerUid: string;
  petId: string;
  petName: string;
  petSpecies: string;
  petBreed?: string;
  petAgeYears?: number;
  ownerName?: string;
  ownerPhone?: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: ServiceCategory;
  price: number;
  platformFee?: number;
  providerPayout?: number;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. '10:00 AM'
  specialNotes?: string;
  status: BookingStatus;
  completionNotes?: string;
  completionPhotoUrls?: string[];
  walkStats?: {
    distanceMeters: number;
    durationSeconds: number;
  };
  petBehaviorRating?: 'friendly' | 'anxious' | 'reactive' | 'calm';
  cancellationReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SriLankaLocation {
  id: string;
  name: string;
  province: string;
  latitude: number;
  longitude: number;
}

export const SRI_LANKA_LOCATIONS: SriLankaLocation[] = [
  { id: 'colombo', name: 'Colombo', province: 'Western', latitude: 6.9271, longitude: 79.8612 },
  { id: 'gampaha', name: 'Gampaha / Negombo', province: 'Western', latitude: 7.0840, longitude: 79.9943 },
  { id: 'kalutara', name: 'Kalutara / Panadura', province: 'Western', latitude: 6.5854, longitude: 79.9607 },
  { id: 'kandy', name: 'Kandy', province: 'Central', latitude: 7.2906, longitude: 80.6337 },
  { id: 'galle', name: 'Galle', province: 'Southern', latitude: 6.0535, longitude: 80.2210 },
  { id: 'matara', name: 'Matara', province: 'Southern', latitude: 5.9549, longitude: 80.5550 },
  { id: 'kurunegala', name: 'Kurunegala', province: 'North Western', latitude: 7.4863, longitude: 80.3623 },
  { id: 'jaffna', name: 'Jaffna', province: 'Northern', latitude: 9.6615, longitude: 80.0255 },
  { id: 'batticaloa', name: 'Batticaloa', province: 'Eastern', latitude: 7.7310, longitude: 81.6747 },
];

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

export function isProviderAvailable(
  provider: ServiceProvider,
  dateString: string,
  _timeSlotString?: string
): boolean {
  if (!provider.availableDays || provider.availableDays.length === 0) return true;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = days[date.getDay()];

  return provider.availableDays.includes(dayName);
}
