import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// ── Event Triggers ────────────────────────────────────────────
export { onLostPetAlertCreated } from './triggers/lostPetAmberAlert';
export { onTelehealthMessageSent } from './triggers/telehealthChatNotification';
export { onOrderStatusUpdated } from './triggers/orderDispatchedNotification';

// ── Callables ─────────────────────────────────────────────────
export { redeemGrantCode } from './callable/redeemGrantCode';

// ── Maintenance ───────────────────────────────────────────────
export { cleanupExpiredGrants } from './maintenance/grantExpiryCleaner';
