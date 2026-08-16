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
import type { WeightUnit } from '@furr/core';
import { createWeightEntry } from '@furr/firebase';
import { Button, TextInput, colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';
import { useHealth } from '@/src/context/health';

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

  const trend = (() => {
    if (!lastWeight || !value || isNaN(parseFloat(value))) return null;
    const prev = lastWeight.unit === unit ? lastWeight.value : lastWeight.unit === 'kg' ? lastWeight.value * 2.205 : lastWeight.value / 2.205;
    const diff = parseFloat(value) - prev;
    if (Math.abs(diff) < 0.05) return null;
    return { diff: Math.abs(diff).toFixed(1), up: diff > 0 };
  })();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>HEALTH RECORDS</Text>
        <Text style={styles.title}>Log Weight</Text>
      </View>

      {selectedPet && (
        <View style={styles.petBadge}>
          <Ionicons name="paw" size={16} color={colors.brand} />
          <Text style={styles.petBadgeText}>For {selectedPet.name}</Text>
        </View>
      )}

      {lastWeight && (
        <View style={styles.lastWeight}>
          <Ionicons name="time" size={16} color={colors.muted} />
          <Text style={styles.lastWeightText}>
            Last recorded: <Text style={styles.bold}>{lastWeight.value} {lastWeight.unit}</Text> on {lastWeight.measuredOn}
          </Text>
        </View>
      )}

      <View style={styles.sectionContainer}>
        <View style={styles.section}>
          <Text style={styles.label}>Weight <Text style={styles.required}>*</Text></Text>
          <View style={styles.weightRow}>
            <View style={{flex: 1}}>
              <TextInput
                placeholder="0.0"
                value={value}
                onChangeText={(t) => { setValue(t); setErrors((e) => ({ ...e, value: '' })); }}
                keyboardType="decimal-pad"
                error={errors.value}
                style={styles.weightInputOverride}
              />
            </View>
            <View style={styles.unitToggle}>
              {(['kg', 'lbs'] as WeightUnit[]).map((u) => (
                <Pressable
                  key={u}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: unit === u }}
                  style={[styles.unitBtn, unit === u && styles.unitBtnSelected]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={[styles.unitBtnText, unit === u && styles.unitBtnTextSelected]}>{u}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          
          {trend && (
            <View style={[styles.trendHint, trend.up ? styles.trendUp : styles.trendDown]}>
              <Ionicons name={trend.up ? 'trending-up' : 'trending-down'} size={16} color={trend.up ? '#B8870F' : colors.brand} />
              <Text style={[styles.trendText, { color: trend.up ? '#B8870F' : colors.brand }]}>
                {trend.up ? '+' : '-'}{trend.diff} {unit} from last entry
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date measured <Text style={styles.required}>*</Text></Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            value={measuredOn}
            onChangeText={(t) => { setMeasuredOn(t); setErrors((e) => ({ ...e, measuredOn: '' })); }}
            keyboardType="numbers-and-punctuation"
            error={errors.measuredOn}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Note (optional)</Text>
          <TextInput
            placeholder="e.g. After vet visit…"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={2}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button label={loading ? 'Saving…' : 'Save weight'} loading={loading} disabled={!value || !measuredOn} onPress={handleSave} />
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

  lastWeight: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, padding: 16, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, marginBottom: space.md, shadowColor: colors.ink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8 },
  lastWeightText: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  bold: { fontWeight: '900', color: colors.ink },

  sectionContainer: { gap: space.xl, marginTop: space.sm },
  section: { gap: 10 },
  label: { color: colors.ink, fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
  required: { color: colors.danger },
  
  weightRow: { flexDirection: 'row', gap: 12 },
  weightInputOverride: { fontSize: 24, fontWeight: '900', textAlign: 'center', height: 60 },
  
  unitToggle: { borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, overflow: 'hidden', flexDirection: 'row', height: 60 },
  unitBtn: { paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  unitBtnSelected: { backgroundColor: colors.brand },
  unitBtnText: { color: colors.muted, fontSize: 15, fontWeight: '900' },
  unitBtnTextSelected: { color: '#fff' },

  trendHint: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.md, alignSelf: 'flex-start', marginTop: 4 },
  trendUp: { backgroundColor: colors.warm },
  trendDown: { backgroundColor: colors.mist },
  trendText: { fontSize: 13, fontWeight: '800' },

  footer: { marginTop: space.xxl },
});
