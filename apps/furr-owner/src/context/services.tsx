import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type {
  ServiceProvider,
  ServiceCategory,
  ServiceBooking,
  PaymentProvider,
  SriLankaLocation,
} from '@furr/core';
import {
  subscribeToServiceProviders,
  subscribeToUserBookings,
  createServiceBooking as firebaseCreateBooking,
  cancelServiceBooking as firebaseCancelBooking,
  createPaymentIntent,
  confirmPayment,
  INITIAL_PROVIDERS,
  INITIAL_BOOKINGS,
} from '@furr/firebase';
import { useAuth } from './auth';
import { calculateDistanceKm, SRI_LANKA_LOCATIONS } from '@furr/core';

interface ServicesContextType {
  providers: ServiceProvider[];
  selectedCategory: ServiceCategory | 'all';
  setSelectedCategory: (category: ServiceCategory | 'all') => void;
  filteredProviders: ServiceProvider[];
  selectedLocation: SriLankaLocation;
  setSelectedLocation: (location: SriLankaLocation) => void;
  bookings: ServiceBooking[];
  bookService: (
    bookingData: Omit<ServiceBooking, 'id' | 'createdAt' | 'status' | 'ownerUid'>,
    paymentProvider?: PaymentProvider
  ) => Promise<ServiceBooking | null>;
  cancelBooking: (bookingId: string) => Promise<void>;
  isLoadingLocation: boolean;
}

const ServicesContext = createContext<ServicesContextType | null>(null);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser, profile } = useAuth();
  const [providers, setProviders] = useState<ServiceProvider[]>(INITIAL_PROVIDERS);
  const [bookings, setBookings] = useState<ServiceBooking[]>(INITIAL_BOOKINGS);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [selectedLocation, setSelectedLocation] = useState<SriLankaLocation>(SRI_LANKA_LOCATIONS[0]);
  const [isLoadingLocation] = useState(false);

  // Subscribe to live service providers
  useEffect(() => {
    const unsubscribe = subscribeToServiceProviders((list) => {
      setProviders(list);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to user bookings
  useEffect(() => {
    if (!firebaseUser) {
      setBookings(INITIAL_BOOKINGS);
      return;
    }
    const unsubscribe = subscribeToUserBookings(firebaseUser.uid, (list) => {
      setBookings(list);
    });
    return () => unsubscribe();
  }, [firebaseUser]);

  // Compute live distances using zero-cost Haversine formula & sort by proximity to selectedLocation
  const filteredProviders = useMemo(() => {
    const origin = { latitude: selectedLocation.latitude, longitude: selectedLocation.longitude };

    const listWithDistance = providers.map((p) => {
      const distanceKm = calculateDistanceKm(origin, {
        latitude: p.latitude,
        longitude: p.longitude,
      });
      return { ...p, distanceKm };
    });

    const categoryFiltered =
      selectedCategory === 'all'
        ? listWithDistance
        : listWithDistance.filter((p) => p.category === selectedCategory);

    // Sort closest first, then by rating
    return categoryFiltered.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [providers, selectedCategory, selectedLocation]);

  const bookService = useCallback(
    async (
      bookingData: Omit<ServiceBooking, 'id' | 'createdAt' | 'status' | 'ownerUid'>,
      paymentProvider: PaymentProvider = 'cash_on_delivery'
    ): Promise<ServiceBooking | null> => {
      try {
        const ownerUid = firebaseUser?.uid || profile?.uid || 'guest-user';

        // 1. Create PaymentIntent for the appointment
        const intent = await createPaymentIntent({
          amount: bookingData.price,
          currency: 'LKR',
          purpose: 'service_booking',
          customerUid: ownerUid,
          customerName: profile?.displayName || undefined,
          provider: paymentProvider,
          metadata: {
            serviceName: bookingData.serviceName,
            providerName: bookingData.providerName,
            date: bookingData.date,
          },
        });

        // 2. Confirm Payment
        await confirmPayment(
          intent.id,
          `tx_srv_${Date.now()}`,
          paymentProvider
        );

        // 3. Create Booking Record
        const booking = await firebaseCreateBooking({
          ...bookingData,
          ownerUid,
        });

        setBookings((prev) => [booking, ...prev]);
        return booking;
      } catch (err) {
        console.error('[furr/services] Failed to book service:', err);
        return null;
      }
    },
    [firebaseUser?.uid, profile?.uid, profile?.displayName]
  );

  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      await firebaseCancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
    } catch (err) {
      console.error('[furr/services] Failed to cancel booking:', err);
    }
  }, []);

  const value = useMemo(
    () => ({
      providers,
      selectedCategory,
      setSelectedCategory,
      filteredProviders,
      selectedLocation,
      setSelectedLocation,
      bookings,
      bookService,
      cancelBooking,
      isLoadingLocation,
    }),
    [
      providers,
      selectedCategory,
      filteredProviders,
      selectedLocation,
      bookings,
      bookService,
      cancelBooking,
      isLoadingLocation,
    ]
  );

  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}

export function useServices() {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
}
