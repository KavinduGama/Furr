import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { sendExpoPushNotifications } from '../utils/expoPush';

export const onOrderStatusUpdated = onDocumentUpdated(
  'marketplace_orders/{orderId}',
  async (event) => {
    const change = event.data;
    if (!change) return;

    const before = change.before.data();
    const after = change.after.data();

    if (!before || !after) return;
    if (before.status === after.status) return;

    const ownerUid = after.ownerUid;
    if (!ownerUid) return;

    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(ownerUid).get();
    const pushToken = userDoc.data()?.expoPushToken;

    if (!pushToken) return;

    let title = '📦 Order Update';
    let body = `Your order ${event.params.orderId} status is now ${after.status}.`;

    if (after.status === 'out_for_delivery') {
      title = '🚚 Out for Delivery!';
      body = `Your Furr marketplace order ${event.params.orderId} is out for delivery with courier tracking: ${after.trackingNumber || 'En route'}.`;
    } else if (after.status === 'delivered') {
      title = '🎉 Order Delivered!';
      body = `Your order ${event.params.orderId} has been successfully delivered. Thank you for shopping with Furr!`;
    }

    await sendExpoPushNotifications([
      {
        to: pushToken,
        title,
        body,
        data: {
          type: 'ORDER_UPDATE',
          orderId: event.params.orderId,
          status: after.status,
        },
        sound: 'default',
      },
    ]);
  }
);
