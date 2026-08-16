import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Consultation, ConsultationMessage } from '@furr/core';
import {
  subscribeToOwnerConsultations,
  subscribeToConsultationMessages,
  createConsultation as firebaseCreateConsultation,
  sendConsultationMessage as firebaseSendMessage,
  INITIAL_CONSULTATIONS,
} from '@furr/firebase';
import { useAuth } from './auth';

interface TelemedicineContextType {
  consultations: Consultation[];
  activeConsultation: Consultation | null;
  setActiveConsultation: (consult: Consultation | null) => void;
  messages: ConsultationMessage[];
  requestConsultation: (
    data: Omit<Consultation, 'id' | 'createdAt' | 'status' | 'ownerUid' | 'ownerName'>
  ) => Promise<Consultation | null>;
  sendMessage: (consultationId: string, text: string, imageUrls?: string[]) => Promise<void>;
}

const TelemedicineContext = createContext<TelemedicineContextType | null>(null);

export function TelemedicineProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser, profile } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>(INITIAL_CONSULTATIONS);
  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);

  // Subscribe to owner consultations
  useEffect(() => {
    if (!firebaseUser) {
      setConsultations(INITIAL_CONSULTATIONS);
      return;
    }
    const unsubscribe = subscribeToOwnerConsultations(firebaseUser.uid, (list) => {
      setConsultations(list);
    });
    return () => unsubscribe();
  }, [firebaseUser]);

  // Subscribe to active consultation's messages
  useEffect(() => {
    if (!activeConsultation) {
      setMessages([]);
      return;
    }
    const unsubscribe = subscribeToConsultationMessages(activeConsultation.id, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [activeConsultation]);

  const requestConsultation = useCallback(
    async (
      data: Omit<Consultation, 'id' | 'createdAt' | 'status' | 'ownerUid' | 'ownerName'>
    ): Promise<Consultation | null> => {
      try {
        const ownerUid = firebaseUser?.uid || profile?.uid || 'demo-uid';
        const ownerName = profile?.displayName || 'Pet Owner';

        const consult = await firebaseCreateConsultation({
          ...data,
          ownerUid,
          ownerName,
        });

        setConsultations((prev) => [consult, ...prev]);
        setActiveConsultation(consult);
        return consult;
      } catch (err) {
        console.error('[furr/telemedicine] Failed to request consultation:', err);
        return null;
      }
    },
    [firebaseUser, profile]
  );

  const sendMessage = useCallback(
    async (consultationId: string, text: string, imageUrls?: string[]) => {
      if (!text.trim() && (!imageUrls || imageUrls.length === 0)) return;

      try {
        const senderUid = firebaseUser?.uid || profile?.uid || 'demo-uid';
        const senderName = profile?.displayName || 'You';

        const msg = await firebaseSendMessage({
          consultationId,
          senderUid,
          senderRole: 'owner',
          senderName,
          text,
          imageUrls,
        });

        setMessages((prev) => [...prev, msg]);
      } catch (err) {
        console.error('[furr/telemedicine] Failed to send message:', err);
      }
    },
    [firebaseUser, profile]
  );

  const value = useMemo(
    () => ({
      consultations,
      activeConsultation,
      setActiveConsultation,
      messages,
      requestConsultation,
      sendMessage,
    }),
    [
      consultations,
      activeConsultation,
      messages,
      requestConsultation,
      sendMessage,
    ]
  );

  return <TelemedicineContext.Provider value={value}>{children}</TelemedicineContext.Provider>;
}

export function useTelemedicine() {
  const context = useContext(TelemedicineContext);
  if (!context) {
    throw new Error('useTelemedicine must be used within a TelemedicineProvider');
  }
  return context;
}
