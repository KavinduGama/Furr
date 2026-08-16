"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onFoundPetReportCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
const expoPush_1 = require("../utils/expoPush");
/**
 * Triggered when a new found_pet_report is submitted.
 * Matches against active lost_pet_alerts in the same district/city and species.
 */
exports.onFoundPetReportCreated = (0, firestore_1.onDocumentCreated)('found_pet_reports/{reportId}', async (event) => {
    const report = event.data?.data();
    if (!report)
        return;
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
        if (matchingAlerts.empty)
            return;
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
                        await (0, expoPush_1.sendExpoPushNotifications)([
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
    }
    catch (err) {
        console.error('[matchLostPets] Error matching found pet against lost alerts:', err);
    }
});
//# sourceMappingURL=matchLostPets.js.map