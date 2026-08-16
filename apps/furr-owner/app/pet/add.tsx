import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Pet, PetSpecies, PetSex } from '@furr/core';
import { createPet, updatePet } from '@furr/firebase';
import { Button, TextInput, colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';

type SpeciesOption = { key: PetSpecies; label: string; icon: keyof typeof Ionicons.glyphMap };
type SexOption = { key: PetSex; label: string };

const SPECIES: SpeciesOption[] = [
  { key: 'dog', label: 'Dog', icon: 'paw' },
  { key: 'cat', label: 'Cat', icon: 'moon' },
];

const SEX_OPTIONS: SexOption[] = [
  { key: 'male', label: 'Male' },
  { key: 'female', label: 'Female' },
  { key: 'unknown', label: 'Unknown' },
];

export default function AddPetScreen() {
  const { firebaseUser, isPreviewSession } = useAuth();
  const { pets, addPet, patchPet } = usePets();
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  const petToEdit = pets.find((pet) => pet.id === petId);

  // Wizard State
  const [step, setStep] = useState(1);

  // Required
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<PetSpecies | null>(null);
  const [sex, setSex] = useState<PetSex | null>(null);

  // Optional
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [colour, setColour] = useState('');
  const [microchip, setMicrochip] = useState('');
  const [isNeutered, setIsNeutered] = useState<boolean | null>(null);
  const [note, setNote] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!petToEdit) return;
    setName(petToEdit.name);
    setSpecies(petToEdit.species);
    setSex(petToEdit.sex);
    setBreed(petToEdit.breed ?? '');
    setBirthDate(petToEdit.birthDate ?? '');
    setColour(petToEdit.colour ?? '');
    setMicrochip(petToEdit.microchipNumber ?? '');
    setIsNeutered(petToEdit.isNeutered ?? null);
    setNote(petToEdit.generalNote ?? '');
  }, [petToEdit]);

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!species) e.species = 'Please select a species.';
    if (!name.trim()) e.name = 'Pet name is required.';
    else if (name.trim().length > 50) e.name = 'Name must be 50 characters or fewer.';
    if (!sex) e.sex = 'Please select a sex.';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Record<string, string> = {};
    if (birthDate) {
      const d = new Date(birthDate);
      if (isNaN(d.getTime())) e.birthDate = 'Enter a valid date (YYYY-MM-DD).';
      else if (d > new Date()) e.birthDate = 'Birth date cannot be in the future.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
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
    if (!validateStep1() || !validateStep2()) return;
    if (!firebaseUser) return;

    setLoading(true);
    try {
      const trimmedName = name.trim();
      const petData = {
        name: trimmedName,
        species: species!,
        sex: sex!,
        breed: breed.trim() || undefined,
        birthDate: birthDate || undefined,
        colour: colour.trim() || undefined,
        microchipNumber: microchip.trim() || undefined,
        isNeutered: isNeutered ?? undefined,
        generalNote: note.trim() || undefined,
        status: 'active' as const,
        avatarLabel: trimmedName.charAt(0).toUpperCase(),
      };

      if (isPreviewSession) {
        if (petToEdit) {
          patchPet(petToEdit.id, petData);
        } else {
          const now = new Date().toISOString();
          addPet({
            ...petData,
            id: `preview-pet-${Date.now()}`,
            ownerUid: firebaseUser.uid,
            createdAt: now,
            updatedAt: now,
          });
        }
        router.back();
        return;
      }

      if (petToEdit) {
        await updatePet(firebaseUser.uid, petToEdit.id, petData);
        patchPet(petToEdit.id, petData);
      } else {
        const newPet = await createPet(firebaseUser.uid, petData);
        addPet(newPet);
      }
      router.back();
    } catch {
      Alert.alert('Something went wrong', 'Couldn\'t save your pet. Please try again.');
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
          {step === 1 && "The Basics"}
          {step === 2 && "Extra Details"}
          {step === 3 && "Summary"}
        </Text>
      </View>

      {/* ── STEP 1 ─────────────────────────────── */}
      {step === 1 && (
        <View style={styles.stepContainer}>
          <View style={styles.section}>
            <Text style={styles.label}>Species <Text style={styles.required}>*</Text></Text>
            <View style={styles.pillRow}>
              {SPECIES.map((s) => (
                <Pressable
                  key={s.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: species === s.key }}
                  style={[styles.pill, species === s.key && styles.pillSelected]}
                  onPress={() => { setSpecies(s.key); setErrors((e) => ({ ...e, species: '' })); }}
                >
                  <Ionicons name={s.icon} size={24} color={species === s.key ? colors.brand : colors.muted} />
                  <Text style={[styles.pillLabel, species === s.key && styles.pillLabelSelected]}>{s.label}</Text>
                </Pressable>
              ))}
            </View>
            {!!errors.species && <Text style={styles.error}>{errors.species}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Pet Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              placeholder={species === 'cat' ? 'e.g. Luna' : 'e.g. Max'}
              value={name}
              onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: '' })); }}
              error={errors.name}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Sex <Text style={styles.required}>*</Text></Text>
            <View style={styles.pillRow}>
              {SEX_OPTIONS.map((s) => (
                <Pressable
                  key={s.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: sex === s.key }}
                  style={[styles.pill, sex === s.key && styles.pillSelected]}
                  onPress={() => { setSex(s.key); setErrors((e) => ({ ...e, sex: '' })); }}
                >
                  <Text style={[styles.pillLabel, sex === s.key && styles.pillLabelSelected]}>{s.label}</Text>
                </Pressable>
              ))}
            </View>
            {!!errors.sex && <Text style={styles.error}>{errors.sex}</Text>}
          </View>
        </View>
      )}

      {/* ── STEP 2 ─────────────────────────────── */}
      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.helperText}>These details are optional, but help build a complete health profile.</Text>
          
          <View style={styles.section}>
            <Text style={styles.label}>Breed</Text>
            <TextInput placeholder="e.g. Golden Retriever or Mixed" value={breed} onChangeText={setBreed} />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Date of birth</Text>
            <TextInput placeholder="YYYY-MM-DD" value={birthDate} onChangeText={(t) => { setBirthDate(t); setErrors((e) => ({ ...e, birthDate: '' })); }} error={errors.birthDate} keyboardType="numbers-and-punctuation" />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Colour / Markings</Text>
            <TextInput placeholder="e.g. Golden, tabby with white paws" value={colour} onChangeText={setColour} />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Microchip Number</Text>
            <TextInput placeholder="15-digit ISO number" value={microchip} onChangeText={setMicrochip} keyboardType="number-pad" />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Neutered / spayed</Text>
            <View style={styles.pillRow}>
              {([true, false, null] as const).map((v) => {
                const lbl = v === true ? 'Yes' : v === false ? 'No' : 'Unknown';
                return (
                  <Pressable key={lbl} style={[styles.pill, isNeutered === v && styles.pillSelected]} onPress={() => setIsNeutered(v)}>
                    <Text style={[styles.pillLabel, isNeutered === v && styles.pillLabelSelected]}>{lbl}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>General Note</Text>
            <TextInput
              placeholder="Any helpful background about your pet…"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              style={{ minHeight: 100, textAlignVertical: 'top' }}
            />
          </View>
        </View>
      )}

      {/* ── STEP 3 ─────────────────────────────── */}
      {step === 3 && (
        <View style={styles.stepContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryAvatar}>
              <Text style={styles.summaryEmoji}>{species === 'cat' ? '🐈' : '🐕'}</Text>
            </View>
            <Text style={styles.summaryName}>{name}</Text>
            <Text style={styles.summarySub}>{breed ? `${breed} · ` : ''}{sex === 'male' ? 'Male' : sex === 'female' ? 'Female' : 'Unknown'} {species === 'cat' ? 'Cat' : 'Dog'}</Text>
            
            <View style={styles.summaryDetails}>
              {birthDate && <View style={styles.summaryRow}><Text style={styles.summaryKey}>DOB</Text><Text style={styles.summaryVal}>{birthDate}</Text></View>}
              {colour && <View style={styles.summaryRow}><Text style={styles.summaryKey}>Colour</Text><Text style={styles.summaryVal}>{colour}</Text></View>}
              {microchip && <View style={styles.summaryRow}><Text style={styles.summaryKey}>Microchip</Text><Text style={styles.summaryVal}>{microchip}</Text></View>}
              {isNeutered !== null && <View style={styles.summaryRow}><Text style={styles.summaryKey}>Neutered</Text><Text style={styles.summaryVal}>{isNeutered ? 'Yes' : 'No'}</Text></View>}
            </View>
          </View>
        </View>
      )}

      {/* Footer Actions */}
      <View style={styles.footer}>
        {step < 3 ? (
          <Button label="Next Step" onPress={handleNext} />
        ) : (
          <Button label={loading ? 'Saving…' : 'Save Companion'} loading={loading} onPress={handleSave} />
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

  header: { marginBottom: space.xl },
  eyebrow: { color: colors.brand, fontWeight: '900', fontSize: 11, letterSpacing: 1.5 },
  title: { color: colors.ink, fontSize: 34, fontWeight: '900', letterSpacing: -1, marginTop: 6 },
  
  helperText: { color: colors.muted, fontSize: 15, marginBottom: space.lg, lineHeight: 22 },

  stepContainer: { gap: space.xl },
  section: { gap: 10 },
  label: { color: colors.ink, fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
  required: { color: colors.danger },
  error: { color: colors.danger, fontSize: 13, fontWeight: '700' },

  pillRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface },
  pillSelected: { borderColor: colors.brand, backgroundColor: colors.softBrand },
  pillLabel: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  pillLabelSelected: { color: colors.brand },

  summaryCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: space.xl, alignItems: 'center', shadowColor: colors.ink, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 4 },
  summaryAvatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.mist, alignItems: 'center', justifyContent: 'center', marginBottom: space.md },
  summaryEmoji: { fontSize: 48 },
  summaryName: { color: colors.ink, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  summarySub: { color: colors.muted, fontSize: 16, marginTop: 4 },
  
  summaryDetails: { width: '100%', marginTop: space.xl, gap: space.sm, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: space.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  summaryKey: { color: colors.muted, fontSize: 15, fontWeight: '600' },
  summaryVal: { color: colors.ink, fontSize: 15, fontWeight: '800' },

  footer: { marginTop: space.xxl },
});
