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
