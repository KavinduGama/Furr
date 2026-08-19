// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Services & Bookings Firestore helpers & seed data
// ─────────────────────────────────────────────────────────────

import type { ServiceProvider, ServiceBooking, ServiceCategory } from '@furr/core';

export const INITIAL_PROVIDERS: ServiceProvider[] = [
  {
    id: 'prov-1',
    name: 'Paws & Bubbles Luxury Grooming Spa',
    avatarUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&auto=format&fit=crop&q=60',
    coverUrl: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=800&auto=format&fit=crop&q=60',
    bio: 'Certified master groomers with 8+ years experience in breed-specific styling, de-shedding treatments, and anxious pet calming techniques.',
    category: 'grooming',
    rating: 4.9,
    reviewCount: 54,
    latitude: 6.9271,
    longitude: 79.8612,
    address: 'No. 12/A, Horton Place',
    city: 'Colombo 07',
    experienceYears: 8,
    isVerified: true,
    phone: '+94 11 234 5678',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableHours: { start: '09:00', end: '18:00' },
    services: [
      { id: 'srv-1', name: 'Full Luxury Groom & Style', category: 'grooming', durationMinutes: 75, price: 4500, description: 'Warm hydrobath, organic shampoo, blow dry, breed styling, ear clean & nail trim.' },
      { id: 'srv-2', name: 'Hydrobath & De-shedding', category: 'grooming', durationMinutes: 45, price: 3000, description: 'Deep coat cleanse, high-velocity blowout & dead undercoat removal.' },
      { id: 'srv-3', name: 'Nail Trim & Paw Balm', category: 'grooming', durationMinutes: 20, price: 1200, description: 'Gentle nail clipping, filing and soothing organic paw wax.' },
    ],
  },
  {
    id: 'prov-2',
    name: 'Happy Paws Dog Walking & Pack Socials',
    avatarUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&auto=format&fit=crop&q=60',
    coverUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&auto=format&fit=crop&q=60',
    bio: 'Professional CPR-certified dog walkers providing GPS-tracked daily exercise and behavioral enrichment.',
    category: 'walking',
    rating: 4.8,
    reviewCount: 38,
    latitude: 6.9016,
    longitude: 79.8558,
    address: 'No. 88, Galle Road',
    city: 'Colombo 03',
    experienceYears: 5,
    isVerified: true,
    phone: '+94 77 987 6543',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    availableHours: { start: '06:30', end: '19:00' },
    services: [
      { id: 'srv-4', name: 'Solo 45-Min Neighborhood Walk', category: 'walking', durationMinutes: 45, price: 2000, description: '1-on-1 focused walk with GPS route tracking, water breaks and post-walk report.' },
      { id: 'srv-5', name: 'Pack Beach Adventure Walk (60 Min)', category: 'walking', durationMinutes: 60, price: 2800, description: 'Fun socialization walk with friendly, temperament-matched companions.' },
    ],
  },
  {
    id: 'prov-3',
    name: 'Serene Tails In-Home Pet Sitting',
    avatarUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&auto=format&fit=crop&q=60',
    coverUrl: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&auto=format&fit=crop&q=60',
    bio: 'Experienced veterinary nurse offering stress-free pet sitting in the comfort of your own home.',
    category: 'sitting',
    rating: 5.0,
    reviewCount: 29,
    latitude: 6.8928,
    longitude: 79.8732,
    address: 'No. 34, Havelock Road',
    city: 'Colombo 05',
    experienceYears: 7,
    isVerified: true,
    phone: '+94 71 456 7890',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    availableHours: { start: '07:00', end: '21:00' },
    services: [
      { id: 'srv-6', name: 'In-Home Day Visit (45 Min)', category: 'sitting', durationMinutes: 45, price: 2500, description: 'Feeding, fresh water, medication administration, playtime, and photo updates.' },
      { id: 'srv-7', name: 'Overnight House Sitting', category: 'sitting', durationMinutes: 720, price: 6500, description: '12-hour overnight stay keeping your pet cozy in their familiar environment.' },
    ],
  },
  {
    id: 'prov-4',
    name: 'K9 Academy Behavior & Obedience Training',
    avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&auto=format&fit=crop&q=60',
    coverUrl: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800&auto=format&fit=crop&q=60',
    bio: 'Positive reinforcement training for puppy foundations, leash manners, and reactivity rehabilitation.',
    category: 'training',
    rating: 4.9,
    reviewCount: 47,
    latitude: 6.8833,
    longitude: 79.8652,
    address: 'No. 15, Park Road',
    city: 'Colombo 05',
    experienceYears: 10,
    isVerified: true,
    phone: '+94 77 333 2211',
    availableDays: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    availableHours: { start: '08:00', end: '17:00' },
    services: [
      { id: 'srv-8', name: 'Private Puppy Foundations (1 Hour)', category: 'training', durationMinutes: 60, price: 5000, description: 'Potty training, crate training, bite inhibition & basic cues.' },
      { id: 'srv-9', name: 'Leash Reactivity & Focus Session', category: 'training', durationMinutes: 60, price: 5500, description: 'Counter-conditioning techniques for dogs that pull or bark on walks.' },
    ],
  },
  {
    id: 'prov-5',
    name: 'FurrSafe 24/7 Pet Ambulance & Transport',
    avatarUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&auto=format&fit=crop&q=60',
    coverUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop&q=60',
    bio: 'Climate-controlled, crate-secured pet transport for vet appointments, airport drop-offs, and emergency care.',
    category: 'transport',
    rating: 4.9,
    reviewCount: 22,
    latitude: 6.9147,
    longitude: 79.8778,
    address: 'No. 20, Kynsey Road',
    city: 'Colombo 08',
    experienceYears: 4,
    isVerified: true,
    phone: '+94 11 999 8888',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    availableHours: { start: '00:00', end: '23:59' },
    services: [
      { id: 'srv-10', name: 'Round-Trip Vet Visit Transport', category: 'transport', durationMinutes: 90, price: 4000, description: 'Door-to-door escort, waiting at clinic, and safe return home.' },
      { id: 'srv-11', name: 'Emergency Clinic Transfer', category: 'transport', durationMinutes: 45, price: 5500, description: 'Priority dispatched vehicle equipped with oxygen and first-aid support.' },
    ],
  },
];

export const INITIAL_BOOKINGS: ServiceBooking[] = [
  {
    id: 'book-1',
    petId: 'max',
    petName: 'Max',
    petSpecies: 'dog',
    ownerUid: 'demo-uid',
    providerId: 'prov-1',
    providerName: 'Paws & Bubbles Luxury Grooming Spa',
    serviceId: 'srv-1',
    serviceName: 'Full Luxury Groom & Style',
    serviceCategory: 'grooming',
    date: new Date(Date.now() + 24 * 3600000).toISOString().slice(0, 10),
    timeSlot: '10:30 AM',
    price: 4500,
    status: 'confirmed',
    specialNotes: 'Gentle on front paw sprain',
    createdAt: new Date().toISOString(),
  },
];

export function subscribeToServiceProviders(
  onUpdate: (providers: ServiceProvider[]) => void,
  categoryFilter?: ServiceCategory
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const colRef = collection(db, 'service_providers');

      unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (snapshot.empty) {
            const filtered = categoryFilter
              ? INITIAL_PROVIDERS.filter((p) => p.category === categoryFilter)
              : INITIAL_PROVIDERS;
            onUpdate(filtered);
            return;
          }
          const list: ServiceProvider[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as ServiceProvider;
            if (!categoryFilter || data.category === categoryFilter) {
              list.push({ ...data, id: docSnap.id });
            }
          });
          onUpdate(list.length > 0 ? list : INITIAL_PROVIDERS);
        },
        (err) => {
          console.warn('Fallback to local providers:', err);
          const filtered = categoryFilter
            ? INITIAL_PROVIDERS.filter((p) => p.category === categoryFilter)
            : INITIAL_PROVIDERS;
          onUpdate(filtered);
        }
      );

      if (!active && unsubscribe) {
        unsubscribe();
      }
    } catch (e) {
      console.warn('Failed to subscribe to service providers:', e);
      const filtered = categoryFilter
        ? INITIAL_PROVIDERS.filter((p) => p.category === categoryFilter)
        : INITIAL_PROVIDERS;
      onUpdate(filtered);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export function subscribeToUserBookings(
  ownerUid: string,
  onUpdate: (bookings: ServiceBooking[]) => void
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, where, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(
        collection(db, 'service_bookings'),
        where('ownerUid', '==', ownerUid)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const bookings: ServiceBooking[] = [];
          snapshot.forEach((docSnap) => {
            bookings.push(docSnap.data() as ServiceBooking);
          });
          bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onUpdate(bookings);
        },
        (error) => {
          console.warn('Bookings subscription fallback:', error);
          onUpdate([]);
        }
      );

      if (!active && unsubscribe) {
        unsubscribe();
      }
    } catch (e) {
      console.warn('Failed to subscribe to bookings:', e);
      onUpdate([]);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export async function createServiceBooking(
  bookingData: Omit<ServiceBooking, 'id' | 'createdAt' | 'status'>
): Promise<ServiceBooking> {
  try {
    const { getFirestore, collection, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const newRef = doc(collection(db, 'service_bookings'));
    const booking: ServiceBooking = {
      ...bookingData,
      id: newRef.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await setDoc(newRef, booking);
    return booking;
  } catch (e) {
    console.warn('Local fallback for createServiceBooking:', e);
    const mockBooking: ServiceBooking = {
      ...bookingData,
      id: 'book-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    return mockBooking;
  }
}

export async function cancelServiceBooking(bookingId: string): Promise<void> {
  return updateBookingStatus(bookingId, 'cancelled');
}

export async function updateBookingStatus(
  bookingId: string,
  status: ServiceBooking['status']
): Promise<void> {
  try {
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const ref = doc(db, 'service_bookings', bookingId);
    await updateDoc(ref, { status, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.warn('updateBookingStatus fallback:', e);
  }
}

export async function updateServiceProvider(
  providerId: string,
  updates: Partial<ServiceProvider>
): Promise<void> {
  try {
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const ref = doc(db, 'service_providers', providerId);
    await updateDoc(ref, updates);
  } catch (e) {
    console.warn('updateServiceProvider fallback:', e);
    const prov = INITIAL_PROVIDERS.find((p) => p.id === providerId);
    if (prov) {
      Object.assign(prov, updates);
    }
  }
}

