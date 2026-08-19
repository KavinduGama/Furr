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
exports.cleanupExpiredGrants = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
/**
 * Runs once every 24 hours to automatically transition expired
 * temporary veterinary access grants to 'expired' status.
 * Handles batched writes in chunks of 400 to never exceed Firestore 500 limit (MED-004).
 */
exports.cleanupExpiredGrants = (0, scheduler_1.onSchedule)('every 24 hours', async () => {
    const db = admin.firestore();
    const now = new Date().toISOString();
    const grantsQuery = await db
        .collectionGroup('grants')
        .where('grantExpiresAt', '<', now)
        .where('status', 'in', ['active', 'redeemed'])
        .get();
    if (grantsQuery.empty) {
        console.log('No expired grants found during daily maintenance.');
        return;
    }
    const docs = grantsQuery.docs;
    const CHUNK_SIZE = 400;
    let totalExpired = 0;
    for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
        const chunk = docs.slice(i, i + CHUNK_SIZE);
        const batch = db.batch();
        chunk.forEach((doc) => {
            batch.update(doc.ref, {
                status: 'expired',
                expiredAt: now,
            });
            totalExpired++;
        });
        await batch.commit();
    }
    console.log(`Successfully expired ${totalExpired} access grants in ${Math.ceil(docs.length / CHUNK_SIZE)} batches.`);
});
//# sourceMappingURL=grantExpiryCleaner.js.map