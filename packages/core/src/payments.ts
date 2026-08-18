// ─────────────────────────────────────────────────────────────
//  @furr/core — Payment Gateway & Subscription Billing Domain
// ─────────────────────────────────────────────────────────────

export type PaymentProvider = 'stripe' | 'payhere' | 'cash_on_delivery' | 'mock_instant';

export type PaymentPurpose =
  | 'marketplace_order'
  | 'service_booking'
  | 'telehealth_consult'
  | 'subscription';

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: 'LKR' | 'USD';
  purpose: PaymentPurpose;
  customerUid: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  transactionReference?: string;
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
  completedAt?: string;
}

export interface BillingHistoryItem {
  id: string;
  userId: string;
  amount: number;
  currency: 'LKR' | 'USD';
  tier: 'plus' | 'family';
  period: 'monthly' | 'annual';
  paymentMethod: string;
  transactionReference: string;
  receiptUrl?: string;
  status: 'paid' | 'refunded';
  createdAt: string;
}

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'rejected';
export type PayoutMethod = 'bank_transfer' | 'dialog_genie' | 'frimi' | 'ez_cash';

export interface ProviderPayout {
  id: string;
  providerId: string;
  providerName: string;
  amount: number;
  currency: 'LKR' | 'USD';
  method: PayoutMethod;
  status: PayoutStatus;
  destinationDetails: string; // e.g. "Commercial Bank - ****4812" or "Genie - 0771234567"
  referenceNumber?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface ProviderEarningsSummary {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  lifetimeRevenue: number;
  pendingPayout: number;
  availableBalance: number;
  completedBookingsCount: number;
  completedOrdersCount: number;
}

export interface EarningsBreakdown {
  serviceRevenue: number;
  productRevenue: number;
  tipsReceived: number;
  platformFees: number;
  netPayout: number;
}

export function formatCurrency(amount: number, currency: 'LKR' | 'USD' = 'LKR'): string {
  if (currency === 'USD') {
    return `$${amount.toFixed(2)}`;
  }
  return `LKR ${amount.toLocaleString()}`;
}

export function calculatePlatformCommission(amount: number, takeRatePercent = 10): {
  platformFee: number;
  providerPayout: number;
} {
  const platformFee = Math.round((amount * takeRatePercent) / 100);
  const providerPayout = amount - platformFee;
  return { platformFee, providerPayout };
}

export function calculateProviderEarnings(
  servicesGross: number,
  productsGross: number,
  tipsGross: number = 0,
  serviceCommissionRate = 10,
  productCommissionRate = 8
): EarningsBreakdown {
  const serviceFee = Math.round((servicesGross * serviceCommissionRate) / 100);
  const productFee = Math.round((productsGross * productCommissionRate) / 100);
  const totalFees = serviceFee + productFee;
  const netPayout = (servicesGross - serviceFee) + (productsGross - productFee) + tipsGross;

  return {
    serviceRevenue: servicesGross,
    productRevenue: productsGross,
    tipsReceived: tipsGross,
    platformFees: totalFees,
    netPayout,
  };
}

