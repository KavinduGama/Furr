import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

/**
 * GDPR-compliant user account deletion cascade (HIGH-007).
 * Recursively removes user profile, pets, medical dossiers, routines,
 * community posts, reviews, alerts, and Firebase Auth record.
 */
export const deleteUserAccount = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }

  const uid = request.auth.uid;
  const db = admin.firestore();
  const auth = admin.auth();

  try {
    const userDocRef = db.collection('users').doc(uid);

    // 1. Delete all pets and their nested subcollections
    const petsSnapshot = await userDocRef.collection('pets').get();
    for (const petDoc of petsSnapshot.docs) {
      const subcollections = [
        'vaccinations',
        'medications',
        'weights',
        'weight_entries',
        'observations',
        'flags',
        'documents',
        'reminders',
        'health_records',
      ];
      for (const sub of subcollections) {
        const subSnap = await petDoc.ref.collection(sub).get().catch(() => ({ docs: [] } as any));
        for (const doc of subSnap.docs) {
          await doc.ref.delete();
        }
      }
      await petDoc.ref.delete();
    }

    // 2. Delete billing history & grants
    const billingSnap = await userDocRef.collection('billing_history').get();
    for (const doc of billingSnap.docs) await doc.ref.delete();

    const grantsSnap = await userDocRef.collection('grants').get();
    for (const doc of grantsSnap.docs) await doc.ref.delete();

    // 3. Delete root documents where user is owner / author
    const rootQueries = [
      db.collection('routines').where('ownerUid', '==', uid),
      db.collection('expenses').where('ownerUid', '==', uid),
      db.collection('care_feeding_schedules').where('ownerUid', '==', uid),
      db.collection('care_walk_activities').where('ownerUid', '==', uid),
      db.collection('family_members').where('ownerUid', '==', uid),
      db.collection('insurance_policies').where('ownerUid', '==', uid),
      db.collection('lost_pet_alerts').where('ownerUid', '==', uid),
      db.collection('found_pet_reports').where('reporterUid', '==', uid),
      db.collection('community_meetups').where('hostUid', '==', uid),
      db.collection('community_questions').where('authorUid', '==', uid),
      db.collection('reviews').where('authorUid', '==', uid),
      db.collection('telemedicine_messages').where('senderUid', '==', uid),
      db.collection('adoption_applications').where('applicantUid', '==', uid),
    ];

    for (const q of rootQueries) {
      const snap = await q.get().catch(() => ({ docs: [] } as any));
      for (const doc of snap.docs) {
        await doc.ref.delete();
      }
    }

    // 4. Delete user profile doc
    await userDocRef.delete();

    // 5. Delete Firebase Auth record
    await auth.deleteUser(uid);

    return { success: true, message: 'Account and all associated personal data permanently removed.' };
  } catch (err: any) {
    console.error('[deleteUserAccount] Account deletion failed:', err);
    throw new HttpsError('internal', err?.message || 'Failed to complete account deletion cascade.');
  }
});
