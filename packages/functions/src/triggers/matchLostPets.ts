import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { sendExpoPushNotifications } from '../utils/expoPush';

/**
 * Triggered when a new found_pet_report is submitted.
 * Matches against active lost_pet_alerts in the same district/city and species.
 */
export const onFoundPetReportCreated = onDocumentCreated(
  'found_pet_reports/{reportId}',
  async (event) => {
    const report = event.data?.data();
    if (!report) return;

    const db = admin.firestore();
    const city = report.foundCity || report.city;
    const species = report.species;

    try {
      // Find active lost alerts with matching criteria
      let query = db.collection('lost_pet_alerts').where('status', '==', 'active');
      if (species) {
        query = query.where('species', '==', species);
      }

      const matchingAlerts = await query.limit(20).get();

      if (matchingAlerts.empty) return;

      for (const alertDoc of matchingAlerts.docs) {
        const alert = alertDoc.data();
        const alertCity = alert.lastSeenCity || alert.city;

        // Check if cities match or in same district
        if (alertCity && city && alertCity.toLowerCase() === city.toLowerCase()) {
          // Record candidate match
          await alertDoc.ref.update({
            matchCandidates: admin.firestore.FieldValue.arrayUnion(event.params.reportId),
          });

          // Send push notification to owner
          if (alert.ownerUid) {
            const ownerDoc = await db.collection('users').doc(alert.ownerUid).get();
            const pushToken = ownerDoc.data()?.expoPushToken;

            if (pushToken) {
              await sendExpoPushNotifications([
                {
                  to: pushToken,
                  title: '🔍 Potential Match Found for Your Lost Pet!',
                  body: `A ${species || 'pet'} matching description was reported found in ${city}. Tap to review details.`,
                  data: {
                    type: 'lost_pet_match',
                    alertId: alertDoc.id,
                    reportId: event.params.reportId,
                  },
                  sound: 'default',
                  priority: 'high',
                },
              ]);
            }
          }
        }
      }
    } catch (err) {
      console.error('[matchLostPets] Error matching found pet against lost alerts:', err);
    }
  }
);
