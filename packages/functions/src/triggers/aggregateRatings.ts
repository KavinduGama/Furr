import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

/**
 * Event Trigger: Recalculates average rating and review count when a review is created or updated.
 */
export const onReviewCreatedOrUpdated = onDocumentWritten(
  'reviews/{reviewId}',
  async (event) => {
    const after = event.data?.after;
    const before = event.data?.before;
    const data = after?.exists ? after.data() : before?.data();
    if (!data) return;

    const { targetId, targetType } = data;
    if (!targetId || !targetType) return;

    const db = admin.firestore();

    // Query all published reviews for this target
    const snap = await db
      .collection('reviews')
      .where('targetId', '==', targetId)
      .where('status', '==', 'published')
      .get();

    const count = snap.size;
    let sum = 0;

    snap.forEach((doc) => {
      sum += doc.data().rating || 0;
    });

    const averageRating = count > 0 ? Number((sum / count).toFixed(1)) : 0;

    // Update target document
    if (targetType === 'product') {
      await db.collection('marketplace_products').doc(targetId).set(
        {
          rating: averageRating,
          reviewCount: count,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } else if (targetType === 'provider') {
      await db.collection('service_providers').doc(targetId).set(
        {
          rating: averageRating,
          reviewCount: count,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
  }
);
