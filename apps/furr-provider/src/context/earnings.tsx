import React, { createContext, useContext, useEffect, useState } from 'react';
import type {
  ProviderPayout,
  ProviderEarningsSummary,
  EarningsBreakdown,
  PayoutMethod,
} from '@furr/core';
import { calculateProviderEarnings } from '@furr/core';
import {
  subscribeToPayoutHistory,
  requestProviderPayout as dbRequestPayout,
  MOCK_PROVIDER_PAYOUTS,
} from '@furr/firebase';
import { useProviderAuth } from './auth';
import { useProviderBookings } from './bookings';
import { useProviderProducts } from './products';

interface EarningsContextType {
  summary: ProviderEarningsSummary;
  breakdown: EarningsBreakdown;
  payouts: ProviderPayout[];
  isLoading: boolean;
  requestPayout: (amount: number, method: PayoutMethod, details: string) => Promise<ProviderPayout>;
}

const EarningsContext = createContext<EarningsContextType | undefined>(undefined);

export function ProviderEarningsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useProviderAuth();
  const { bookings } = useProviderBookings();
  const { orders } = useProviderProducts();
  const [payouts, setPayouts] = useState<ProviderPayout[]>(MOCK_PROVIDER_PAYOUTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPayouts([]);
      setIsLoading(false);
      return;
    }

    const unsub = subscribeToPayoutHistory(user.uid, (list) => {
      setPayouts(list);
      setIsLoading(false);
    });

    return () => unsub();
  }, [user]);

  // Aggregate genuine gross revenues (MED-016)
  const servicesGross = bookings
    .filter((b) => b.status === 'completed')
    .reduce((acc, b) => acc + (b.price || 0), 0);

  const productsGross = orders
    .filter((o) => o.status === 'delivered' || o.status === 'shipped')
    .reduce((acc, o) => acc + (o.total || 0), 0);

  const tipsGross = 0;

  const breakdown = calculateProviderEarnings(servicesGross, productsGross, tipsGross);

  const completedPayoutsTotal = payouts
    .filter((p) => p.status === 'completed')
    .reduce((acc, p) => acc + p.amount, 0);

  const pendingPayoutTotal = payouts
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((acc, p) => acc + p.amount, 0);

  const availableBalance = Math.max(0, breakdown.netPayout - completedPayoutsTotal - pendingPayoutTotal);

  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const completedOrders = orders.filter((o) => o.status === 'delivered');

  const summary: ProviderEarningsSummary = {
    todayRevenue: 0,
    weekRevenue: breakdown.netPayout,
    monthRevenue: breakdown.netPayout,
    lifetimeRevenue: breakdown.netPayout + completedPayoutsTotal,
    pendingPayout: pendingPayoutTotal,
    availableBalance,
    completedBookingsCount: completedBookings.length,
    completedOrdersCount: completedOrders.length,
  };

  const requestPayout = async (amount: number, method: PayoutMethod, details: string) => {
    if (!user) throw new Error('Not authenticated');
    const payout = await dbRequestPayout(user.uid, 'Premier Pet Care Studio', amount, method, details);
    setPayouts((prev) => [payout, ...prev]);
    return payout;
  };

  return (
    <EarningsContext.Provider
      value={{
        summary,
        breakdown,
        payouts,
        isLoading,
        requestPayout,
      }}
    >
      {children}
    </EarningsContext.Provider>
  );
}

export function useProviderEarnings() {
  const context = useContext(EarningsContext);
  if (!context) {
    throw new Error('useProviderEarnings must be used within a ProviderEarningsProvider');
  }
  return context;
}
