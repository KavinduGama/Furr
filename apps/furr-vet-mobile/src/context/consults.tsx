import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Consultation, ConsultationMessage } from '@furr/core';
import {
  INITIAL_CONSULTATIONS,
  INITIAL_MESSAGES,
  subscribeToAllActiveConsultations,
  subscribeToConsultationMessages,
  sendConsultationMessage,
} from '@furr/firebase';

type VetConsultsContextValue = {
  consultations: Consultation[];
  messages: Record<string, ConsultationMessage[]>;
  sendMessage: (consultId: string, text: string) => Promise<void>;
  subscribeToRoomMessages: (consultId: string) => () => void;
};

const VetConsultsContext = createContext<VetConsultsContextValue | null>(null);

export function VetConsultsProvider({ children }: { children: React.ReactNode }) {
  const [consultations, setConsultations] = useState<Consultation[]>(INITIAL_CONSULTATIONS);
  const [messages, setMessages] = useState<Record<string, ConsultationMessage[]>>(INITIAL_MESSAGES);

  // Subscribe to all live incoming consultations
  useEffect(() => {
    const unsub = subscribeToAllActiveConsultations((list) => {
      setConsultations(list);
    });
    return () => unsub();
  }, []);

  const subscribeToRoomMessages = useCallback((consultId: string) => {
    return subscribeToConsultationMessages(consultId, (msgs) => {
      setMessages((prev) => ({
        ...prev,
        [consultId]: msgs,
      }));
    });
  }, []);

  const sendMessage = async (consultId: string, text: string) => {
    if (!text.trim()) return;
    try {
      await sendConsultationMessage({
        consultationId: consultId,
        senderUid: 'vet-mobile-duty',
        senderRole: 'vet',
        senderName: 'Dr. Sarah Weerasinghe, BVSc',
        text: text.trim(),
      });
    } catch (err) {
      console.warn('Failed to send mobile vet response:', err);
    }
  };

  return (
    <VetConsultsContext.Provider
      value={{
        consultations,
        messages,
        sendMessage,
        subscribeToRoomMessages,
      }}
    >
      {children}
    </VetConsultsContext.Provider>
  );
}

export function useVetConsults() {
  const ctx = useContext(VetConsultsContext);
  if (!ctx) throw new Error('useVetConsults must be used inside <VetConsultsProvider>');
  return ctx;
}
