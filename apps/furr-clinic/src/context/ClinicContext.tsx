'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  subscribeToClinicQueue,
  addClinicQueueItem,
  updateClinicQueueStatus,
  subscribeToClinicAppointments,
  updateClinicAppointmentStatus,
  subscribeToClinicStaff,
  INITIAL_CLINIC_QUEUE,
  INITIAL_CLINIC_APPOINTMENTS,
  INITIAL_CLINIC_STAFF,
  type ClinicQueueItem,
  type ClinicAppointmentItem,
  type ClinicStaffMember,
} from '@furr/firebase';

export type { ClinicQueueItem, ClinicAppointmentItem, ClinicStaffMember };

export interface ClinicBranch {
  id: string;
  name: string;
  code: string;
  location: string;
  city: string;
  phone: string;
}

export const CLINIC_BRANCHES: ClinicBranch[] = [
  {
    id: 'clb-01',
    name: 'Colombo Central Animal Hospital',
    code: 'CLB-01',
    location: '120 Galle Road, Colombo 03',
    city: 'Colombo',
    phone: '+94 11 234 5678',
  },
  {
    id: 'knd-02',
    name: 'Kandy Hill Country Pet Care',
    code: 'KND-02',
    location: '45 Peradeniya Road, Kandy',
    city: 'Kandy',
    phone: '+94 81 222 3456',
  },
  {
    id: 'gal-03',
    name: 'Galle Coastal Veterinary Center',
    code: 'GAL-03',
    location: '88 Matara Road, Galle',
    city: 'Galle',
    phone: '+94 91 223 7890',
  },
];

export interface ClinicOperator {
  name: string;
  email: string;
  role: 'Clinic Administrator' | 'Triage Nurse' | 'Reception & Intake Desk';
}

interface ClinicContextType {
  activeQueue: ClinicQueueItem[];
  appointments: ClinicAppointmentItem[];
  staff: ClinicStaffMember[];
  currentBranch: ClinicBranch;
  setBranch: (branch: ClinicBranch) => void;
  operator: ClinicOperator;
  setOperator: (op: ClinicOperator) => void;
  checkInPatient: (item: Omit<ClinicQueueItem, 'id'>) => Promise<ClinicQueueItem>;
  updateQueueStatus: (id: string, status: ClinicQueueItem['status'], room?: string, vet?: string) => Promise<void>;
  updateAppointment: (id: string, status: ClinicAppointmentItem['status']) => Promise<void>;
  stats: {
    activeCheckIns: number;
    scheduledToday: number;
    vetsOnDuty: number;
    surgeriesCompleted: number;
  };
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [activeQueue, setActiveQueue] = useState<ClinicQueueItem[]>(INITIAL_CLINIC_QUEUE);
  const [appointments, setAppointments] = useState<ClinicAppointmentItem[]>(INITIAL_CLINIC_APPOINTMENTS);
  const [staff, setStaff] = useState<ClinicStaffMember[]>(INITIAL_CLINIC_STAFF);
  const [currentBranch, setBranch] = useState<ClinicBranch>(CLINIC_BRANCHES[0]);
  const [operator, setOperator] = useState<ClinicOperator>({
    name: 'Nalinda Jayasuriya',
    email: 'admin@colombocentral.lk',
    role: 'Clinic Administrator',
  });

  useEffect(() => {
    const unsubQueue = subscribeToClinicQueue((data) => setActiveQueue(data));
    const unsubAppts = subscribeToClinicAppointments((data) => setAppointments(data));
    const unsubStaff = subscribeToClinicStaff((data) => setStaff(data));

    return () => {
      unsubQueue();
      unsubAppts();
      unsubStaff();
    };
  }, []);

  const checkInPatient = async (item: Omit<ClinicQueueItem, 'id'>) => {
    const created = await addClinicQueueItem(item);
    setActiveQueue((prev) => [created, ...prev]);
    return created;
  };

  const updateQueueStatus = async (
    id: string,
    status: ClinicQueueItem['status'],
    room?: string,
    vet?: string
  ) => {
    setActiveQueue((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status, room: room || q.room, assignedVet: vet || q.assignedVet } : q))
    );
    await updateClinicQueueStatus(id, status, room, vet);
  };

  const updateAppointment = async (id: string, status: ClinicAppointmentItem['status']) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    await updateClinicAppointmentStatus(id, status);
  };

  const stats = {
    activeCheckIns: activeQueue.filter((q) => q.status !== 'Ready for Discharge').length,
    scheduledToday: appointments.length,
    vetsOnDuty: staff.filter((s) => s.status === 'On Duty' || s.status === 'In Surgery').length,
    surgeriesCompleted: 2,
  };

  return (
    <ClinicContext.Provider
      value={{
        activeQueue,
        appointments,
        staff,
        currentBranch,
        setBranch,
        operator,
        setOperator,
        checkInPatient,
        updateQueueStatus,
        updateAppointment,
        stats,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
}
