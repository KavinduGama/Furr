import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { FeedingSchedule, FeedingLog, WalkActivity, TrainingLog } from '@furr/core';
import {
  subscribeToFeedingSchedules,
  subscribeToWalks,
  logMealFeed as firebaseLogMeal,
  saveWalkActivity as firebaseSaveWalk,
  saveTrainingLog as firebaseSaveTraining,
  INITIAL_FEEDING_SCHEDULES,
  INITIAL_FEEDING_LOGS,
  INITIAL_WALKS,
  INITIAL_TRAINING_LOGS,
} from '@furr/firebase';
import { usePets } from './pets';
import { useAuth } from './auth';

interface CareContextType {
  feedingSchedules: FeedingSchedule[];
  feedingLogs: FeedingLog[];
  walks: WalkActivity[];
  trainingLogs: TrainingLog[];
  logMeal: (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', amount: string) => Promise<void>;
  recordWalk: (data: Omit<WalkActivity, 'id' | 'petId' | 'ownerUid'>) => Promise<WalkActivity>;
  recordTraining: (commandName: string, successRatePercent: number, durationMinutes: number, notes?: string) => Promise<void>;
}

const CareContext = createContext<CareContextType | null>(null);

export function CareProvider({ children }: { children: React.ReactNode }) {
  const { selectedPet } = usePets();
  const { firebaseUser, profile } = useAuth();
  const [feedingSchedules, setFeedingSchedules] = useState<FeedingSchedule[]>(INITIAL_FEEDING_SCHEDULES);
  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>(INITIAL_FEEDING_LOGS);
  const [walks, setWalks] = useState<WalkActivity[]>(INITIAL_WALKS);
  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>(INITIAL_TRAINING_LOGS);

  const petId = selectedPet?.id || 'max';

  useEffect(() => {
    const unsubFeed = subscribeToFeedingSchedules(petId, (list) => setFeedingSchedules(list));
    const unsubWalks = subscribeToWalks(petId, (list) => setWalks(list));
    return () => {
      unsubFeed();
      unsubWalks();
    };
  }, [petId]);

  const logMeal = useCallback(
    async (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', amount: string) => {
      const fedByName = profile?.displayName || 'Owner';
      const fedByUid = firebaseUser?.uid || 'demo-uid';
      const newLog = await firebaseLogMeal({
        petId,
        mealType,
        fedByUid,
        fedByName,
        amount,
      });
      setFeedingLogs((prev) => [newLog, ...prev]);
    },
    [petId, profile, firebaseUser]
  );

  const recordWalk = useCallback(
    async (data: Omit<WalkActivity, 'id' | 'petId' | 'ownerUid'>) => {
      const ownerUid = firebaseUser?.uid || 'demo-uid';
      const newWalk = await firebaseSaveWalk({
        ...data,
        petId,
        ownerUid,
      });
      setWalks((prev) => [newWalk, ...prev]);
      return newWalk;
    },
    [petId, firebaseUser]
  );

  const recordTraining = useCallback(
    async (commandName: string, successRatePercent: number, durationMinutes: number, notes?: string) => {
      const ownerUid = firebaseUser?.uid || 'demo-uid';
      const newLog = await firebaseSaveTraining({
        petId,
        ownerUid,
        commandName,
        successRatePercent,
        durationMinutes,
        notes,
      });
      setTrainingLogs((prev) => [newLog, ...prev]);
    },
    [petId, firebaseUser]
  );

  const value = useMemo(
    () => ({
      feedingSchedules,
      feedingLogs,
      walks,
      trainingLogs,
      logMeal,
      recordWalk,
      recordTraining,
    }),
    [
      feedingSchedules,
      feedingLogs,
      walks,
      trainingLogs,
      logMeal,
      recordWalk,
      recordTraining,
    ]
  );

  return <CareContext.Provider value={value}>{children}</CareContext.Provider>;
}

export function useCare() {
  const context = useContext(CareContext);
  if (!context) {
    throw new Error('useCare must be used within a CareProvider');
  }
  return context;
}
