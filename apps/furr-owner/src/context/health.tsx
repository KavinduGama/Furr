import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { VaccinationRecord, MedicationPlan, WeightEntry } from '@furr/core';
import {
  subscribeToVaccinations,
  subscribeToMedications,
  subscribeToWeightEntries,
} from '@furr/firebase';
import { useAuth } from './auth';
import { usePets } from './pets';

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

interface HealthContextValue {
  vaccinations: VaccinationRecord[];
  medications: MedicationPlan[];
  weights: WeightEntry[];
  isLoading: boolean;
  addVaccination: (v: VaccinationRecord) => void;
  patchVaccination: (id: string, updates: Partial<VaccinationRecord>) => void;
  removeVaccination: (id: string) => void;
  addMedication: (m: MedicationPlan) => void;
  removeMedication: (id: string) => void;
  addWeight: (w: WeightEntry) => void;
  removeWeight: (id: string) => void;
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
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ── Subscribe whenever selected pet changes ──────────────────
  useEffect(() => {
    if (!firebaseUser || !selectedPet) {
      setVaccinations([]);
      setMedications([]);
      setWeights([]);
      return;
    }

    setIsLoading(true);
    let done = 0;
    const checkDone = () => { if (++done === 3) setIsLoading(false); };

    const unsubVac = subscribeToVaccinations(firebaseUser.uid, selectedPet.id, (recs) => {
      setVaccinations(recs);
      checkDone();
    });
    const unsubMed = subscribeToMedications(firebaseUser.uid, selectedPet.id, (plans) => {
      setMedications(plans);
      checkDone();
    });
    const unsubWgt = subscribeToWeightEntries(firebaseUser.uid, selectedPet.id, (entries) => {
      setWeights(entries);
      checkDone();
    });

    return () => { unsubVac(); unsubMed(); unsubWgt(); };
  }, [firebaseUser, selectedPet]);

  // ── Optimistic actions ────────────────────────────────────────

  const addVaccination = useCallback((v: VaccinationRecord) => setVaccinations((p) => [v, ...p]), []);
  const patchVaccination = useCallback((id: string, u: Partial<VaccinationRecord>) =>
    setVaccinations((p) => p.map((v) => v.id === id ? { ...v, ...u } : v)), []);
  const removeVaccination = useCallback((id: string) => setVaccinations((p) => p.filter((v) => v.id !== id)), []);
  const addMedication = useCallback((m: MedicationPlan) => setMedications((p) => [m, ...p]), []);
  const removeMedication = useCallback((id: string) => setMedications((p) => p.filter((m) => m.id !== id)), []);
  const addWeight = useCallback((w: WeightEntry) => setWeights((p) => [w, ...p]), []);
  const removeWeight = useCallback((id: string) => setWeights((p) => p.filter((w) => w.id !== id)), []);

  const value = useMemo<HealthContextValue>(
    () => ({
      vaccinations, medications, weights, isLoading,
      addVaccination, patchVaccination, removeVaccination,
      addMedication, removeMedication,
      addWeight, removeWeight,
    }),
    [vaccinations, medications, weights, isLoading,
     addVaccination, patchVaccination, removeVaccination,
     addMedication, removeMedication, addWeight, removeWeight],
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
