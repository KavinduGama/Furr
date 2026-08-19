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
exports.onLostPetAlertCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
const expoPush_1 = require("../utils/expoPush");
exports.onLostPetAlertCreated = (0, firestore_1.onDocumentCreated)('lost_pet_alerts/{alertId}', async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const alert = snap.data();
    if (!alert || alert.status !== 'active')
        return;
    const city = alert.lastSeenCity;
    const petName = alert.petName;
    const species = alert.species;
    // Query pet owners who have enabled notifications in this district (capped at 200 to prevent timeout - MED-021)
    const db = admin.firestore();
    const usersSnap = await db
        .collection('users')
        .where('district', '==', city)
        .where('notificationsEnabled', '==', true)
        .limit(200)
        .get();
    const pushTokens = [];
    usersSnap.forEach((doc) => {
        const data = doc.data();
        if (data.expoPushToken && data.uid !== alert.ownerUid) {
            pushTokens.push(data.expoPushToken);
        }
    });
    if (pushTokens.length === 0)
        return;
    const messages = pushTokens.map((token) => ({
        to: token,
        title: `🚨 LOST PET RADAR: ${petName} (${species})`,
        body: `A pet was just reported missing near ${alert.lastSeenAddress}, ${city}. Tap to view photo and details.`,
        data: {
            type: 'LOST_PET_ALERT',
            alertId: event.params.alertId,
            petName: alert.petName,
            city: alert.lastSeenCity,
        },
        sound: 'default',
        channelId: 'pet-care',
    }));
    await (0, expoPush_1.sendExpoPushNotifications)(messages);
});
//# sourceMappingURL=lostPetAmberAlert.js.map