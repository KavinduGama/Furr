import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

/**
 * Daily scheduled maintenance to clean up invalid or malformed Expo push tokens.
 */
export const cleanupStalePushTokens = onSchedule(
  {
    schedule: 'every 24 hours',
    timeZone: 'Asia/Colombo',
  },
  async () => {
    const db = admin.firestore();

    try {
      const usersSnapshot = await db
        .collection('users')
        .where('expoPushToken', '!=', null)
        .limit(500)
        .get();

      if (usersSnapshot.empty) return;

      let cleaned = 0;
      for (const doc of usersSnapshot.docs) {
        const token = doc.data().expoPushToken;
        // Check if token format is valid Expo push token
        if (typeof token !== 'string' || (!token.startsWith('ExponentPushToken[') && !token.startsWith('ExpoPushToken['))) {
          await doc.ref.update({
            expoPushToken: admin.firestore.FieldValue.delete(),
          });
          cleaned++;
        }
      }

      console.log(`[cleanupStalePushTokens] Cleaned up ${cleaned} invalid push tokens.`);
    } catch (err) {
      console.error('[cleanupStalePushTokens] Error cleaning push tokens:', err);
    }
  }
);
