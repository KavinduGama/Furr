import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Pet } from '@furr/core';
import { archivePet } from '@furr/firebase';
import { colors, radius, space } from '@furr/ui';
import { Screen } from '@/src/components/screen';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';
import { useHealth } from '@/src/context/health';
import { generateAndSharePdf } from '@/src/utils/pdf';

// ─────────────────────────────────────────────────────────────
//  Pet Detail screen  (PET-002/003/004)
//  Shows the selected pet's profile and health timeline.
// ─────────────────────────────────────────────────────────────

function petMetaLine(pet: Pet): string {
  const parts: string[] = [];
  if (pet.breed) parts.push(pet.breed);
  if (pet.sex && pet.sex !== 'unknown') parts.push(pet.sex.charAt(0).toUpperCase() + pet.sex.slice(1));
  if (pet.birthDate) {
    const months =
      (new Date().getFullYear() - new Date(pet.birthDate).getFullYear()) * 12 +
      (new Date().getMonth() - new Date(pet.birthDate).getMonth());
    const years = Math.floor(months / 12);
    if (years >= 1) parts.push(`${years} year${years !== 1 ? 's' : ''} old`);
    else parts.push(`${months} month${months !== 1 ? 's' : ''} old`);
  }
  return parts.join(' · ');
}

function speciesEmoji(pet: Pet) {
  return pet.species === 'cat' ? '🐈' : '🐕';
}

export default function PetDetailScreen() {
  const { firebaseUser } = useAuth();
  const { selectedPet, removePet } = usePets();
  const { vaccinations, medications, flags } = useHealth();
  const [archiving, setArchiving] = useState(false);

  if (!selectedPet) {
    return (
      <Screen>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No pet selected.</Text>
          <Pressable onPress={() => router.back()} accessibilityRole="button">
            <Text style={styles.backLink}>Go back</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const handleArchive = () => {
    Alert.alert(
      `Archive ${selectedPet.name}?`,
      'Their records will remain safe. You can restore them anytime from your archived pets.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            if (!firebaseUser) return;
            setArchiving(true);
            try {
              await archivePet(firebaseUser.uid, selectedPet.id);
              removePet(selectedPet.id);
              router.back();
            } catch {
              Alert.alert('Something went wrong', 'Couldn\'t archive. Please try again.');
            } finally {
              setArchiving(false);
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: selectedPet.name,
          headerStyle: { backgroundColor: colors.canvas },
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '900', color: colors.ink },
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => router.back()}
              style={{ paddingRight: 8 }}
            >
              <Ionicons name="arrow-back" size={22} color={colors.ink} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit pet"
              onPress={() => router.push('/pet/add' as never)}
              style={{ paddingLeft: 8 }}
            >
              <Text style={styles.editBtn}>Edit</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Identity card */}
        <View style={styles.identity}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>{speciesEmoji(selectedPet)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{selectedPet.name}</Text>
            <Text style={styles.meta}>{petMetaLine(selectedPet)}</Text>
            {selectedPet.colour && (
              <Text style={styles.meta}>Colour: {selectedPet.colour}</Text>
            )}
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          {selectedPet.microchipNumber && (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>MICROCHIP</Text>
              <Text style={styles.statValue} numberOfLines={1}>{selectedPet.microchipNumber}</Text>
            </View>
          )}
          {selectedPet.isNeutered !== undefined && selectedPet.isNeutered !== null && (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>NEUTERED</Text>
              <Text style={styles.statValue}>{selectedPet.isNeutered ? 'Yes' : 'No'}</Text>
            </View>
          )}
          <View style={[styles.statBox, { flex: 1 }]}>
            <Text style={styles.statLabel}>STATUS</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>Active</Text>
          </View>
        </View>

        {/* Note */}
        {selectedPet.generalNote && (
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>NOTE</Text>
            <Text style={styles.noteText}>{selectedPet.generalNote}</Text>
          </View>
        )}

        {/* Health Flags (Allergies/Conditions) */}
        <View style={styles.flagsHeader}>
          <Text style={styles.sectionEyebrow}>ALLERGIES & CONDITIONS</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/health/add-flag' as never)}
          >
            <Text style={styles.seeAll}>+ Add</Text>
          </Pressable>
        </View>

        {flags.length === 0 ? (
          <View style={styles.emptyFlags}>
            <Text style={styles.emptyFlagsText}>No recorded allergies or chronic conditions.</Text>
          </View>
        ) : (
          <View style={styles.flagsList}>
            {flags.map((flag) => (
              <View key={flag.id} style={styles.flagCard}>
                <View style={styles.flagTop}>
                  <Ionicons
                    name={flag.type === 'allergy' ? 'warning' : 'medkit'}
                    size={16}
                    color={flag.type === 'allergy' ? '#E65100' : colors.brand}
                  />
                  <Text style={styles.flagTitle}>{flag.title}</Text>
                  <View style={[styles.flagStatus, flag.status === 'active' ? styles.flagStatusActive : undefined]}>
                    <Text style={[styles.flagStatusText, flag.status === 'active' ? styles.flagStatusTextActive : undefined]}>
                      {flag.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                {flag.notes && <Text style={styles.flagNotes}>{flag.notes}</Text>}
                <Text style={styles.flagMeta}>
                  {flag.provenance === 'VET_VERIFIED' ? 'Vet verified' : 'Owner entered'}
                  {flag.startedOn ? ` · Since ${flag.startedOn}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Health timeline */}
        <View style={styles.timelineHeader}>
          <Text style={styles.sectionEyebrow}>HEALTH TIMELINE</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/health/add-vaccination' as never)}
          >
            <Text style={styles.seeAll}>Add record</Text>
          </Pressable>
        </View>

        {vaccinations.length === 0 && medications.length === 0 ? (
          <View style={styles.emptyTimeline}>
            <Ionicons name="document-text-outline" size={32} color={colors.muted} />
            <Text style={styles.emptyTimelineTitle}>No records yet</Text>
            <Text style={styles.emptyTimelineCopy}>
              Add a vaccination, medication, or health observation to get started.
            </Text>
          </View>
        ) : (
          <View style={styles.recordSummary}>
            {vaccinations.length > 0 && (
              <View style={styles.recordSummaryRow}>
                <Ionicons name="shield-checkmark" size={16} color={colors.brand} />
                <Text style={styles.recordSummaryText}>
                  {vaccinations.length} vaccination{vaccinations.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
            {medications.length > 0 && (
              <View style={styles.recordSummaryRow}>
                <Ionicons name="medical" size={16} color={colors.accent} />
                <Text style={styles.recordSummaryText}>
                  {medications.length} active medication{medications.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
            <Pressable
              accessibilityRole="button"
              style={styles.viewAllBtn}
              onPress={() => router.push('/(tabs)/care' as never)}
            >
              <Text style={styles.viewAllText}>View all in Care Centre →</Text>
            </Pressable>
          </View>
        )}

        {/* Export PDF (SHR-003) */}
        <Pressable
          accessibilityRole="button"
          style={styles.exportBtn}
          onPress={() => {
            if (selectedPet) {
              generateAndSharePdf(selectedPet, flags, vaccinations, medications);
            }
          }}
        >
          <Ionicons name="document-text" size={16} color={colors.brand} />
          <Text style={styles.exportBtnText}>Export health summary (PDF)</Text>
        </Pressable>

        {/* Archive */}
        <Pressable
          accessibilityRole="button"
          style={styles.archiveBtn}
          onPress={handleArchive}
          disabled={archiving}
        >
          <Ionicons name="archive-outline" size={16} color={colors.muted} />
          <Text style={styles.archiveBtnText}>
            {archiving ? 'Archiving…' : `Archive ${selectedPet.name}`}
          </Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: space.md, gap: space.md, paddingBottom: 48 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { color: colors.muted, fontSize: 15 },
  backLink: { color: colors.brand, fontWeight: '800' },

  editBtn: { color: colors.brand, fontSize: 15, fontWeight: '800' },

  identity: {
    backgroundColor: colors.surface,
    padding: space.md,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  avatarWrap: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.pearl, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 36 },
  name: { color: colors.ink, fontSize: 24, fontWeight: '900', letterSpacing: -0.6 },
  meta: { color: colors.muted, fontSize: 13, marginTop: 3 },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    minWidth: 90,
  },
  statLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  statValue: { color: colors.ink, fontSize: 14, fontWeight: '900', marginTop: 5 },

  noteBox: {
    backgroundColor: colors.warm,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0D89A',
  },
  noteLabel: { color: '#B8870F', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  noteText: { color: colors.ink, fontSize: 14, lineHeight: 20, marginTop: 5 },

  timelineHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionEyebrow: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  seeAll: { color: colors.brand, fontSize: 12, fontWeight: '900' },

  emptyTimeline: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 28,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyTimelineTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  emptyTimelineCopy: { color: colors.muted, fontSize: 13, lineHeight: 18, textAlign: 'center', maxWidth: 260 },

  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 14, marginTop: 10, backgroundColor: colors.mist, borderRadius: radius.md, borderWidth: 1, borderColor: colors.softBrand },
  exportBtnText: { color: colors.brand, fontSize: 13, fontWeight: '800' },

  archiveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 14, marginTop: 10 },
  archiveBtnText: { color: colors.danger, fontSize: 13, fontWeight: '800' },

  flagsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  emptyFlags: { backgroundColor: colors.surface, padding: 16, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed' },
  emptyFlagsText: { color: colors.muted, fontSize: 13, textAlign: 'center' },
  flagsList: { gap: 10 },
  flagCard: { backgroundColor: colors.surface, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, gap: 6 },
  flagTop: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  flagTitle: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: '900' },
  flagStatus: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: colors.mist },
  flagStatusActive: { backgroundColor: '#FFF0E5' },
  flagStatusText: { fontSize: 9, fontWeight: '900', color: colors.muted, letterSpacing: 0.5 },
  flagStatusTextActive: { color: '#E65100' },
  flagNotes: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  flagMeta: { color: colors.muted, fontSize: 11, marginTop: 4 },

  recordSummary: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.line, gap: 10 },
  recordSummaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recordSummaryText: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  viewAllBtn: { marginTop: 4 },
  viewAllText: { color: colors.brand, fontSize: 13, fontWeight: '900' },
});
