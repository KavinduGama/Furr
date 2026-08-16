import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import { sendExpoPushNotifications } from '../utils/expoPush';

/**
 * Hourly scheduled task to check for due pet care & medication reminders
 * and dispatch push notifications to owners.
 */
export const sendReminderNotifications = onSchedule(
  {
    schedule: 'every 1 hours',
    timeZone: 'Asia/Colombo',
  },
  async () => {
    const db = admin.firestore();
    const nowIso = new Date().toISOString();

    try {
      // Find all due scheduled reminders across all pets
      const snapshot = await db
        .collectionGroup('reminders')
        .where('status', '==', 'scheduled')
        .where('scheduledAt', '<=', nowIso)
        .limit(200)
        .get();

      if (snapshot.empty) {
        console.log('[sendReminderNotifications] No due reminders found.');
        return;
      }

      console.log(`[sendReminderNotifications] Processing ${snapshot.size} due reminders.`);

      for (const doc of snapshot.docs) {
        const reminder = doc.data();
        const ownerUid = reminder.ownerUid;

        if (ownerUid) {
          // Fetch owner's push token
          const userDoc = await db.collection('users').doc(ownerUid).get();
          const pushToken = userDoc.data()?.expoPushToken;

          if (pushToken) {
            await sendExpoPushNotifications([
              {
                to: pushToken,
                title: `🐾 Reminder: ${reminder.title || 'Pet Care Task'}`,
                body: reminder.body || 'You have a scheduled pet care task due now.',
                data: {
                  type: 'care_reminder',
                  reminderId: doc.id,
                  petId: reminder.petId,
                },
                sound: 'default',
                priority: 'high',
              },
            ]);
          }
        }

        // Mark as processed/notified
        await doc.ref.update({
          status: 'notified',
          notifiedAt: nowIso,
        });
      }
    } catch (err) {
      console.error('[sendReminderNotifications] Error executing reminder scheduler:', err);
    }
  }
);
