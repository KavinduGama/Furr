// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Telemedicine & Vet Consultations Firestore helpers
// ─────────────────────────────────────────────────────────────

import type { Consultation, ConsultationMessage, VetPrescriptionItem } from '@furr/core';

export const INITIAL_CONSULTATIONS: Consultation[] = [
  {
    id: 'consult-1',
    ownerUid: 'demo-uid',
    ownerName: 'Kavindu Deshappriya',
    petId: 'max',
    petName: 'Max',
    petSpecies: 'dog',
    petBreed: 'Golden Retriever',
    petAgeYears: 2,
    symptoms: 'Mild limping on the front right paw after park sprint. No visible swelling, but licking paw frequently.',
    duration: 'Since yesterday evening',
    severity: 'mild',
    type: 'chat',
    status: 'active',
    vetUid: 'vet-101',
    vetName: 'Dr. Sarah Weerasinghe, BVSc',
    vetClinicName: 'Colombo Veterinary Hospital',
    summary: 'Suspected mild muscle strain or minor paw pad abrasion. Prescribed anti-inflammatory gel and rest for 3 days.',
    prescriptions: [
      {
        medicationName: 'Meloxicam Oral Suspension (1.5mg/ml)',
        dosage: '0.1mg/kg with meal',
        frequency: 'Once daily',
        durationDays: 3,
        instructions: 'Administer with food in the morning. Restrict running or high jumps.',
        marketplaceProductId: 'prod-3',
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

export const INITIAL_MESSAGES: Record<string, ConsultationMessage[]> = {
  'consult-1': [
    {
      id: 'msg-1',
      consultationId: 'consult-1',
      senderUid: 'demo-uid',
      senderRole: 'owner',
      senderName: 'Kavindu',
      text: 'Hi Dr. Sarah, Max started limping on his front right paw after running at the park yesterday. He keeps licking it.',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'msg-2',
      consultationId: 'consult-1',
      senderUid: 'vet-101',
      senderRole: 'vet',
      senderName: 'Dr. Sarah Weerasinghe',
      text: 'Hello Kavindu! Thank you for reaching out. Does he whimper or pull away when you gently touch his paw pads or between his toes?',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'msg-3',
      consultationId: 'consult-1',
      senderUid: 'demo-uid',
      senderRole: 'owner',
      senderName: 'Kavindu',
      text: 'No whimpering, he lets me touch it, but he puts less weight on it when walking on tiles.',
      createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    },
    {
      id: 'msg-4',
      consultationId: 'consult-1',
      senderUid: 'vet-101',
      senderRole: 'vet',
      senderName: 'Dr. Sarah Weerasinghe',
      text: 'That sounds like a mild joint/muscle sprain. I have issued a short course prescription below. Keep him strictly rested for 3 days and let me know if the limp worsens.',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
  ],
};

export function subscribeToOwnerConsultations(
  ownerUid: string,
  onUpdate: (consults: Consultation[]) => void
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, where, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(
        collection(db, 'telemedicine_consultations'),
        where('ownerUid', '==', ownerUid)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            onUpdate(INITIAL_CONSULTATIONS);
            return;
          }
          const list: Consultation[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Consultation);
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onUpdate(list);
        },
        (error) => {
          console.warn('Consultations subscription fallback:', error);
          onUpdate(INITIAL_CONSULTATIONS);
        }
      );

      if (!active && unsubscribe) {
        unsubscribe();
      }
    } catch (e) {
      console.warn('Failed to subscribe to consultations:', e);
      onUpdate(INITIAL_CONSULTATIONS);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export function subscribeToAllActiveConsultations(
  onUpdate: (consults: Consultation[]) => void
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const ref = collection(db, 'telemedicine_consultations');

      unsubscribe = onSnapshot(
        ref,
        (snapshot) => {
          if (snapshot.empty) {
            onUpdate(INITIAL_CONSULTATIONS);
            return;
          }
          const list: Consultation[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Consultation);
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onUpdate(list);
        },
        (error) => {
          console.warn('All consultations subscription fallback:', error);
          onUpdate(INITIAL_CONSULTATIONS);
        }
      );

      if (!active && unsubscribe) {
        unsubscribe();
      }
    } catch (e) {
      console.warn('Failed to subscribe to all consultations:', e);
      onUpdate(INITIAL_CONSULTATIONS);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export function subscribeToConsultation(
  consultationId: string,
  onUpdate: (consult: Consultation | null) => void
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, doc, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const ref = doc(db, 'telemedicine_consultations', consultationId);

      unsubscribe = onSnapshot(
        ref,
        (snapshot) => {
          if (snapshot.exists()) {
            onUpdate(snapshot.data() as Consultation);
          } else {
            const fallback = INITIAL_CONSULTATIONS.find((c) => c.id === consultationId) || null;
            onUpdate(fallback);
          }
        },
        (error) => {
          console.warn('Single consultation subscription fallback:', error);
          const fallback = INITIAL_CONSULTATIONS.find((c) => c.id === consultationId) || null;
          onUpdate(fallback);
        }
      );

      if (!active && unsubscribe) {
        unsubscribe();
      }
    } catch (e) {
      console.warn('Failed to subscribe to single consultation:', e);
      const fallback = INITIAL_CONSULTATIONS.find((c) => c.id === consultationId) || null;
      onUpdate(fallback);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export function subscribeToConsultationMessages(
  consultationId: string,
  onUpdate: (messages: ConsultationMessage[]) => void
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, where, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(
        collection(db, 'telemedicine_messages'),
        where('consultationId', '==', consultationId)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            onUpdate(INITIAL_MESSAGES[consultationId] || []);
            return;
          }
          const msgs: ConsultationMessage[] = [];
          snapshot.forEach((docSnap) => {
            msgs.push(docSnap.data() as ConsultationMessage);
          });
          msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          onUpdate(msgs);
        },
        (error) => {
          console.warn('Messages subscription fallback:', error);
          onUpdate(INITIAL_MESSAGES[consultationId] || []);
        }
      );

      if (!active && unsubscribe) {
        unsubscribe();
      }
    } catch (e) {
      console.warn('Failed to subscribe to messages:', e);
      onUpdate(INITIAL_MESSAGES[consultationId] || []);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export async function createConsultation(
  data: Omit<Consultation, 'id' | 'createdAt' | 'status'>
): Promise<Consultation> {
  try {
    const { getFirestore, collection, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const newRef = doc(collection(db, 'telemedicine_consultations'));
    const consult: Consultation = {
      ...data,
      id: newRef.id,
      status: 'waiting',
      vetName: 'Assigned Duty Vet (Dr. Sarah)',
      vetClinicName: 'Furr Telehealth Care Network',
      createdAt: new Date().toISOString(),
    };
    await setDoc(newRef, consult);
    return consult;
  } catch (e) {
    console.warn('Local fallback for createConsultation:', e);
    const mockConsult: Consultation = {
      ...data,
      id: 'consult-' + Date.now(),
      status: 'active',
      vetName: 'Dr. Sarah Weerasinghe, BVSc',
      vetClinicName: 'Furr Telehealth Care Network',
      createdAt: new Date().toISOString(),
    };
    return mockConsult;
  }
}

export async function updateConsultationStatus(
  consultationId: string,
  updates: Partial<Pick<Consultation, 'status' | 'vetUid' | 'vetName' | 'vetClinicName' | 'summary' | 'prescriptions'>>
): Promise<void> {
  try {
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const ref = doc(db, 'telemedicine_consultations', consultationId);
    await updateDoc(ref, updates);
  } catch (e) {
    console.warn('Local fallback for updateConsultationStatus:', e);
    const item = INITIAL_CONSULTATIONS.find((c) => c.id === consultationId);
    if (item) {
      Object.assign(item, updates);
    }
  }
}

export async function sendConsultationMessage(
  data: Omit<ConsultationMessage, 'id' | 'createdAt'>
): Promise<ConsultationMessage> {
  try {
    const { getFirestore, collection, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const newRef = doc(collection(db, 'telemedicine_messages'));
    const msg: ConsultationMessage = {
      ...data,
      id: newRef.id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(newRef, msg);
    return msg;
  } catch (e) {
    console.warn('Local fallback for sendConsultationMessage:', e);
    const mockMsg: ConsultationMessage = {
      ...data,
      id: 'msg-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    if (!INITIAL_MESSAGES[data.consultationId]) {
      INITIAL_MESSAGES[data.consultationId] = [];
    }
    INITIAL_MESSAGES[data.consultationId].push(mockMsg);
    return mockMsg;
  }
}
