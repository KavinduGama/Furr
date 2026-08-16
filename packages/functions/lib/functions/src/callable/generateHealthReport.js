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
exports.generateHealthReport = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
/**
 * Callable function that aggregates verified health records, vaccinations,
 * and medication logs into a structured medical dossier for clinic/travel export.
 */
exports.generateHealthReport = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Authentication required.');
    }
    const { ownerUid, petId } = request.data;
    if (!ownerUid || !petId) {
        throw new https_1.HttpsError('invalid-argument', 'Missing ownerUid or petId.');
    }
    const db = admin.firestore();
    try {
        const petDoc = await db.collection('users').doc(ownerUid).collection('pets').doc(petId).get();
        if (!petDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Pet record not found.');
        }
        const petData = petDoc.data();
        // Fetch vaccinations
        const vacSnapshot = await db
            .collection('users')
            .doc(ownerUid)
            .collection('pets')
            .doc(petId)
            .collection('vaccinations')
            .orderBy('administeredDate', 'desc')
            .get()
            .catch(() => ({ docs: [] }));
        // Fetch medications
        const medSnapshot = await db
            .collection('users')
            .doc(ownerUid)
            .collection('pets')
            .doc(petId)
            .collection('medications')
            .get()
            .catch(() => ({ docs: [] }));
        // Fetch weight logs
        const weightSnapshot = await db
            .collection('users')
            .doc(ownerUid)
            .collection('pets')
            .doc(petId)
            .collection('weight_entries')
            .orderBy('measuredAt', 'desc')
            .limit(10)
            .get()
            .catch(() => ({ docs: [] }));
        const report = {
            reportId: `HLTH-${Date.now().toString(36).toUpperCase()}`,
            generatedAt: new Date().toISOString(),
            pet: {
                id: petId,
                name: petData?.name || 'Unknown',
                species: petData?.species || 'Unknown',
                breed: petData?.breed || 'Unknown',
                gender: petData?.gender || 'Unknown',
                microchipNumber: petData?.microchipNumber || null,
                dateOfBirth: petData?.dateOfBirth || null,
            },
            vaccinations: vacSnapshot.docs.map((d) => d.data()),
            medications: medSnapshot.docs.map((d) => d.data()),
            weightHistory: weightSnapshot.docs.map((d) => d.data()),
            verificationChecksum: `VREF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        };
        return report;
    }
    catch (err) {
        console.error('[generateHealthReport] Failed to generate health report:', err);
        throw new https_1.HttpsError('internal', err?.message || 'Failed to aggregate health dossier.');
    }
});
//# sourceMappingURL=generateHealthReport.js.map