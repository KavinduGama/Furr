import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ServiceProvider, ServiceCategory, ServiceBooking } from '@furr/core';
import {
  subscribeToServiceProviders,
  subscribeToUserBookings,
  createServiceBooking as firebaseCreateBooking,
  cancelServiceBooking as firebaseCancelBooking,
  INITIAL_PROVIDERS,
} from '@furr/firebase';
import { getCurrentLocation, calculateDistanceKm, type GeoCoordinate } from '../utils/location';
import { useAuth } from './auth';

interface ServicesContextType {
  providers: ServiceProvider[];
  selectedCategory: ServiceCategory | 'all';
  setSelectedCategory: (cat: ServiceCategory | 'all') => void;
  filteredProviders: ServiceProvider[];
  userLocation: GeoCoordinate | null;
  bookings: ServiceBooking[];
  bookService: (
    bookingData: Omit<ServiceBooking, 'id' | 'createdAt' | 'status' | 'ownerUid'>
  ) => Promise<ServiceBooking | null>;
  cancelBooking: (bookingId: string) => Promise<void>;
  isLoadingLocation: boolean;
}

const ServicesContext = createContext<ServicesContextType | null>(null);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser } = useAuth();
  const [providers, setProviders] = useState<ServiceProvider[]>(INITIAL_PROVIDERS);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [userLocation, setUserLocation] = useState<GeoCoordinate | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);

  // Fetch device GPS coordinates
  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoadingLocation(true);
      const loc = await getCurrentLocation();
      if (mounted && loc) {
        setUserLocation(loc);
      }
      if (mounted) setIsLoadingLocation(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Subscribe to service providers
  useEffect(() => {
    const unsubscribe = subscribeToServiceProviders((list) => {
      setProviders(list);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to user bookings
  useEffect(() => {
    if (!firebaseUser) {
      setBookings([]);
      return;
    }
    const unsubscribe = subscribeToUserBookings(firebaseUser.uid, (list) => {
      setBookings(list);
    });
    return () => unsubscribe();
  }, [firebaseUser]);

  // Compute live distances using zero-cost Haversine formula & sort by proximity
  const filteredProviders = useMemo(() => {
    const defaultCoords = { latitude: 6.9271, longitude: 79.8612 }; // Colombo default
    const origin = userLocation || defaultCoords;

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
  }, [providers, selectedCategory, userLocation]);

  const bookService = useCallback(
    async (
      bookingData: Omit<ServiceBooking, 'id' | 'createdAt' | 'status' | 'ownerUid'>
    ): Promise<ServiceBooking | null> => {
      const ownerUid = firebaseUser?.uid || 'guest-user';
      const booking = await firebaseCreateBooking({
        ...bookingData,
        ownerUid,
      });

      setBookings((prev) => [booking, ...prev]);
      return booking;
    },
    [firebaseUser]
  );

  const cancelBooking = useCallback(async (bookingId: string) => {
    await firebaseCancelBooking(bookingId);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
  }, []);

  const value = useMemo(
    () => ({
      providers,
      selectedCategory,
      setSelectedCategory,
      filteredProviders,
      userLocation,
      bookings,
      bookService,
      cancelBooking,
      isLoadingLocation,
    }),
    [
      providers,
      selectedCategory,
      filteredProviders,
      userLocation,
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
