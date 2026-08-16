// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Admin repository & Firestore integration
// ─────────────────────────────────────────────────────────────

import { IS_DEV_BYPASS } from './env';
import type {
  Product,
  ServiceProvider,
  ServiceBooking,
  PetMeetup,
  ForumQuestion,
  LostPetAlert,
} from '@furr/core';

export interface VetApplicant {
  id: string;
  name: string;
  regNumber: string;
  email: string;
  phone: string;
  district: string;
  clinicAffiliation: string;
  specialization: string;
  yearsOfExperience: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: { type: string; name: string; url: string }[];
  rejectionReason?: string;
}

export interface ClinicRegistration {
  id: string;
  name: string;
  regNumber: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  type: '24/7 Emergency Hospital' | 'Specialty Surgical Center' | 'General Practice' | 'Dental & Wellness';
  operatingHours: string;
  staffCount: number;
  status: 'active' | 'pending_verification' | 'suspended';
  chiefMedicalOfficer: string;
  emergencyIntakeReady: boolean;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  city: string;
  address: string;
  total: number;
  items: { productId: string; name: string; quantity: number; price: number }[];
  paymentMethod: 'Cash on Delivery' | 'Card' | 'Bank Transfer';
  status: 'placed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  createdAt: string;
}

export interface DisputeTicket {
  id: string;
  type: 'marketplace_order' | 'service_booking' | 'user_conduct';
  referenceId: string;
  complainantName: string;
  complainantRole: 'owner' | 'vet' | 'provider';
  defendantName: string;
  reason: string;
  amount?: number;
  status: 'open' | 'under_review' | 'resolved' | 'dismissed';
  evidenceUrls: string[];
  createdAt: string;
  resolutionNotes?: string;
}

export interface AdminUserAccount {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'owner' | 'vet' | 'clinic_staff' | 'admin';
  status: 'ACTIVE' | 'SUSPENDED' | 'FLAGGED';
  lastLogin: string;
  petsCount?: number;
  joinedDate: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  action: string;
  category: 'VET' | 'CLINIC' | 'MARKETPLACE' | 'SERVICES' | 'COMMUNITY' | 'USER' | 'FINANCE' | 'SECURITY';
  details: string;
}

export interface VendorPayout {
  id: string;
  vendorId: string;
  vendorName: string;
  type: 'marketplace' | 'service';
  period: string;
  grossRevenue: number;
  platformFee: number;
  netPayout: number;
  bankAccount: string;
  status: 'pending' | 'processing' | 'settled';
}

// ── Initial Mock Data for Dev Bypass ─────────────────────────

export const INITIAL_ADMIN_VETS: VetApplicant[] = [
  {
    id: 'vet_req_001',
    name: 'Dr. Emily Chen',
    regNumber: 'SLVC-88321',
    email: 'emily.chen@example.com',
    phone: '+94 77 123 4567',
    district: 'Kandy',
    clinicAffiliation: 'Hill Country Pet Hospital',
    specialization: 'Small Animal Internal Medicine',
    yearsOfExperience: 7,
    submittedAt: '2026-08-14T10:30:00Z',
    status: 'pending',
    documents: [
      { type: 'SLVC License', name: 'slvc_license_chen.pdf', url: '#' },
      { type: 'BVSc Degree', name: 'peradeniya_bvsc_chen.pdf', url: '#' },
    ],
  },
  {
    id: 'vet_req_002',
    name: 'Dr. Michael Perera',
    regNumber: 'SLVC-44910',
    email: 'm.perera@example.com',
    phone: '+94 71 987 6543',
    district: 'Colombo',
    clinicAffiliation: 'Colombo Animal Specialty Center',
    specialization: 'Orthopedic & Soft Tissue Surgery',
    yearsOfExperience: 12,
    submittedAt: '2026-08-13T14:20:00Z',
    status: 'pending',
    documents: [
      { type: 'SLVC License', name: 'slvc_license_perera.pdf', url: '#' },
      { type: 'Surgery Certification', name: 'surgical_accreditation.pdf', url: '#' },
    ],
  },
  {
    id: 'vet_req_003',
    name: 'Dr. Sarah Smith',
    regNumber: 'SLVC-11002',
    email: 'dr.smith@example.com',
    phone: '+94 76 555 1212',
    district: 'Colombo',
    clinicAffiliation: 'Furr Central Veterinary Hospital',
    specialization: 'Emergency & Critical Care',
    yearsOfExperience: 9,
    submittedAt: '2026-08-01T09:00:00Z',
    status: 'approved',
    documents: [
      { type: 'SLVC License', name: 'slvc_license_smith.pdf', url: '#' },
    ],
  },
];

export const INITIAL_ADMIN_CLINICS: ClinicRegistration[] = [
  {
    id: 'clinic_001',
    name: 'Colombo Central Animal Hospital',
    regNumber: 'CLIN-COL-0091',
    district: 'Colombo',
    address: '142 Havelock Road, Colombo 05',
    phone: '+94 11 258 9900',
    email: 'operations@colombovet.lk',
    type: '24/7 Emergency Hospital',
    operatingHours: '24 Hours / 7 Days',
    staffCount: 14,
    status: 'active',
    chiefMedicalOfficer: 'Dr. Sarah Smith',
    emergencyIntakeReady: true,
  },
  {
    id: 'clinic_002',
    name: 'Kandy Hill Country Vet Clinic',
    regNumber: 'CLIN-KDY-0044',
    district: 'Kandy',
    address: '78 Peradeniya Road, Kandy',
    phone: '+94 81 223 4567',
    email: 'info@kandyvetclinic.lk',
    type: 'General Practice',
    operatingHours: '08:00 - 20:00',
    staffCount: 6,
    status: 'active',
    chiefMedicalOfficer: 'Dr. Emily Chen',
    emergencyIntakeReady: false,
  },
  {
    id: 'clinic_003',
    name: 'Galle Coastal Surgical Facility',
    regNumber: 'CLIN-GAL-0018',
    district: 'Galle',
    address: '22 Matara Road, Galle',
    phone: '+94 91 438 8800',
    email: 'contact@gallevetcenter.lk',
    type: 'Specialty Surgical Center',
    operatingHours: '09:00 - 18:00',
    staffCount: 8,
    status: 'pending_verification',
    chiefMedicalOfficer: 'Dr. Rohan De Silva',
    emergencyIntakeReady: true,
  },
];

export const INITIAL_ADMIN_ORDERS: AdminOrder[] = [
  {
    id: 'ORD-9421',
    customerName: 'Amara Perera',
    customerPhone: '+94 77 222 3344',
    customerEmail: 'amara.p@gmail.com',
    city: 'Colombo 07',
    address: "45 Gregory's Road, Colombo 07",
    total: 11900,
    items: [
      { productId: 'prod-1', name: 'Royal Canin Maxi Adult Dry Dog Food', quantity: 1, price: 8500 },
      { productId: 'prod-5', name: 'Organic Aloe Vera & Oatmeal Shampoo', quantity: 1, price: 3400 },
    ],
    paymentMethod: 'Cash on Delivery',
    status: 'out_for_delivery',
    trackingNumber: 'PRL-COL-88219',
    createdAt: '2026-08-16T08:15:00Z',
  },
  {
    id: 'ORD-9420',
    customerName: 'Kasun Silva',
    customerPhone: '+94 71 888 9900',
    customerEmail: 'kasun.silva@yahoo.com',
    city: 'Kandy',
    address: '12 Rajapihilla Mawatha, Kandy',
    total: 4800,
    items: [
      { productId: 'prod-3', name: 'Simparica Trio Chewable Tablets', quantity: 1, price: 4800 },
    ],
    paymentMethod: 'Card',
    status: 'processing',
    trackingNumber: 'PRL-KDY-10029',
    createdAt: '2026-08-16T11:40:00Z',
  },
  {
    id: 'ORD-9419',
    customerName: 'Dilani Fernando',
    customerPhone: '+94 76 333 4455',
    customerEmail: 'dilani.f@hotmail.com',
    city: 'Gampaha',
    address: '88 Negombo Road, Gampaha',
    total: 8500,
    items: [
      { productId: 'prod-1', name: 'Royal Canin Maxi Adult Dry Dog Food', quantity: 1, price: 8500 },
    ],
    paymentMethod: 'Cash on Delivery',
    status: 'delivered',
    trackingNumber: 'PRL-GMP-44911',
    createdAt: '2026-08-15T14:20:00Z',
  },
];

export const INITIAL_ADMIN_DISPUTES: DisputeTicket[] = [
  {
    id: 'DISP-101',
    type: 'marketplace_order',
    referenceId: 'ORD-9419',
    complainantName: 'Dilani Fernando',
    complainantRole: 'owner',
    defendantName: 'Colombo Pet Mart (Vendor)',
    reason: 'Bag outer packaging torn during transit; food unsealed.',
    amount: 8500,
    status: 'under_review',
    evidenceUrls: ['https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400'],
    createdAt: '2026-08-16T09:00:00Z',
  },
  {
    id: 'DISP-102',
    type: 'service_booking',
    referenceId: 'book-1',
    complainantName: 'Saman Wickramasinghe',
    complainantRole: 'owner',
    defendantName: 'Paws & Bubbles Mobile Grooming',
    reason: 'Groomer arrived 45 minutes late without prior notice.',
    amount: 1500,
    status: 'open',
    evidenceUrls: [],
    createdAt: '2026-08-15T18:30:00Z',
  },
];

export const INITIAL_ADMIN_USERS: AdminUserAccount[] = [
  { id: 'usr_81920', name: 'Kavindu Deshappriya', phone: '+94770000001', email: 'kavindu@example.com', role: 'owner', status: 'ACTIVE', lastLogin: '2026-08-16T19:00:00Z', petsCount: 2, joinedDate: '2026-01-10' },
  { id: 'usr_11929', name: 'Dr. Sarah Smith', email: 'dr.smith@example.com', phone: '+94765551212', role: 'vet', status: 'ACTIVE', lastLogin: '2026-08-16T15:30:00Z', joinedDate: '2026-02-15' },
  { id: 'usr_55912', name: 'Chaminda Rathnayake', phone: '+94710000002', email: 'chaminda.r@gmail.com', role: 'owner', status: 'SUSPENDED', lastLogin: '2026-07-20T10:00:00Z', petsCount: 1, joinedDate: '2026-03-01' },
  { id: 'usr_99102', name: 'Paws & Bubbles Operator', email: 'support@pawsandbubbles.lk', phone: '+94772345678', role: 'clinic_staff', status: 'ACTIVE', lastLogin: '2026-08-16T12:00:00Z', joinedDate: '2026-04-12' },
  { id: 'usr_admin_01', name: 'Platform Admin', email: 'admin@furr.lk', phone: '+94119998888', role: 'admin', status: 'ACTIVE', lastLogin: '2026-08-16T22:00:00Z', joinedDate: '2025-12-01' },
];

export const INITIAL_ADMIN_PAYOUTS: VendorPayout[] = [
  { id: 'PAY-801', vendorId: 'vendor-1', vendorName: 'Colombo Pet Mart', type: 'marketplace', period: 'Aug 01 - Aug 15', grossRevenue: 485000, platformFee: 48500, netPayout: 436500, bankAccount: 'Commercial Bank ···· 4901', status: 'pending' },
  { id: 'PAY-802', vendorId: 'vendor-2', vendorName: 'Central Vet Pharmacy', type: 'marketplace', period: 'Aug 01 - Aug 15', grossRevenue: 312000, platformFee: 31200, netPayout: 280800, bankAccount: 'Sampath Bank ···· 8112', status: 'settled' },
  { id: 'PAY-803', vendorId: 'prov-1', vendorName: 'Paws & Bubbles Mobile Grooming', type: 'service', period: 'Aug 01 - Aug 15', grossRevenue: 185000, platformFee: 18500, netPayout: 166500, bankAccount: 'HNB ···· 2290', status: 'pending' },
];

export const INITIAL_ADMIN_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'log-1', timestamp: '2026-08-16T21:40:00Z', adminName: 'Platform Admin', adminEmail: 'admin@furr.lk', action: 'Approved Vet Applicant', category: 'VET', details: 'Dr. Sarah Smith (SLVC-11002) granted verified practitioner credentials.' },
  { id: 'log-2', timestamp: '2026-08-16T18:15:00Z', adminName: 'Platform Admin', adminEmail: 'admin@furr.lk', action: 'Order Status Updated', category: 'MARKETPLACE', details: 'ORD-9421 dispatched with tracking code PRL-COL-88219.' },
  { id: 'log-3', timestamp: '2026-08-16T14:30:00Z', adminName: 'Platform Admin', adminEmail: 'admin@furr.lk', action: 'Suspended Abusive Account', category: 'USER', details: 'Account usr_55912 suspended due to repeated spam reports.' },
  { id: 'log-4', timestamp: '2026-08-16T10:05:00Z', adminName: 'Platform Admin', adminEmail: 'admin@furr.lk', action: 'Amber Alert Broadcasted', category: 'COMMUNITY', details: 'Broadcasted Lost Pet alert for "Max" across Colombo 03 radius.' },
];

// ── Firestore Subscription & Mutation Functions ────────────────

export function subscribeToAdminVets(onUpdate: (vets: VetApplicant[]) => void): () => void {
  if (IS_DEV_BYPASS) {
    onUpdate(INITIAL_ADMIN_VETS);
    return () => {};
  }
  let unsubscribe: (() => void) | undefined;
  void (async () => {
    try {
      const { getFirestore, collection, query, orderBy, onSnapshot } = await import('firebase/firestore');
      const q = query(collection(getFirestore(), 'admin_vet_applications'), orderBy('submittedAt', 'desc'));
      unsubscribe = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          onUpdate(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        } else {
          onUpdate(INITIAL_ADMIN_VETS);
        }
      });
    } catch {
      onUpdate(INITIAL_ADMIN_VETS);
    }
  })();
  return () => { if (unsubscribe) unsubscribe(); };
}

export async function updateAdminVetStatus(id: string, status: 'approved' | 'rejected', reason?: string): Promise<void> {
  if (IS_DEV_BYPASS) return;
  const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(getFirestore(), 'admin_vet_applications', id), {
    status,
    rejectionReason: reason || null,
    reviewedAt: new Date().toISOString(),
  });
}

export function subscribeToAdminClinics(onUpdate: (clinics: ClinicRegistration[]) => void): () => void {
  if (IS_DEV_BYPASS) {
    onUpdate(INITIAL_ADMIN_CLINICS);
    return () => {};
  }
  let unsubscribe: (() => void) | undefined;
  void (async () => {
    try {
      const { getFirestore, collection, onSnapshot } = await import('firebase/firestore');
      unsubscribe = onSnapshot(collection(getFirestore(), 'admin_clinics'), (snap) => {
        if (!snap.empty) {
          onUpdate(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        } else {
          onUpdate(INITIAL_ADMIN_CLINICS);
        }
      });
    } catch {
      onUpdate(INITIAL_ADMIN_CLINICS);
    }
  })();
  return () => { if (unsubscribe) unsubscribe(); };
}

export async function saveAdminClinic(clinic: Omit<ClinicRegistration, 'id'> & { id?: string }): Promise<void> {
  if (IS_DEV_BYPASS) return;
  const { getFirestore, collection, doc, setDoc } = await import('firebase/firestore');
  const db = getFirestore();
  const id = clinic.id || `clinic_${Date.now()}`;
  await setDoc(doc(db, 'admin_clinics', id), { ...clinic, id }, { merge: true });
}

export function subscribeToAdminAuditLogs(onUpdate: (logs: AuditLogEntry[]) => void): () => void {
  if (IS_DEV_BYPASS) {
    onUpdate(INITIAL_ADMIN_AUDIT_LOGS);
    return () => {};
  }
  let unsubscribe: (() => void) | undefined;
  void (async () => {
    try {
      const { getFirestore, collection, query, orderBy, limit, onSnapshot } = await import('firebase/firestore');
      const q = query(collection(getFirestore(), 'admin_audit_logs'), orderBy('timestamp', 'desc'), limit(100));
      unsubscribe = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          onUpdate(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        } else {
          onUpdate(INITIAL_ADMIN_AUDIT_LOGS);
        }
      });
    } catch {
      onUpdate(INITIAL_ADMIN_AUDIT_LOGS);
    }
  })();
  return () => { if (unsubscribe) unsubscribe(); };
}

export async function recordAdminAuditLog(entry: Omit<AuditLogEntry, 'id'>): Promise<void> {
  if (IS_DEV_BYPASS) return;
  const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
  await addDoc(collection(getFirestore(), 'admin_audit_logs'), {
    ...entry,
    serverTimestamp: serverTimestamp(),
  });
}
