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
 * Callable Function: Atomically validates stock, decrements inventory,
 * and confirms marketplace order state.
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

    const db = admin.firestore();

    return await db.runTransaction(async (transaction) => {
      // 1. Verify stock for all items
      for (const item of data.items) {
        const prodRef = db.collection('marketplace_products').doc(item.productId);
        const prodDoc = await transaction.get(prodRef);

        if (!prodDoc.exists) {
          throw new HttpsError(
            'not-found',
            `Product not found: ${item.productId}`
          );
        }

        const currentStock = prodDoc.data()?.stock ?? 0;
        if (currentStock < item.quantity) {
          throw new HttpsError(
            'failed-precondition',
            `Insufficient stock for ${prodDoc.data()?.name || item.productId}. Available: ${currentStock}`
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

      // 2. Update order status to 'confirmed'
      const orderRef = db.collection('marketplace_orders').doc(data.orderId);
      transaction.update(orderRef, {
        status: 'confirmed',
        confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        orderId: data.orderId,
        message: 'Order verified and inventory updated.',
      };
    });
  }
);
