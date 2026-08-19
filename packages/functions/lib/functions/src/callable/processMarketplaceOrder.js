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
exports.processMarketplaceOrder = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
/**
 * Callable Function: Atomically validates ownership, server-side prices, stock levels,
 * decrements inventory, and confirms marketplace order state (HIGH-006).
 */
exports.processMarketplaceOrder = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be authenticated to process marketplace orders');
    }
    const data = request.data;
    if (!data.orderId || !Array.isArray(data.items) || data.items.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'Valid orderId and items array are required');
    }
    // Ownership check (HIGH-006)
    const callerUid = request.auth.uid;
    const isAdmin = request.auth.token?.admin === true;
    if (data.ownerUid && data.ownerUid !== callerUid && !isAdmin) {
        throw new https_1.HttpsError('permission-denied', 'Cannot process orders on behalf of another user');
    }
    const db = admin.firestore();
    return await db.runTransaction(async (transaction) => {
        let computedSubtotal = 0;
        // 1. Verify stock and calculate genuine server-side prices for all items
        for (const item of data.items) {
            if (item.quantity <= 0) {
                throw new https_1.HttpsError('invalid-argument', `Invalid quantity for product ${item.productId}`);
            }
            const prodRef = db.collection('marketplace_products').doc(item.productId);
            const prodDoc = await transaction.get(prodRef);
            if (!prodDoc.exists) {
                throw new https_1.HttpsError('not-found', `Product not found: ${item.productId}`);
            }
            const prodData = prodDoc.data();
            const currentStock = prodData.stock ?? 0;
            const itemPrice = typeof prodData.price === 'number' ? prodData.price : 0;
            computedSubtotal += itemPrice * item.quantity;
            if (currentStock < item.quantity) {
                throw new https_1.HttpsError('failed-precondition', `Insufficient stock for ${prodData.name || item.productId}. Available: ${currentStock}`);
            }
            // Decrement stock
            const newStock = currentStock - item.quantity;
            transaction.update(prodRef, {
                stock: newStock,
                inStock: newStock > 0,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        // Compute standard delivery
        const deliveryFee = computedSubtotal >= 10000 || computedSubtotal === 0 ? 0 : 450;
        const computedTotal = computedSubtotal + deliveryFee;
        // 2. Update order status and record verified totals
        const orderRef = db.collection('marketplace_orders').doc(data.orderId);
        transaction.set(orderRef, {
            ownerUid: callerUid,
            subtotal: computedSubtotal,
            deliveryFee,
            total: computedTotal,
            status: 'confirmed',
            confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return {
            success: true,
            orderId: data.orderId,
            computedSubtotal,
            computedTotal,
            message: 'Order verified, prices calculated server-side, and inventory updated.',
        };
    });
});
//# sourceMappingURL=processMarketplaceOrder.js.map