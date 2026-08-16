import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { Pet } from '@furr/core';
import { subscribeToPets } from '@furr/firebase';
import { useAuth } from './auth';

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

interface PetContextValue {
  /** All active pets for the signed-in owner. */
  pets: Pet[];
  /** Currently selected pet (for single-pet views). */
  selectedPet: Pet | null;
  /** Whether pets are still loading from Firestore. */
  isLoading: boolean;
  /** Select a pet by ID. */
  selectPet: (petId: string) => void;
  /** Optimistically add a new pet to local state (called after createPet). */
  addPet: (pet: Pet) => void;
  /** Optimistically update a pet in local state (called after updatePet). */
  patchPet: (petId: string, updates: Partial<Pet>) => void;
  /** Optimistically remove a pet from the active list (called after archivePet). */
  removePet: (petId: string) => void;
}

const PetContext = createContext<PetContextValue | null>(null);

// ─────────────────────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────────────────────

export function PetProvider({ children }: PropsWithChildren) {
  const { firebaseUser, status, isPreviewSession } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Subscribe to Firestore pets ──────────────────────────────
  useEffect(() => {
    if (status !== 'authenticated' || !firebaseUser) {
      setPets([]);
      setIsLoading(false);
      return;
    }

    if (isPreviewSession) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsub = subscribeToPets(firebaseUser.uid, (fetchedPets) => {
      setPets(fetchedPets);
      setIsLoading(false);
      // Auto-select first pet if nothing is selected or selected pet no longer exists
      setSelectedPetId((current) => {
        if (current && fetchedPets.some((p) => p.id === current)) return current;
        return fetchedPets[0]?.id ?? null;
      });
    });

    return unsub;
  }, [firebaseUser, status, isPreviewSession]);

  // ── Actions ──────────────────────────────────────────────────

  const selectPet = useCallback((petId: string) => {
    setSelectedPetId(petId);
  }, []);

  const addPet = useCallback((pet: Pet) => {
    setPets((prev) => [...prev.filter((current) => current.id !== pet.id), pet]);
    setSelectedPetId(pet.id);
  }, []);

  const patchPet = useCallback((petId: string, updates: Partial<Pet>) => {
    setPets((prev) =>
      prev.map((p) => (p.id === petId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)),
    );
  }, []);

  const removePet = useCallback((petId: string) => {
    setPets((prev) => {
      const remaining = prev.filter((p) => p.id !== petId);
      setSelectedPetId((current) => {
        if (current !== petId) return current;
        return remaining[0]?.id ?? null;
      });
      return remaining;
    });
  }, []);

  const selectedPet = useMemo(
    () => pets.find((p) => p.id === selectedPetId) ?? pets[0] ?? null,
    [pets, selectedPetId],
  );

  const value = useMemo<PetContextValue>(
    () => ({ pets, selectedPet, isLoading, selectPet, addPet, patchPet, removePet }),
    [pets, selectedPet, isLoading, selectPet, addPet, patchPet, removePet],
  );

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}

// ─────────────────────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────────────────────

export function usePets(): PetContextValue {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error('usePets must be used inside <PetProvider>');
  return ctx;
}
