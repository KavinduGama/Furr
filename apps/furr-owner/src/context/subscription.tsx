import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './auth';
import {
  updateSubscriptionTier,
  createPaymentIntent,
  confirmPayment,
  recordBillingTransaction,
  subscribeToBillingHistory,
} from '@furr/firebase';
import type { BillingHistoryItem, PaymentProvider } from '@furr/core';

export type SubscriptionTier = 'free' | 'plus' | 'family';

interface SubscriptionContextType {
  tier: SubscriptionTier;
  isPlus: boolean;
  isFamily: boolean;
  isPremium: boolean;
  billingHistory: BillingHistoryItem[];
  upgradeTier: (
    targetTier: SubscriptionTier,
    provider?: PaymentProvider,
    period?: 'monthly' | 'annual'
  ) => Promise<boolean>;
  restorePurchases: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser, profile, setProfile } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>(
    (profile?.subscriptionTier as SubscriptionTier) || 'free'
  );
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);

  useEffect(() => {
    if (profile?.subscriptionTier) {
      setTier(profile.subscriptionTier as SubscriptionTier);
    }
  }, [profile?.subscriptionTier]);

  // Subscribe to billing history
  useEffect(() => {
    if (!firebaseUser?.uid) return;
    const unsub = subscribeToBillingHistory(firebaseUser.uid, (items) => {
      setBillingHistory(items);
    });
    return () => unsub();
  }, [firebaseUser?.uid]);

  const upgradeTier = useCallback(
    async (
      targetTier: SubscriptionTier,
      provider: PaymentProvider = 'stripe',
      period: 'monthly' | 'annual' = 'monthly'
    ): Promise<boolean> => {
      const uid = firebaseUser?.uid || profile?.uid || 'demo-uid';
      const amount = targetTier === 'family' ? (period === 'annual' ? 7990 : 799) : (period === 'annual' ? 4990 : 499);

      try {
        // 1. Create PaymentIntent
        const intent = await createPaymentIntent({
          amount,
          currency: 'LKR',
          purpose: 'subscription',
          customerUid: uid,
          customerName: profile?.displayName || undefined,
          customerEmail: profile?.email || undefined,
          provider,
          metadata: {
            tier: targetTier,
            period,
          },
        });

        // 2. Confirm Payment
        const confirmed = await confirmPayment(
          intent.id,
          `tx_sub_${targetTier}_${Date.now()}`,
          provider
        );

        // 3. Persist Tier to User Profile
        await updateSubscriptionTier(uid, targetTier);
        if (profile) {
          setProfile({ ...profile, subscriptionTier: targetTier });
        }
        setTier(targetTier);

        // 4. Record Billing Transaction Invoice
        await recordBillingTransaction(uid, {
          userId: uid,
          amount,
          currency: 'LKR',
          tier: targetTier as 'plus' | 'family',
          period,
          paymentMethod: provider === 'stripe' ? 'Card (Stripe)' : provider === 'payhere' ? 'PayHere Local Wallet' : 'Direct Activation',
          transactionReference: confirmed.transactionReference || intent.id,
          status: 'paid',
        });

        Alert.alert(
          'Subscription Activated! 🎉',
          `Welcome to Furr ${targetTier.toUpperCase()}! You now have full access to all premium features.`
        );
        return true;
      } catch (err) {
        console.warn('Subscription upgrade error:', err);
        Alert.alert('Upgrade Error', 'Failed to process subscription payment. Please try again.');
        return false;
      }
    },
    [firebaseUser?.uid, profile, setProfile]
  );

  const restorePurchases = useCallback(async () => {
    const currentTier = (profile?.subscriptionTier as SubscriptionTier) || tier;
    if (currentTier === 'free') {
      Alert.alert('Restore Purchases', 'No prior active subscription found.');
    } else {
      setTier(currentTier);
      Alert.alert('Restored!', `Restored active Furr ${currentTier.toUpperCase()} subscription.`);
    }
  }, [profile?.subscriptionTier, tier]);

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        isPlus: tier === 'plus' || tier === 'family',
        isFamily: tier === 'family',
        isPremium: tier !== 'free',
        billingHistory,
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
