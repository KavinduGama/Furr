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
exports.onOrderStatusUpdated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
const expoPush_1 = require("../utils/expoPush");
exports.onOrderStatusUpdated = (0, firestore_1.onDocumentUpdated)('marketplace_orders/{orderId}', async (event) => {
    const change = event.data;
    if (!change)
        return;
    const before = change.before.data();
    const after = change.after.data();
    if (!before || !after)
        return;
    if (before.status === after.status)
        return;
    const ownerUid = after.ownerUid;
    if (!ownerUid)
        return;
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(ownerUid).get();
    const pushToken = userDoc.data()?.expoPushToken;
    if (!pushToken)
        return;
    let title = '📦 Order Update';
    let body = `Your order ${event.params.orderId} status is now ${after.status}.`;
    if (after.status === 'out_for_delivery') {
        title = '🚚 Out for Delivery!';
        body = `Your Furr marketplace order ${event.params.orderId} is out for delivery with courier tracking: ${after.trackingNumber || 'En route'}.`;
    }
    else if (after.status === 'delivered') {
        title = '🎉 Order Delivered!';
        body = `Your order ${event.params.orderId} has been successfully delivered. Thank you for shopping with Furr!`;
    }
    await (0, expoPush_1.sendExpoPushNotifications)([
        {
            to: pushToken,
            title,
            body,
            data: {
                type: 'ORDER_UPDATE',
                orderId: event.params.orderId,
                status: after.status,
            },
            sound: 'default',
        },
    ]);
});
//# sourceMappingURL=orderDispatchedNotification.js.map