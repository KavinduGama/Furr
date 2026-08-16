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
import { VACCINE_TYPES, type VaccineType } from '@furr/core';
import { createVaccination } from '@furr/firebase';
import { Button, TextInput, colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';
import { useHealth } from '@/src/context/health';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddVaccinationScreen() {
  const { firebaseUser } = useAuth();
  const { selectedPet } = usePets();
  const { addVaccination } = useHealth();

  const [step, setStep] = useState(1);

  // Step 1: Type
  const [vaccineType, setVaccineType] = useState<VaccineType | null>(null);
  const [customName, setCustomName] = useState('');

  // Step 2: Administration
  const [administeredOn, setAdministeredOn] = useState(todayIso());
  const [nextDueOn, setNextDueOn] = useState('');
  const [veterinarian, setVeterinarian] = useState('');
  const [clinic, setClinic] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [certNumber, setCertNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!vaccineType) e.vaccineType = 'Please select a vaccine type.';
    if (vaccineType === 'Other' && !customName.trim()) e.customName = 'Enter a vaccine name.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Record<string, string> = {};
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

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleSave = async () => {
    if (!validateStep1() || !validateStep2() || !firebaseUser || !selectedPet) return;
    setLoading(true);
    try {
      const provenance = 'OWNER_ENTERED';

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
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>STEP {step} OF 2</Text>
        <Text style={styles.title}>
          {step === 1 && "Vaccine Details"}
          {step === 2 && "Administration"}
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
            <Text style={styles.label}>Vaccine type <Text style={styles.required}>*</Text></Text>
            <View style={styles.typeGrid}>
              {VACCINE_TYPES.map((t) => (
                <Pressable
                  key={t}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: vaccineType === t }}
                  style={[styles.typePill, vaccineType === t && styles.typePillSelected]}
                  onPress={() => { setVaccineType(t); setErrors((e) => ({ ...e, vaccineType: '' })); }}
                >
                  <Text style={[styles.typePillText, vaccineType === t && styles.typePillTextSelected]}>{t}</Text>
                </Pressable>
              ))}
            </View>
            {!!errors.vaccineType && <Text style={styles.error}>{errors.vaccineType}</Text>}
          </View>

          {vaccineType === 'Other' && (
            <View style={styles.section}>
              <Text style={styles.label}>Vaccine name <Text style={styles.required}>*</Text></Text>
              <TextInput
                placeholder="Enter vaccine name"
                value={customName}
                onChangeText={(t) => { setCustomName(t); setErrors((e) => ({ ...e, customName: '' })); }}
                error={errors.customName}
              />
            </View>
          )}
        </View>
      )}

      {/* ── STEP 2 ─────────────────────────────── */}
      {step === 2 && (
        <View style={styles.stepContainer}>
          <View style={styles.notice}>
            <Ionicons name="information-circle" size={20} color={colors.brand} />
            <Text style={styles.noticeText}>
              This record will be marked <Text style={styles.bold}>Owner entered</Text>. Only a verified vet can mark it as professionally verified.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Date administered <Text style={styles.required}>*</Text></Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              value={administeredOn}
              onChangeText={(t) => { setAdministeredOn(t); setErrors((e) => ({ ...e, administeredOn: '' })); }}
              keyboardType="numbers-and-punctuation"
              error={errors.administeredOn}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Next due date</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              value={nextDueOn}
              onChangeText={(t) => { setNextDueOn(t); setErrors((e) => ({ ...e, nextDueOn: '' })); }}
              keyboardType="numbers-and-punctuation"
              error={errors.nextDueOn}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Veterinarian</Text>
            <TextInput placeholder="e.g. Dr. Priya Perera" value={veterinarian} onChangeText={setVeterinarian} />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Clinic</Text>
            <TextInput placeholder="e.g. Colombo Pet Care Centre" value={clinic} onChangeText={setClinic} />
          </View>

          <View style={styles.twoCol}>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>Batch / lot no.</Text>
              <TextInput placeholder="Batch" value={batchNumber} onChangeText={setBatchNumber} />
            </View>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>Certificate no.</Text>
              <TextInput placeholder="Cert. no." value={certNumber} onChangeText={setCertNumber} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              placeholder="Any additional notes…"
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
        {step < 2 ? (
          <Button label="Next Step" onPress={handleNext} />
        ) : (
          <Button label={loading ? 'Saving…' : 'Save Vaccination'} loading={loading} onPress={handleSave} />
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
  stepDot: { width: 48, height: 6, borderRadius: 3, backgroundColor: colors.line },
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

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typePill: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface },
  typePillSelected: { borderColor: colors.brand, backgroundColor: colors.softBrand },
  typePillText: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  typePillTextSelected: { color: colors.brand },

  twoCol: { flexDirection: 'row', gap: space.md },
  
  notice: { flexDirection: 'row', gap: 12, backgroundColor: colors.surface, padding: 16, borderRadius: radius.xl, alignItems: 'flex-start', borderWidth: 1, borderColor: colors.line, shadowColor: colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8 },
  noticeText: { color: colors.ink, fontSize: 14, lineHeight: 20, flex: 1, fontWeight: '600' },
  bold: { fontWeight: '900', color: colors.brand },

  footer: { marginTop: space.xxl },
});
