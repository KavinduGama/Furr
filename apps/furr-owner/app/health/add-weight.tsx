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
import type { WeightUnit } from '@furr/core';
import { createWeightEntry } from '@furr/firebase';
import { Button, colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';
import { useHealth } from '@/src/context/health';

// ─────────────────────────────────────────────────────────────
//  Add Weight screen  (WGT-001)
// ─────────────────────────────────────────────────────────────

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddWeightScreen() {
  const { firebaseUser } = useAuth();
  const { selectedPet } = usePets();
  const { addWeight, weights } = useHealth();

  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<WeightUnit>('kg');
  const [measuredOn, setMeasuredOn] = useState(todayIso());
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Last recorded weight for context
  const lastWeight = weights[0];

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const num = parseFloat(value);
    if (!value || isNaN(num)) e.value = 'Enter a valid weight number.';
    else if (num <= 0 || num > 200) e.value = 'Weight must be between 0.1 and 200.';
    if (!measuredOn) {
      e.measuredOn = 'Date is required.';
    } else if (isNaN(new Date(measuredOn).getTime())) {
      e.measuredOn = 'Enter a valid date (YYYY-MM-DD).';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !firebaseUser || !selectedPet) return;
    setLoading(true);
    try {
      const entry = await createWeightEntry(firebaseUser.uid, selectedPet.id, {
        value: parseFloat(value),
        unit,
        measuredOn,
        note: note.trim() || undefined,
        createdByUid: firebaseUser.uid,
      });
      addWeight(entry);
      router.back();
    } catch {
      Alert.alert('Something went wrong', 'Couldn\'t save the weight entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Trend hint
  const trend = (() => {
    if (!lastWeight || !value || isNaN(parseFloat(value))) return null;
    const prev = lastWeight.unit === unit ? lastWeight.value
      : lastWeight.unit === 'kg' ? lastWeight.value * 2.205 : lastWeight.value / 2.205;
    const diff = parseFloat(value) - prev;
    if (Math.abs(diff) < 0.05) return null;
    return { diff: Math.abs(diff).toFixed(1), up: diff > 0 };
  })();

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
        <Text style={styles.heading}>Log weight</Text>
        <View style={{ width: 60 }} />
      </View>

      {selectedPet && (
        <View style={styles.petBadge}>
          <Ionicons name="paw" size={13} color={colors.brand} />
          <Text style={styles.petBadgeText}>For {selectedPet.name}</Text>
        </View>
      )}

      {/* Last weight context */}
      {lastWeight && (
        <View style={styles.lastWeight}>
          <Ionicons name="time-outline" size={14} color={colors.muted} />
          <Text style={styles.lastWeightText}>
            Last recorded: <Text style={styles.bold}>{lastWeight.value} {lastWeight.unit}</Text> on {lastWeight.measuredOn}
          </Text>
        </View>
      )}

      {/* Weight entry */}
      <View style={styles.section}>
        <Text style={styles.label}>Weight <Text style={styles.required}>*</Text></Text>
        <View style={styles.weightRow}>
          <TextInput
            style={[styles.weightInput, !!errors.value && styles.inputError]}
            placeholder="0.0"
            placeholderTextColor={colors.muted}
            value={value}
            onChangeText={(t) => { setValue(t); setErrors((e) => ({ ...e, value: '' })); }}
            keyboardType="decimal-pad"
            maxLength={6}
            accessibilityLabel="Weight value"
          />
          <View style={styles.unitToggle}>
            {(['kg', 'lbs'] as WeightUnit[]).map((u) => (
              <Pressable
                key={u}
                accessibilityRole="radio"
                accessibilityState={{ selected: unit === u }}
                style={[styles.unitBtn, unit === u && styles.unitBtnSelected]}
                onPress={() => setUnit(u)}
              >
                <Text style={[styles.unitBtnText, unit === u && styles.unitBtnTextSelected]}>
                  {u}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        {!!errors.value && <Text style={styles.error}>{errors.value}</Text>}

        {/* Trend hint */}
        {trend && (
          <View style={[styles.trendHint, trend.up ? styles.trendUp : styles.trendDown]}>
            <Ionicons
              name={trend.up ? 'trending-up' : 'trending-down'}
              size={14}
              color={trend.up ? '#B8870F' : colors.brand}
            />
            <Text style={[styles.trendText, { color: trend.up ? '#B8870F' : colors.brand }]}>
              {trend.up ? '+' : '-'}{trend.diff} {unit} from last entry
            </Text>
          </View>
        )}
      </View>

      {/* Date */}
      <View style={styles.section}>
        <Text style={styles.label}>Date measured <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, !!errors.measuredOn && styles.inputError]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.muted}
          value={measuredOn}
          onChangeText={(t) => { setMeasuredOn(t); setErrors((e) => ({ ...e, measuredOn: '' })); }}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          accessibilityLabel="Date measured"
        />
        {!!errors.measuredOn && <Text style={styles.error}>{errors.measuredOn}</Text>}
      </View>

      {/* Note */}
      <View style={styles.section}>
        <Text style={styles.label}>Note (optional)</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="e.g. After vet visit, before breakfast…"
          placeholderTextColor={colors.muted}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={2}
          maxLength={200}
          accessibilityLabel="Note"
        />
      </View>

      <Button
        label={loading ? 'Saving…' : 'Save weight'}
        loading={loading}
        disabled={!value || !measuredOn}
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
  lastWeight: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line },
  lastWeightText: { color: colors.muted, fontSize: 13 },
  bold: { fontWeight: '900', color: colors.ink },
  section: { gap: 7 },
  label: { color: colors.ink, fontSize: 13, fontWeight: '800', letterSpacing: 0.2 },
  required: { color: colors.danger },
  weightRow: { flexDirection: 'row', gap: 10 },
  weightInput: { flex: 1, minHeight: 64, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 18, fontSize: 32, fontWeight: '900', color: colors.ink, textAlign: 'center' },
  inputError: { borderColor: colors.danger },
  unitToggle: { borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, overflow: 'hidden', flexDirection: 'row' },
  unitBtn: { paddingHorizontal: 18, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  unitBtnSelected: { backgroundColor: colors.brand },
  unitBtnText: { color: colors.muted, fontSize: 15, fontWeight: '900' },
  unitBtnTextSelected: { color: '#fff' },
  trendHint: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.sm },
  trendUp: { backgroundColor: colors.warm },
  trendDown: { backgroundColor: colors.mist },
  trendText: { fontSize: 12, fontWeight: '800' },
  input: { minHeight: 52, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, fontSize: 16, color: colors.ink, fontWeight: '600' },
  textarea: { minHeight: 72, paddingTop: 14, textAlignVertical: 'top' },
  error: { color: colors.danger, fontSize: 12, fontWeight: '700' },
});
