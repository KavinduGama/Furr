import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

export interface OrderItemPayload {
  productId: string;
  quantity: number;
}

export interface ProcessOrderRequest {
  orderId: string;
  items: OrderItemPayload[];
  totalLkr: number;
  ownerUid: string;
  deliveryAddress: string;
}

/**
 * Callable Function: Atomically validates ownership, server-side prices, stock levels,
 * decrements inventory, and confirms marketplace order state (HIGH-006).
 */
export const processMarketplaceOrder = onCall<ProcessOrderRequest>(
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Must be authenticated to process marketplace orders'
      );
    }

    const data = request.data;
    if (!data.orderId || !Array.isArray(data.items) || data.items.length === 0) {
      throw new HttpsError('invalid-argument', 'Valid orderId and items array are required');
    }

    // Ownership check (HIGH-006)
    const callerUid = request.auth.uid;
    const isAdmin = request.auth.token?.admin === true;
    if (data.ownerUid && data.ownerUid !== callerUid && !isAdmin) {
      throw new HttpsError('permission-denied', 'Cannot process orders on behalf of another user');
    }

    const db = admin.firestore();

    return await db.runTransaction(async (transaction) => {
      let computedSubtotal = 0;

      // 1. Verify stock and calculate genuine server-side prices for all items
      for (const item of data.items) {
        if (item.quantity <= 0) {
          throw new HttpsError('invalid-argument', `Invalid quantity for product ${item.productId}`);
        }

        const prodRef = db.collection('marketplace_products').doc(item.productId);
        const prodDoc = await transaction.get(prodRef);

        if (!prodDoc.exists) {
          throw new HttpsError(
            'not-found',
            `Product not found: ${item.productId}`
          );
        }

        const prodData = prodDoc.data()!;
        const currentStock = prodData.stock ?? 0;
        const itemPrice = typeof prodData.price === 'number' ? prodData.price : 0;
        computedSubtotal += itemPrice * item.quantity;

        if (currentStock < item.quantity) {
          throw new HttpsError(
            'failed-precondition',
            `Insufficient stock for ${prodData.name || item.productId}. Available: ${currentStock}`
          );
        }

        // Decrement stock
        const newStock = currentStock - item.quantity;
        transaction.update(prodRef, {
          stock: newStock,
          inStock: newStock > 0,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Compute standard delivery
      const deliveryFee = computedSubtotal >= 10000 || computedSubtotal === 0 ? 0 : 450;
      const computedTotal = computedSubtotal + deliveryFee;

      // 2. Update order status and record verified totals
      const orderRef = db.collection('marketplace_orders').doc(data.orderId);
      transaction.set(orderRef, {
        ownerUid: callerUid,
        subtotal: computedSubtotal,
        deliveryFee,
        total: computedTotal,
        status: 'confirmed',
        confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      return {
        success: true,
        orderId: data.orderId,
        computedSubtotal,
        computedTotal,
        message: 'Order verified, prices calculated server-side, and inventory updated.',
      };
    });
  }
);
