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
import type { FrequencyPattern } from '@furr/core';
import { createMedication } from '@furr/firebase';
import { Button, colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';
import { useHealth } from '@/src/context/health';

// ─────────────────────────────────────────────────────────────
//  Add Medication screen  (MED-001)
// ─────────────────────────────────────────────────────────────

type FreqKind = FrequencyPattern['kind'];

const FREQ_OPTIONS: { key: FreqKind; label: string; description: string }[] = [
  { key: 'once', label: 'One time', description: 'Single dose' },
  { key: 'daily', label: 'Daily', description: 'One or more times per day' },
  { key: 'every_n_hours', label: 'Every N hours', description: 'Repeat on an interval' },
  { key: 'weekly', label: 'Weekly', description: 'On selected days' },
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddMedicationScreen() {
  const { firebaseUser } = useAuth();
  const { selectedPet } = usePets();
  const { addMedication } = useHealth();

  // Required
  const [name, setName] = useState('');
  const [doseInstruction, setDoseInstruction] = useState('');
  const [freqKind, setFreqKind] = useState<FreqKind>('daily');
  const [startDate, setStartDate] = useState(todayIso());

  // Frequency details
  const [intervalHours, setIntervalHours] = useState('8');
  const [dailyTimes, setDailyTimes] = useState('08:00');
  const [weeklyDays, setWeeklyDays] = useState<number[]>([1, 3, 5]); // Mon Wed Fri
  const [weeklyTimes, setWeeklyTimes] = useState('08:00');

  // Optional
  const [endDate, setEndDate] = useState('');
  const [prescribingVet, setPrescribingVet] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [showOptional, setShowOptional] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // ── Build FrequencyPattern ───────────────────────────────

  function buildFrequency(): FrequencyPattern {
    switch (freqKind) {
      case 'once':
        return { kind: 'once' };
      case 'every_n_hours':
        return { kind: 'every_n_hours', hours: parseInt(intervalHours, 10) || 8 };
      case 'daily':
        return { kind: 'daily', times: dailyTimes.split(',').map((t) => t.trim()).filter(Boolean) };
      case 'weekly':
        return { kind: 'weekly', days: weeklyDays, times: weeklyTimes.split(',').map((t) => t.trim()).filter(Boolean) };
    }
  }

  // ── Validation ───────────────────────────────────────────

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Medication name is required.';
    if (!doseInstruction.trim()) e.doseInstruction = 'Dose instruction is required.';
    if (!startDate) {
      e.startDate = 'Start date is required.';
    } else if (isNaN(new Date(startDate).getTime())) {
      e.startDate = 'Enter a valid date (YYYY-MM-DD).';
    }
    if (endDate && !isNaN(new Date(startDate).getTime())) {
      if (new Date(endDate) <= new Date(startDate)) {
        e.endDate = 'End date must be after start date.';
      }
    }
    if (freqKind === 'every_n_hours') {
      const h = parseInt(intervalHours, 10);
      if (isNaN(h) || h < 1 || h > 168) e.intervalHours = 'Enter a number between 1 and 168.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────

  const handleSave = async () => {
    if (!validate() || !firebaseUser || !selectedPet) return;
    setLoading(true);
    try {
      const plan = await createMedication(firebaseUser.uid, selectedPet.id, {
        medicationName: name.trim(),
        doseInstruction: doseInstruction.trim(),
        frequency: buildFrequency(),
        startAt: `${startDate}T00:00:00.000Z`,
        endAt: endDate ? `${endDate}T23:59:59.000Z` : undefined,
        prescribingVet: prescribingVet.trim() || undefined,
        reason: reason.trim() || undefined,
        notes: notes.trim() || undefined,
        isActive: true,
        createdByUid: firebaseUser.uid,
      });
      addMedication(plan);
      router.back();
    } catch {
      Alert.alert('Something went wrong', 'Couldn\'t save the medication plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSave = !!name.trim() && !!doseInstruction.trim() && !!startDate;

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
        <Text style={styles.heading}>Add medication</Text>
        <View style={{ width: 60 }} />
      </View>

      {selectedPet && (
        <View style={styles.petBadge}>
          <Ionicons name="paw" size={13} color={colors.brand} />
          <Text style={styles.petBadgeText}>For {selectedPet.name}</Text>
        </View>
      )}

      {/* Medication name */}
      <View style={styles.section}>
        <Text style={styles.label}>Medication name <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, !!errors.name && styles.inputError]}
          placeholder="e.g. Omega-3, Doxycycline 50mg"
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: '' })); }}
          maxLength={80}
          accessibilityLabel="Medication name"
        />
        {!!errors.name && <Text style={styles.error}>{errors.name}</Text>}
      </View>

      {/* Dose instruction */}
      <View style={styles.section}>
        <Text style={styles.label}>Dose instruction <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, !!errors.doseInstruction && styles.inputError]}
          placeholder="e.g. 1 capsule with food"
          placeholderTextColor={colors.muted}
          value={doseInstruction}
          onChangeText={(t) => { setDoseInstruction(t); setErrors((e) => ({ ...e, doseInstruction: '' })); }}
          maxLength={120}
          accessibilityLabel="Dose instruction"
        />
        {!!errors.doseInstruction && <Text style={styles.error}>{errors.doseInstruction}</Text>}
      </View>

      {/* Frequency */}
      <View style={styles.section}>
        <Text style={styles.label}>Frequency <Text style={styles.required}>*</Text></Text>
        <View style={styles.freqGrid}>
          {FREQ_OPTIONS.map((f) => (
            <Pressable
              key={f.key}
              accessibilityRole="radio"
              accessibilityState={{ selected: freqKind === f.key }}
              style={[styles.freqPill, freqKind === f.key && styles.freqPillSelected]}
              onPress={() => setFreqKind(f.key)}
            >
              <Text style={[styles.freqLabel, freqKind === f.key && styles.freqLabelSelected]}>
                {f.label}
              </Text>
              <Text style={[styles.freqDesc, freqKind === f.key && styles.freqDescSelected]}>
                {f.description}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Frequency details */}
      {freqKind === 'every_n_hours' && (
        <View style={styles.section}>
          <Text style={styles.label}>Interval (hours)</Text>
          <TextInput
            style={[styles.input, !!errors.intervalHours && styles.inputError]}
            placeholder="e.g. 8"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            value={intervalHours}
            onChangeText={(t) => { setIntervalHours(t); setErrors((e) => ({ ...e, intervalHours: '' })); }}
            maxLength={3}
            accessibilityLabel="Interval in hours"
          />
          {!!errors.intervalHours && <Text style={styles.error}>{errors.intervalHours}</Text>}
        </View>
      )}

      {freqKind === 'daily' && (
        <View style={styles.section}>
          <Text style={styles.label}>Time(s) daily</Text>
          <TextInput
            style={styles.input}
            placeholder="08:00 or 08:00, 20:00"
            placeholderTextColor={colors.muted}
            value={dailyTimes}
            onChangeText={setDailyTimes}
            accessibilityLabel="Daily times"
          />
        </View>
      )}

      {freqKind === 'weekly' && (
        <>
          <View style={styles.section}>
            <Text style={styles.label}>Days of week</Text>
            <View style={styles.dayRow}>
              {DAY_LABELS.map((d, i) => (
                <Pressable
                  key={i}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: weeklyDays.includes(i) }}
                  style={[styles.dayBox, weeklyDays.includes(i) && styles.dayBoxSelected]}
                  onPress={() => setWeeklyDays((prev) =>
                    prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort()
                  )}
                >
                  <Text style={[styles.dayLabel, weeklyDays.includes(i) && styles.dayLabelSelected]}>
                    {d}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Time(s)</Text>
            <TextInput
              style={styles.input}
              placeholder="08:00"
              placeholderTextColor={colors.muted}
              value={weeklyTimes}
              onChangeText={setWeeklyTimes}
              accessibilityLabel="Weekly times"
            />
          </View>
        </>
      )}

      {/* Start date */}
      <View style={styles.section}>
        <Text style={styles.label}>Start date <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, !!errors.startDate && styles.inputError]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.muted}
          value={startDate}
          onChangeText={(t) => { setStartDate(t); setErrors((e) => ({ ...e, startDate: '' })); }}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          accessibilityLabel="Start date"
        />
        {!!errors.startDate && <Text style={styles.error}>{errors.startDate}</Text>}
      </View>

      {/* Optional */}
      <Pressable
        accessibilityRole="button"
        style={styles.optionalToggle}
        onPress={() => setShowOptional((v) => !v)}
      >
        <Text style={styles.optionalToggleText}>
          {showOptional ? 'Hide' : 'Add'} optional details
        </Text>
        <Ionicons name={showOptional ? 'chevron-up' : 'chevron-down'} size={16} color={colors.brand} />
      </Pressable>

      {showOptional && (
        <View style={styles.optionalBlock}>
          {/* End date */}
          <View style={styles.section}>
            <Text style={styles.label}>End date (leave blank if ongoing)</Text>
            <TextInput
              style={[styles.input, !!errors.endDate && styles.inputError]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              value={endDate}
              onChangeText={(t) => { setEndDate(t); setErrors((e) => ({ ...e, endDate: '' })); }}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              accessibilityLabel="End date"
            />
            {!!errors.endDate && <Text style={styles.error}>{errors.endDate}</Text>}
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Prescribing vet / clinic</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Dr. Priya Perera, Colombo Pet Care"
              placeholderTextColor={colors.muted}
              value={prescribingVet}
              onChangeText={setPrescribingVet}
              maxLength={100}
              accessibilityLabel="Prescribing vet"
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Reason</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Joint support, post-surgery"
              placeholderTextColor={colors.muted}
              value={reason}
              onChangeText={setReason}
              maxLength={120}
              accessibilityLabel="Reason"
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Any extra notes…"
              placeholderTextColor={colors.muted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              maxLength={400}
              accessibilityLabel="Notes"
            />
          </View>
        </View>
      )}

      <Button
        label={loading ? 'Saving…' : 'Save medication plan'}
        loading={loading}
        disabled={!canSave}
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
  input: { minHeight: 52, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, fontSize: 16, color: colors.ink, fontWeight: '600' },
  inputError: { borderColor: colors.danger },
  textarea: { minHeight: 88, paddingTop: 14, textAlignVertical: 'top' },
  error: { color: colors.danger, fontSize: 12, fontWeight: '700' },
  freqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  freqPill: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, minWidth: '47%' },
  freqPillSelected: { borderColor: colors.brand, backgroundColor: colors.mist },
  freqLabel: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  freqLabelSelected: { color: colors.brand },
  freqDesc: { color: colors.muted, fontSize: 11, marginTop: 2 },
  freqDescSelected: { color: colors.brand },
  dayRow: { flexDirection: 'row', gap: 8 },
  dayBox: { width: 40, height: 40, borderRadius: 12, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  dayBoxSelected: { borderColor: colors.brand, backgroundColor: colors.brand },
  dayLabel: { color: colors.muted, fontSize: 13, fontWeight: '800' },
  dayLabelSelected: { color: '#fff' },
  optionalToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', paddingVertical: 6 },
  optionalToggleText: { color: colors.brand, fontSize: 13, fontWeight: '800' },
  optionalBlock: { gap: space.md },
});
