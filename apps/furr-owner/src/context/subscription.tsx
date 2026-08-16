import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './auth';
import { updateSubscriptionTier } from '@furr/firebase';

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
  const { firebaseUser, profile, setProfile } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>(
    (profile?.subscriptionTier as SubscriptionTier) || 'free'
  );

  useEffect(() => {
    if (profile?.subscriptionTier) {
      setTier(profile.subscriptionTier as SubscriptionTier);
    }
  }, [profile?.subscriptionTier]);

  const upgradeTier = async (targetTier: SubscriptionTier) => {
    setTier(targetTier);
    if (firebaseUser?.uid) {
      try {
        await updateSubscriptionTier(firebaseUser.uid, targetTier);
        if (profile) {
          setProfile({ ...profile, subscriptionTier: targetTier });
        }
      } catch (err) {
        console.warn('Failed to persist subscription tier to Firestore:', err);
      }
    }
    Alert.alert('Subscription Active!', `Welcome to Furr ${targetTier === 'family' ? 'Family' : 'Plus'}!`);
  };

  const restorePurchases = async () => {
    const currentTier = (profile?.subscriptionTier as SubscriptionTier) || tier;
    if (currentTier === 'free') {
      Alert.alert('Restore Purchases', 'No prior active subscription found.');
    } else {
      setTier(currentTier);
      Alert.alert('Restored!', `Restored active Furr ${currentTier.toUpperCase()} subscription.`);
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
