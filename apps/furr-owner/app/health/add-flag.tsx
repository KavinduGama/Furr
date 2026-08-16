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
import type { HealthFlagType, HealthFlagStatus } from '@furr/core';
import { createFlag } from '@furr/firebase';
import { Button, colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';
import { useHealth } from '@/src/context/health';

export default function AddFlagScreen() {
  const { firebaseUser } = useAuth();
  const { selectedPet } = usePets();
  const { addFlag } = useHealth();

  const [type, setType] = useState<HealthFlagType>('allergy');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<HealthFlagStatus>('active');
  const [startedOn, setStartedOn] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Name is required.';
    if (startedOn && isNaN(new Date(startedOn).getTime())) {
      e.startedOn = 'Enter a valid date (YYYY-MM-DD).';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !firebaseUser || !selectedPet) return;
    setSaving(true);
    try {
      const flag = await createFlag(firebaseUser.uid, selectedPet.id, {
        type,
        title: title.trim(),
        status,
        startedOn: startedOn.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      addFlag(flag);
      router.back();
    } catch {
      Alert.alert('Error', 'Couldn\'t save. Please try again.');
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
        <Text style={styles.eyebrow}>MEDICAL ALERTS</Text>
        <Text style={styles.title}>Add Flag</Text>
      </View>

      {selectedPet && (
        <View style={styles.petBadge}>
          <Ionicons name="paw" size={16} color={colors.brand} />
          <Text style={styles.petBadgeText}>For {selectedPet.name}</Text>
        </View>
      )}

      <View style={styles.sectionContainer}>
        {/* Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.rowGrid}>
            <Pressable
              style={[styles.typeCard, type === 'allergy' && { borderColor: '#E65100', backgroundColor: '#FFF3E0' }]}
              onPress={() => setType('allergy')}
            >
              <Ionicons name="warning" size={24} color={type === 'allergy' ? '#E65100' : colors.muted} />
              <Text style={[styles.typeLabel, type === 'allergy' && { color: '#E65100' }]}>Allergy</Text>
            </Pressable>
            <Pressable
              style={[styles.typeCard, type === 'condition' && { borderColor: colors.brand, backgroundColor: colors.mist }]}
              onPress={() => setType('condition')}
            >
              <Ionicons name="medkit" size={24} color={type === 'condition' ? colors.brand : colors.muted} />
              <Text style={[styles.typeLabel, type === 'condition' && { color: colors.brand }]}>Condition</Text>
            </Pressable>
          </View>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, !!errors.title && styles.inputError]}
            placeholder={type === 'allergy' ? "e.g. Chicken, Penicillin" : "e.g. Diabetes, Arthritis"}
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={(t) => { setTitle(t); setErrors((e) => ({ ...e, title: '' })); }}
            maxLength={80}
          />
          {!!errors.title && <Text style={styles.error}>{errors.title}</Text>}
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.rowGrid}>
            {['active', 'inactive', 'unknown'].map((s) => {
              const active = status === s;
              return (
                <Pressable
                  key={s}
                  style={[styles.statusCard, active && styles.statusCardActive]}
                  onPress={() => setStatus(s as HealthFlagStatus)}
                >
                  <Text style={[styles.statusLabel, active && styles.statusLabelActive]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Start Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Known since (optional)</Text>
          <TextInput
            style={[styles.input, !!errors.startedOn && styles.inputError]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            value={startedOn}
            onChangeText={(t) => { setStartedOn(t); setErrors((e) => ({ ...e, startedOn: '' })); }}
            maxLength={10}
          />
          {!!errors.startedOn && <Text style={styles.error}>{errors.startedOn}</Text>}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes or reaction (optional)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="e.g. Causes severe hives..."
            placeholderTextColor={colors.muted}
            value={notes}
            onChangeText={setNotes}
            multiline
            maxLength={300}
          />
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Ionicons name="shield-checkmark" size={20} color={colors.brand} />
        <Text style={styles.disclaimerText}>
          Flags appear prominently in your pet's record to alert veterinarians of critical information.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button label={saving ? 'Saving…' : 'Save flag'} loading={saving} onPress={handleSave} disabled={!title.trim()} />
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

  rowGrid: { flexDirection: 'row', gap: 12 },
  typeCard: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: radius.xl, paddingVertical: 16, borderWidth: 1.5, borderColor: colors.line, shadowColor: colors.ink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  typeLabel: { color: colors.muted, fontSize: 15, fontWeight: '900' },
  
  statusCard: { flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.xl, paddingVertical: 14, borderWidth: 1.5, borderColor: colors.line },
  statusCardActive: { borderColor: colors.brand, backgroundColor: colors.softBrand },
  statusLabel: { color: colors.muted, fontSize: 14, fontWeight: '800' },
  statusLabelActive: { color: colors.brand },

  input: { minHeight: 52, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, fontSize: 16, color: colors.ink, fontWeight: '600' },
  inputError: { borderColor: colors.danger },
  textarea: { minHeight: 120, paddingTop: 14, textAlignVertical: 'top' },
  error: { color: colors.danger, fontSize: 13, fontWeight: '700' },

  disclaimer: { flexDirection: 'row', gap: 12, backgroundColor: colors.surface, padding: 16, borderRadius: radius.xl, alignItems: 'flex-start', borderWidth: 1, borderColor: colors.line, shadowColor: colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, marginTop: space.xl },
  disclaimerText: { color: colors.ink, fontSize: 14, lineHeight: 20, flex: 1, fontWeight: '600' },

  footer: { marginTop: space.xxl },
});
