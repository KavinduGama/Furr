import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';

type SubscriptionTier = 'free' | 'premium';

interface SubscriptionContextType {
  tier: SubscriptionTier;
  isPremium: boolean;
  purchaseMonthly: () => Promise<void>;
  purchaseYearly: () => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  // Mocked state: start as free.
  const [tier, setTier] = useState<SubscriptionTier>('free');

  const purchaseMonthly = async () => {
    // Mock the delay of a purchase
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTier('premium');
  };

  const purchaseYearly = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTier('premium');
  };

  const restorePurchases = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // For mocking purposes, let's just say no purchases found unless they are already premium
    if (tier !== 'premium') {
      Alert.alert('Restore Failed', 'No active subscription found.');
    } else {
      Alert.alert('Success', 'Your purchases have been restored.');
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        isPremium: tier === 'premium',
        purchaseMonthly,
        purchaseYearly,
        restorePurchases,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
