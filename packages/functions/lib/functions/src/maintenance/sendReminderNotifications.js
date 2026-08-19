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
exports.sendReminderNotifications = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
const expoPush_1 = require("../utils/expoPush");
/**
 * Hourly scheduled task to check for due pet care & medication reminders
 * and dispatch push notifications to owners.
 * Features per-item error isolation so single push failures never block remaining items (MED-006).
 */
exports.sendReminderNotifications = (0, scheduler_1.onSchedule)({
    schedule: 'every 1 hours',
    timeZone: 'Asia/Colombo',
}, async () => {
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
            try {
                const reminder = doc.data();
                const ownerUid = reminder.ownerUid;
                if (ownerUid) {
                    // Fetch owner's push token
                    const userDoc = await db.collection('users').doc(ownerUid).get();
                    const pushToken = userDoc.data()?.expoPushToken;
                    if (pushToken) {
                        await (0, expoPush_1.sendExpoPushNotifications)([
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
            catch (itemErr) {
                console.error(`[sendReminderNotifications] Failed to process reminder ${doc.id}:`, itemErr);
            }
        }
    }
    catch (err) {
        console.error('[sendReminderNotifications] Error executing reminder scheduler query:', err);
    }
});
//# sourceMappingURL=sendReminderNotifications.js.map