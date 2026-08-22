import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

export interface AuditLogInput {
  action: string;
  category: 'VET' | 'CLINIC' | 'MARKETPLACE' | 'SERVICES' | 'COMMUNITY' | 'USER' | 'FINANCE' | 'SECURITY';
  details: string;
}

/**
 * Secure callable function to record tamper-proof administrator audit trail entries.
 * Enforces admin claim verification (HIGH-008) and collision-resistant IDs (LOW-005).
 */
export const writeAdminAuditLog = onCall<AuditLogInput>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }

  // Admin authorization check (HIGH-008)
  const isAdmin = request.auth.token?.admin === true || request.auth.token?.role === 'admin';
  if (!isAdmin) {
    throw new HttpsError(
      'permission-denied',
      'Only authorized administrators can record audit log entries.'
    );
  }

  const { action, category, details } = request.data;
  if (!action || !category || !details) {
    throw new HttpsError('invalid-argument', 'Missing required audit log parameters.');
  }

  const db = admin.firestore();
  const user = await admin.auth().getUser(request.auth.uid).catch(() => null);
  const logUuid = crypto.randomUUID();

  const entry = {
    id: `log-${logUuid}`,
    timestamp: new Date().toISOString(),
    adminUid: request.auth.uid,
    adminName: user?.displayName || 'Administrator',
    adminEmail: user?.email || 'admin@furr.lk',
    action,
    category,
    details,
    serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = db.collection('admin_audit_logs').doc(entry.id);
  await docRef.set(entry);

  return { success: true, logId: entry.id };
});
