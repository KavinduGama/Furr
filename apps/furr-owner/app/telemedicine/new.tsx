import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { useTelemedicine } from '@/src/context/telemedicine';
import { usePets } from '@/src/context/pets';

const SEVERITIES: { id: 'mild' | 'moderate' | 'urgent'; label: string; desc: string; color: string }[] = [
  { id: 'mild', label: 'Mild / Question', desc: 'Diet questions, minor itch, behavior query', color: colors.brand },
  { id: 'moderate', label: 'Moderate Concern', desc: 'Limping, vomiting once, lethargy, eye discharge', color: '#F59E0B' },
  { id: 'urgent', label: 'Urgent Triage', desc: 'Severe distress, bleeding, poison suspicion', color: colors.danger },
];

export default function NewConsultationScreen() {
  const { requestConsultation } = useTelemedicine();
  const { pets, selectedPet } = usePets();

  const [selectedPetId, setSelectedPetId] = useState(selectedPet?.id || pets[0]?.id || '');
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('Today / Few hours');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'urgent'>('mild');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activePet = pets.find((p) => p.id === selectedPetId) || selectedPet;

  const handleSubmit = async () => {
    if (!symptoms.trim()) {
      Alert.alert('Missing Details', 'Please describe the symptoms or your question for the veterinarian.');
      return;
    }

    if (!activePet) {
      Alert.alert('Missing Pet', 'Please select or add a pet first.');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const consult = await requestConsultation({
        petId: activePet.id,
        petName: activePet.name,
        petSpecies: activePet.species,
        petBreed: activePet.breed,
        symptoms,
        duration,
        severity,
        type: 'chat',
      });

      if (consult) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace(`/telemedicine/room/${consult.id}` as never);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Unable to initiate vet consultation. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Ask a Veterinarian',
          headerStyle: { backgroundColor: colors.canvas },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Select Pet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Which pet needs advice?</Text>
          <View style={styles.petsRow}>
            {pets.map((p) => {
              const isSelected = selectedPetId === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedPetId(p.id);
                  }}
                  style={[styles.petPill, isSelected && styles.petPillActive]}
                >
                  <Text style={styles.petEmoji}>{p.species === 'cat' ? '🐱' : '🐶'}</Text>
                  <Text style={[styles.petPillName, isSelected && styles.petPillNameActive]}>
                    {p.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Step 2: Symptoms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Describe what you are observing</Text>
          <TextInput
            placeholder="Explain the symptoms, changes in appetite, mood, or any questions for the veterinarian..."
            placeholderTextColor={colors.muted}
            value={symptoms}
            onChangeText={setSymptoms}
            multiline
            numberOfLines={4}
            style={styles.textInput}
          />
        </View>

        {/* Step 3: Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. How long has this been happening?</Text>
          <View style={styles.durationRow}>
            {['Just started today', '2-3 days', 'Over a week', 'Ongoing concern'].map((dur) => (
              <Pressable
                key={dur}
                onPress={() => {
                  Haptics.selectionAsync();
                  setDuration(dur);
                }}
                style={[styles.durationPill, duration === dur && styles.durationPillActive]}
              >
                <Text
                  style={[
                    styles.durationText,
                    duration === dur && styles.durationTextActive,
                  ]}
                >
                  {dur}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Step 4: Urgency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Urgency Level</Text>
          <View style={styles.severityList}>
            {SEVERITIES.map((sev) => {
              const isSelected = severity === sev.id;
              return (
                <Pressable
                  key={sev.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSeverity(sev.id);
                  }}
                  style={[styles.severityCard, isSelected && styles.severityCardActive]}
                >
                  <View
                    style={[
                      styles.severityDot,
                      { backgroundColor: sev.color },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.severityTitle,
                        isSelected && styles.severityTitleActive,
                      ]}
                    >
                      {sev.label}
                    </Text>
                    <Text style={styles.severityDesc}>{sev.desc}</Text>
                  </View>
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={isSelected ? colors.brand : colors.muted}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Action Button */}
        <View style={{ marginTop: space.xl }}>
          <Button
            label={isSubmitting ? 'Submitting to Duty Vet...' : 'Start Vet Consultation'}
            loading={isSubmitting}
            onPress={handleSubmit}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  headerBtn: { padding: 6 },
  content: { padding: space.lg, paddingBottom: space.xxl },

  section: { marginTop: space.lg },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.ink, marginBottom: space.sm },

  petsRow: { flexDirection: 'row', gap: space.sm },
  petPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.line,
  },
  petPillActive: { borderColor: colors.brand, backgroundColor: colors.softBrand },
  petEmoji: { fontSize: 16 },
  petPillName: { fontSize: 14, fontWeight: '800', color: colors.muted },
  petPillNameActive: { color: colors.ink },

  textInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    fontSize: 14,
    color: colors.ink,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.line,
  },

  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  durationPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  durationPillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  durationText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  durationTextActive: { color: '#FFF' },

  severityList: { gap: space.xs },
  severityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  severityCardActive: { borderColor: colors.brand, backgroundColor: colors.softBrand },
  severityDot: { width: 10, height: 10, borderRadius: 5 },
  severityTitle: { fontSize: 14, fontWeight: '800', color: colors.ink },
  severityTitleActive: { color: colors.brand },
  severityDesc: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
