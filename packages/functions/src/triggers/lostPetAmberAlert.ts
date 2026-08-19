import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { sendExpoPushNotifications, ExpoPushMessage } from '../utils/expoPush';
import type { LostPetAlert } from '@furr/core';

export const onLostPetAlertCreated = onDocumentCreated(
  'lost_pet_alerts/{alertId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const alert = snap.data() as LostPetAlert;
    if (!alert || alert.status !== 'active') return;

    const city = alert.lastSeenCity;
    const petName = alert.petName;
    const species = alert.species;

    // Query pet owners who have enabled notifications in this district (capped at 200 to prevent timeout - MED-021)
    const db = admin.firestore();
    const usersSnap = await db
      .collection('users')
      .where('district', '==', city)
      .where('notificationsEnabled', '==', true)
      .limit(200)
      .get();

    const pushTokens: string[] = [];
    usersSnap.forEach((doc) => {
      const data = doc.data();
      if (data.expoPushToken && data.uid !== alert.ownerUid) {
        pushTokens.push(data.expoPushToken);
      }
    });

    if (pushTokens.length === 0) return;

    const messages: ExpoPushMessage[] = pushTokens.map((token) => ({
      to: token,
      title: `🚨 LOST PET RADAR: ${petName} (${species})`,
      body: `A pet was just reported missing near ${alert.lastSeenAddress}, ${city}. Tap to view photo and details.`,
      data: {
        type: 'LOST_PET_ALERT',
        alertId: event.params.alertId,
        petName: alert.petName,
        city: alert.lastSeenCity,
      },
      sound: 'default',
      channelId: 'pet-care',
    }));

    await sendExpoPushNotifications(messages);
  }
);
