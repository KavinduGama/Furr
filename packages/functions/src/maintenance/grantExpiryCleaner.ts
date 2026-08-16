import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

/**
 * Runs once every 24 hours to automatically transition expired
 * temporary veterinary access grants to 'expired' status.
 */
export const cleanupExpiredGrants = onSchedule('every 24 hours', async () => {
  const db = admin.firestore();
  const now = new Date().toISOString();

  const grantsQuery = await db
    .collectionGroup('grants')
    .where('grantExpiresAt', '<', now)
    .where('status', 'in', ['active', 'redeemed'])
    .get();

  if (grantsQuery.empty) {
    console.log('No expired grants found during daily maintenance.');
    return;
  }

  const batch = db.batch();
  let count = 0;

  grantsQuery.forEach((doc) => {
    batch.update(doc.ref, {
      status: 'expired',
      expiredAt: now,
    });
    count++;
  });

  await batch.commit();
  console.log(`Successfully expired ${count} access grants.`);
});
