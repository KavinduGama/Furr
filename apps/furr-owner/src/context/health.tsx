import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { VaccinationRecord, MedicationPlan } from '@furr/core';
import {
  subscribeToVaccinations,
  subscribeToMedications,
} from '@furr/firebase';
import { useAuth } from './auth';
import { usePets } from './pets';

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

interface HealthContextValue {
  vaccinations: VaccinationRecord[];
  medications: MedicationPlan[];
  isLoading: boolean;
  addVaccination: (v: VaccinationRecord) => void;
  patchVaccination: (id: string, updates: Partial<VaccinationRecord>) => void;
  removeVaccination: (id: string) => void;
  addMedication: (m: MedicationPlan) => void;
  removeMedication: (id: string) => void;
}

const HealthContext = createContext<HealthContextValue | null>(null);

// ─────────────────────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────────────────────

export function HealthProvider({ children }: PropsWithChildren) {
  const { firebaseUser } = useAuth();
  const { selectedPet } = usePets();

  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [medications, setMedications] = useState<MedicationPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ── Subscribe whenever selected pet changes ──────────────────
  useEffect(() => {
    if (!firebaseUser || !selectedPet) {
      setVaccinations([]);
      setMedications([]);
      return;
    }

    setIsLoading(true);
    let vacDone = false;
    let medDone = false;
    const checkDone = () => { if (vacDone && medDone) setIsLoading(false); };

    const unsubVac = subscribeToVaccinations(firebaseUser.uid, selectedPet.id, (recs) => {
      setVaccinations(recs);
      vacDone = true;
      checkDone();
    });

    const unsubMed = subscribeToMedications(firebaseUser.uid, selectedPet.id, (plans) => {
      setMedications(plans);
      medDone = true;
      checkDone();
    });

    return () => {
      unsubVac();
      unsubMed();
    };
  }, [firebaseUser, selectedPet]);

  // ── Optimistic actions ────────────────────────────────────────

  const addVaccination = useCallback((v: VaccinationRecord) => {
    setVaccinations((prev) => [v, ...prev]);
  }, []);

  const patchVaccination = useCallback((id: string, updates: Partial<VaccinationRecord>) => {
    setVaccinations((prev) => prev.map((v) => v.id === id ? { ...v, ...updates } : v));
  }, []);

  const removeVaccination = useCallback((id: string) => {
    setVaccinations((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const addMedication = useCallback((m: MedicationPlan) => {
    setMedications((prev) => [m, ...prev]);
  }, []);

  const removeMedication = useCallback((id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const value = useMemo<HealthContextValue>(
    () => ({
      vaccinations, medications, isLoading,
      addVaccination, patchVaccination, removeVaccination,
      addMedication, removeMedication,
    }),
    [vaccinations, medications, isLoading, addVaccination, patchVaccination,
     removeVaccination, addMedication, removeMedication],
  );

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

// ─────────────────────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────────────────────

export function useHealth(): HealthContextValue {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error('useHealth must be used inside <HealthProvider>');
  return ctx;
}
