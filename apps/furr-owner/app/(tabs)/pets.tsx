import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import type { Pet } from '@furr/core';
import { colors, radius, space } from '@furr/ui';
import { Screen } from '@/src/components/screen';
import { usePets } from '@/src/context/pets';

// ─────────────────────────────────────────────────────────────
//  Pets tab  (PET-001/002)
// ─────────────────────────────────────────────────────────────

function petAgeLabel(pet: Pet): string {
  if (!pet.birthDate) return pet.breed ?? 'Dog or cat';
  const born = new Date(pet.birthDate);
  const now = new Date();
  const months =
    (now.getFullYear() - born.getFullYear()) * 12 + (now.getMonth() - born.getMonth());
  if (months < 1) return 'Less than 1 month old';
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} old`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} old`;
}

function speciesEmoji(pet: Pet) {
  return pet.species === 'cat' ? '🐈' : '🐕';
}

export default function PetsScreen() {
  const { pets, selectedPet, selectPet, isLoading } = usePets();

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.brand} size="large" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>YOUR FAMILY</Text>
          <Text style={styles.title}>Your pets</Text>
          <Text style={styles.copy}>Every little health detail, held close.</Text>
        </View>
        <Pressable
          accessibilityLabel="Add a pet"
          accessibilityRole="button"
          style={styles.addBtn}
          onPress={() => router.push('/pet/add' as never)}
        >
          <Ionicons name="add" color="#fff" size={24} />
        </Pressable>
      </View>

      {/* Empty state */}
      {pets.length === 0 && (
        <Pressable
          accessibilityRole="button"
          style={styles.emptyCard}
          onPress={() => router.push('/pet/add' as never)}
        >
          <View style={styles.emptyIcon}>
            <Ionicons name="paw" size={28} color={colors.brand} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.emptyTitle}>Add your first pet</Text>
            <Text style={styles.emptyCopy}>
              Set up their health home in under 60 seconds.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={colors.brand} />
        </Pressable>
      )}

      {/* Pet cards */}
      {pets.map((pet) => (
        <Pressable
          key={pet.id}
          accessibilityRole="button"
          style={[styles.petCard, selectedPet?.id === pet.id && styles.petCardSelected]}
          onPress={() => {
            selectPet(pet.id);
            router.push('/pet-detail' as never);
          }}
        >
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>{speciesEmoji(pet)}</Text>
          </View>

          {/* Info */}
          <View style={styles.petCopy}>
            <View style={styles.nameRow}>
              <Text style={styles.petName}>{pet.name}</Text>
              {/* Verified badge placeholder — shows when vet has authored a record */}
              <View style={styles.verifiedDot} />
            </View>
            {pet.breed && <Text style={styles.meta}>{pet.breed}</Text>}
            <Text style={styles.meta}>{petAgeLabel(pet)}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>

          <Ionicons name="arrow-forward" size={18} color={colors.brand} />
        </Pressable>
      ))}

      {/* Add another pet */}
      {pets.length > 0 && (
        <Pressable
          accessibilityRole="button"
          style={styles.addMore}
          onPress={() => router.push('/pet/add' as never)}
        >
          <View style={styles.addMoreIcon}>
            <Ionicons name="add" color={colors.brand} size={20} />
          </View>
          <View>
            <Text style={styles.addMoreTitle}>Add a new companion</Text>
            <Text style={styles.addMoreCopy}>Set up their health home in minutes.</Text>
          </View>
        </Pressable>
      )}
    </Screen>
  );
}

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { color: colors.brand, fontWeight: '900', fontSize: 10, letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 31, lineHeight: 35, fontWeight: '900', letterSpacing: -1.2, marginTop: 4 },
  copy: { color: colors.muted, marginTop: 6, fontSize: 14 },
  addBtn: { height: 46, width: 46, borderRadius: 23, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },

  emptyCard: {
    backgroundColor: colors.mist,
    borderRadius: radius.lg,
    padding: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: colors.softBrand,
    borderStyle: 'dashed',
  },
  emptyIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  emptyCopy: { color: colors.muted, fontSize: 12, marginTop: 3 },

  petCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  petCardSelected: { borderColor: colors.brand, backgroundColor: colors.mist },
  avatarWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: colors.pearl, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 32 },
  petCopy: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  petName: { color: colors.ink, fontSize: 20, fontWeight: '900', letterSpacing: -0.4 },
  verifiedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 9 },
  statusDot: { height: 6, width: 6, borderRadius: 3, backgroundColor: colors.success },
  statusText: { color: colors.success, fontSize: 11, fontWeight: '800' },

  addMore: { borderRadius: radius.md, backgroundColor: colors.mist, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  addMoreIcon: { height: 42, width: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  addMoreTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  addMoreCopy: { color: colors.muted, fontSize: 12, marginTop: 3 },
});
