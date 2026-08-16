import React, { createContext, useContext, useState } from 'react';
import type { Consultation, ConsultationMessage } from '@furr/core';
import { INITIAL_CONSULTATIONS, INITIAL_MESSAGES } from '@furr/firebase';

type VetConsultsContextValue = {
  consultations: Consultation[];
  messages: Record<string, ConsultationMessage[]>;
  sendMessage: (consultId: string, text: string) => void;
};

const VetConsultsContext = createContext<VetConsultsContextValue | null>(null);

export function VetConsultsProvider({ children }: { children: React.ReactNode }) {
  const [consultations] = useState<Consultation[]>(INITIAL_CONSULTATIONS);
  const [messages, setMessages] = useState<Record<string, ConsultationMessage[]>>(INITIAL_MESSAGES);

  const sendMessage = (consultId: string, text: string) => {
    if (!text.trim()) return;
    const newMsg: ConsultationMessage = {
      id: 'vet-msg-' + Date.now(),
      consultationId: consultId,
      senderUid: 'vet-mobile-user',
      senderRole: 'vet',
      senderName: 'Dr. Sarah Smith',
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [consultId]: [...(prev[consultId] || []), newMsg],
    }));
  };

  return (
    <VetConsultsContext.Provider
      value={{
        consultations,
        messages,
        sendMessage,
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
