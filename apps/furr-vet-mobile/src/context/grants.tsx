import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AccessGrant, Pet } from '@furr/core';
import { getPet, redeemGrant, IS_DEV_BYPASS } from '@furr/firebase';
import { useVetAuth } from './auth';

type VetGrantsContextValue = {
  activeGrants: AccessGrant[];
  admittedPets: Record<string, Pet>;
  redeemCode: (code: string) => Promise<AccessGrant>;
  refreshGrants: () => Promise<void>;
  isLoading: boolean;
};

const DEV_TEST_GRANT: AccessGrant = {
  id: 'test-grant-1',
  petId: 'max',
  ownerUid: 'demo-uid',
  redemptionCode: 'TEST12',
  codeExpiresAt: new Date(Date.now() + 86400000).toISOString(),
  purpose: 'veterinary_care',
  categories: ['summary', 'vaccinations', 'medications', 'timeline', 'weight', 'documents'],
  duration: '24h',
  grantExpiresAt: new Date(Date.now() + 86400000).toISOString(),
  status: 'redeemed',
  redeemedByUid: 'vet_dev_001',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEV_PET: Pet = {
  id: 'max',
  ownerUid: 'demo-uid',
  name: 'Max',
  species: 'dog',
  sex: 'male',
  breed: 'Golden Retriever',
  birthDate: '2024-02-10',
  status: 'active',
  avatarLabel: 'M',
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
};

const VetGrantsContext = createContext<VetGrantsContextValue | null>(null);

export function VetGrantsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useVetAuth();
  // Only seed mock grant if explicit IS_DEV_BYPASS is active (HIGH-009)
  const [activeGrants, setActiveGrants] = useState<AccessGrant[]>(IS_DEV_BYPASS ? [DEV_TEST_GRANT] : []);
  const [admittedPets, setAdmittedPets] = useState<Record<string, Pet>>(IS_DEV_BYPASS ? { max: DEV_PET } : {});
  const [isLoading, setIsLoading] = useState(false);

  // Enforce grant expiry on active records (HIGH-008)
  const refreshGrants = async () => {
    const now = Date.now();
    const validGrants = activeGrants.filter((g) => {
      if (!g.grantExpiresAt) return true;
      return new Date(g.grantExpiresAt).getTime() > now;
    });

    if (validGrants.length !== activeGrants.length) {
      setActiveGrants(validGrants);
    }

    for (const g of validGrants) {
      const p = await getPet(g.ownerUid, g.petId);
      if (p) {
        setAdmittedPets((prev) => ({ ...prev, [p.id]: p }));
      }
    }
  };

  useEffect(() => {
    void refreshGrants();
  }, [activeGrants.length]);

  const redeemCode = async (code: string): Promise<AccessGrant> => {
    setIsLoading(true);
    try {
      const vetUid = user?.uid || 'vet_duty';
      const g = await redeemGrant(code, vetUid);
      if (g) {
        setActiveGrants((prev) => [g, ...prev.filter((item) => item.id !== g.id)]);
        const p = await getPet(g.ownerUid, g.petId);
        if (p) {
          setAdmittedPets((prev) => ({ ...prev, [p.id]: p }));
        }
        return g;
      }
      throw new Error('Invalid or expired code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VetGrantsContext.Provider
      value={{
        activeGrants,
        admittedPets,
        redeemCode,
        refreshGrants,
        isLoading,
      }}
    >
      {children}
    </VetGrantsContext.Provider>
  );
}

export function useVetGrants() {
  const ctx = useContext(VetGrantsContext);
  if (!ctx) throw new Error('useVetGrants must be used inside <VetGrantsProvider>');
  return ctx;
}
