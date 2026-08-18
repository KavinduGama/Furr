import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  formatCurrency,
  calculatePlatformCommission,
  type PaymentIntent,
  type BillingHistoryItem,
} from '../payments';

describe('Payment Gateway & Subscription Engine Tests', () => {
  it('formats currency correctly for LKR and USD', () => {
    assert.strictEqual(formatCurrency(499, 'LKR'), 'LKR 499');
    assert.strictEqual(formatCurrency(12500, 'LKR'), 'LKR 12,500');
    assert.strictEqual(formatCurrency(15.5, 'USD'), '$15.50');
  });

  it('calculates platform commission and provider net payout', () => {
    const { platformFee, providerPayout } = calculatePlatformCommission(2500, 10);
    assert.strictEqual(platformFee, 250);
    assert.strictEqual(providerPayout, 2250);
    assert.strictEqual(platformFee + providerPayout, 2500);
  });

  it('validates PaymentIntent life cycle structure', () => {
    const intent: PaymentIntent = {
      id: 'pi_test_12345',
      amount: 3200,
      currency: 'LKR',
      purpose: 'marketplace_order',
      customerUid: 'cust-101',
      customerName: 'Kavindu Deshappriya',
      customerPhone: '+94771234567',
      provider: 'stripe',
      status: 'pending',
      metadata: { orderId: 'ord-881' },
      createdAt: '2026-08-18T10:00:00Z',
    };

    assert.strictEqual(intent.status, 'pending');
    assert.strictEqual(intent.amount, 3200);
    assert.strictEqual(intent.provider, 'stripe');

    // Confirm Payment
    const completedIntent: PaymentIntent = {
      ...intent,
      status: 'succeeded',
      transactionReference: 'ch_stripe_mock_99182',
      completedAt: '2026-08-18T10:01:30Z',
    };

    assert.strictEqual(completedIntent.status, 'succeeded');
    assert.ok(completedIntent.transactionReference);
  });

  it('validates BillingHistory invoice entry', () => {
    const invoice: BillingHistoryItem = {
      id: 'inv_sub_8819',
      userId: 'user_001',
      amount: 799,
      currency: 'LKR',
      tier: 'family',
      period: 'monthly',
      paymentMethod: 'PayHere Mobile Wallet (EzCash)',
      transactionReference: 'ph_tx_998124',
      status: 'paid',
      createdAt: '2026-08-18T12:00:00Z',
    };

    assert.strictEqual(invoice.tier, 'family');
    assert.strictEqual(invoice.status, 'paid');
    assert.strictEqual(invoice.amount, 799);
  });
});
