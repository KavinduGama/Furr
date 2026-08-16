import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';

export type SubscriptionTier = 'free' | 'plus' | 'family';

interface SubscriptionContextType {
  tier: SubscriptionTier;
  isPlus: boolean;
  isFamily: boolean;
  isPremium: boolean;
  upgradeTier: (targetTier: SubscriptionTier) => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<SubscriptionTier>('free');

  const upgradeTier = async (targetTier: SubscriptionTier) => {
    // Simulates payment transaction completion
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setTier(targetTier);
    Alert.alert('Subscription Active!', `Welcome to Furr ${targetTier === 'family' ? 'Family' : 'Plus'}!`);
  };

  const restorePurchases = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (tier === 'free') {
      Alert.alert('Restore Purchases', 'No prior active subscription found.');
    } else {
      Alert.alert('Restored!', `Restored active Furr ${tier.toUpperCase()} subscription.`);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        isPlus: tier === 'plus' || tier === 'family',
        isFamily: tier === 'family',
        isPremium: tier !== 'free',
        upgradeTier,
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
