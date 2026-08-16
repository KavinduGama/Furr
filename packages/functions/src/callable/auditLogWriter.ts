import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

export interface AuditLogInput {
  action: string;
  category: 'VET' | 'CLINIC' | 'MARKETPLACE' | 'SERVICES' | 'COMMUNITY' | 'USER' | 'FINANCE' | 'SECURITY';
  details: string;
}

/**
 * Secure callable function to record tamper-proof administrator audit trail entries.
 */
export const writeAdminAuditLog = onCall<AuditLogInput>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }

  const { action, category, details } = request.data;
  if (!action || !category || !details) {
    throw new HttpsError('invalid-argument', 'Missing required audit log parameters.');
  }

  const db = admin.firestore();
  const user = await admin.auth().getUser(request.auth.uid).catch(() => null);

  const entry = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    adminUid: request.auth.uid,
    adminName: user?.displayName || 'Administrator',
    adminEmail: user?.email || 'admin@furr.lk',
    action,
    category,
    details,
    serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await db.collection('admin_audit_logs').add(entry);
  return { success: true, logId: docRef.id };
});
