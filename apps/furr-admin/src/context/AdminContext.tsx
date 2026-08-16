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
  INITIAL_ADMIN_VETS,
  INITIAL_ADMIN_CLINICS,
  INITIAL_ADMIN_ORDERS,
  INITIAL_ADMIN_DISPUTES,
  INITIAL_ADMIN_USERS,
  INITIAL_ADMIN_PAYOUTS,
  INITIAL_ADMIN_AUDIT_LOGS,
  subscribeToAdminVets,
  updateAdminVetStatus,
  subscribeToAdminClinics,
  saveAdminClinic,
  subscribeToAdminAuditLogs,
  recordAdminAuditLog,
  type VetApplicant,
  type ClinicRegistration,
  type AdminOrder,
  type DisputeTicket,
  type AdminUserAccount,
  type AuditLogEntry,
  type VendorPayout,
} from '@furr/firebase';

export type {
  VetApplicant,
  ClinicRegistration,
  AdminOrder,
  DisputeTicket,
  AdminUserAccount,
  AuditLogEntry,
  VendorPayout,
};

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

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState({
    name: 'Super Administrator',
    email: 'admin@furr.lk',
    role: 'Global Platform Admin',
  });

  const [vets, setVets] = useState<VetApplicant[]>(INITIAL_ADMIN_VETS);
  const [clinics, setClinics] = useState<ClinicRegistration[]>(INITIAL_ADMIN_CLINICS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ADMIN_ORDERS);
  const [providers, setProviders] = useState<ServiceProvider[]>(INITIAL_PROVIDERS);
  const [bookings, setBookings] = useState<ServiceBooking[]>(INITIAL_BOOKINGS);
  const [meetups, setMeetups] = useState<PetMeetup[]>(INITIAL_MEETUPS);
  const [questions, setQuestions] = useState<ForumQuestion[]>(INITIAL_QUESTIONS);
  const [lostAlerts, setLostAlerts] = useState<LostPetAlert[]>(INITIAL_LOST_ALERTS);
  const [disputes, setDisputes] = useState<DisputeTicket[]>(INITIAL_ADMIN_DISPUTES);
  const [users, setUsers] = useState<AdminUserAccount[]>(INITIAL_ADMIN_USERS);
  const [payouts, setPayouts] = useState<VendorPayout[]>(INITIAL_ADMIN_PAYOUTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_ADMIN_AUDIT_LOGS);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    const unsubVets = subscribeToAdminVets((data) => setVets(data));
    const unsubClinics = subscribeToAdminClinics((data) => setClinics(data));
    const unsubLogs = subscribeToAdminAuditLogs((data) => setAuditLogs(data));

    return () => {
      unsubVets();
      unsubClinics();
      unsubLogs();
    };
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
    setAuditLogs((prev) => [newLog, ...prev]);
    recordAdminAuditLog({
      timestamp: newLog.timestamp,
      adminName: newLog.adminName,
      adminEmail: newLog.adminEmail,
      action: newLog.action,
      category: newLog.category,
      details: newLog.details,
    }).catch(() => {});
  };

  const approveVet = (id: string) => {
    const vet = vets.find((v) => v.id === id);
    setVets((prev) => prev.map((v) => (v.id === id ? { ...v, status: 'approved' as const } : v)));
    updateAdminVetStatus(id, 'approved').catch(() => {});
    if (vet) {
      addAuditLog('Approved Vet Application', 'VET', `Verified ${vet.name} (${vet.regNumber}) for ${vet.district}.`);
    }
  };

  const rejectVet = (id: string, reason: string) => {
    const vet = vets.find((v) => v.id === id);
    setVets((prev) => prev.map((v) => (v.id === id ? { ...v, status: 'rejected' as const, rejectionReason: reason } : v)));
    updateAdminVetStatus(id, 'rejected', reason).catch(() => {});
    if (vet) {
      addAuditLog('Rejected Vet Application', 'VET', `Rejected ${vet.name} (${vet.regNumber}). Reason: ${reason}`);
    }
  };

  const approveClinic = (id: string) => {
    const clinic = clinics.find((c) => c.id === id);
    setClinics((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'active' as const } : c)));
    if (clinic) {
      saveAdminClinic({ ...clinic, status: 'active' }).catch(() => {});
      addAuditLog('Approved Clinic Accreditation', 'CLINIC', `Accredited ${clinic.name} (${clinic.regNumber}) in ${clinic.district}.`);
    }
  };

  const suspendClinic = (id: string) => {
    const clinic = clinics.find((c) => c.id === id);
    setClinics((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'suspended' as const } : c)));
    if (clinic) {
      saveAdminClinic({ ...clinic, status: 'suspended' }).catch(() => {});
      addAuditLog('Suspended Clinic License', 'CLINIC', `Suspended operations for ${clinic.name}.`);
    }
  };

  const addClinic = (clinicData: Omit<ClinicRegistration, 'id'>) => {
    const newClinic: ClinicRegistration = {
      ...clinicData,
      id: `clinic_${Date.now()}`,
    };
    setClinics((prev) => [newClinic, ...prev]);
    saveAdminClinic(newClinic).catch(() => {});
    addAuditLog('Registered New Clinic Facility', 'CLINIC', `Onboarded ${newClinic.name} (${newClinic.district}).`);
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    addAuditLog('Added Marketplace Product', 'MARKETPLACE', `Listed "${newProd.name}" at Rs ${newProd.price}.`);
  };

  const updateProductStock = (id: string, newStock: number) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: newStock, inStock: newStock > 0 } : p)));
    if (prod) {
      addAuditLog('Updated Product Stock', 'MARKETPLACE', `Adjusted "${prod.name}" inventory to ${newStock} units.`);
    }
  };

  const toggleProductFeatured = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p)));
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (prod) {
      addAuditLog('Removed Marketplace Product', 'MARKETPLACE', `Deleted product listing "${prod.name}".`);
    }
  };

  const updateOrderStatus = (orderId: string, status: AdminOrder['status'], tracking?: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status, trackingNumber: tracking || o.trackingNumber } : o)));
    addAuditLog('Updated Order Status', 'MARKETPLACE', `Order ${orderId} status set to ${status}.`);
  };

  const toggleVerifyProvider = (id: string) => {
    const prov = providers.find((p) => p.id === id);
    setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, isVerified: !p.isVerified } : p)));
    if (prov) {
      addAuditLog(prov.isVerified ? 'Revoked Provider Verification' : 'Verified Specialist Provider', 'SERVICES', `${prov.name} (${prov.category}).`);
    }
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
    const user = users.find((u) => u.id === userId);
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          return { ...u, status: nextStatus as AdminUserAccount['status'] };
        }
        return u;
      })
    );
    if (user) {
      addAuditLog(user.status === 'ACTIVE' ? 'Suspended User Account' : 'Reactivated User Account', 'USER', `User ${user.id} (${user.email || user.phone}).`);
    }
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
