import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space, shadows, Button } from '@furr/ui';
import { INITIAL_ADOPTION_LISTINGS } from '@furr/firebase';
import type { AdoptionListing } from '@furr/core';

const { width } = Dimensions.get('window');

export default function AdoptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<AdoptionListing | null>(null);

  useEffect(() => {
    const item = INITIAL_ADOPTION_LISTINGS.find((l) => l.id === id);
    if (item) setListing(item);
  }, [id]);

  if (!listing) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notFoundText}>Adoption listing not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Back to Listings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: listing.coverPhotoUrl }} style={styles.heroImage} />
          <TouchableOpacity
            style={styles.floatingBackButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color={colors.ink} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentBody}>
          {/* Pet Title & Badges */}
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.petName}>{listing.petName}</Text>
              <Text style={styles.breedSubtitle}>
                {listing.breed} • {listing.ageEstimate} • {listing.sex === 'male' ? 'Boy ♂' : 'Girl ♀'}
              </Text>
            </View>
            <View style={styles.feeBadge}>
              <Text style={styles.feeText}>
                {listing.adoptionFeeLkr === 0 ? 'Free Adoption' : `Rs ${listing.adoptionFeeLkr.toLocaleString()}`}
              </Text>
            </View>
          </View>

          {/* Shelter Card */}
          <View style={styles.shelterCard}>
            <View style={styles.shelterIconBox}>
              <Ionicons name="home" size={20} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.shelterName}>{listing.shelterName}</Text>
                {listing.shelterVerified ? (
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                ) : null}
              </View>
              <Text style={styles.shelterLocation}>
                {listing.location.city}, {listing.location.district}
              </Text>
            </View>
            {listing.shelterPhone ? (
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => Linking.openURL(`tel:${listing.shelterPhone}`)}
              >
                <Ionicons name="call" size={16} color={colors.brand} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Medical Check Card */}
          <Text style={styles.sectionHeading}>Health & Veterinary Care</Text>
          <View style={styles.medicalGrid}>
            <View style={styles.medicalPill}>
              <Ionicons
                name={listing.medicalSummary.isVaccinated ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={listing.medicalSummary.isVaccinated ? colors.success : colors.muted}
              />
              <Text style={styles.medicalPillText}>Vaccinated</Text>
            </View>

            <View style={styles.medicalPill}>
              <Ionicons
                name={listing.medicalSummary.isNeutered ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={listing.medicalSummary.isNeutered ? colors.success : colors.muted}
              />
              <Text style={styles.medicalPillText}>Neutered / Spayed</Text>
            </View>

            <View style={styles.medicalPill}>
              <Ionicons
                name={listing.medicalSummary.isDewormed ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={listing.medicalSummary.isDewormed ? colors.success : colors.muted}
              />
              <Text style={styles.medicalPillText}>Dewormed</Text>
            </View>

            <View style={styles.medicalPill}>
              <Ionicons
                name={listing.medicalSummary.isMicrochipped ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={listing.medicalSummary.isMicrochipped ? colors.success : colors.muted}
              />
              <Text style={styles.medicalPillText}>Microchipped</Text>
            </View>
          </View>

          {/* Temperament Traits */}
          <Text style={styles.sectionHeading}>Personality & Traits</Text>
          <View style={styles.traitsContainer}>
            {listing.temperamentTraits.map((trait, idx) => (
              <View key={idx} style={styles.traitChip}>
                <Text style={styles.traitChipText}>✨ {trait}</Text>
              </View>
            ))}
          </View>

          {/* Rescue Story */}
          <Text style={styles.sectionHeading}>Rescue Story & Bio</Text>
          <Text style={styles.storyText}>{listing.story || listing.description}</Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomFeeColumn}>
          <Text style={styles.bottomFeeLabel}>Adoption Fee</Text>
          <Text style={styles.bottomFeeValue}>
            {listing.adoptionFeeLkr === 0 ? 'Rs 0 (Free)' : `Rs ${listing.adoptionFeeLkr.toLocaleString()}`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.applyButton}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: '/adoption/apply',
              params: {
                listingId: listing.id,
                petName: listing.petName,
                shelterName: listing.shelterName,
              },
            } as any)
          }
        >
          <Text style={styles.applyButtonText}>Apply to Adopt ❤️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.lg,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: space.md,
  },
  backLink: {
    padding: space.sm,
  },
  backLinkText: {
    fontSize: 14,
    color: colors.brand,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroContainer: {
    width: '100%',
    height: 320,
    backgroundColor: colors.pearl,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  floatingBackButton: {
    position: 'absolute',
    top: 50,
    left: space.lg,
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  contentBody: {
    padding: space.lg,
    backgroundColor: colors.canvas,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: space.lg,
  },
  petName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink,
  },
  breedSubtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  },
  feeBadge: {
    backgroundColor: colors.softBrand,
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  feeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand,
  },
  shelterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: space.xl,
    gap: space.md,
    ...shadows.sm,
  },
  shelterIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.softBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shelterName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  shelterLocation: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.softBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: space.sm,
    marginTop: space.sm,
  },
  medicalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
    marginBottom: space.lg,
  },
  medicalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    width: (width - space.lg * 2 - space.xs) / 2,
    gap: 8,
  },
  medicalPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
    marginBottom: space.lg,
  },
  traitChip: {
    backgroundColor: colors.softBrand,
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  traitChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brand,
  },
  storyText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.ink,
    backgroundColor: colors.surface,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    ...shadows.lg,
  },
  bottomFeeColumn: {
    flex: 1,
  },
  bottomFeeLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  bottomFeeValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  applyButton: {
    backgroundColor: colors.brand,
    paddingHorizontal: space.xl,
    paddingVertical: 14,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: colors.onBrand,
    fontSize: 15,
    fontWeight: '700',
  },
});
