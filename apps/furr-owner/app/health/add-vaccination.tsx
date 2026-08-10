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
import { VACCINE_TYPES, type VaccineType } from '@furr/core';
import { createVaccination } from '@furr/firebase';
import { Button, colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';
import { useHealth } from '@/src/context/health';

// ─────────────────────────────────────────────────────────────
//  Add Vaccination screen  (VAC-001)
// ─────────────────────────────────────────────────────────────

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddVaccinationScreen() {
  const { firebaseUser } = useAuth();
  const { selectedPet } = usePets();
  const { addVaccination } = useHealth();

  // Required
  const [vaccineType, setVaccineType] = useState<VaccineType | null>(null);
  const [customName, setCustomName] = useState('');
  const [administeredOn, setAdministeredOn] = useState(todayIso());

  // Optional
  const [nextDueOn, setNextDueOn] = useState('');
  const [veterinarian, setVeterinarian] = useState('');
  const [clinic, setClinic] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [certNumber, setCertNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [showOptional, setShowOptional] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // ── Validation ────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!vaccineType) e.vaccineType = 'Please select a vaccine type.';
    if (vaccineType === 'Other' && !customName.trim()) e.customName = 'Enter a vaccine name.';
    if (!administeredOn) {
      e.administeredOn = 'Administration date is required.';
    } else {
      const d = new Date(administeredOn);
      if (isNaN(d.getTime())) e.administeredOn = 'Enter a valid date (YYYY-MM-DD).';
      else if (d > new Date()) e.administeredOn = 'Administration date cannot be in the future.';
    }
    if (nextDueOn) {
      const due = new Date(nextDueOn);
      const given = new Date(administeredOn);
      if (isNaN(due.getTime())) e.nextDueOn = 'Enter a valid date (YYYY-MM-DD).';
      else if (due <= given) e.nextDueOn = 'Next due date must be after the administration date.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────

  const handleSave = async () => {
    if (!validate() || !firebaseUser || !selectedPet) return;
    setLoading(true);
    try {
      const hasDoc = false; // document upload comes in DOC-001
      const provenance = hasDoc ? 'OWNER_ENTERED_WITH_DOCUMENT' : 'OWNER_ENTERED';

      const rec = await createVaccination(firebaseUser.uid, selectedPet.id, {
        vaccineType: vaccineType!,
        customVaccineName: vaccineType === 'Other' ? customName.trim() : undefined,
        administeredOn,
        nextDueOn: nextDueOn || undefined,
        veterinarian: veterinarian.trim() || undefined,
        clinic: clinic.trim() || undefined,
        batchNumber: batchNumber.trim() || undefined,
        certificateNumber: certNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        provenance,
        createdByUid: firebaseUser.uid,
        isArchived: false,
      });

      addVaccination(rec);
      router.back();
    } catch {
      Alert.alert('Something went wrong', 'Couldn\'t save the vaccination record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSave = !!vaccineType && !!administeredOn && (vaccineType !== 'Other' || !!customName.trim());

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
        <Text style={styles.heading}>Add vaccination</Text>
        <View style={{ width: 60 }} />
      </View>

      {selectedPet && (
        <View style={styles.petBadge}>
          <Ionicons name="paw" size={13} color={colors.brand} />
          <Text style={styles.petBadgeText}>For {selectedPet.name}</Text>
        </View>
      )}

      {/* Provenance notice */}
      <View style={styles.notice}>
        <Ionicons name="information-circle-outline" size={16} color={colors.brand} />
        <Text style={styles.noticeText}>
          This record will be marked <Text style={styles.bold}>Owner entered</Text>.
          Only a verified vet can mark it as professionally verified.
        </Text>
      </View>

      {/* Vaccine type */}
      <View style={styles.section}>
        <Text style={styles.label}>Vaccine type <Text style={styles.required}>*</Text></Text>
        <View style={styles.typeGrid}>
          {VACCINE_TYPES.map((t) => (
            <Pressable
              key={t}
              accessibilityRole="radio"
              accessibilityState={{ selected: vaccineType === t }}
              style={[styles.typePill, vaccineType === t && styles.typePillSelected]}
              onPress={() => {
                setVaccineType(t);
                setErrors((e) => ({ ...e, vaccineType: '' }));
              }}
            >
              <Text style={[styles.typePillText, vaccineType === t && styles.typePillTextSelected]}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
        {!!errors.vaccineType && <Text style={styles.error}>{errors.vaccineType}</Text>}
      </View>

      {/* Custom name */}
      {vaccineType === 'Other' && (
        <View style={styles.section}>
          <Text style={styles.label}>Vaccine name <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, !!errors.customName && styles.inputError]}
            placeholder="Enter vaccine name"
            placeholderTextColor={colors.muted}
            value={customName}
            onChangeText={(t) => { setCustomName(t); setErrors((e) => ({ ...e, customName: '' })); }}
            maxLength={80}
            accessibilityLabel="Custom vaccine name"
          />
          {!!errors.customName && <Text style={styles.error}>{errors.customName}</Text>}
        </View>
      )}

      {/* Administration date */}
      <View style={styles.section}>
        <Text style={styles.label}>Date administered <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, !!errors.administeredOn && styles.inputError]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.muted}
          value={administeredOn}
          onChangeText={(t) => { setAdministeredOn(t); setErrors((e) => ({ ...e, administeredOn: '' })); }}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          accessibilityLabel="Date administered"
        />
        {!!errors.administeredOn && <Text style={styles.error}>{errors.administeredOn}</Text>}
      </View>

      {/* Optional details toggle */}
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
          {/* Next due date */}
          <View style={styles.section}>
            <Text style={styles.label}>Next due date</Text>
            <TextInput
              style={[styles.input, !!errors.nextDueOn && styles.inputError]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              value={nextDueOn}
              onChangeText={(t) => { setNextDueOn(t); setErrors((e) => ({ ...e, nextDueOn: '' })); }}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              accessibilityLabel="Next due date"
            />
            {!!errors.nextDueOn && <Text style={styles.error}>{errors.nextDueOn}</Text>}
          </View>

          {/* Veterinarian */}
          <View style={styles.section}>
            <Text style={styles.label}>Veterinarian</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Dr. Priya Perera"
              placeholderTextColor={colors.muted}
              value={veterinarian}
              onChangeText={setVeterinarian}
              maxLength={80}
              accessibilityLabel="Veterinarian"
            />
          </View>

          {/* Clinic */}
          <View style={styles.section}>
            <Text style={styles.label}>Clinic</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Colombo Pet Care Centre"
              placeholderTextColor={colors.muted}
              value={clinic}
              onChangeText={setClinic}
              maxLength={80}
              accessibilityLabel="Clinic"
            />
          </View>

          {/* Batch & cert */}
          <View style={styles.twoCol}>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>Batch / lot no.</Text>
              <TextInput
                style={styles.input}
                placeholder="Batch"
                placeholderTextColor={colors.muted}
                value={batchNumber}
                onChangeText={setBatchNumber}
                maxLength={30}
                accessibilityLabel="Batch number"
              />
            </View>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>Certificate no.</Text>
              <TextInput
                style={styles.input}
                placeholder="Cert. no."
                placeholderTextColor={colors.muted}
                value={certNumber}
                onChangeText={setCertNumber}
                maxLength={30}
                accessibilityLabel="Certificate number"
              />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Any additional notes…"
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
        label={loading ? 'Saving…' : 'Save vaccination record'}
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
  notice: { flexDirection: 'row', gap: 8, backgroundColor: colors.mist, padding: 12, borderRadius: radius.md, alignItems: 'flex-start' },
  noticeText: { color: colors.brand, fontSize: 12, lineHeight: 17, flex: 1 },
  bold: { fontWeight: '900' },
  section: { gap: 7 },
  label: { color: colors.ink, fontSize: 13, fontWeight: '800', letterSpacing: 0.2 },
  required: { color: colors.danger },
  input: { minHeight: 52, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, fontSize: 16, color: colors.ink, fontWeight: '600' },
  inputError: { borderColor: colors.danger },
  textarea: { minHeight: 88, paddingTop: 14, textAlignVertical: 'top' },
  error: { color: colors.danger, fontSize: 12, fontWeight: '700' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typePill: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface },
  typePillSelected: { borderColor: colors.brand, backgroundColor: colors.mist },
  typePillText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  typePillTextSelected: { color: colors.brand },
  twoCol: { flexDirection: 'row', gap: 10 },
  optionalToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', paddingVertical: 6 },
  optionalToggleText: { color: colors.brand, fontSize: 13, fontWeight: '800' },
  optionalBlock: { gap: space.md },
});
