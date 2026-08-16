import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

/**
 * GDPR-compliant user account deletion cascade.
 * Removes user record, authenticated profile, and all subcollections.
 */
export const deleteUserAccount = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }

  const uid = request.auth.uid;
  const db = admin.firestore();
  const auth = admin.auth();

  try {
    // Delete subcollections under users/{uid}
    const userDocRef = db.collection('users').doc(uid);
    const petsSnapshot = await userDocRef.collection('pets').get();

    for (const petDoc of petsSnapshot.docs) {
      // Clean up pet subcollections (vaccinations, medications, etc.)
      const healthSub = await petDoc.ref.collection('health_records').get();
      for (const h of healthSub.docs) await h.ref.delete();

      const remindersSub = await petDoc.ref.collection('reminders').get();
      for (const r of remindersSub.docs) await r.ref.delete();

      await petDoc.ref.delete();
    }

    // Delete user profile doc
    await userDocRef.delete();

    // Delete Firebase Auth record
    await auth.deleteUser(uid);

    console.log(`[deleteUserAccount] Successfully deleted all data for user ${uid}`);
    return { success: true, message: 'Account and associated data deleted successfully.' };
  } catch (err: any) {
    console.error('[deleteUserAccount] Account deletion failed:', err);
    throw new HttpsError('internal', err?.message || 'Failed to complete account deletion cascade.');
  }
});
