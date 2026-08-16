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
import type { FrequencyPattern } from '@furr/core';
import { createMedication } from '@furr/firebase';
import { Button, TextInput, colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';
import { useHealth } from '@/src/context/health';

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

  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');

  // Step 2
  const [doseInstruction, setDoseInstruction] = useState('');
  const [freqKind, setFreqKind] = useState<FreqKind>('daily');
  const [intervalHours, setIntervalHours] = useState('8');
  const [dailyTimes, setDailyTimes] = useState('08:00');
  const [weeklyDays, setWeeklyDays] = useState<number[]>([1, 3, 5]);
  const [weeklyTimes, setWeeklyTimes] = useState('08:00');

  // Step 3
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState('');
  const [prescribingVet, setPrescribingVet] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function buildFrequency(): FrequencyPattern {
    switch (freqKind) {
      case 'once': return { kind: 'once' };
      case 'every_n_hours': return { kind: 'every_n_hours', hours: parseInt(intervalHours, 10) || 8 };
      case 'daily': return { kind: 'daily', times: dailyTimes.split(',').map((t) => t.trim()).filter(Boolean) };
      case 'weekly': return { kind: 'weekly', days: weeklyDays, times: weeklyTimes.split(',').map((t) => t.trim()).filter(Boolean) };
    }
  }

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Medication name is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Record<string, string> = {};
    if (!doseInstruction.trim()) e.doseInstruction = 'Dose instruction is required.';
    if (freqKind === 'every_n_hours') {
      const h = parseInt(intervalHours, 10);
      if (isNaN(h) || h < 1 || h > 168) e.intervalHours = 'Enter a number between 1 and 168.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = (): boolean => {
    const e: Record<string, string> = {};
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
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const handleSave = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep3() || !firebaseUser || !selectedPet) return;
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

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      
      {/* Header & Steps */}
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>STEP {step} OF 3</Text>
        <Text style={styles.title}>
          {step === 1 && "What is it?"}
          {step === 2 && "Dosage"}
          {step === 3 && "Schedule"}
        </Text>
      </View>

      {selectedPet && (
        <View style={styles.petBadge}>
          <Ionicons name="paw" size={16} color={colors.brand} />
          <Text style={styles.petBadgeText}>For {selectedPet.name}</Text>
        </View>
      )}

      {/* ── STEP 1 ─────────────────────────────── */}
      {step === 1 && (
        <View style={styles.stepContainer}>
          <View style={styles.section}>
            <Text style={styles.label}>Medication name <Text style={styles.required}>*</Text></Text>
            <TextInput
              placeholder="e.g. Omega-3, Doxycycline 50mg"
              value={name}
              onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: '' })); }}
              error={errors.name}
            />
          </View>
          
          <View style={styles.section}>
            <Text style={styles.label}>Reason / Condition</Text>
            <TextInput
              placeholder="e.g. Joint support, post-surgery"
              value={reason}
              onChangeText={setReason}
            />
          </View>
        </View>
      )}

      {/* ── STEP 2 ─────────────────────────────── */}
      {step === 2 && (
        <View style={styles.stepContainer}>
          <View style={styles.section}>
            <Text style={styles.label}>Dose instruction <Text style={styles.required}>*</Text></Text>
            <TextInput
              placeholder="e.g. 1 capsule with food"
              value={doseInstruction}
              onChangeText={(t) => { setDoseInstruction(t); setErrors((e) => ({ ...e, doseInstruction: '' })); }}
              error={errors.doseInstruction}
            />
          </View>

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
                  <Text style={[styles.freqLabel, freqKind === f.key && styles.freqLabelSelected]}>{f.label}</Text>
                  <Text style={[styles.freqDesc, freqKind === f.key && styles.freqDescSelected]}>{f.description}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {freqKind === 'every_n_hours' && (
            <View style={styles.section}>
              <Text style={styles.label}>Interval (hours)</Text>
              <TextInput
                placeholder="e.g. 8"
                keyboardType="number-pad"
                value={intervalHours}
                onChangeText={(t) => { setIntervalHours(t); setErrors((e) => ({ ...e, intervalHours: '' })); }}
                error={errors.intervalHours}
              />
            </View>
          )}

          {freqKind === 'daily' && (
            <View style={styles.section}>
              <Text style={styles.label}>Time(s) daily</Text>
              <TextInput placeholder="08:00 or 08:00, 20:00" value={dailyTimes} onChangeText={setDailyTimes} />
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
                      style={[styles.dayBox, weeklyDays.includes(i) && styles.dayBoxSelected]}
                      onPress={() => setWeeklyDays((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort())}
                    >
                      <Text style={[styles.dayLabel, weeklyDays.includes(i) && styles.dayLabelSelected]}>{d}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.section}>
                <Text style={styles.label}>Time(s)</Text>
                <TextInput placeholder="08:00" value={weeklyTimes} onChangeText={setWeeklyTimes} />
              </View>
            </>
          )}
        </View>
      )}

      {/* ── STEP 3 ─────────────────────────────── */}
      {step === 3 && (
        <View style={styles.stepContainer}>
          <View style={styles.section}>
            <Text style={styles.label}>Start date <Text style={styles.required}>*</Text></Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={(t) => { setStartDate(t); setErrors((e) => ({ ...e, startDate: '' })); }}
              keyboardType="numbers-and-punctuation"
              error={errors.startDate}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>End date (leave blank if ongoing)</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChangeText={(t) => { setEndDate(t); setErrors((e) => ({ ...e, endDate: '' })); }}
              keyboardType="numbers-and-punctuation"
              error={errors.endDate}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Prescribing vet / clinic</Text>
            <TextInput placeholder="e.g. Dr. Priya Perera, Colombo Pet Care" value={prescribingVet} onChangeText={setPrescribingVet} />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              placeholder="Any extra notes…"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={{ minHeight: 100, textAlignVertical: 'top' }}
            />
          </View>
        </View>
      )}

      {/* Footer Actions */}
      <View style={styles.footer}>
        {step < 3 ? (
          <Button label="Next Step" onPress={handleNext} />
        ) : (
          <Button label={loading ? 'Saving…' : 'Save Medication'} loading={loading} onPress={handleSave} />
        )}
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
  
  stepIndicator: { flexDirection: 'row', gap: 8 },
  stepDot: { width: 32, height: 6, borderRadius: 3, backgroundColor: colors.line },
  stepDotActive: { backgroundColor: colors.brand },

  header: { marginBottom: space.md },
  eyebrow: { color: colors.brand, fontWeight: '900', fontSize: 11, letterSpacing: 1.5 },
  title: { color: colors.ink, fontSize: 34, fontWeight: '900', letterSpacing: -1, marginTop: 6 },
  
  petBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: colors.mist, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, marginBottom: space.lg },
  petBadgeText: { color: colors.brand, fontSize: 14, fontWeight: '800' },

  stepContainer: { gap: space.xl },
  section: { gap: 10 },
  label: { color: colors.ink, fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
  required: { color: colors.danger },
  error: { color: colors.danger, fontSize: 13, fontWeight: '700' },

  freqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  freqPill: { padding: 16, borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, width: '48%' },
  freqPillSelected: { borderColor: colors.brand, backgroundColor: colors.softBrand },
  freqLabel: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  freqLabelSelected: { color: colors.brand },
  freqDesc: { color: colors.muted, fontSize: 12, marginTop: 4 },
  freqDescSelected: { color: colors.brandDark },

  dayRow: { flexDirection: 'row', gap: 8 },
  dayBox: { width: 44, height: 44, borderRadius: 14, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  dayBoxSelected: { borderColor: colors.brand, backgroundColor: colors.brand },
  dayLabel: { color: colors.muted, fontSize: 15, fontWeight: '800' },
  dayLabelSelected: { color: '#fff' },

  footer: { marginTop: space.xxl },
});
