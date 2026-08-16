// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Clinic repository & Firestore integration
// ─────────────────────────────────────────────────────────────

import { IS_DEV_BYPASS } from './env';

export interface ClinicQueueItem {
  id: string;
  petName: string;
  species: string;
  ownerName: string;
  timeArrived: string;
  assignedVet: string;
  status: 'Waiting Area' | 'Triage / Vitals' | 'In Consultation' | 'In Surgery' | 'Ready for Discharge';
  room: string;
  reason: string;
  petId?: string;
  ownerUid?: string;
}

export interface ClinicAppointmentItem {
  id: string;
  petName: string;
  species: string;
  ownerName: string;
  ownerPhone: string;
  date: string;
  time: string;
  vetName: string;
  type: 'Vaccination' | 'General Checkup' | 'Dental Cleaning' | 'Surgery Follow-up' | 'Emergency Intake';
  status: 'Confirmed' | 'Admitted' | 'Completed' | 'Cancelled';
}

export interface ClinicStaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  shift: string;
  status: 'On Duty' | 'In Surgery' | 'Break' | 'Off Duty';
  casesToday: number;
  phone: string;
}

// ── Initial Mock Data for Dev Bypass ─────────────────────────

export const INITIAL_CLINIC_QUEUE: ClinicQueueItem[] = [
  {
    id: 'Q-101',
    petName: 'Milo',
    species: 'Dog (Golden Retriever)',
    ownerName: 'Sunil Jayawardena',
    timeArrived: '09:15 AM',
    assignedVet: 'Dr. Sarah Smith',
    status: 'In Consultation',
    room: 'Room 2',
    reason: 'Routine Vaccination & Heartworm Check',
    petId: 'pet-milo-01',
  },
  {
    id: 'Q-102',
    petName: 'Bella',
    species: 'Cat (Persian)',
    ownerName: 'Ananya Fernando',
    timeArrived: '09:40 AM',
    assignedVet: 'Dr. Emily Chen',
    status: 'Triage / Vitals',
    room: 'Triage Bay A',
    reason: 'Lethargy & Reduced Appetite',
    petId: 'pet-bella-02',
  },
  {
    id: 'Q-103',
    petName: 'Rocky',
    species: 'Dog (German Shepherd)',
    ownerName: 'Kasun Bandara',
    timeArrived: '10:05 AM',
    assignedVet: 'Unassigned',
    status: 'Waiting Area',
    room: 'Lobby',
    reason: 'Minor Paw Cut (Post-Walk)',
    petId: 'pet-rocky-03',
  },
];

export const INITIAL_CLINIC_APPOINTMENTS: ClinicAppointmentItem[] = [
  {
    id: 'APT-401',
    petName: 'Milo',
    species: 'Dog (Golden Retriever)',
    ownerName: 'Sunil Jayawardena',
    ownerPhone: '+94 77 123 4567',
    date: 'Today',
    time: '09:30 AM',
    vetName: 'Dr. Sarah Smith',
    type: 'Vaccination',
    status: 'Admitted',
  },
  {
    id: 'APT-402',
    petName: 'Bella',
    species: 'Cat (Persian)',
    ownerName: 'Ananya Fernando',
    ownerPhone: '+94 71 234 5678',
    date: 'Today',
    time: '10:00 AM',
    vetName: 'Dr. Emily Chen',
    type: 'General Checkup',
    status: 'Confirmed',
  },
  {
    id: 'APT-403',
    petName: 'Luna',
    species: 'Dog (Beagle)',
    ownerName: 'Ruwan Perera',
    ownerPhone: '+94 76 345 6789',
    date: 'Today',
    time: '11:15 AM',
    vetName: 'Dr. Sarah Smith',
    type: 'Dental Cleaning',
    status: 'Confirmed',
  },
  {
    id: 'APT-404',
    petName: 'Simba',
    species: 'Cat (Domestic Shorthair)',
    ownerName: 'Chathuri Silva',
    ownerPhone: '+94 70 456 7890',
    date: 'Today',
    time: '02:00 PM',
    vetName: 'Dr. Rohan De Silva',
    type: 'Surgery Follow-up',
    status: 'Confirmed',
  },
];

export const INITIAL_CLINIC_STAFF: ClinicStaffMember[] = [
  {
    id: 'stf-1',
    name: 'Dr. Sarah Smith',
    role: 'Lead Veterinary Surgeon',
    department: 'Surgery & Critical Care',
    shift: '08:00 - 16:00',
    status: 'In Surgery',
    casesToday: 5,
    phone: '+94 76 555 1212',
  },
  {
    id: 'stf-2',
    name: 'Dr. Emily Chen',
    role: 'Internal Medicine Specialist',
    department: 'General Practice',
    shift: '09:00 - 17:00',
    status: 'On Duty',
    casesToday: 7,
    phone: '+94 77 123 4567',
  },
  {
    id: 'stf-3',
    name: 'Kasun Bandara (RVN)',
    role: 'Senior Veterinary Nurse',
    department: 'Triage & Inpatient',
    shift: '08:00 - 16:00',
    status: 'On Duty',
    casesToday: 12,
    phone: '+94 71 888 2211',
  },
  {
    id: 'stf-4',
    name: 'Nadeesha Fernando',
    role: 'Clinic Operations Coordinator',
    department: 'Front Desk & Admissions',
    shift: '07:30 - 15:30',
    status: 'On Duty',
    casesToday: 18,
    phone: '+94 11 258 9900',
  },
];

// ── Firestore Subscription & Mutation Functions ────────────────

export function subscribeToClinicQueue(onUpdate: (queue: ClinicQueueItem[]) => void): () => void {
  if (IS_DEV_BYPASS) {
    onUpdate(INITIAL_CLINIC_QUEUE);
    return () => {};
  }
  let unsubscribe: (() => void) | undefined;
  void (async () => {
    try {
      const { getFirestore, collection, onSnapshot } = await import('firebase/firestore');
      unsubscribe = onSnapshot(collection(getFirestore(), 'clinic_queue'), (snap) => {
        if (!snap.empty) {
          onUpdate(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        } else {
          onUpdate(INITIAL_CLINIC_QUEUE);
        }
      });
    } catch {
      onUpdate(INITIAL_CLINIC_QUEUE);
    }
  })();
  return () => { if (unsubscribe) unsubscribe(); };
}

export async function addClinicQueueItem(item: Omit<ClinicQueueItem, 'id'>): Promise<ClinicQueueItem> {
  const newId = `Q-${Math.floor(100 + Math.random() * 900)}`;
  const created: ClinicQueueItem = { ...item, id: newId };
  if (IS_DEV_BYPASS) return created;

  const { getFirestore, doc, setDoc } = await import('firebase/firestore');
  await setDoc(doc(getFirestore(), 'clinic_queue', newId), created);
  return created;
}

export async function updateClinicQueueStatus(
  id: string,
  status: ClinicQueueItem['status'],
  room?: string,
  assignedVet?: string,
): Promise<void> {
  if (IS_DEV_BYPASS) return;
  const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
  const updates: any = { status };
  if (room) updates.room = room;
  if (assignedVet) updates.assignedVet = assignedVet;
  await updateDoc(doc(getFirestore(), 'clinic_queue', id), updates);
}

export function subscribeToClinicAppointments(onUpdate: (appts: ClinicAppointmentItem[]) => void): () => void {
  if (IS_DEV_BYPASS) {
    onUpdate(INITIAL_CLINIC_APPOINTMENTS);
    return () => {};
  }
  let unsubscribe: (() => void) | undefined;
  void (async () => {
    try {
      const { getFirestore, collection, onSnapshot } = await import('firebase/firestore');
      unsubscribe = onSnapshot(collection(getFirestore(), 'clinic_appointments'), (snap) => {
        if (!snap.empty) {
          onUpdate(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        } else {
          onUpdate(INITIAL_CLINIC_APPOINTMENTS);
        }
      });
    } catch {
      onUpdate(INITIAL_CLINIC_APPOINTMENTS);
    }
  })();
  return () => { if (unsubscribe) unsubscribe(); };
}

export async function updateClinicAppointmentStatus(
  id: string,
  status: ClinicAppointmentItem['status'],
): Promise<void> {
  if (IS_DEV_BYPASS) return;
  const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(getFirestore(), 'clinic_appointments', id), { status });
}

export function subscribeToClinicStaff(onUpdate: (staff: ClinicStaffMember[]) => void): () => void {
  if (IS_DEV_BYPASS) {
    onUpdate(INITIAL_CLINIC_STAFF);
    return () => {};
  }
  let unsubscribe: (() => void) | undefined;
  void (async () => {
    try {
      const { getFirestore, collection, onSnapshot } = await import('firebase/firestore');
      unsubscribe = onSnapshot(collection(getFirestore(), 'clinic_staff'), (snap) => {
        if (!snap.empty) {
          onUpdate(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        } else {
          onUpdate(INITIAL_CLINIC_STAFF);
        }
      });
    } catch {
      onUpdate(INITIAL_CLINIC_STAFF);
    }
  })();
  return () => { if (unsubscribe) unsubscribe(); };
}
