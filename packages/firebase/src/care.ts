// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Advanced Daily Care, Feeding & Walk helpers
// ─────────────────────────────────────────────────────────────

import type { FeedingSchedule, FeedingLog, WalkActivity, TrainingLog } from '@furr/core';

export const INITIAL_FEEDING_SCHEDULES: FeedingSchedule[] = [
  {
    id: 'feed-1',
    petId: 'max',
    ownerUid: 'demo-uid',
    mealType: 'breakfast',
    foodBrand: 'Royal Canin Maxi Adult',
    portion: '1.5 cups',
    time: '08:00',
    notes: 'Mix with warm water and 1 pump of salmon oil',
  },
  {
    id: 'feed-2',
    petId: 'max',
    ownerUid: 'demo-uid',
    mealType: 'dinner',
    foodBrand: 'Royal Canin Maxi Adult',
    portion: '1.5 cups',
    time: '19:30',
    notes: 'Add joint supplement chew',
  },
];

export const INITIAL_FEEDING_LOGS: FeedingLog[] = [
  {
    id: 'flog-1',
    petId: 'max',
    mealType: 'breakfast',
    fedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    fedByUid: 'demo-uid',
    fedByName: 'Kavindu',
    amount: '1.5 cups',
  },
];

export const INITIAL_WALKS: WalkActivity[] = [
  {
    id: 'walk-1',
    petId: 'max',
    ownerUid: 'demo-uid',
    startTime: new Date(Date.now() - 3600000 * 6).toISOString(),
    endTime: new Date(Date.now() - 3600000 * 5.25).toISOString(),
    durationMinutes: 45,
    distanceKm: 2.8,
    steps: 3600,
    avgPaceMinPerKm: 16.1,
    poopCount: 1,
    peeCount: 3,
    notes: 'Great energy! Met a friendly Lab near the park fountain.',
  },
];

export const INITIAL_TRAINING_LOGS: TrainingLog[] = [
  {
    id: 'train-1',
    petId: 'max',
    ownerUid: 'demo-uid',
    commandName: 'Loose Leash Walking',
    successRatePercent: 85,
    durationMinutes: 15,
    notes: 'Improved focus when walking past distractions on sidewalks.',
    loggedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'train-2',
    petId: 'max',
    ownerUid: 'demo-uid',
    commandName: 'Emergency Recall ("Come")',
    successRatePercent: 90,
    durationMinutes: 10,
    notes: 'Returned promptly across 30ft lawn with high-value treat reward.',
    loggedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export function subscribeToFeedingSchedules(
  petId: string,
  onUpdate: (schedules: FeedingSchedule[]) => void
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, where, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(
        collection(db, 'care_feeding_schedules'),
        where('petId', '==', petId)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            onUpdate(INITIAL_FEEDING_SCHEDULES);
            return;
          }
          const list: FeedingSchedule[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as FeedingSchedule);
          });
          onUpdate(list);
        },
        () => onUpdate(INITIAL_FEEDING_SCHEDULES)
      );
      if (!active && unsubscribe) unsubscribe();
    } catch {
      onUpdate(INITIAL_FEEDING_SCHEDULES);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export function subscribeToWalks(
  petId: string,
  onUpdate: (walks: WalkActivity[]) => void
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, where, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(
        collection(db, 'care_walk_activities'),
        where('petId', '==', petId)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            onUpdate(INITIAL_WALKS);
            return;
          }
          const list: WalkActivity[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as WalkActivity);
          });
          list.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
          onUpdate(list);
        },
        () => onUpdate(INITIAL_WALKS)
      );
      if (!active && unsubscribe) unsubscribe();
    } catch {
      onUpdate(INITIAL_WALKS);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export async function logMealFeed(data: Omit<FeedingLog, 'id' | 'fedAt'>): Promise<FeedingLog> {
  const log: FeedingLog = {
    ...data,
    id: 'flog-' + Date.now(),
    fedAt: new Date().toISOString(),
  };
  return log;
}

export async function saveWalkActivity(data: Omit<WalkActivity, 'id'>): Promise<WalkActivity> {
  const walk: WalkActivity = {
    ...data,
    id: 'walk-' + Date.now(),
  };
  return walk;
}

export async function saveTrainingLog(data: Omit<TrainingLog, 'id' | 'loggedAt'>): Promise<TrainingLog> {
  const log: TrainingLog = {
    ...data,
    id: 'train-' + Date.now(),
    loggedAt: new Date().toISOString(),
  };
  return log;
}
