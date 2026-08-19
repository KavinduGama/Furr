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
exports.handlePaymentWebhook = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
exports.handlePaymentWebhook = (0, https_1.onCall)(async (request) => {
    const { intentId, transactionReference, provider = 'stripe', webhookSecret, signature } = request.data || {};
    if (!intentId) {
        throw new https_1.HttpsError('invalid-argument', 'Missing payment intentId');
    }
    const expectedSecret = process.env.PAYMENT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
    // Authorization check (CRIT-001 & CRIT-002)
    const isServerWebhook = Boolean(expectedSecret && (webhookSecret === expectedSecret || signature));
    const isUserAuth = Boolean(request.auth?.uid);
    if (!isServerWebhook && !isUserAuth) {
        throw new https_1.HttpsError('unauthenticated', 'Caller must be authenticated or provide a valid payment gateway signature');
    }
    const db = admin.firestore();
    const intentRef = db.collection('payment_intents').doc(intentId);
    // Execute all updates inside an atomic Firestore transaction (MED-008 & HIGH-014)
    const result = await db.runTransaction(async (transaction) => {
        const intentDoc = await transaction.get(intentRef);
        if (!intentDoc.exists) {
            throw new https_1.HttpsError('not-found', 'PaymentIntent not found');
        }
        const intent = intentDoc.data();
        // If client caller, ensure user owns the intent or is admin
        if (!isServerWebhook) {
            const isOwner = intent.customerUid === request.auth.uid;
            const isAdmin = request.auth.token?.admin === true;
            if (!isOwner && !isAdmin) {
                throw new https_1.HttpsError('permission-denied', 'You do not have permission to verify this payment intent');
            }
        }
        // Idempotency check (HIGH-014)
        if (intent.status === 'succeeded') {
            return {
                success: true,
                intentId,
                status: 'succeeded',
                completedAt: intent.completedAt || new Date().toISOString(),
                idempotent: true,
            };
        }
        const completedAt = new Date().toISOString();
        const txRef = transactionReference || 'tx_' + crypto.randomBytes(8).toString('hex');
        // 1. Update PaymentIntent
        transaction.update(intentRef, {
            status: 'succeeded',
            transactionReference: txRef,
            provider,
            completedAt,
            verifiedBy: isServerWebhook ? 'webhook_signature' : `auth_${request.auth.uid}`,
        });
        // 2. Post-payment automations based on purpose
        if (intent.purpose === 'subscription') {
            const tier = intent.metadata?.tier || 'plus';
            const customerUid = intent.customerUid;
            if (customerUid) {
                const userRef = db.collection('users').doc(customerUid);
                transaction.set(userRef, {
                    subscriptionTier: tier,
                    updatedAt: completedAt,
                }, { merge: true });
                // Deterministic invoice ID prevents duplicates
                const invoiceId = `inv_${intentId}`;
                const invoiceRef = db.collection(`users/${customerUid}/billing_history`).doc(invoiceId);
                transaction.set(invoiceRef, {
                    id: invoiceId,
                    userId: customerUid,
                    amount: intent.amount,
                    currency: intent.currency || 'LKR',
                    tier,
                    period: intent.metadata?.period || 'monthly',
                    paymentMethod: provider === 'stripe' ? 'Credit / Debit Card' : 'PayHere Digital Wallet',
                    transactionReference: txRef,
                    status: 'paid',
                    createdAt: completedAt,
                });
            }
        }
        else if (intent.purpose === 'marketplace_order') {
            const orderId = intent.metadata?.orderId;
            if (orderId) {
                const orderRef = db.collection('marketplace_orders').doc(orderId);
                transaction.set(orderRef, {
                    status: 'confirmed',
                    paymentStatus: 'paid',
                    transactionReference: txRef,
                    updatedAt: completedAt,
                }, { merge: true });
            }
        }
        else if (intent.purpose === 'service_booking') {
            const bookingId = intent.metadata?.bookingId;
            if (bookingId) {
                const bookingRef = db.collection('service_bookings').doc(bookingId);
                transaction.set(bookingRef, {
                    status: 'confirmed',
                    paymentStatus: 'paid',
                    transactionReference: txRef,
                    updatedAt: completedAt,
                }, { merge: true });
            }
        }
        return {
            success: true,
            intentId,
            status: 'succeeded',
            completedAt,
        };
    });
    return result;
});
//# sourceMappingURL=handlePaymentWebhook.js.map