// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Provider App Firestore Helpers & Operations
// ─────────────────────────────────────────────────────────────

import type {
  ServiceProvider,
  ServiceBooking,
  Product,
  Order,
  ProviderPayout,
  ProviderEarningsSummary,
  EarningsBreakdown,
  PayoutMethod,
} from '@furr/core';
import { calculateProviderEarnings } from '@furr/core';
import { INITIAL_PROVIDERS, INITIAL_BOOKINGS } from './services';
import { INITIAL_PRODUCTS } from './marketplace';

// ── Default Provider Profile Generator ─────────────────────────
export function getOrCreateDefaultProvider(uid: string, phone: string = '+94 77 123 4567'): ServiceProvider {
  const existing = INITIAL_PROVIDERS.find((p) => p.id === uid);
  if (existing) return existing;

  return {
    id: uid,
    name: 'Premier Pet Care Studio',
    bio: 'Professional certified pet stylist, trainer and daily walking specialist.',
    category: 'grooming',
    providerRoles: ['grooming', 'walking', 'sitting'],
    isMarketplaceVendor: true,
    rating: 4.9,
    reviewCount: 32,
    latitude: 6.9271,
    longitude: 79.8612,
    address: 'No. 45, Alfred House Gardens',
    city: 'Colombo 03',
    district: 'Colombo',
    experienceYears: 6,
    isVerified: true,
    phone,
    onlineStatus: 'online',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableHours: { start: '08:30', end: '18:30' },
    services: [
      { id: 'srv-p1', name: 'Signature Hydrobath & Groom', category: 'grooming', durationMinutes: 60, price: 4500, description: 'Organic botanical shampoo, ear cleaning, paw balm and styling.' },
      { id: 'srv-p2', name: '60-Min Focused Pack Walk', category: 'walking', durationMinutes: 60, price: 2500, description: 'Exercise, social play, fresh water breaks & GPS route report.' },
      { id: 'srv-p3', name: 'In-Home Sitting & Feeding Visit', category: 'sitting', durationMinutes: 45, price: 2800, description: 'Feeding, medication, playtime and instant photo updates.' },
    ],
    bankDetails: {
      bankName: 'Commercial Bank of Ceylon',
      accountNumber: '8004921938',
      branch: 'Kollupitiya',
      holderName: 'Premier Pet Care Studio',
    },
    metrics: {
      totalBookings: 84,
      completionRate: 98,
      acceptanceRate: 95,
      avgResponseMinutes: 8,
      avgRating: 4.9,
    },
  };
}

// ── Provider Profile Subscriptions & Mutations ─────────────────

export function subscribeToProviderProfile(
  providerId: string,
  onUpdate: (profile: ServiceProvider | null) => void
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, doc, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const docRef = doc(db, 'service_providers', providerId);

      unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            onUpdate(docSnap.data() as ServiceProvider);
          } else {
            onUpdate(getOrCreateDefaultProvider(providerId));
          }
        },
        (err) => {
          console.warn('Provider profile fallback to default:', err);
          onUpdate(getOrCreateDefaultProvider(providerId));
        }
      );

      if (!active && unsubscribe) unsubscribe();
    } catch (e) {
      console.warn('subscribeToProviderProfile error, using default:', e);
      onUpdate(getOrCreateDefaultProvider(providerId));
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export async function updateProviderProfile(
  providerId: string,
  updates: Partial<ServiceProvider>
): Promise<void> {
  try {
    const { getFirestore, doc, setDoc, getDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const ref = doc(db, 'service_providers', providerId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      await setDoc(ref, { ...snap.data(), ...updates, updatedAt: new Date().toISOString() }, { merge: true });
    } else {
      const initial = getOrCreateDefaultProvider(providerId);
      await setDoc(ref, { ...initial, ...updates, updatedAt: new Date().toISOString() });
    }
  } catch (e) {
    console.warn('updateProviderProfile fallback:', e);
  }
}

export async function setProviderOnlineStatus(
  providerId: string,
  status: 'online' | 'offline' | 'busy'
): Promise<void> {
  return updateProviderProfile(providerId, { onlineStatus: status });
}

// ── Provider Bookings Lifecycle ────────────────────────────────

export const MOCK_PROVIDER_BOOKINGS: ServiceBooking[] = [
  {
    id: 'pb-101',
    petId: 'max',
    petName: 'Max',
    petSpecies: 'dog',
    petBreed: 'Golden Retriever',
    petAgeYears: 2,
    ownerUid: 'owner-1',
    ownerName: 'Sarah Perera',
    ownerPhone: '+94 77 123 4567',
    providerId: 'prov-1',
    providerName: 'Premier Pet Care Studio',
    serviceId: 'srv-p1',
    serviceName: 'Signature Hydrobath & Groom',
    serviceCategory: 'grooming',
    price: 4500,
    platformFee: 450,
    providerPayout: 4050,
    date: new Date().toISOString().slice(0, 10),
    timeSlot: '10:00 AM',
    status: 'pending',
    specialNotes: 'Please use hypoallergenic shampoo — mild skin allergy on ears.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pb-102',
    petId: 'rocky',
    petName: 'Rocky',
    petSpecies: 'dog',
    petBreed: 'Labrador',
    petAgeYears: 3,
    ownerUid: 'owner-2',
    ownerName: 'Dinuka Silva',
    ownerPhone: '+94 71 987 6543',
    providerId: 'prov-1',
    providerName: 'Premier Pet Care Studio',
    serviceId: 'srv-p2',
    serviceName: '60-Min Focused Pack Walk',
    serviceCategory: 'walking',
    price: 2500,
    platformFee: 250,
    providerPayout: 2250,
    date: new Date().toISOString().slice(0, 10),
    timeSlot: '02:30 PM',
    status: 'confirmed',
    specialNotes: 'Loves chasing tennis balls, highly energetic.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'pb-103',
    petId: 'luna',
    petName: 'Luna',
    petSpecies: 'cat',
    petBreed: 'Persian',
    petAgeYears: 1,
    ownerUid: 'owner-3',
    ownerName: 'Anuki Fernando',
    ownerPhone: '+94 76 555 4321',
    providerId: 'prov-1',
    providerName: 'Premier Pet Care Studio',
    serviceId: 'srv-p3',
    serviceName: 'In-Home Sitting & Feeding Visit',
    serviceCategory: 'sitting',
    price: 2800,
    platformFee: 280,
    providerPayout: 2520,
    date: new Date().toISOString().slice(0, 10),
    timeSlot: '05:00 PM',
    status: 'in_progress',
    specialNotes: 'Indoor only. Wet food in the kitchen pantry top shelf.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

export function subscribeToProviderBookings(
  providerId: string,
  onUpdate: (bookings: ServiceBooking[]) => void,
  statusFilter?: ServiceBooking['status']
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, where, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(
        collection(db, 'service_bookings'),
        where('providerId', '==', providerId)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            const filtered = statusFilter
              ? MOCK_PROVIDER_BOOKINGS.filter((b) => b.status === statusFilter)
              : MOCK_PROVIDER_BOOKINGS;
            onUpdate(filtered);
            return;
          }
          const list: ServiceBooking[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as ServiceBooking;
            if (!statusFilter || data.status === statusFilter) {
              list.push({ ...data, id: docSnap.id });
            }
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onUpdate(list.length > 0 ? list : MOCK_PROVIDER_BOOKINGS);
        },
        (err) => {
          console.warn('Provider bookings fallback:', err);
          const filtered = statusFilter
            ? MOCK_PROVIDER_BOOKINGS.filter((b) => b.status === statusFilter)
            : MOCK_PROVIDER_BOOKINGS;
          onUpdate(filtered);
        }
      );

      if (!active && unsubscribe) unsubscribe();
    } catch (e) {
      console.warn('subscribeToProviderBookings error:', e);
      const filtered = statusFilter
        ? MOCK_PROVIDER_BOOKINGS.filter((b) => b.status === statusFilter)
        : MOCK_PROVIDER_BOOKINGS;
      onUpdate(filtered);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export async function acceptBooking(bookingId: string): Promise<void> {
  try {
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const ref = doc(db, 'service_bookings', bookingId);
    await updateDoc(ref, { status: 'confirmed', updatedAt: new Date().toISOString() });
  } catch (e) {
    console.warn('acceptBooking local update:', e);
    const item = MOCK_PROVIDER_BOOKINGS.find((b) => b.id === bookingId);
    if (item) item.status = 'confirmed';
  }
}

export async function declineBooking(bookingId: string, reason: string): Promise<void> {
  try {
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const ref = doc(db, 'service_bookings', bookingId);
    await updateDoc(ref, { status: 'cancelled', cancellationReason: reason, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.warn('declineBooking local update:', e);
    const item = MOCK_PROVIDER_BOOKINGS.find((b) => b.id === bookingId);
    if (item) {
      item.status = 'cancelled';
      item.cancellationReason = reason;
    }
  }
}

export async function startService(bookingId: string): Promise<void> {
  try {
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const ref = doc(db, 'service_bookings', bookingId);
    await updateDoc(ref, { status: 'in_progress', updatedAt: new Date().toISOString() });
  } catch (e) {
    console.warn('startService local update:', e);
    const item = MOCK_PROVIDER_BOOKINGS.find((b) => b.id === bookingId);
    if (item) item.status = 'in_progress';
  }
}

export async function completeService(
  bookingId: string,
  completionData: {
    completionNotes?: string;
    completionPhotoUrls?: string[];
    walkStats?: { distanceMeters: number; durationSeconds: number };
    petBehaviorRating?: 'friendly' | 'anxious' | 'reactive' | 'calm';
  }
): Promise<void> {
  try {
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const ref = doc(db, 'service_bookings', bookingId);
    await updateDoc(ref, {
      status: 'completed',
      ...completionData,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('completeService local update:', e);
    const item = MOCK_PROVIDER_BOOKINGS.find((b) => b.id === bookingId);
    if (item) {
      item.status = 'completed';
      Object.assign(item, completionData);
    }
  }
}

// ── Vendor Product Inventory CRUD ──────────────────────────────

export function subscribeToProviderProducts(
  sellerId: string,
  onUpdate: (products: Product[]) => void
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, where, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(
        collection(db, 'marketplace_products'),
        where('sellerId', '==', sellerId)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            onUpdate(INITIAL_PRODUCTS);
            return;
          }
          const list: Product[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...(docSnap.data() as Product), id: docSnap.id });
          });
          onUpdate(list);
        },
        (err) => {
          console.warn('Provider products fallback:', err);
          onUpdate(INITIAL_PRODUCTS);
        }
      );

      if (!active && unsubscribe) unsubscribe();
    } catch (e) {
      console.warn('subscribeToProviderProducts error:', e);
      onUpdate(INITIAL_PRODUCTS);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export async function addProviderProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const newProduct: Product = {
    ...product,
    id: 'prod-' + Date.now(),
    createdAt: new Date().toISOString(),
  };

  try {
    const { getFirestore, collection, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const ref = doc(collection(db, 'marketplace_products'));
    newProduct.id = ref.id;
    await setDoc(ref, newProduct);
  } catch (e) {
    console.warn('addProviderProduct fallback:', e);
    INITIAL_PRODUCTS.unshift(newProduct);
  }
  return newProduct;
}

export async function updateProviderProduct(productId: string, updates: Partial<Product>): Promise<void> {
  try {
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const ref = doc(db, 'marketplace_products', productId);
    await updateDoc(ref, updates);
  } catch (e) {
    console.warn('updateProviderProduct fallback:', e);
    const prod = INITIAL_PRODUCTS.find((p) => p.id === productId);
    if (prod) Object.assign(prod, updates);
  }
}

export async function deleteProviderProduct(productId: string): Promise<void> {
  try {
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const ref = doc(db, 'marketplace_products', productId);
    await deleteDoc(ref);
  } catch (e) {
    console.warn('deleteProviderProduct fallback:', e);
    const idx = INITIAL_PRODUCTS.findIndex((p) => p.id === productId);
    if (idx >= 0) INITIAL_PRODUCTS.splice(idx, 1);
  }
}

// ── Vendor Orders Stream & Fulfillment ─────────────────────────

export const MOCK_SELLER_ORDERS: Order[] = [
  {
    id: 'ord-v101',
    ownerUid: 'owner-1',
    items: [
      { product: INITIAL_PRODUCTS[0], quantity: 1 },
      { product: INITIAL_PRODUCTS[3], quantity: 2 },
    ],
    subtotal: 14100,
    deliveryFee: 450,
    discount: 0,
    total: 14550,
    status: 'confirmed',
    shippingAddress: {
      fullName: 'Kavinda Deshappriya',
      phone: '+94 77 123 4567',
      streetAddress: 'No. 18, Flower Road',
      city: 'Colombo 07',
      postalCode: '00700',
    },
    paymentMethod: 'card',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString(),
  },
  {
    id: 'ord-v102',
    ownerUid: 'owner-2',
    items: [
      { product: INITIAL_PRODUCTS[1], quantity: 2 },
    ],
    subtotal: 12400,
    deliveryFee: 450,
    discount: 0,
    total: 12850,
    status: 'shipped',
    trackingNumber: 'PRONT-LK-884920',
    shippingAddress: {
      fullName: 'Nadeeka Wickramasinghe',
      phone: '+94 71 888 9999',
      streetAddress: 'No. 32/B, Baseline Road',
      city: 'Colombo 09',
      postalCode: '00900',
    },
    paymentMethod: 'card',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    estimatedDelivery: new Date(Date.now() + 86400000 * 1).toISOString(),
  },
];

export function subscribeToSellerOrders(
  sellerId: string,
  onUpdate: (orders: Order[]) => void
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(collection(db, 'marketplace_orders'));

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            onUpdate(MOCK_SELLER_ORDERS);
            return;
          }
          const list: Order[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...(docSnap.data() as Order), id: docSnap.id });
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onUpdate(list);
        },
        (err) => {
          console.warn('Seller orders fallback:', err);
          onUpdate(MOCK_SELLER_ORDERS);
        }
      );

      if (!active && unsubscribe) unsubscribe();
    } catch (e) {
      console.warn('subscribeToSellerOrders error:', e);
      onUpdate(MOCK_SELLER_ORDERS);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export async function updateSellerOrderStatus(
  orderId: string,
  status: Order['status'],
  trackingNumber?: string
): Promise<void> {
  try {
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const ref = doc(db, 'marketplace_orders', orderId);
    const updates: Partial<Order> = { status };
    if (trackingNumber) updates.trackingNumber = trackingNumber;
    await updateDoc(ref, updates);
  } catch (e) {
    console.warn('updateSellerOrderStatus fallback:', e);
    const ord = MOCK_SELLER_ORDERS.find((o) => o.id === orderId);
    if (ord) {
      ord.status = status;
      if (trackingNumber) ord.trackingNumber = trackingNumber;
    }
  }
}

// ── Provider Earnings & Payout Records ─────────────────────────

export const MOCK_PROVIDER_PAYOUTS: ProviderPayout[] = [
  {
    id: 'pay-2026-08-01',
    providerId: 'prov-1',
    providerName: 'Premier Pet Care Studio',
    amount: 45000,
    currency: 'LKR',
    method: 'bank_transfer',
    status: 'completed',
    destinationDetails: 'Commercial Bank - ****1938',
    referenceNumber: 'CB-TX-994821',
    requestedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    processedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 'pay-2026-08-10',
    providerId: 'prov-1',
    providerName: 'Premier Pet Care Studio',
    amount: 32500,
    currency: 'LKR',
    method: 'dialog_genie',
    status: 'completed',
    destinationDetails: 'Dialog Genie - 0771234567',
    referenceNumber: 'GENIE-984210',
    requestedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    processedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export function subscribeToPayoutHistory(
  providerId: string,
  onUpdate: (payouts: ProviderPayout[]) => void
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, where, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(
        collection(db, 'provider_payouts'),
        where('providerId', '==', providerId)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            onUpdate(MOCK_PROVIDER_PAYOUTS);
            return;
          }
          const list: ProviderPayout[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as ProviderPayout);
          });
          list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
          onUpdate(list);
        },
        (err) => {
          console.warn('Payout history fallback:', err);
          onUpdate(MOCK_PROVIDER_PAYOUTS);
        }
      );

      if (!active && unsubscribe) unsubscribe();
    } catch (e) {
      console.warn('subscribeToPayoutHistory error:', e);
      onUpdate(MOCK_PROVIDER_PAYOUTS);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export async function requestProviderPayout(
  providerId: string,
  providerName: string,
  amount: number,
  method: PayoutMethod,
  destinationDetails: string
): Promise<ProviderPayout> {
  const payout: ProviderPayout = {
    id: 'pay-' + Date.now(),
    providerId,
    providerName,
    amount,
    currency: 'LKR',
    method,
    status: 'pending',
    destinationDetails,
    requestedAt: new Date().toISOString(),
  };

  try {
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const ref = doc(db, 'provider_payouts', payout.id);
    await setDoc(ref, payout);
  } catch (e) {
    console.warn('requestProviderPayout fallback:', e);
    MOCK_PROVIDER_PAYOUTS.unshift(payout);
  }
  return payout;
}
