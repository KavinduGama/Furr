import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@furr/ui';
import type {
  MedicationPlan,
  Pet,
  PetDocument,
  TimelineItem,
  VaccinationRecord,
  WeightEntry,
} from '@furr/core';
import { buildTimeline } from '@furr/core';
import {
  subscribeToDocuments,
  subscribeToMedications,
  subscribeToObservations,
  subscribeToVaccinations,
  subscribeToWeightEntries,
} from '@furr/firebase';
import { useVetGrants } from '@/src/context/grants';
import { HealthRecordCard } from '@/src/components/HealthRecordCard';

export default function PetMedicalChartScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const { admittedPets, activeGrants } = useVetGrants();
  const pet = admittedPets[petId || ''] || admittedPets['max'];

  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [medications, setMedications] = useState<MedicationPlan[]>([]);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [documents, setDocuments] = useState<PetDocument[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'timeline' | 'vaccines' | 'meds' | 'weight'>('timeline');

  useEffect(() => {
    if (!pet) return;
    const ownerUid = pet.ownerUid || 'demo-uid';

    const unsubs = [
      subscribeToVaccinations(ownerUid, pet.id, setVaccinations),
      subscribeToMedications(ownerUid, pet.id, setMedications),
      subscribeToWeightEntries(ownerUid, pet.id, setWeights),
      subscribeToObservations(ownerUid, pet.id, setObservations),
      subscribeToDocuments(ownerUid, pet.id, setDocuments),
    ];

    return () => unsubs.forEach((fn) => fn());
  }, [pet]);

  const timelineItems: TimelineItem[] = buildTimeline(
    vaccinations,
    medications,
    weights,
    observations,
    documents
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#10242D" />
        </Pressable>
        <Text style={styles.topBarTitle}>Owner-Shared Patient Chart</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Patient Profile Card */}
        <View style={styles.petHeroCard}>
          <View style={styles.petAvatar}>
            <Text style={styles.avatarText}>{pet?.name ? pet.name.charAt(0) : 'P'}</Text>
          </View>
          <View style={styles.petDetails}>
            <Text style={styles.petName}>{pet?.name || 'Pet'}</Text>
            <Text style={styles.petSpecies}>
              {pet?.species} · {pet?.breed || 'Mixed'} · {pet?.sex}
            </Text>
            <Text style={styles.birthDate}>
              DOB: {pet?.birthDate ? new Date(pet.birthDate).toLocaleDateString() : 'Unknown'}
            </Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {[
            { id: 'timeline', label: 'Timeline' },
            { id: 'vaccines', label: `Vaccines (${vaccinations.length})` },
            { id: 'meds', label: `Meds (${medications.length})` },
            { id: 'weight', label: `Weight (${weights.length})` },
          ].map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setSelectedFilter(tab.id as any)}
              style={[styles.filterPill, selectedFilter === tab.id && styles.filterPillActive]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedFilter === tab.id && styles.filterPillTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedFilter === 'timeline'
              ? 'Complete Chronological Events'
              : selectedFilter === 'vaccines'
              ? 'Vaccination Records'
              : selectedFilter === 'meds'
              ? 'Active Prescriptions'
              : 'Weight Entries'}
          </Text>
        </View>

        {/* Timeline Items Stream */}
        {selectedFilter === 'timeline' && (
          timelineItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No medical events recorded yet.</Text>
            </View>
          ) : (
            timelineItems.map((item, idx) => <HealthRecordCard key={idx} item={item} />)
          )
        )}

        {selectedFilter === 'vaccines' && (
          vaccinations.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No vaccination records shared.</Text>
            </View>
          ) : (
            vaccinations.map((v) => (
              <View key={v.id} style={styles.detailCard}>
                <Text style={styles.cardTitle}>
                  {v.vaccineType === 'Other' ? v.customVaccineName : v.vaccineType}
                </Text>
                <Text style={styles.cardSub}>Administered: {v.administeredOn}</Text>
                <Text style={styles.cardMeta}>Next Due: {v.nextDueOn || 'None specified'}</Text>
              </View>
            ))
          )
        )}

        {selectedFilter === 'meds' && (
          medications.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No active medications shared.</Text>
            </View>
          ) : (
            medications.map((m) => (
              <View key={m.id} style={styles.detailCard}>
                <Text style={styles.cardTitle}>{m.medicationName}</Text>
                <Text style={styles.cardSub}>Dosage: {m.doseInstruction}</Text>
                <Text style={styles.cardMeta}>Schedule: {m.frequency.kind}</Text>
              </View>
            ))
          )
        )}

        {selectedFilter === 'weight' && (
          weights.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No weight entries shared.</Text>
            </View>
          ) : (
            weights.map((w) => (
              <View key={w.id} style={styles.detailCard}>
                <Text style={styles.cardTitle}>
                  {w.value} {w.unit}
                </Text>
                <Text style={styles.cardSub}>Recorded: {w.measuredOn}</Text>
                {w.note && <Text style={styles.cardMeta}>Note: {w.note}</Text>}
              </View>
            ))
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10242D',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  petHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10242D',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  petAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#006B78',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  petDetails: {
    flex: 1,
  },
  petName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  petSpecies: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  birthDate: {
    fontSize: 11,
    color: '#006B78',
    marginTop: 4,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  filterPillActive: {
    backgroundColor: '#006B78',
    borderColor: '#006B78',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10242D',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  emptyText: {
    fontSize: 13,
    color: colors.muted,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10242D',
  },
  cardSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 3,
  },
  cardMeta: {
    fontSize: 11,
    color: '#006B78',
    fontWeight: '700',
    marginTop: 4,
  },
});
