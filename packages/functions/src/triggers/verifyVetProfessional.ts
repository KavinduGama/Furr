import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

/**
 * Triggered when a vet application document is updated in admin_vet_applications.
 * If status changes to 'approved', assign custom claim { vet: true } and sync profile.
 */
export const onVetApplicationStatusChanged = onDocumentUpdated(
  'admin_vet_applications/{applicationId}',
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!afterData || beforeData?.status === afterData.status) {
      return;
    }

    if (afterData.status === 'approved' && afterData.email) {
      try {
        const auth = admin.auth();
        const db = admin.firestore();

        // Look up user by email
        const user = await auth.getUserByEmail(afterData.email).catch(() => null);

        if (user) {
          // Set custom user claims
          const existingClaims = user.customClaims || {};
          await auth.setCustomUserClaims(user.uid, {
            ...existingClaims,
            vet: true,
          });

          // Create or update verified vet profile in vets collection
          await db.collection('vets').doc(user.uid).set(
            {
              uid: user.uid,
              fullName: afterData.name,
              registrationNumber: afterData.regNumber,
              email: afterData.email,
              phone: afterData.phone,
              district: afterData.district,
              clinicAffiliation: afterData.clinicAffiliation || null,
              specialization: afterData.specialization || null,
              yearsOfExperience: afterData.yearsOfExperience || 0,
              status: 'ACTIVE',
              verifiedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );

          console.log(`[verifyVetProfessional] Successfully verified vet claims for ${afterData.email} (${user.uid})`);
        }
      } catch (err) {
        console.error('[verifyVetProfessional] Failed to process vet approval:', err);
      }
    }
  }
);
