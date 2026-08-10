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
import type { Pet, PetSpecies, PetSex } from '@furr/core';
import { createPet } from '@furr/firebase';
import { Button, colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';

// ─────────────────────────────────────────────────────────────
//  Add Pet screen  (PET-001)
//
//  Required:  name, species, sex
//  Optional:  breed, birthDate, colour, microchip, isNeutered, note
// ─────────────────────────────────────────────────────────────

type SpeciesOption = { key: PetSpecies; label: string; emoji: string };
type SexOption = { key: PetSex; label: string };

const SPECIES: SpeciesOption[] = [
  { key: 'dog', label: 'Dog', emoji: '🐕' },
  { key: 'cat', label: 'Cat', emoji: '🐈' },
];

const SEX_OPTIONS: SexOption[] = [
  { key: 'male', label: 'Male' },
  { key: 'female', label: 'Female' },
  { key: 'unknown', label: 'Unknown' },
];

export default function AddPetScreen() {
  const { firebaseUser } = useAuth();
  const { addPet } = usePets();

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
  const [showOptional, setShowOptional] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // ── Validation ────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Pet name is required.';
    else if (name.trim().length > 50) e.name = 'Name must be 50 characters or fewer.';
    if (!species) e.species = 'Please select a species.';
    if (!sex) e.sex = 'Please select a sex.';
    if (birthDate) {
      const d = new Date(birthDate);
      if (isNaN(d.getTime())) e.birthDate = 'Enter a valid date (YYYY-MM-DD).';
      else if (d > new Date()) e.birthDate = 'Birth date cannot be in the future.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────

  const handleSave = async () => {
    if (!validate()) return;
    if (!firebaseUser) return;

    setLoading(true);
    try {
      const trimmedName = name.trim();
      const newPet = await createPet(firebaseUser.uid, {
        name: trimmedName,
        species: species!,
        sex: sex!,
        breed: breed.trim() || undefined,
        birthDate: birthDate || undefined,
        colour: colour.trim() || undefined,
        microchipNumber: microchip.trim() || undefined,
        isNeutered: isNeutered ?? undefined,
        generalNote: note.trim() || undefined,
        status: 'active',
        avatarLabel: trimmedName.charAt(0).toUpperCase(),
      });

      // Optimistic update — no need to wait for Firestore subscription
      addPet(newPet);
      router.back();
    } catch {
      Alert.alert('Something went wrong', 'Couldn\'t save your pet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSave = name.trim().length > 0 && !!species && !!sex;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          onPress={() => router.back()}
          style={styles.cancel}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Text style={styles.heading}>Add a pet</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* ── Required fields ─────────────────────────────── */}

      {/* Species */}
      <View style={styles.section}>
        <Text style={styles.label}>Species <Text style={styles.required}>*</Text></Text>
        <View style={styles.pillRow}>
          {SPECIES.map((s) => (
            <Pressable
              key={s.key}
              accessibilityRole="radio"
              accessibilityState={{ selected: species === s.key }}
              style={[styles.pill, species === s.key && styles.pillSelected]}
              onPress={() => {
                setSpecies(s.key);
                setErrors((e) => ({ ...e, species: '' }));
              }}
            >
              <Text style={styles.pillEmoji}>{s.emoji}</Text>
              <Text style={[styles.pillLabel, species === s.key && styles.pillLabelSelected]}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {!!errors.species && <Text style={styles.error}>{errors.species}</Text>}
      </View>

      {/* Name */}
      <View style={styles.section}>
        <Text style={styles.label}>Pet name <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, !!errors.name && styles.inputError]}
          placeholder={species === 'cat' ? 'e.g. Luna' : 'e.g. Max'}
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={(t) => {
            setName(t);
            setErrors((e) => ({ ...e, name: '' }));
          }}
          maxLength={50}
          returnKeyType="next"
          accessibilityLabel="Pet name"
        />
        {!!errors.name && <Text style={styles.error}>{errors.name}</Text>}
      </View>

      {/* Sex */}
      <View style={styles.section}>
        <Text style={styles.label}>Sex <Text style={styles.required}>*</Text></Text>
        <View style={styles.pillRow}>
          {SEX_OPTIONS.map((s) => (
            <Pressable
              key={s.key}
              accessibilityRole="radio"
              accessibilityState={{ selected: sex === s.key }}
              style={[styles.pillSm, sex === s.key && styles.pillSelected]}
              onPress={() => {
                setSex(s.key);
                setErrors((e) => ({ ...e, sex: '' }));
              }}
            >
              <Text style={[styles.pillLabel, sex === s.key && styles.pillLabelSelected]}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {!!errors.sex && <Text style={styles.error}>{errors.sex}</Text>}
      </View>

      {/* ── Optional fields toggle ────────────────────── */}
      <Pressable
        accessibilityRole="button"
        style={styles.optionalToggle}
        onPress={() => setShowOptional((v) => !v)}
      >
        <Text style={styles.optionalToggleText}>
          {showOptional ? 'Hide' : 'Add'} optional details
        </Text>
        <Ionicons
          name={showOptional ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.brand}
        />
      </Pressable>

      {showOptional && (
        <View style={styles.optionalBlock}>
          {/* Breed */}
          <View style={styles.section}>
            <Text style={styles.label}>Breed</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Golden Retriever or Mixed"
              placeholderTextColor={colors.muted}
              value={breed}
              onChangeText={setBreed}
              maxLength={80}
              accessibilityLabel="Breed"
            />
          </View>

          {/* Date of birth */}
          <View style={styles.section}>
            <Text style={styles.label}>Date of birth</Text>
            <TextInput
              style={[styles.input, !!errors.birthDate && styles.inputError]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              value={birthDate}
              onChangeText={(t) => {
                setBirthDate(t);
                setErrors((e) => ({ ...e, birthDate: '' }));
              }}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              accessibilityLabel="Date of birth"
            />
            {!!errors.birthDate && <Text style={styles.error}>{errors.birthDate}</Text>}
          </View>

          {/* Colour */}
          <View style={styles.section}>
            <Text style={styles.label}>Colour / markings</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Golden, tabby with white paws"
              placeholderTextColor={colors.muted}
              value={colour}
              onChangeText={setColour}
              maxLength={80}
              accessibilityLabel="Colour and markings"
            />
          </View>

          {/* Microchip */}
          <View style={styles.section}>
            <Text style={styles.label}>Microchip number</Text>
            <TextInput
              style={styles.input}
              placeholder="15-digit ISO number"
              placeholderTextColor={colors.muted}
              value={microchip}
              onChangeText={setMicrochip}
              keyboardType="number-pad"
              maxLength={20}
              accessibilityLabel="Microchip number"
            />
          </View>

          {/* Neutered */}
          <View style={styles.section}>
            <Text style={styles.label}>Neutered / spayed</Text>
            <View style={styles.pillRow}>
              {([true, false, null] as const).map((v) => {
                const lbl = v === true ? 'Yes' : v === false ? 'No' : 'Unknown';
                return (
                  <Pressable
                    key={lbl}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isNeutered === v }}
                    style={[styles.pillSm, isNeutered === v && styles.pillSelected]}
                    onPress={() => setIsNeutered(v)}
                  >
                    <Text style={[styles.pillLabel, isNeutered === v && styles.pillLabelSelected]}>
                      {lbl}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Note */}
          <View style={styles.section}>
            <Text style={styles.label}>General note</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Any helpful background about your pet…"
              placeholderTextColor={colors.muted}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              maxLength={300}
              accessibilityLabel="General note"
            />
          </View>
        </View>
      )}

      {/* Save button */}
      <Button
        label={loading ? 'Saving…' : `Add ${name.trim() || 'pet'}`}
        loading={loading}
        disabled={!canSave}
        onPress={handleSave}
      />

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: space.md, gap: space.md, paddingBottom: 40 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  cancel: { padding: 4 },
  cancelText: { color: colors.brand, fontSize: 15, fontWeight: '700' },
  heading: { color: colors.ink, fontSize: 17, fontWeight: '900' },

  section: { gap: 8 },
  label: { color: colors.ink, fontSize: 13, fontWeight: '800', letterSpacing: 0.2 },
  required: { color: colors.danger },

  input: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.ink,
    fontWeight: '600',
  },
  inputError: { borderColor: colors.danger },
  textarea: { minHeight: 88, paddingTop: 14, textAlignVertical: 'top' },
  error: { color: colors.danger, fontSize: 12, fontWeight: '700' },

  pillRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  pillSm: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  pillSelected: { borderColor: colors.brand, backgroundColor: colors.mist },
  pillEmoji: { fontSize: 22 },
  pillLabel: { color: colors.muted, fontSize: 14, fontWeight: '800' },
  pillLabelSelected: { color: colors.brand },

  optionalToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 6,
  },
  optionalToggleText: { color: colors.brand, fontSize: 13, fontWeight: '800' },
  optionalBlock: { gap: space.md },
});
