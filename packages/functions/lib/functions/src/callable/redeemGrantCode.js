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
exports.redeemGrantCode = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
/**
 * Callable function for veterinarians to redeem an owner-generated 6-character
 * access grant code. This performs a secure collectionGroup query across all
 * owner grant subcollections.
 */
exports.redeemGrantCode = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be signed in as a veterinary professional.');
    }
    const code = request.data.code?.trim().toUpperCase();
    if (!code || code.length < 6) {
        throw new https_1.HttpsError('invalid-argument', 'A valid 6-character redemption code is required.');
    }
    const db = admin.firestore();
    const now = new Date();
    const grantsQuery = await db
        .collectionGroup('grants')
        .where('redemptionCode', '==', code)
        .limit(1)
        .get();
    if (grantsQuery.empty) {
        throw new https_1.HttpsError('not-found', 'Invalid access code or code does not exist.');
    }
    const grantDoc = grantsQuery.docs[0];
    const grantData = grantDoc.data();
    if (grantData.status === 'redeemed') {
        // If already redeemed by this same vet and still valid, allow re-entry
        if (grantData.redeemedByUid === request.auth.uid &&
            grantData.grantExpiresAt &&
            new Date(grantData.grantExpiresAt) > now) {
            return { success: true, grant: grantData };
        }
        throw new https_1.HttpsError('failed-precondition', 'This access code has already been redeemed.');
    }
    if (grantData.status !== 'active') {
        throw new https_1.HttpsError('failed-precondition', `This access code is ${grantData.status}.`);
    }
    if (new Date(grantData.codeExpiresAt) < now) {
        await grantDoc.ref.update({ status: 'expired' });
        throw new https_1.HttpsError('deadline-exceeded', 'This access code has expired. Please ask the owner for a new code.');
    }
    // Calculate grant expiry based on duration ('24h' | '7d')
    const durationMs = grantData.duration === '7d' ? 7 * 86400000 : 86400000;
    const grantExpiresAt = new Date(now.getTime() + durationMs).toISOString();
    const updatedFields = {
        status: 'redeemed',
        redeemedByUid: request.auth.uid,
        redeemedAt: now.toISOString(),
        grantExpiresAt,
        updatedAt: now.toISOString(),
    };
    await grantDoc.ref.update(updatedFields);
    const updatedGrant = {
        ...grantData,
        ...updatedFields,
    };
    return {
        success: true,
        grant: updatedGrant,
    };
});
//# sourceMappingURL=redeemGrantCode.js.map