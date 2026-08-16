'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, ServiceProvider, ServiceBooking, PetMeetup, ForumQuestion, LostPetAlert } from '@furr/core';
import {
  INITIAL_PRODUCTS,
  INITIAL_PROVIDERS,
  INITIAL_BOOKINGS,
  INITIAL_MEETUPS,
  INITIAL_QUESTIONS,
  INITIAL_LOST_ALERTS,
} from '@furr/firebase';

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

interface AdminContextType {
  // Current admin profile
  adminUser: { name: string; email: string; role: string };
  setAdminUser: (u: { name: string; email: string; role: string }) => void;

  // Vet Desk
  vets: VetApplicant[];
  approveVet: (id: string) => void;
  rejectVet: (id: string, reason: string) => void;

  // Clinics Desk
  clinics: ClinicRegistration[];
  approveClinic: (id: string) => void;
  suspendClinic: (id: string) => void;
  addClinic: (clinic: Omit<ClinicRegistration, 'id'>) => void;

  // Marketplace & Inventory
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProductStock: (id: string, newStock: number) => void;
  toggleProductFeatured: (id: string) => void;
  deleteProduct: (id: string) => void;

  // Orders
  orders: AdminOrder[];
  updateOrderStatus: (orderId: string, status: AdminOrder['status'], tracking?: string) => void;

  // Services Desk
  providers: ServiceProvider[];
  toggleVerifyProvider: (id: string) => void;
  bookings: ServiceBooking[];
  updateBookingStatus: (id: string, status: ServiceBooking['status']) => void;

  // Community Desk
  meetups: PetMeetup[];
  toggleSponsorMeetup: (id: string) => void;
  questions: ForumQuestion[];
  deleteQuestion: (id: string) => void;
  lostAlerts: LostPetAlert[];
  resolveLostAlert: (id: string) => void;

  // Disputes & Moderation
  disputes: DisputeTicket[];
  resolveDispute: (id: string, resolutionNotes: string, action: 'refund' | 'dismiss' | 'resolve') => void;

  // Users Desk
  users: AdminUserAccount[];
  toggleUserStatus: (userId: string) => void;
  changeUserRole: (userId: string, newRole: AdminUserAccount['role']) => void;

  // Payouts & Finance
  payouts: VendorPayout[];
  settlePayout: (id: string) => void;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: string, category: AuditLogEntry['category'], details: string) => void;
}

const INITIAL_VETS: VetApplicant[] = [
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

const INITIAL_CLINICS: ClinicRegistration[] = [
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

const INITIAL_ORDERS: AdminOrder[] = [
  {
    id: 'ORD-9421',
    customerName: 'Amara Perera',
    customerPhone: '+94 77 222 3344',
    customerEmail: 'amara.p@gmail.com',
    city: 'Colombo 07',
    address: '45 Gregory\'s Road, Colombo 07',
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
  {
    id: 'ORD-9418',
    customerName: 'Nimal Jayawardena',
    customerPhone: '+94 70 111 2233',
    customerEmail: 'nimal.j@gmail.com',
    city: 'Mount Lavinia',
    address: '5 Hotel Road, Mount Lavinia',
    total: 2800,
    items: [
      { productId: 'prod-4', name: 'KONG Classic Dog Toy', quantity: 1, price: 2800 },
    ],
    paymentMethod: 'Card',
    status: 'placed',
    createdAt: '2026-08-16T15:10:00Z',
  },
];

const INITIAL_DISPUTES: DisputeTicket[] = [
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

const INITIAL_USERS: AdminUserAccount[] = [
  { id: 'usr_81920', name: 'Kavindu Deshappriya', phone: '+94770000001', email: 'kavindu@example.com', role: 'owner', status: 'ACTIVE', lastLogin: '2026-08-16T19:00:00Z', petsCount: 2, joinedDate: '2026-01-10' },
  { id: 'usr_11929', name: 'Dr. Sarah Smith', email: 'dr.smith@example.com', phone: '+94765551212', role: 'vet', status: 'ACTIVE', lastLogin: '2026-08-16T15:30:00Z', joinedDate: '2026-02-15' },
  { id: 'usr_55912', name: 'Chaminda Rathnayake', phone: '+94710000002', email: 'chaminda.r@gmail.com', role: 'owner', status: 'SUSPENDED', lastLogin: '2026-07-20T10:00:00Z', petsCount: 1, joinedDate: '2026-03-01' },
  { id: 'usr_99102', name: 'Paws & Bubbles Operator', email: 'support@pawsandbubbles.lk', phone: '+94772345678', role: 'clinic_staff', status: 'ACTIVE', lastLogin: '2026-08-16T12:00:00Z', joinedDate: '2026-04-12' },
  { id: 'usr_admin_01', name: 'Platform Admin', email: 'admin@furr.lk', phone: '+94119998888', role: 'admin', status: 'ACTIVE', lastLogin: '2026-08-16T22:00:00Z', joinedDate: '2025-12-01' },
];

const INITIAL_PAYOUTS: VendorPayout[] = [
  { id: 'PAY-801', vendorId: 'vendor-1', vendorName: 'Colombo Pet Mart', type: 'marketplace', period: 'Aug 01 - Aug 15', grossRevenue: 485000, platformFee: 48500, netPayout: 436500, bankAccount: 'Commercial Bank ···· 4901', status: 'pending' },
  { id: 'PAY-802', vendorId: 'vendor-2', vendorName: 'Central Vet Pharmacy', type: 'marketplace', period: 'Aug 01 - Aug 15', grossRevenue: 312000, platformFee: 31200, netPayout: 280800, bankAccount: 'Sampath Bank ···· 8112', status: 'settled' },
  { id: 'PAY-803', vendorId: 'prov-1', vendorName: 'Paws & Bubbles Mobile Grooming', type: 'service', period: 'Aug 01 - Aug 15', grossRevenue: 185000, platformFee: 18500, netPayout: 166500, bankAccount: 'HNB ···· 2290', status: 'pending' },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'log-1', timestamp: '2026-08-16T21:40:00Z', adminName: 'Platform Admin', adminEmail: 'admin@furr.lk', action: 'Approved Vet Applicant', category: 'VET', details: 'Dr. Sarah Smith (SLVC-11002) granted verified practitioner credentials.' },
  { id: 'log-2', timestamp: '2026-08-16T18:15:00Z', adminName: 'Platform Admin', adminEmail: 'admin@furr.lk', action: 'Order Status Updated', category: 'MARKETPLACE', details: 'ORD-9421 dispatched with tracking code PRL-COL-88219.' },
  { id: 'log-3', timestamp: '2026-08-16T14:30:00Z', adminName: 'Platform Admin', adminEmail: 'admin@furr.lk', action: 'Suspended Abusive Account', category: 'USER', details: 'Account usr_55912 suspended due to repeated spam reports.' },
  { id: 'log-4', timestamp: '2026-08-16T10:05:00Z', adminName: 'Platform Admin', adminEmail: 'admin@furr.lk', action: 'Amber Alert Broadcasted', category: 'COMMUNITY', details: 'Broadcasted Lost Pet alert for "Max" across Colombo 03 radius.' },
];

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState({
    name: 'Super Administrator',
    email: 'admin@furr.lk',
    role: 'Global Platform Admin',
  });

  const [vets, setVets] = useState<VetApplicant[]>(INITIAL_VETS);
  const [clinics, setClinics] = useState<ClinicRegistration[]>(INITIAL_CLINICS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const [providers, setProviders] = useState<ServiceProvider[]>(INITIAL_PROVIDERS);
  const [bookings, setBookings] = useState<ServiceBooking[]>(INITIAL_BOOKINGS);
  const [meetups, setMeetups] = useState<PetMeetup[]>(INITIAL_MEETUPS);
  const [questions, setQuestions] = useState<ForumQuestion[]>(INITIAL_QUESTIONS);
  const [lostAlerts, setLostAlerts] = useState<LostPetAlert[]>(INITIAL_LOST_ALERTS);
  const [disputes, setDisputes] = useState<DisputeTicket[]>(INITIAL_DISPUTES);
  const [users, setUsers] = useState<AdminUserAccount[]>(INITIAL_USERS);
  const [payouts, setPayouts] = useState<VendorPayout[]>(INITIAL_PAYOUTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Load from local storage if available for persistence
  useEffect(() => {
    try {
      const savedVets = localStorage.getItem('furr_admin_vets');
      if (savedVets) setVets(JSON.parse(savedVets));
      const savedClinics = localStorage.getItem('furr_admin_clinics');
      if (savedClinics) setClinics(JSON.parse(savedClinics));
      const savedProducts = localStorage.getItem('furr_admin_products');
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      const savedOrders = localStorage.getItem('furr_admin_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      const savedLogs = localStorage.getItem('furr_admin_logs');
      if (savedLogs) setAuditLogs(JSON.parse(savedLogs));
    } catch {
      // ignore
    }
  }, []);

  const addAuditLog = (action: string, category: AuditLogEntry['category'], details: string) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminName: adminUser.name,
      adminEmail: adminUser.email,
      action,
      category,
      details,
    };
    setAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      try { localStorage.setItem('furr_admin_logs', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const approveVet = (id: string) => {
    setVets((prev) => {
      const vet = prev.find((v) => v.id === id);
      const updated = prev.map((v) => (v.id === id ? { ...v, status: 'approved' as const } : v));
      try { localStorage.setItem('furr_admin_vets', JSON.stringify(updated)); } catch {}
      if (vet) {
        addAuditLog('Approved Vet Application', 'VET', `Verified ${vet.name} (${vet.regNumber}) for ${vet.district}.`);
      }
      return updated;
    });
  };

  const rejectVet = (id: string, reason: string) => {
    setVets((prev) => {
      const vet = prev.find((v) => v.id === id);
      const updated = prev.map((v) => (v.id === id ? { ...v, status: 'rejected' as const, rejectionReason: reason } : v));
      try { localStorage.setItem('furr_admin_vets', JSON.stringify(updated)); } catch {}
      if (vet) {
        addAuditLog('Rejected Vet Application', 'VET', `Rejected ${vet.name} (${vet.regNumber}). Reason: ${reason}`);
      }
      return updated;
    });
  };

  const approveClinic = (id: string) => {
    setClinics((prev) => {
      const clinic = prev.find((c) => c.id === id);
      const updated = prev.map((c) => (c.id === id ? { ...c, status: 'active' as const } : c));
      try { localStorage.setItem('furr_admin_clinics', JSON.stringify(updated)); } catch {}
      if (clinic) {
        addAuditLog('Approved Clinic Accreditation', 'CLINIC', `Accredited ${clinic.name} (${clinic.regNumber}) in ${clinic.district}.`);
      }
      return updated;
    });
  };

  const suspendClinic = (id: string) => {
    setClinics((prev) => {
      const clinic = prev.find((c) => c.id === id);
      const updated = prev.map((c) => (c.id === id ? { ...c, status: 'suspended' as const } : c));
      try { localStorage.setItem('furr_admin_clinics', JSON.stringify(updated)); } catch {}
      if (clinic) {
        addAuditLog('Suspended Clinic License', 'CLINIC', `Suspended operations for ${clinic.name}.`);
      }
      return updated;
    });
  };

  const addClinic = (clinicData: Omit<ClinicRegistration, 'id'>) => {
    const newClinic: ClinicRegistration = {
      ...clinicData,
      id: `clinic_${Date.now()}`,
    };
    setClinics((prev) => {
      const updated = [newClinic, ...prev];
      try { localStorage.setItem('furr_admin_clinics', JSON.stringify(updated)); } catch {}
      addAuditLog('Registered New Clinic Facility', 'CLINIC', `Onboarded ${newClinic.name} (${newClinic.district}).`);
      return updated;
    });
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => {
      const updated = [newProd, ...prev];
      try { localStorage.setItem('furr_admin_products', JSON.stringify(updated)); } catch {}
      addAuditLog('Added Marketplace Product', 'MARKETPLACE', `Listed "${newProd.name}" at Rs ${newProd.price}.`);
      return updated;
    });
  };

  const updateProductStock = (id: string, newStock: number) => {
    setProducts((prev) => {
      const prod = prev.find((p) => p.id === id);
      const updated = prev.map((p) => (p.id === id ? { ...p, stock: newStock, inStock: newStock > 0 } : p));
      try { localStorage.setItem('furr_admin_products', JSON.stringify(updated)); } catch {}
      if (prod) {
        addAuditLog('Updated Product Stock', 'MARKETPLACE', `Adjusted "${prod.name}" inventory to ${newStock} units.`);
      }
      return updated;
    });
  };

  const toggleProductFeatured = (id: string) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p));
      try { localStorage.setItem('furr_admin_products', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const prod = prev.find((p) => p.id === id);
      const updated = prev.filter((p) => p.id !== id);
      try { localStorage.setItem('furr_admin_products', JSON.stringify(updated)); } catch {}
      if (prod) {
        addAuditLog('Removed Marketplace Product', 'MARKETPLACE', `Deleted product listing "${prod.name}".`);
      }
      return updated;
    });
  };

  const updateOrderStatus = (orderId: string, status: AdminOrder['status'], tracking?: string) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, status, trackingNumber: tracking || o.trackingNumber } : o));
      try { localStorage.setItem('furr_admin_orders', JSON.stringify(updated)); } catch {}
      addAuditLog('Updated Order Status', 'MARKETPLACE', `Order ${orderId} status set to ${status}.`);
      return updated;
    });
  };

  const toggleVerifyProvider = (id: string) => {
    setProviders((prev) => {
      const prov = prev.find((p) => p.id === id);
      const updated = prev.map((p) => (p.id === id ? { ...p, isVerified: !p.isVerified } : p));
      if (prov) {
        addAuditLog(prov.isVerified ? 'Revoked Provider Verification' : 'Verified Specialist Provider', 'SERVICES', `${prov.name} (${prov.category}).`);
      }
      return updated;
    });
  };

  const updateBookingStatus = (id: string, status: ServiceBooking['status']) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    addAuditLog('Updated Booking Status', 'SERVICES', `Booking ${id} set to ${status}.`);
  };

  const toggleSponsorMeetup = (id: string) => {
    setMeetups((prev) => prev.map((m) => (m.id === id ? { ...m, isSponsored: !m.isSponsored } : m)));
    addAuditLog('Toggled Meetup Sponsorship', 'COMMUNITY', `Meetup ${id} sponsorship status modified.`);
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    addAuditLog('Deleted Inappropriate Forum Question', 'COMMUNITY', `Deleted forum post ID: ${id}`);
  };

  const resolveLostAlert = (id: string) => {
    setLostAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'resolved' as const } : a)));
    addAuditLog('Resolved Lost Pet Amber Alert', 'COMMUNITY', `Marked alert ${id} as reunited/resolved.`);
  };

  const resolveDispute = (id: string, resolutionNotes: string, action: 'refund' | 'dismiss' | 'resolve') => {
    setDisputes((prev) => prev.map((d) => (d.id === id ? { ...d, status: action === 'dismiss' ? 'dismissed' : 'resolved', resolutionNotes } : d)));
    addAuditLog('Dispute Ticket Resolved', 'SECURITY', `Ticket ${id} resolved with action [${action}]: ${resolutionNotes}`);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) => {
      const user = prev.find((u) => u.id === userId);
      const updated = prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          return { ...u, status: nextStatus as AdminUserAccount['status'] };
        }
        return u;
      });
      if (user) {
        addAuditLog(user.status === 'ACTIVE' ? 'Suspended User Account' : 'Reactivated User Account', 'USER', `User ${user.id} (${user.email || user.phone}).`);
      }
      return updated;
    });
  };

  const changeUserRole = (userId: string, newRole: AdminUserAccount['role']) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    addAuditLog('Changed User Role', 'USER', `User ${userId} promoted/assigned to role: ${newRole}.`);
  };

  const settlePayout = (id: string) => {
    setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'settled' } : p)));
    addAuditLog('Settled Vendor Payout', 'FINANCE', `Payout ticket ${id} marked as settled.`);
  };

  return (
    <AdminContext.Provider
      value={{
        adminUser,
        setAdminUser,
        vets,
        approveVet,
        rejectVet,
        clinics,
        approveClinic,
        suspendClinic,
        addClinic,
        products,
        addProduct,
        updateProductStock,
        toggleProductFeatured,
        deleteProduct,
        orders,
        updateOrderStatus,
        providers,
        toggleVerifyProvider,
        bookings,
        updateBookingStatus,
        meetups,
        toggleSponsorMeetup,
        questions,
        deleteQuestion,
        lostAlerts,
        resolveLostAlert,
        disputes,
        resolveDispute,
        users,
        toggleUserStatus,
        changeUserRole,
        payouts,
        settlePayout,
        auditLogs,
        addAuditLog,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
