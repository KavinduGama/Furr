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
exports.onTelehealthMessageSent = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
const expoPush_1 = require("../utils/expoPush");
exports.onTelehealthMessageSent = (0, firestore_1.onDocumentCreated)('telemedicine_messages/{msgId}', async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const msg = snap.data();
    if (!msg || !msg.consultationId)
        return;
    const db = admin.firestore();
    const consultSnap = await db.collection('telemedicine_consultations').doc(msg.consultationId).get();
    if (!consultSnap.exists)
        return;
    const consult = consultSnap.data();
    if (!consult)
        return;
    // Determine receiver: if sender is owner, receiver is vet. If sender is vet, receiver is owner.
    const receiverUid = msg.senderRole === 'owner' ? consult.vetUid : consult.ownerUid;
    if (!receiverUid)
        return;
    const userDoc = await db.collection('users').doc(receiverUid).get();
    const userData = userDoc.data();
    const pushToken = userData?.expoPushToken;
    if (!pushToken)
        return;
    await (0, expoPush_1.sendExpoPushNotifications)([
        {
            to: pushToken,
            title: `💬 New Message from ${msg.senderName}`,
            body: msg.text || (msg.imageUrls?.length ? 'Sent an attachment photo' : 'New consultation update'),
            data: {
                type: 'TELEHEALTH_MESSAGE',
                consultationId: msg.consultationId,
            },
            sound: 'default',
            channelId: 'pet-care',
        },
    ]);
});
//# sourceMappingURL=telehealthChatNotification.js.map