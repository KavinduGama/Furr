import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space, shadows, EmptyState } from '@furr/ui';
import { subscribeToAdoptionListings } from '@furr/firebase';
import type { AdoptionListing, PetSpecies } from '@furr/core';

export default function AdoptionDirectoryScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<AdoptionListing[]>([]);
  const [speciesFilter, setSpeciesFilter] = useState<PetSpecies | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = subscribeToAdoptionListings((data) => {
      setListings(data);
    }, speciesFilter);
    return () => unsub();
  }, [speciesFilter]);

  const filtered = listings.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.petName.toLowerCase().includes(q) ||
        item.breed.toLowerCase().includes(q) ||
        item.location.city.toLowerCase().includes(q) ||
        item.shelterName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adopt a Pet 🐾</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.muted} style={styles.searchIcon} />
        <TextInput
          placeholder="Search by breed, city, or shelter..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Species Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'dog', 'cat'] as const).map((spec) => (
          <TouchableOpacity
            key={spec}
            onPress={() => setSpeciesFilter(spec)}
            style={[
              styles.filterPill,
              speciesFilter === spec && styles.filterPillActive,
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                speciesFilter === spec && styles.filterPillTextActive,
              ]}
            >
              {spec === 'all' ? 'All Rescues' : spec === 'dog' ? '🐕 Dogs & Pups' : '🐈 Cats & Kittens'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Listings List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <EmptyState
            emoji="🐾"
            title="No Rescues Found"
            description="We couldn't find any adoptable pets matching your current filters."
            actionLabel="Clear Filters"
            onAction={() => {
              setSpeciesFilter('all');
              setSearchQuery('');
            }}
          />
        ) : (
          filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              style={styles.card}
              onPress={() => router.push(`/adoption/${item.id}` as any)}
            >
              <Image source={{ uri: item.coverPhotoUrl }} style={styles.coverImage} />

              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.petName}>{item.petName}</Text>
                    <Text style={styles.breedText}>
                      {item.breed} • {item.ageEstimate}
                    </Text>
                  </View>
                  <View style={styles.feeBadge}>
                    <Text style={styles.feeText}>
                      {item.adoptionFeeLkr === 0 ? 'Free Adoption' : `Rs ${item.adoptionFeeLkr.toLocaleString()}`}
                    </Text>
                  </View>
                </View>

                {/* Location & Shelter */}
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={14} color={colors.muted} />
                  <Text style={styles.metaText}>
                    {item.location.city}, {item.location.district}
                  </Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Ionicons name="shield-checkmark" size={14} color={colors.success} />
                  <Text style={[styles.metaText, { color: colors.ink, fontWeight: '600' }]} numberOfLines={1}>
                    {item.shelterName}
                  </Text>
                </View>

                {/* Traits / Badges */}
                <View style={styles.traitsRow}>
                  {item.medicalSummary.isVaccinated ? (
                    <View style={[styles.traitBadge, { backgroundColor: '#E0FAEB' }]}>
                      <Text style={[styles.traitText, { color: '#059669' }]}>✓ Vaccinated</Text>
                    </View>
                  ) : null}
                  {item.medicalSummary.isNeutered ? (
                    <View style={[styles.traitBadge, { backgroundColor: '#F0EDFF' }]}>
                      <Text style={[styles.traitText, { color: colors.brand }]}>✓ Neutered</Text>
                    </View>
                  ) : null}
                  {item.temperamentTraits.slice(0, 2).map((tr, idx) => (
                    <View key={idx} style={styles.traitBadge}>
                      <Text style={styles.traitText}>{tr}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: 54,
    paddingBottom: space.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: space.lg,
    marginTop: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    height: 46,
  },
  searchIcon: {
    marginRight: space.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    gap: space.xs,
  },
  filterPill: {
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  filterPillActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
  filterPillTextActive: {
    color: colors.onBrand,
  },
  listContent: {
    paddingHorizontal: space.lg,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.sm,
  },
  coverImage: {
    width: '100%',
    height: 190,
    backgroundColor: colors.pearl,
  },
  cardBody: {
    padding: space.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: space.xs,
  },
  petName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  breedText: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  feeBadge: {
    backgroundColor: colors.softBrand,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  feeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.muted,
  },
  metaDot: {
    fontSize: 12,
    color: colors.muted,
    marginHorizontal: 2,
  },
  traitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: space.sm,
  },
  traitBadge: {
    backgroundColor: colors.pearl,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  traitText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink,
  },
});
