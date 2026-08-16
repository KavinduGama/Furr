import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { sendExpoPushNotifications } from '../utils/expoPush';
import type { ConsultationMessage } from '@furr/core';

export const onTelehealthMessageSent = onDocumentCreated(
  'telemedicine_messages/{msgId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const msg = snap.data() as ConsultationMessage;
    if (!msg || !msg.consultationId) return;

    const db = admin.firestore();
    const consultSnap = await db.collection('telemedicine_consultations').doc(msg.consultationId).get();
    if (!consultSnap.exists) return;

    const consult = consultSnap.data();
    if (!consult) return;

    // Determine receiver: if sender is owner, receiver is vet. If sender is vet, receiver is owner.
    const receiverUid = msg.senderRole === 'owner' ? consult.vetUid : consult.ownerUid;
    if (!receiverUid) return;

    const userDoc = await db.collection('users').doc(receiverUid).get();
    const userData = userDoc.data();
    const pushToken = userData?.expoPushToken;

    if (!pushToken) return;

    await sendExpoPushNotifications([
      {
        to: pushToken,
        title: `💬 New Message from ${msg.senderName}`,
        body: msg.text || (msg.imageUrls?.length ? 'Sent an attachment photo' : 'New consultation update'),
        data: {
          type: 'TELEHEALTH_MESSAGE',
          consultationId: msg.consultationId,
        },
        sound: 'default',
        channelId: 'pet-care',
      },
    ]);
  }
);
