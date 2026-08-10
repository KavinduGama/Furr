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
import type { ObservationCategory, ObservationSeverity } from '@furr/core';
import { createObservation } from '@furr/firebase';
import { Button, colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';

// ─────────────────────────────────────────────────────────────
//  Add Health Observation screen (HLT-001)
// ─────────────────────────────────────────────────────────────

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
      await createObservation(firebaseUser.uid, selectedPet.id, {
        category,
        description: description.trim(),
        severity,
        observedOn,
        provenance: 'OWNER_ENTERED',
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Couldn\'t save the observation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.cancel}><Text style={styles.cancelText}>Cancel</Text></Pressable>
        <Text style={styles.heading}>New observation</Text>
        <View style={{ width: 60 }} />
      </View>

      {selectedPet && (
        <View style={styles.petBadge}>
          <Ionicons name="paw" size={13} color={colors.brand} />
          <Text style={styles.petBadgeText}>For {selectedPet.name}</Text>
        </View>
      )}

      {/* Category */}
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
                <Ionicons name={cat.icon as never} size={18} color={active ? colors.brand : colors.muted} />
                <Text style={[styles.catLabel, active && styles.catLabelActive]}>{cat.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Severity */}
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

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, styles.textarea, !!errors.description && styles.inputError]}
          placeholder="e.g. Scratched ear more than usual..."
          placeholderTextColor={colors.muted}
          value={description}
          onChangeText={(t) => { setDescription(t); setErrors((e) => ({ ...e, description: '' })); }}
          multiline
          maxLength={300}
        />
        {!!errors.description && <Text style={styles.error}>{errors.description}</Text>}
      </View>

      {/* Date */}
      <View style={styles.section}>
        <Text style={styles.label}>Date observed <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, !!errors.observedOn && styles.inputError]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.muted}
          value={observedOn}
          onChangeText={(t) => { setObservedOn(t); setErrors((e) => ({ ...e, observedOn: '' })); }}
          maxLength={10}
        />
        {!!errors.observedOn && <Text style={styles.error}>{errors.observedOn}</Text>}
      </View>

      <View style={styles.disclaimer}>
        <Ionicons name="information-circle" size={16} color={colors.muted} />
        <Text style={styles.disclaimerText}>
          This is an owner-entered observation and not a medical diagnosis. It will be shared with verified professionals when you grant them access.
        </Text>
      </View>

      <Button label="Save observation" loading={saving} onPress={handleSave} disabled={!description.trim()} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: space.md, gap: space.md },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  cancel: { padding: 4 },
  cancelText: { color: colors.brand, fontSize: 15, fontWeight: '700' },
  heading: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  petBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: colors.mist, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  petBadgeText: { color: colors.brand, fontSize: 12, fontWeight: '800' },
  section: { gap: 8 },
  label: { color: colors.ink, fontSize: 13, fontWeight: '800', letterSpacing: 0.2 },
  required: { color: colors.danger },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catCard: { width: '23%', backgroundColor: colors.surface, borderRadius: radius.md, padding: 10, alignItems: 'center', gap: 5, borderWidth: 1, borderColor: colors.line },
  catCardActive: { borderColor: colors.brand, backgroundColor: colors.mist },
  catLabel: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  catLabelActive: { color: colors.brand },
  sevGrid: { flexDirection: 'row', gap: 10 },
  sevCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.line },
  sevLabel: { color: colors.muted, fontSize: 13, fontWeight: '800' },
  input: { minHeight: 52, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, fontSize: 15, color: colors.ink, fontWeight: '600' },
  inputError: { borderColor: colors.danger },
  textarea: { minHeight: 90, paddingTop: 14, textAlignVertical: 'top' },
  error: { color: colors.danger, fontSize: 12, fontWeight: '700' },
  disclaimer: { flexDirection: 'row', gap: 8, backgroundColor: colors.pearl, padding: 12, borderRadius: radius.md },
  disclaimerText: { color: colors.muted, fontSize: 11, lineHeight: 15, flex: 1 },
});
