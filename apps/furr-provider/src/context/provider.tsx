import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ServiceProvider, ServiceCategory, ServiceItem } from '@furr/core';
import {
  subscribeToProviderProfile,
  updateProviderProfile as dbUpdateProviderProfile,
  setProviderOnlineStatus as dbSetProviderOnlineStatus,
  getOrCreateDefaultProvider,
} from '@furr/firebase';
import { useProviderAuth } from './auth';

interface ProviderContextType {
  profile: ServiceProvider | null;
  isLoading: boolean;
  isOnline: boolean;
  toggleOnlineStatus: () => Promise<void>;
  updateProfile: (updates: Partial<ServiceProvider>) => Promise<void>;
  addService: (service: Omit<ServiceItem, 'id'>) => Promise<void>;
  updateService: (serviceId: string, updates: Partial<ServiceItem>) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  hasCompletedOnboarding: boolean;
}

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

export function ProviderProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useProviderAuth();
  const [profile, setProfile] = useState<ServiceProvider | null>(() =>
    user ? getOrCreateDefaultProvider(user.uid, user.phone) : null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const unsub = subscribeToProviderProfile(user.uid, (p) => {
      setProfile(p);
      setIsLoading(false);
    });

    return () => unsub();
  }, [user]);

  const isOnline = profile?.onlineStatus === 'online';

  const toggleOnlineStatus = async () => {
    if (!profile || !user) return;
    const nextStatus: 'online' | 'offline' = isOnline ? 'offline' : 'online';
    await dbSetProviderOnlineStatus(user.uid, nextStatus);
    setProfile((prev) => (prev ? { ...prev, onlineStatus: nextStatus } : prev));
  };

  const updateProfile = async (updates: Partial<ServiceProvider>) => {
    if (!user) return;
    await dbUpdateProviderProfile(user.uid, updates);
    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const addService = async (newSrv: Omit<ServiceItem, 'id'>) => {
    if (!profile) return;
    const srv: ServiceItem = {
      ...newSrv,
      id: 'srv-' + Date.now(),
    };
    const updated = [...profile.services, srv];
    await updateProfile({ services: updated });
  };

  const updateService = async (serviceId: string, updates: Partial<ServiceItem>) => {
    if (!profile) return;
    const updated = profile.services.map((s) => (s.id === serviceId ? { ...s, ...updates } : s));
    await updateProfile({ services: updated });
  };

  const deleteService = async (serviceId: string) => {
    if (!profile) return;
    const updated = profile.services.filter((s) => s.id !== serviceId);
    await updateProfile({ services: updated });
  };

  const hasCompletedOnboarding = !!profile && profile.services.length > 0;

  return (
    <ProviderContext.Provider
      value={{
        profile,
        isLoading,
        isOnline,
        toggleOnlineStatus,
        updateProfile,
        addService,
        updateService,
        deleteService,
        hasCompletedOnboarding,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
}

export function useProviderProfile() {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error('useProviderProfile must be used within a ProviderProfileProvider');
  }
  return context;
}
