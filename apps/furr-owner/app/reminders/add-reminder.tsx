import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { ReminderType } from '@furr/core';
import { createReminder, requestNotificationPermissions } from '@furr/firebase';
import { Button, colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';

// ─────────────────────────────────────────────────────────────
//  Add Reminder screen  (REM-001)
// ─────────────────────────────────────────────────────────────

const TYPES: { key: ReminderType; label: string; icon: string; description: string }[] = [
  { key: 'vaccination_due', label: 'Vaccination due', icon: 'shield-checkmark', description: 'Remind when a vaccine is next due' },
  { key: 'medication_dose', label: 'Medication dose', icon: 'medical', description: 'Remind to give a medication' },
  { key: 'follow_up', label: 'Follow-up visit', icon: 'calendar', description: 'Vet or specialist appointment' },
  { key: 'manual', label: 'Custom reminder', icon: 'notifications', description: 'Grooming, check-up, or anything else' },
];

const TYPE_COLORS: Record<ReminderType, string> = {
  vaccination_due: colors.brand,
  medication_dose: colors.accent,
  follow_up: '#7C5CBF',
  manual: '#2D8EC8',
};

function todayAtNoon(): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
}

export default function AddReminderScreen() {
  const { firebaseUser } = useAuth();
  const { selectedPet } = usePets();

  const [type, setType] = useState<ReminderType>('manual');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [scheduledAt, setScheduledAt] = useState(todayAtNoon());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required.';
    if (!scheduledAt) {
      e.scheduledAt = 'Date and time is required.';
    } else if (isNaN(new Date(scheduledAt).getTime())) {
      e.scheduledAt = 'Enter a valid date/time (YYYY-MM-DDTHH:MM).';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !firebaseUser || !selectedPet) return;
    setLoading(true);

    // Request notification permissions first
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
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.cancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Text style={styles.heading}>Add reminder</Text>
        <View style={{ width: 60 }} />
      </View>

      {selectedPet && (
        <View style={styles.petBadge}>
          <Ionicons name="paw" size={13} color={colors.brand} />
          <Text style={styles.petBadgeText}>For {selectedPet.name}</Text>
        </View>
      )}

      {/* Type picker */}
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
                <Ionicons name={t.icon as never} size={20} color={selected ? col : colors.muted} />
                <Text style={[styles.typeLabel, selected && { color: col }]}>{t.label}</Text>
                <Text style={styles.typeSub}>{t.description}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Title */}
      <View style={styles.section}>
        <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, !!errors.title && styles.inputError]}
          placeholder="e.g. Rabies booster due"
          placeholderTextColor={colors.muted}
          value={title}
          onChangeText={(t) => { setTitle(t); setErrors((e) => ({ ...e, title: '' })); }}
          maxLength={80}
          accessibilityLabel="Reminder title"
        />
        {!!errors.title && <Text style={styles.error}>{errors.title}</Text>}
      </View>

      {/* Body */}
      <View style={styles.section}>
        <Text style={styles.label}>Notes (shown in notification)</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Optional detail shown in the notification…"
          placeholderTextColor={colors.muted}
          value={body}
          onChangeText={setBody}
          multiline
          numberOfLines={2}
          maxLength={200}
          accessibilityLabel="Reminder body"
        />
      </View>

      {/* Date + time */}
      <View style={styles.section}>
        <Text style={styles.label}>When <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, !!errors.scheduledAt && styles.inputError]}
          placeholder="YYYY-MM-DDTHH:MM  e.g. 2026-09-15T09:00"
          placeholderTextColor={colors.muted}
          value={scheduledAt}
          onChangeText={(t) => { setScheduledAt(t); setErrors((e) => ({ ...e, scheduledAt: '' })); }}
          keyboardType="numbers-and-punctuation"
          maxLength={16}
          accessibilityLabel="Date and time"
        />
        {!!errors.scheduledAt
          ? <Text style={styles.error}>{errors.scheduledAt}</Text>
          : <Text style={styles.hint}>Date and time in 24-hour format</Text>}
      </View>

      <View style={styles.notifNote}>
        <Ionicons name="notifications-outline" size={14} color={colors.muted} />
        <Text style={styles.notifNoteText}>
          Furr will ask for notification permission when you save. You can always adjust in Settings.
        </Text>
      </View>

      <Button
        label={loading ? 'Saving…' : 'Set reminder'}
        loading={loading}
        disabled={!title.trim() || !scheduledAt}
        onPress={handleSave}
      />
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: space.md, gap: space.md, paddingBottom: 40 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  cancel: { padding: 4 },
  cancelText: { color: colors.brand, fontSize: 15, fontWeight: '700' },
  heading: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  petBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: colors.mist, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  petBadgeText: { color: colors.brand, fontSize: 12, fontWeight: '800' },
  section: { gap: 7 },
  label: { color: colors.ink, fontSize: 13, fontWeight: '800', letterSpacing: 0.2 },
  required: { color: colors.danger },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeCard: { width: '47%', backgroundColor: colors.surface, borderRadius: radius.md, padding: 13, gap: 5, borderWidth: 1.5, borderColor: colors.line },
  typeLabel: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  typeSub: { color: colors.muted, fontSize: 11, lineHeight: 15 },
  input: { minHeight: 52, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, fontSize: 15, color: colors.ink, fontWeight: '600' },
  inputError: { borderColor: colors.danger },
  textarea: { minHeight: 72, paddingTop: 14, textAlignVertical: 'top' },
  error: { color: colors.danger, fontSize: 12, fontWeight: '700' },
  hint: { color: colors.muted, fontSize: 11 },
  notifNote: { flexDirection: 'row', gap: 7, alignItems: 'flex-start', backgroundColor: colors.pearl, padding: 11, borderRadius: radius.md },
  notifNoteText: { color: colors.muted, fontSize: 11, lineHeight: 16, flex: 1 },
});
