import React, { createContext, useContext, useEffect, useState } from 'react';
import { useProviderAuth } from './auth';

export interface ProviderMessage {
  id: string;
  conversationId: string;
  senderUid: string;
  senderRole: 'provider' | 'owner';
  senderName: string;
  text: string;
  photoUrl?: string;
  createdAt: string;
}

export interface ProviderConversation {
  id: string;
  ownerUid: string;
  ownerName: string;
  petName: string;
  petSpecies: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
  serviceCategory: string;
}

interface ChatContextType {
  conversations: ProviderConversation[];
  messages: Record<string, ProviderMessage[]>;
  sendMessage: (conversationId: string, text: string, photoUrl?: string) => Promise<void>;
  markConversationAsRead: (conversationId: string) => void;
  totalUnreadCount: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const MOCK_CONVERSATIONS: ProviderConversation[] = [
  {
    id: 'conv-1',
    ownerUid: 'owner-1',
    ownerName: 'Sarah Perera',
    petName: 'Max',
    petSpecies: 'Golden Retriever',
    lastMessageText: 'Thanks! See you at 10 AM tomorrow for Max\'s grooming.',
    lastMessageAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    unreadCount: 1,
    serviceCategory: 'grooming',
  },
  {
    id: 'conv-2',
    ownerUid: 'owner-2',
    ownerName: 'Dinuka Silva',
    petName: 'Rocky',
    petSpecies: 'Labrador',
    lastMessageText: 'Can you bring extra water? It’s pretty sunny today.',
    lastMessageAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    unreadCount: 0,
    serviceCategory: 'walking',
  },
];

const MOCK_MESSAGES: Record<string, ProviderMessage[]> = {
  'conv-1': [
    {
      id: 'm1',
      conversationId: 'conv-1',
      senderUid: 'owner-1',
      senderRole: 'owner',
      senderName: 'Sarah Perera',
      text: 'Hi! Quick question about Max’s appointment tomorrow. Do you have hypoallergenic shampoo?',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'm2',
      conversationId: 'conv-1',
      senderUid: 'prov-1',
      senderRole: 'provider',
      senderName: 'Premier Pet Care Studio',
      text: 'Hello Sarah! Yes, absolutely. We use an organic chamomile and oat formula specially for sensitive skin.',
      createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    },
    {
      id: 'm3',
      conversationId: 'conv-1',
      senderUid: 'owner-1',
      senderRole: 'owner',
      senderName: 'Sarah Perera',
      text: 'Thanks! See you at 10 AM tomorrow for Max\'s grooming.',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
  ],
  'conv-2': [
    {
      id: 'm4',
      conversationId: 'conv-2',
      senderUid: 'owner-2',
      senderRole: 'owner',
      senderName: 'Dinuka Silva',
      text: 'Can you bring extra water? It’s pretty sunny today.',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
  ],
};

export function ProviderChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useProviderAuth();
  const [conversations, setConversations] = useState<ProviderConversation[]>(MOCK_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, ProviderMessage[]>>(MOCK_MESSAGES);

  const sendMessage = async (conversationId: string, text: string, photoUrl?: string) => {
    if (!user) return;
    const msg: ProviderMessage = {
      id: 'msg-' + Date.now(),
      conversationId,
      senderUid: user.uid,
      senderRole: 'provider',
      senderName: 'Premier Pet Care Studio',
      text,
      photoUrl,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), msg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessageText: text,
              lastMessageAt: msg.createdAt,
            }
          : c
      )
    );
  };

  const markConversationAsRead = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const totalUnreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        messages,
        sendMessage,
        markConversationAsRead,
        totalUnreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useProviderChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useProviderChat must be used within a ProviderChatProvider');
  }
  return context;
}
