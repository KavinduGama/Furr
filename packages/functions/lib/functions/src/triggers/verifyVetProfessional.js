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
exports.onVetApplicationStatusChanged = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
/**
 * Triggered when a vet application document is updated in admin_vet_applications.
 * If status changes to 'approved', assign custom claim { vet: true } and sync profile.
 */
exports.onVetApplicationStatusChanged = (0, firestore_1.onDocumentUpdated)('admin_vet_applications/{applicationId}', async (event) => {
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
                await db.collection('vets').doc(user.uid).set({
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
                }, { merge: true });
                console.log(`[verifyVetProfessional] Successfully verified vet claims for ${afterData.email} (${user.uid})`);
            }
        }
        catch (err) {
            console.error('[verifyVetProfessional] Failed to process vet approval:', err);
        }
    }
});
//# sourceMappingURL=verifyVetProfessional.js.map