import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ReminderType } from '@furr/core';
import { createReminder, requestNotificationPermissions } from '@furr/firebase/src/reminders';
import { Button, TextInput, colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';

const TYPES: { key: ReminderType; label: string; icon: string; description: string }[] = [
  { key: 'vaccination_due', label: 'Vaccination', icon: 'shield-checkmark', description: 'Remind when a vaccine is next due' },
  { key: 'medication_dose', label: 'Medication', icon: 'medical', description: 'Remind to give a medication dose' },
  { key: 'follow_up', label: 'Follow-up', icon: 'calendar', description: 'Vet or specialist appointment' },
  { key: 'manual', label: 'Custom', icon: 'notifications', description: 'Grooming, check-up, or anything else' },
];

const TYPE_COLORS: Record<ReminderType, string> = {
  vaccination_due: colors.brand,
  medication_dose: colors.accent,
  follow_up: '#7C5CBF',
  manual: '#2D8EC8',
};

function toLocalInputValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function initialReminderTime(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 30, 0, 0);
  return toLocalInputValue(d);
}

export default function AddReminderScreen() {
  const { firebaseUser } = useAuth();
  const { selectedPet } = usePets();

  const [type, setType] = useState<ReminderType>('manual');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [scheduledAt, setScheduledAt] = useState(initialReminderTime());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required.';
    if (!scheduledAt) {
      e.scheduledAt = 'Date and time is required.';
    } else if (isNaN(new Date(scheduledAt).getTime())) {
      e.scheduledAt = 'Enter a valid date/time (YYYY-MM-DDTHH:MM).';
    } else if (new Date(scheduledAt) <= new Date()) {
      e.scheduledAt = 'Choose a time in the future.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !firebaseUser || !selectedPet) return;
    setLoading(true);

    const granted = await requestNotificationPermissions();
    if (!granted) {
      Alert.alert(
        'Notifications disabled',
        'Furr needs notification permission to remind you. The reminder will be saved but won\'t trigger a push notification.',
      );
    }

    try {
      await createReminder(firebaseUser.uid, selectedPet.id, {
        type,
        title: title.trim(),
        body: body.trim() || `Reminder for ${selectedPet.name}`,
        scheduledAt: new Date(scheduledAt).toISOString(),
      });
      router.back();
    } catch {
      Alert.alert('Something went wrong', 'Couldn\'t save the reminder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>REMINDERS</Text>
        <Text style={styles.title}>New Alert</Text>
      </View>

      {selectedPet && (
        <View style={styles.petBadge}>
          <Ionicons name="paw" size={16} color={colors.brand} />
          <Text style={styles.petBadgeText}>For {selectedPet.name}</Text>
        </View>
      )}

      <View style={styles.sectionContainer}>
        <View style={styles.section}>
          <Text style={styles.label}>Reminder type</Text>
          <View style={styles.typeGrid}>
            {TYPES.map((t) => {
              const col = TYPE_COLORS[t.key];
              const selected = type === t.key;
              return (
                <Pressable
                  key={t.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={[styles.typeCard, selected && { borderColor: col, backgroundColor: `${col}10` }]}
                  onPress={() => setType(t.key)}
                >
                  <View style={[styles.iconWrap, selected && { backgroundColor: col }]}>
                     <Ionicons name={t.icon as never} size={20} color={selected ? '#fff' : colors.muted} />
                  </View>
                  <Text style={[styles.typeLabel, selected && { color: col }]}>{t.label}</Text>
                  <Text style={styles.typeSub}>{t.description}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
          <TextInput
            placeholder="e.g. Rabies booster due"
            value={title}
            onChangeText={(t) => { setTitle(t); setErrors((e) => ({ ...e, title: '' })); }}
            error={errors.title}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notes (shown in notification)</Text>
          <TextInput
            placeholder="Optional detail shown in the notification…"
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={2}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>When <Text style={styles.required}>*</Text></Text>
          <TextInput
            placeholder="YYYY-MM-DDTHH:MM  e.g. 2026-09-15T09:00"
            value={scheduledAt}
            onChangeText={(t) => { setScheduledAt(t); setErrors((e) => ({ ...e, scheduledAt: '' })); }}
            keyboardType="numbers-and-punctuation"
            error={errors.scheduledAt}
            hint="Date and time in 24-hour format"
          />
        </View>

        <View style={styles.notifNote}>
          <Ionicons name="notifications" size={20} color={colors.brand} />
          <Text style={styles.notifNoteText}>
            Furr will ask for notification permission when you save. You can always adjust in Settings.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button label={loading ? 'Saving…' : 'Set reminder'} loading={loading} disabled={!title.trim() || !scheduledAt} onPress={handleSave} />
      </View>
      
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: 40 },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },

  header: { marginBottom: space.md },
  eyebrow: { color: colors.brand, fontWeight: '900', fontSize: 11, letterSpacing: 1.5 },
  title: { color: colors.ink, fontSize: 34, fontWeight: '900', letterSpacing: -1, marginTop: 6 },
  
  petBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: colors.mist, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, marginBottom: space.lg },
  petBadgeText: { color: colors.brand, fontSize: 14, fontWeight: '800' },

  sectionContainer: { gap: space.xl, marginTop: space.sm },
  section: { gap: 10 },
  label: { color: colors.ink, fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
  required: { color: colors.danger },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeCard: { width: '48%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, gap: 8, borderWidth: 1.5, borderColor: colors.line },
  iconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.mist, alignItems: 'center', justifyContent: 'center' },
  typeLabel: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  typeSub: { color: colors.muted, fontSize: 12, lineHeight: 16 },

  notifNote: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: colors.surface, padding: 16, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, shadowColor: colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8 },
  notifNoteText: { color: colors.ink, fontSize: 14, lineHeight: 20, flex: 1, fontWeight: '600' },

  footer: { marginTop: space.xxl },
});
