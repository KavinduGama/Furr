// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Reminder repository + local scheduling
//
//  Uses expo-notifications for local push scheduling.
//  In dev-bypass: schedules real local notifications but stores
//  reminder records in memory.
// ─────────────────────────────────────────────────────────────

import type { Reminder, ReminderType } from '@furr/core';
import { Platform } from 'react-native';

const IS_DEV_BYPASS = typeof process !== 'undefined' && !process.env?.EXPO_PUBLIC_FIREBASE_API_KEY && !process.env?.NEXT_PUBLIC_FIREBASE_API_KEY;

let devReminders: Reminder[] = [];
const ANDROID_CHANNEL_ID = 'pet-care';

function devId(): string {
  return `rem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const remPath = (uid: string, petId: string) => `users/${uid}/pets/${petId}/reminders`;

// ─────────────────────────────────────────────────────────────
//  Permission helpers
// ─────────────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { default: Notifications } = await import('expo-notifications');
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: 'Pet care reminders',
        description: 'Medication, vaccination, and follow-up reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#006B78',
      });
    }
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
//  Schedule a local notification
// ─────────────────────────────────────────────────────────────

async function scheduleLocalNotification(
  title: string,
  body: string,
  scheduledAt: Date,
): Promise<string | null> {
  try {
    const { default: Notifications } = await import('expo-notifications');
    const notifId = await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: { type: 'date' as never, date: scheduledAt, channelId: ANDROID_CHANNEL_ID } as never,
    });
    return notifId;
  } catch {
    return null;
  }
}

async function cancelLocalNotification(notifId: string): Promise<void> {
  try {
    const { default: Notifications } = await import('expo-notifications');
    await Notifications.cancelScheduledNotificationAsync(notifId);
  } catch {
    // no-op
  }
}

// ─────────────────────────────────────────────────────────────
//  Create reminder
// ─────────────────────────────────────────────────────────────

export type CreateReminderInput = {
  type: ReminderType;
  title: string;
  body: string;
  scheduledAt: string; // ISO datetime
  sourceId?: string;
};

export async function createReminder(
  ownerUid: string,
  petId: string,
  input: CreateReminderInput,
): Promise<Reminder> {
  const now = new Date().toISOString();
  const scheduledDate = new Date(input.scheduledAt);
  if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
    throw new Error('Reminders must be scheduled for a future date and time.');
  }

  // Schedule local notification
  const notifId = scheduledDate > new Date()
    ? await scheduleLocalNotification(input.title, input.body, scheduledDate)
    : null;

  const reminder: Reminder = {
    id: devId(),
    petId,
    ownerUid,
    type: input.type,
    title: input.title,
    body: input.body,
    scheduledAt: input.scheduledAt,
    status: 'scheduled',
    notificationId: notifId ?? undefined,
    sourceId: input.sourceId,
    createdAt: now,
    updatedAt: now,
  };

  if (IS_DEV_BYPASS) {
    devReminders = [reminder, ...devReminders];
    return reminder;
  }

  const { getFirestore, collection, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const db = getFirestore();
  const ref = doc(collection(db, remPath(ownerUid, petId)));
  const r = { ...reminder, id: ref.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  await setDoc(ref, r);
  return { ...reminder, id: ref.id };
}

// ─────────────────────────────────────────────────────────────
//  Subscribe to reminders
// ─────────────────────────────────────────────────────────────

export function subscribeToReminders(
  ownerUid: string,
  petId: string,
  onUpdate: (reminders: Reminder[]) => void,
): () => void {
  if (IS_DEV_BYPASS) {
    onUpdate(devReminders.filter((r) => r.petId === petId));
    return () => {};
  }
  void (async () => {
    const { getFirestore, collection, query, orderBy, onSnapshot } = await import('firebase/firestore');
    const db = getFirestore();
    const q = query(collection(db, remPath(ownerUid, petId)), orderBy('scheduledAt', 'desc'));
    return onSnapshot(q, (snap) => { onUpdate(snap.docs.map((d) => d.data() as Reminder)); });
  })();
  return () => {};
}

// ─────────────────────────────────────────────────────────────
//  Complete / skip / cancel reminder
// ─────────────────────────────────────────────────────────────

export async function completeReminder(ownerUid: string, petId: string, remId: string, notifId?: string): Promise<void> {
  if (notifId) await cancelLocalNotification(notifId);
  const now = new Date().toISOString();
  if (IS_DEV_BYPASS) {
    devReminders = devReminders.map((r) => r.id === remId ? { ...r, status: 'completed' as const, completedAt: now, updatedAt: now } : r);
    return;
  }
  const { getFirestore, doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  await updateDoc(doc(getFirestore(), remPath(ownerUid, petId), remId), { status: 'completed', completedAt: now, updatedAt: serverTimestamp() });
}

export async function skipReminder(ownerUid: string, petId: string, remId: string, reason?: string, notifId?: string): Promise<void> {
  if (notifId) await cancelLocalNotification(notifId);
  const now = new Date().toISOString();
  if (IS_DEV_BYPASS) {
    devReminders = devReminders.map((r) => r.id === remId ? { ...r, status: 'skipped' as const, skippedAt: now, skipReason: reason, updatedAt: now } : r);
    return;
  }
  const { getFirestore, doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  await updateDoc(doc(getFirestore(), remPath(ownerUid, petId), remId), { status: 'skipped', skippedAt: now, skipReason: reason, updatedAt: serverTimestamp() });
}

export async function cancelReminder(ownerUid: string, petId: string, remId: string, notifId?: string): Promise<void> {
  if (notifId) await cancelLocalNotification(notifId);
  const now = new Date().toISOString();
  if (IS_DEV_BYPASS) {
    devReminders = devReminders.map((r) => r.id === remId ? { ...r, status: 'cancelled' as const, updatedAt: now } : r);
    return;
  }
  const { getFirestore, doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  await updateDoc(doc(getFirestore(), remPath(ownerUid, petId), remId), { status: 'cancelled', updatedAt: serverTimestamp() });
}
