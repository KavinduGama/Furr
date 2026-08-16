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
import type { ObservationCategory, ObservationSeverity } from '@furr/core';
import { createObservation } from '@furr/firebase';
import { Button, TextInput, colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';
import { useHealth } from '@/src/context/health';

const CATEGORIES: { key: ObservationCategory; label: string; icon: string }[] = [
  { key: 'symptom', label: 'Symptom', icon: 'medical' },
  { key: 'behaviour', label: 'Behaviour', icon: 'happy' },
  { key: 'appetite', label: 'Appetite', icon: 'restaurant' },
  { key: 'energy', label: 'Energy', icon: 'flash' },
  { key: 'digestion', label: 'Digestion', icon: 'water' },
  { key: 'skin_coat', label: 'Skin/Coat', icon: 'cut' },
  { key: 'injury', label: 'Injury', icon: 'bandage' },
  { key: 'other', label: 'Other', icon: 'add-circle' },
];

const SEVERITIES: { key: ObservationSeverity; label: string; color: string }[] = [
  { key: 'mild', label: 'Mild', color: '#F2C94C' },
  { key: 'moderate', label: 'Moderate', color: '#F2994A' },
  { key: 'concerning', label: 'Concerning', color: colors.danger },
];

function todayYMD(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddObservationScreen() {
  const { firebaseUser } = useAuth();
  const { selectedPet } = usePets();
  const { addObservation } = useHealth();

  const [category, setCategory] = useState<ObservationCategory>('symptom');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<ObservationSeverity | undefined>();
  const [observedOn, setObservedOn] = useState(todayYMD());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!description.trim()) e.description = 'Description is required.';
    if (!observedOn) {
      e.observedOn = 'Date is required.';
    } else if (isNaN(new Date(observedOn).getTime())) {
      e.observedOn = 'Enter a valid date (YYYY-MM-DD).';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !firebaseUser || !selectedPet) return;
    setSaving(true);
    try {
      const observation = await createObservation(firebaseUser.uid, selectedPet.id, {
        category,
        description: description.trim(),
        severity,
        observedOn,
        provenance: 'OWNER_ENTERED',
      });
      addObservation(observation);
      router.back();
    } catch {
      Alert.alert('Error', 'Couldn\'t save the observation. Please try again.');
    } finally {
      setSaving(false);
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
        <Text style={styles.eyebrow}>HEALTH RECORDS</Text>
        <Text style={styles.title}>New Observation</Text>
      </View>

      {selectedPet && (
        <View style={styles.petBadge}>
          <Ionicons name="paw" size={16} color={colors.brand} />
          <Text style={styles.petBadgeText}>For {selectedPet.name}</Text>
        </View>
      )}

      <View style={styles.sectionContainer}>
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map((cat) => {
              const active = category === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  style={[styles.catCard, active && styles.catCardActive]}
                  onPress={() => setCategory(cat.key)}
                >
                  <Ionicons name={cat.icon as never} size={24} color={active ? colors.brand : colors.muted} />
                  <Text style={[styles.catLabel, active && styles.catLabelActive]}>{cat.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Severity (optional)</Text>
          <View style={styles.sevGrid}>
            {SEVERITIES.map((sev) => {
              const active = severity === sev.key;
              return (
                <Pressable
                  key={sev.key}
                  style={[styles.sevCard, active && { borderColor: sev.color, backgroundColor: `${sev.color}10` }]}
                  onPress={() => setSeverity(active ? undefined : sev.key)}
                >
                  <Text style={[styles.sevLabel, active && { color: sev.color }]}>{sev.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
          <TextInput
            placeholder="e.g. Scratched ear more than usual..."
            value={description}
            onChangeText={(t) => { setDescription(t); setErrors((e) => ({ ...e, description: '' })); }}
            multiline
            numberOfLines={4}
            error={errors.description}
            style={{ minHeight: 120, textAlignVertical: 'top' }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date observed <Text style={styles.required}>*</Text></Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            value={observedOn}
            onChangeText={(t) => { setObservedOn(t); setErrors((e) => ({ ...e, observedOn: '' })); }}
            error={errors.observedOn}
          />
        </View>

        <View style={styles.disclaimer}>
          <Ionicons name="information-circle" size={20} color={colors.brand} />
          <Text style={styles.disclaimerText}>
            This is an owner-entered observation and not a medical diagnosis. It will be shared with verified professionals when you grant them access.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button label={saving ? 'Saving…' : 'Save observation'} loading={saving} onPress={handleSave} disabled={!description.trim()} />
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
  error: { color: colors.danger, fontSize: 13, fontWeight: '700' },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: { width: '23%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: 12, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.line },
  catCardActive: { borderColor: colors.brand, backgroundColor: colors.softBrand },
  catLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', textAlign: 'center' },
  catLabelActive: { color: colors.brand },

  sevGrid: { flexDirection: 'row', gap: 10 },
  sevCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.xl, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.line },
  sevLabel: { color: colors.muted, fontSize: 14, fontWeight: '800' },

  disclaimer: { flexDirection: 'row', gap: 12, backgroundColor: colors.surface, padding: 16, borderRadius: radius.xl, alignItems: 'flex-start', borderWidth: 1, borderColor: colors.line, shadowColor: colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8 },
  disclaimerText: { color: colors.ink, fontSize: 14, lineHeight: 20, flex: 1, fontWeight: '600' },

  footer: { marginTop: space.xxl },
});
