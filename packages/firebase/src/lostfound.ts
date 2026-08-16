// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Lost & Found Pet Network & Digital ID helpers
// ─────────────────────────────────────────────────────────────

import type { LostPetAlert, FoundPetReport } from '@furr/core';

export const INITIAL_LOST_ALERTS: LostPetAlert[] = [
  {
    id: 'lost-1',
    petId: 'pet-oliver',
    ownerUid: 'user-7',
    ownerName: 'Nadeesha Senanayake',
    ownerPhone: '+94 00 000 0001',
    petName: 'Oliver',
    species: 'cat',
    breed: 'Persian Cross',
    colour: 'White with ginger patches on ears',
    photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
    lastSeenAddress: 'Near St. Thomas Church / Queens Road',
    lastSeenCity: 'Colombo 03',
    lastSeenTime: new Date(Date.now() - 3600000 * 18).toISOString(),
    latitude: 6.9015,
    longitude: 79.8542,
    rewardAmount: 'Rs 25,000',
    description: 'Very shy and scared of traffic. May hide in car engine bays or garden bushes.',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'lost-2',
    petId: 'pet-rocky',
    ownerUid: 'user-8',
    ownerName: 'Malik Jayasuriya',
    ownerPhone: '+94 00 000 0002',
    petName: 'Rocky',
    species: 'dog',
    breed: 'Beagle',
    colour: 'Tricolor (Black, White, Tan)',
    photoUrl: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600&auto=format&fit=crop&q=80',
    lastSeenAddress: 'Thurstan Road near University Ground',
    lastSeenCity: 'Colombo 07',
    lastSeenTime: new Date(Date.now() - 3600000 * 36).toISOString(),
    latitude: 6.9034,
    longitude: 79.8606,
    rewardAmount: 'Rs 15,000',
    description: 'Friendly, answers to whistle and treats. Has a notched left ear.',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
];

export const INITIAL_FOUND_REPORTS: FoundPetReport[] = [
  {
    id: 'found-1',
    reporterUid: 'user-9',
    reporterName: 'Suren K.',
    reporterPhone: '+94 00 000 0003',
    species: 'dog',
    colour: 'Golden cream',
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&auto=format&fit=crop&q=80',
    foundAddress: 'Havelock Road near park bench',
    foundCity: 'Colombo 05',
    foundTime: new Date(Date.now() - 3600000 * 6).toISOString(),
    description: 'Golden Mix / Retriever Puppy. Sheltered safely at home patio with food and water.',
    currentCareStatus: 'with_me',
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

export function subscribeToLostAlerts(onUpdate: (alerts: LostPetAlert[]) => void) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, where, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(collection(db, 'lost_pet_alerts'), where('status', '==', 'active'));

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            onUpdate(INITIAL_LOST_ALERTS);
            return;
          }
          const list: LostPetAlert[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as LostPetAlert);
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onUpdate(list);
        },
        () => onUpdate(INITIAL_LOST_ALERTS)
      );
      if (!active && unsubscribe) unsubscribe();
    } catch {
      onUpdate(INITIAL_LOST_ALERTS);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export function subscribeToFoundReports(onUpdate: (reports: FoundPetReport[]) => void) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      unsubscribe = onSnapshot(
        collection(db, 'found_pet_reports'),
        (snapshot) => {
          if (snapshot.empty) {
            onUpdate(INITIAL_FOUND_REPORTS);
            return;
          }
          const list: FoundPetReport[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as FoundPetReport);
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onUpdate(list);
        },
        () => onUpdate(INITIAL_FOUND_REPORTS)
      );
      if (!active && unsubscribe) unsubscribe();
    } catch {
      onUpdate(INITIAL_FOUND_REPORTS);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export async function createLostAlert(
  data: Omit<LostPetAlert, 'id' | 'createdAt' | 'status'>
): Promise<LostPetAlert> {
  try {
    const { getFirestore, collection, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const newRef = doc(collection(db, 'lost_pet_alerts'));
    const alert: LostPetAlert = {
      ...data,
      id: newRef.id,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    await setDoc(newRef, alert);
    return alert;
  } catch {
    const mockAlert: LostPetAlert = {
      ...data,
      id: 'lost-' + Date.now(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    return mockAlert;
  }
}

export async function createFoundReport(
  data: Omit<FoundPetReport, 'id' | 'createdAt' | 'status'>
): Promise<FoundPetReport> {
  try {
    const { getFirestore, collection, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const newRef = doc(collection(db, 'found_pet_reports'));
    const report: FoundPetReport = {
      ...data,
      id: newRef.id,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    await setDoc(newRef, report);
    return report;
  } catch {
    const mockReport: FoundPetReport = {
      ...data,
      id: 'found-' + Date.now(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    return mockReport;
  }
}
