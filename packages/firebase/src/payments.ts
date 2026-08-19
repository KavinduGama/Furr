// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Payment Gateway & Billing Persistence Helpers
// ─────────────────────────────────────────────────────────────

import type { PaymentIntent, BillingHistoryItem, PaymentProvider } from '@furr/core';

export const INITIAL_BILLING_HISTORY: BillingHistoryItem[] = [
  {
    id: 'inv-2026-08',
    userId: 'demo-uid',
    amount: 499,
    currency: 'LKR',
    tier: 'plus',
    period: 'monthly',
    paymentMethod: 'Visa •••• 4242',
    transactionReference: 'ch_stripe_mock_88192',
    status: 'paid',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export async function createPaymentIntent(
  data: Omit<PaymentIntent, 'id' | 'createdAt' | 'status'>
): Promise<PaymentIntent> {
  const intentId = 'pi_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const intent: PaymentIntent = {
    ...data,
    id: intentId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const ref = doc(db, 'payment_intents', intentId);
    await setDoc(ref, intent);
    return intent;
  } catch (e) {
    console.warn('Local fallback for createPaymentIntent:', e);
    return intent;
  }
}

export async function confirmPayment(
  intentId: string,
  transactionReference = 'tx_' + Date.now(),
  provider: PaymentProvider = 'stripe'
): Promise<PaymentIntent> {
  const completedAt = new Date().toISOString();

  try {
    const { getFirestore, doc, updateDoc, getDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const ref = doc(db, 'payment_intents', intentId);
    await updateDoc(ref, {
      status: 'succeeded',
      transactionReference,
      provider,
      completedAt,
    });
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as PaymentIntent;
    }
  } catch (e) {
    console.warn('Local fallback for confirmPayment:', e);
  }

  return {
    id: intentId,
    amount: 0,
    currency: 'LKR',
    purpose: 'marketplace_order',
    customerUid: 'demo-uid',
    provider,
    status: 'succeeded',
    transactionReference,
    createdAt: new Date().toISOString(),
    completedAt,
  };
}

export function subscribeToBillingHistory(
  userId: string,
  onUpdate: (items: BillingHistoryItem[]) => void
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(
        collection(db, `users/${userId}/billing_history`)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            onUpdate(INITIAL_BILLING_HISTORY);
            return;
          }
          const list: BillingHistoryItem[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as BillingHistoryItem);
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onUpdate(list);
        },
        (error) => {
          console.warn('Billing history subscription fallback:', error);
          onUpdate(INITIAL_BILLING_HISTORY);
        }
      );

      if (!active && unsubscribe) {
        unsubscribe();
      }
    } catch (e) {
      console.warn('Failed to subscribe to billing history:', e);
      onUpdate(INITIAL_BILLING_HISTORY);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export async function recordBillingTransaction(
  userId: string,
  data: Omit<BillingHistoryItem, 'id' | 'createdAt'>
): Promise<BillingHistoryItem> {
  const id = 'inv_' + Date.now();
  const item: BillingHistoryItem = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };

  try {
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const ref = doc(db, `users/${userId}/billing_history`, id);
    await setDoc(ref, item);
    return item;
  } catch (e) {
    console.warn('Local fallback for recordBillingTransaction:', e);
    INITIAL_BILLING_HISTORY.unshift(item);
    return item;
  }
}
