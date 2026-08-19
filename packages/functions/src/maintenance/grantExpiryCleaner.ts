import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

/**
 * Runs once every 24 hours to automatically transition expired
 * temporary veterinary access grants to 'expired' status.
 * Handles batched writes in chunks of 400 to never exceed Firestore 500 limit (MED-004).
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

  const docs = grantsQuery.docs;
  const CHUNK_SIZE = 400;
  let totalExpired = 0;

  for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
    const chunk = docs.slice(i, i + CHUNK_SIZE);
    const batch = db.batch();

    chunk.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'expired',
        expiredAt: now,
      });
      totalExpired++;
    });

    await batch.commit();
  }

  console.log(`Successfully expired ${totalExpired} access grants in ${Math.ceil(docs.length / CHUNK_SIZE)} batches.`);
});
