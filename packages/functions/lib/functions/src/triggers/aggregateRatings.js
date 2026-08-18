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
exports.onReviewCreatedOrUpdated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
/**
 * Event Trigger: Recalculates average rating and review count when a review is created or updated.
 */
exports.onReviewCreatedOrUpdated = (0, firestore_1.onDocumentWritten)('reviews/{reviewId}', async (event) => {
    const after = event.data?.after;
    const before = event.data?.before;
    const data = after?.exists ? after.data() : before?.data();
    if (!data)
        return;
    const { targetId, targetType } = data;
    if (!targetId || !targetType)
        return;
    const db = admin.firestore();
    // Query all published reviews for this target
    const snap = await db
        .collection('reviews')
        .where('targetId', '==', targetId)
        .where('status', '==', 'published')
        .get();
    const count = snap.size;
    let sum = 0;
    snap.forEach((doc) => {
        sum += doc.data().rating || 0;
    });
    const averageRating = count > 0 ? Number((sum / count).toFixed(1)) : 0;
    // Update target document
    if (targetType === 'product') {
        await db.collection('marketplace_products').doc(targetId).set({
            rating: averageRating,
            reviewCount: count,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
    else if (targetType === 'provider') {
        await db.collection('service_providers').doc(targetId).set({
            rating: averageRating,
            reviewCount: count,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
});
//# sourceMappingURL=aggregateRatings.js.map