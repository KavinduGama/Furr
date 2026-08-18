import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ServiceBooking, BookingStatus } from '@furr/core';
import {
  subscribeToProviderBookings,
  acceptBooking as dbAcceptBooking,
  declineBooking as dbDeclineBooking,
  startService as dbStartService,
  completeService as dbCompleteService,
  MOCK_PROVIDER_BOOKINGS,
} from '@furr/firebase';
import { useProviderAuth } from './auth';

interface BookingsContextType {
  bookings: ServiceBooking[];
  isLoading: boolean;
  filter: 'all' | BookingStatus;
  setFilter: (f: 'all' | BookingStatus) => void;
  pendingCount: number;
  accept: (bookingId: string) => Promise<void>;
  decline: (bookingId: string, reason: string) => Promise<void>;
  start: (bookingId: string) => Promise<void>;
  complete: (
    bookingId: string,
    data: {
      completionNotes?: string;
      completionPhotoUrls?: string[];
      walkStats?: { distanceMeters: number; durationSeconds: number };
      petBehaviorRating?: 'friendly' | 'anxious' | 'reactive' | 'calm';
    }
  ) => Promise<void>;
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export function ProviderBookingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useProviderAuth();
  const [bookings, setBookings] = useState<ServiceBooking[]>(MOCK_PROVIDER_BOOKINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | BookingStatus>('all');

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    const unsub = subscribeToProviderBookings(user.uid, (list) => {
      setBookings(list);
      setIsLoading(false);
    });

    return () => unsub();
  }, [user]);

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  const accept = async (bookingId: string) => {
    await dbAcceptBooking(bookingId);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'confirmed' as BookingStatus } : b))
    );
  };

  const decline = async (bookingId: string, reason: string) => {
    await dbDeclineBooking(bookingId, reason);
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'cancelled' as BookingStatus, cancellationReason: reason }
          : b
      )
    );
  };

  const start = async (bookingId: string) => {
    await dbStartService(bookingId);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'in_progress' as BookingStatus } : b))
    );
  };

  const complete = async (
    bookingId: string,
    data: {
      completionNotes?: string;
      completionPhotoUrls?: string[];
      walkStats?: { distanceMeters: number; durationSeconds: number };
      petBehaviorRating?: 'friendly' | 'anxious' | 'reactive' | 'calm';
    }
  ) => {
    await dbCompleteService(bookingId, data);
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'completed' as BookingStatus,
              ...data,
            }
          : b
      )
    );
  };

  const filteredBookings =
    filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <BookingsContext.Provider
      value={{
        bookings: filteredBookings,
        isLoading,
        filter,
        setFilter,
        pendingCount,
        accept,
        decline,
        start,
        complete,
      }}
    >
      {children}
    </BookingsContext.Provider>
  );
}

export function useProviderBookings() {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error('useProviderBookings must be used within a ProviderBookingsProvider');
  }
  return context;
}
