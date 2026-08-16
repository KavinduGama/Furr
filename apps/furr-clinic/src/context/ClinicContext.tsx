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

interface ClinicContextType {
  activeQueue: ClinicQueueItem[];
  appointments: ClinicAppointmentItem[];
  staff: ClinicStaffMember[];
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
