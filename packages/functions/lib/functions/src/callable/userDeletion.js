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
exports.deleteUserAccount = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
/**
 * GDPR-compliant user account deletion cascade.
 * Removes user record, authenticated profile, and all subcollections.
 */
exports.deleteUserAccount = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Authentication required.');
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
            for (const h of healthSub.docs)
                await h.ref.delete();
            const remindersSub = await petDoc.ref.collection('reminders').get();
            for (const r of remindersSub.docs)
                await r.ref.delete();
            await petDoc.ref.delete();
        }
        // Delete user profile doc
        await userDocRef.delete();
        // Delete Firebase Auth record
        await auth.deleteUser(uid);
        console.log(`[deleteUserAccount] Successfully deleted all data for user ${uid}`);
        return { success: true, message: 'Account and associated data deleted successfully.' };
    }
    catch (err) {
        console.error('[deleteUserAccount] Account deletion failed:', err);
        throw new https_1.HttpsError('internal', err?.message || 'Failed to complete account deletion cascade.');
    }
});
//# sourceMappingURL=userDeletion.js.map