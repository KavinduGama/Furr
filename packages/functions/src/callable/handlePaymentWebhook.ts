import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

export interface PaymentWebhookInput {
  intentId: string;
  transactionReference?: string;
  provider?: string;
}

export const handlePaymentWebhook = onCall<PaymentWebhookInput>(async (request) => {
  const { intentId, transactionReference, provider = 'stripe' } = request.data || {};

  if (!intentId) {
    throw new HttpsError('invalid-argument', 'Missing payment intentId');
  }

  const db = admin.firestore();
  const intentRef = db.collection('payment_intents').doc(intentId);
  const intentDoc = await intentRef.get();

  if (!intentDoc.exists) {
    throw new HttpsError('not-found', 'PaymentIntent not found');
  }

  const intent = intentDoc.data()!;
  const completedAt = new Date().toISOString();

  // Mark PaymentIntent as succeeded
  await intentRef.update({
    status: 'succeeded',
    transactionReference: transactionReference || 'tx_' + Date.now(),
    provider,
    completedAt,
  });

  // Post-payment automations based on purpose
  if (intent.purpose === 'subscription') {
    const tier = intent.metadata?.tier || 'plus';
    const customerUid = intent.customerUid;
    if (customerUid) {
      // Update user subscription tier
      await db.collection('users').doc(customerUid).set(
        {
          subscriptionTier: tier,
          updatedAt: completedAt,
        },
        { merge: true }
      );

      // Record invoice in billing history
      const invoiceId = 'inv_' + Date.now();
      await db.collection(`users/${customerUid}/billing_history`).doc(invoiceId).set({
        id: invoiceId,
        userId: customerUid,
        amount: intent.amount,
        currency: intent.currency || 'LKR',
        tier,
        period: intent.metadata?.period || 'monthly',
        paymentMethod: provider === 'stripe' ? 'Credit / Debit Card' : 'PayHere Digital Wallet',
        transactionReference: transactionReference || intentId,
        status: 'paid',
        createdAt: completedAt,
      });
    }
  } else if (intent.purpose === 'marketplace_order') {
    const orderId = intent.metadata?.orderId;
    if (orderId) {
      await db.collection('marketplace_orders').doc(orderId).set(
        {
          status: 'confirmed',
          paymentStatus: 'paid',
          transactionReference: transactionReference || intentId,
          updatedAt: completedAt,
        },
        { merge: true }
      );
    }
  } else if (intent.purpose === 'service_booking') {
    const bookingId = intent.metadata?.bookingId;
    if (bookingId) {
      await db.collection('service_bookings').doc(bookingId).set(
        {
          status: 'confirmed',
          paymentStatus: 'paid',
          transactionReference: transactionReference || intentId,
          updatedAt: completedAt,
        },
        { merge: true }
      );
    }
  }

  return {
    success: true,
    intentId,
    status: 'succeeded',
    completedAt,
  };
});
