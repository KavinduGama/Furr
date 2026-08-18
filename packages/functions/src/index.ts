import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// ── Event Triggers ────────────────────────────────────────────
export { onLostPetAlertCreated } from './triggers/lostPetAmberAlert';
export { onTelehealthMessageSent } from './triggers/telehealthChatNotification';
export { onOrderStatusUpdated } from './triggers/orderDispatchedNotification';
export { onVetApplicationStatusChanged } from './triggers/verifyVetProfessional';
export { onFoundPetReportCreated } from './triggers/matchLostPets';
export { onCommunityQuestionCreated } from './triggers/moderateContent';
export { onReviewCreatedOrUpdated } from './triggers/aggregateRatings';

// ── Callables ─────────────────────────────────────────────────
export { redeemGrantCode } from './callable/redeemGrantCode';
export { writeAdminAuditLog } from './callable/auditLogWriter';
export { deleteUserAccount } from './callable/userDeletion';
export { generateHealthReport } from './callable/generateHealthReport';
export { handlePaymentWebhook } from './callable/handlePaymentWebhook';
export { processMarketplaceOrder } from './callable/processMarketplaceOrder';


// ── Maintenance Schedulers ────────────────────────────────────
export { cleanupExpiredGrants } from './maintenance/grantExpiryCleaner';
export { sendReminderNotifications } from './maintenance/sendReminderNotifications';
export { cleanupStalePushTokens } from './maintenance/expoPushTokenCleanup';
