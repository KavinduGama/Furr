import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { LostPetAlert, FoundPetReport } from '@furr/core';
import {
  subscribeToLostAlerts,
  subscribeToFoundReports,
  createLostAlert as firebaseCreateLostAlert,
  createFoundReport as firebaseCreateFoundReport,
  INITIAL_LOST_ALERTS,
  INITIAL_FOUND_REPORTS,
} from '@furr/firebase';
import { useAuth } from './auth';

interface LostFoundContextType {
  lostAlerts: LostPetAlert[];
  foundReports: FoundPetReport[];
  broadcastLostAlert: (
    data: Omit<LostPetAlert, 'id' | 'createdAt' | 'status' | 'ownerUid' | 'ownerName'>
  ) => Promise<LostPetAlert | null>;
  reportFoundPet: (
    data: Omit<FoundPetReport, 'id' | 'createdAt' | 'reporterUid' | 'reporterName' | 'status'>
  ) => Promise<FoundPetReport | null>;
}

const LostFoundContext = createContext<LostFoundContextType | null>(null);

export function LostFoundProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser, profile } = useAuth();
  const [lostAlerts, setLostAlerts] = useState<LostPetAlert[]>(INITIAL_LOST_ALERTS);
  const [foundReports, setFoundReports] = useState<FoundPetReport[]>(INITIAL_FOUND_REPORTS);

  useEffect(() => {
    const unsubLost = subscribeToLostAlerts((list) => setLostAlerts(list));
    const unsubFound = subscribeToFoundReports((list) => setFoundReports(list));
    return () => {
      unsubLost();
      unsubFound();
    };
  }, []);

  const broadcastLostAlert = useCallback(
    async (
      data: Omit<LostPetAlert, 'id' | 'createdAt' | 'status' | 'ownerUid' | 'ownerName'>
    ): Promise<LostPetAlert | null> => {
      try {
        const ownerUid = firebaseUser?.uid || profile?.uid || 'demo-uid';
        const ownerName = profile?.displayName || 'Pet Parent';

        const alert = await firebaseCreateLostAlert({
          ...data,
          ownerUid,
          ownerName,
        });

        setLostAlerts((prev) => [alert, ...prev]);
        return alert;
      } catch (err) {
        console.error('[furr/lostfound] Failed to broadcast lost alert:', err);
        return null;
      }
    },
    [firebaseUser, profile]
  );

  const reportFoundPet = useCallback(
    async (
      data: Omit<FoundPetReport, 'id' | 'createdAt' | 'reporterUid' | 'reporterName' | 'status'>
    ): Promise<FoundPetReport | null> => {
      try {
        const reporterUid = firebaseUser?.uid || profile?.uid || 'demo-uid';
        const reporterName = profile?.displayName || 'Good Samaritan';

        const report = await firebaseCreateFoundReport({
          ...data,
          reporterUid,
          reporterName,
        });

        setFoundReports((prev) => [report, ...prev]);
        return report;
      } catch (err) {
        console.error('[furr/lostfound] Failed to report found pet:', err);
        return null;
      }
    },
    [firebaseUser, profile]
  );

  const value = useMemo(
    () => ({
      lostAlerts,
      foundReports,
      broadcastLostAlert,
      reportFoundPet,
    }),
    [
      lostAlerts,
      foundReports,
      broadcastLostAlert,
      reportFoundPet,
    ]
  );

  return <LostFoundContext.Provider value={value}>{children}</LostFoundContext.Provider>;
}

export function useLostFound() {
  const context = useContext(LostFoundContext);
  if (!context) {
    throw new Error('useLostFound must be used within a LostFoundProvider');
  }
  return context;
}
