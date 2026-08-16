import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/src/components/screen';
import { colors, radius, space } from '@furr/ui';
import { SERVICE_CATEGORIES, type ServiceCategory } from '@furr/core';
import { useServices } from '@/src/context/services';
import { usePets } from '@/src/context/pets';

export default function ServicesTab() {
  const {
    filteredProviders,
    selectedCategory,
    setSelectedCategory,
    bookings,
    userLocation,
  } = useServices();
  const { selectedPet } = usePets();

  const activeBookingsCount = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'in_progress'
  ).length;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>LOCAL EXPERTS</Text>
            <Text style={styles.title}>Pet Services</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/services/bookings' as never)}
            style={styles.bookingsBtn}
          >
            <Ionicons name="calendar" size={18} color={colors.brand} />
            <Text style={styles.bookingsBtnText}>Bookings</Text>
            {activeBookingsCount > 0 && (
              <View style={styles.bookingBadge}>
                <Text style={styles.bookingBadgeText}>{activeBookingsCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Location Subtext */}
        <View style={styles.locationBar}>
          <Ionicons name="location-sharp" size={14} color={colors.brand} />
          <Text style={styles.locationText}>
            {userLocation ? 'Showing specialists near you' : 'Showing top specialists in Colombo'}
          </Text>
        </View>

        {/* Category Pills Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedCategory('all');
            }}
            style={[styles.categoryPill, selectedCategory === 'all' && styles.categoryPillActive]}
          >
            <Ionicons
              name="sparkles"
              size={14}
              color={selectedCategory === 'all' ? '#FFF' : colors.muted}
            />
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === 'all' && styles.categoryPillTextActive,
              ]}
            >
              All Services
            </Text>
          </Pressable>
          {SERVICE_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedCategory(cat.id);
                }}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={isActive ? '#FFF' : colors.muted}
                />
                <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                  {cat.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Provider List Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all'
              ? 'Top Rated Providers'
              : SERVICE_CATEGORIES.find((c) => c.id === selectedCategory)?.title || 'Providers'}
          </Text>
          <Text style={styles.sectionCount}>{filteredProviders.length} available</Text>
        </View>

        {/* Provider Cards */}
        {filteredProviders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cut-outline" size={48} color={colors.muted} />
            <Text style={styles.emptyTitle}>No service providers found</Text>
            <Text style={styles.emptyCopy}>Try switching to a different service category.</Text>
          </View>
        ) : (
          <View style={styles.providersList}>
            {filteredProviders.map((provider) => {
              const lowestPrice = Math.min(...provider.services.map((s) => s.price));

              return (
                <Pressable
                  key={provider.id}
                  onPress={() => router.push(`/services/${provider.id}` as never)}
                  style={styles.providerCard}
                >
                  <View style={styles.providerHeader}>
                    <Image
                      source={{ uri: provider.avatarUrl }}
                      style={styles.providerAvatar}
                      resizeMode="cover"
                    />
                    <View style={{ flex: 1 }}>
                      <View style={styles.nameRow}>
                        <Text style={styles.providerName} numberOfLines={1}>
                          {provider.name}
                        </Text>
                        {provider.isVerified && (
                          <Ionicons name="shield-checkmark" size={16} color={colors.brand} />
                        )}
                      </View>

                      <Text style={styles.providerAddress} numberOfLines={1}>
                        {provider.address}, {provider.city}
                      </Text>

                      <View style={styles.metaRow}>
                        <View style={styles.ratingBadge}>
                          <Ionicons name="star" size={12} color="#F59E0B" />
                          <Text style={styles.ratingText}>{provider.rating.toFixed(1)}</Text>
                          <Text style={styles.reviewCount}>({provider.reviewCount})</Text>
                        </View>

                        {provider.distanceKm !== undefined && (
                          <View style={styles.distanceBadge}>
                            <Ionicons name="navigate" size={10} color={colors.brand} />
                            <Text style={styles.distanceText}>{provider.distanceKm} km away</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  <Text style={styles.providerBio} numberOfLines={2}>
                    {provider.bio}
                  </Text>

                  {/* Services preview tags */}
                  <View style={styles.servicesRow}>
                    {provider.services.slice(0, 2).map((srv) => (
                      <View key={srv.id} style={styles.servicePill}>
                        <Text style={styles.servicePillText}>{srv.name}</Text>
                      </View>
                    ))}
                    {provider.services.length > 2 && (
                      <View style={styles.servicePillMore}>
                        <Text style={styles.servicePillMoreText}>
                          +{provider.services.length - 2} more
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Footer */}
                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.priceLabel}>From</Text>
                      <Text style={styles.priceValue}>Rs {lowestPrice.toLocaleString()}</Text>
                    </View>

                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push(`/services/book/${provider.id}` as never);
                      }}
                      style={styles.bookBtn}
                    >
                      <Text style={styles.bookBtnText}>Book Now</Text>
                      <Ionicons name="arrow-forward" size={14} color="#FFF" />
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: 110 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontSize: 11, fontWeight: '800', color: colors.brand, letterSpacing: 0.8 },
  title: { fontSize: 28, fontWeight: '900', color: colors.ink, letterSpacing: -0.5 },
  bookingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.softBrand,
    position: 'relative',
  },
  bookingsBtnText: { color: colors.brand, fontSize: 13, fontWeight: '800' },
  bookingBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.brand,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  bookingBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '900' },

  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: space.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.line,
  },
  locationText: { fontSize: 12, color: colors.muted, fontWeight: '600' },

  categoriesRow: { paddingVertical: space.md, gap: 8 },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  categoryPillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  categoryPillText: { fontSize: 12, fontWeight: '700', color: colors.ink },
  categoryPillTextActive: { color: '#FFF' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.sm,
    marginBottom: space.sm,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  sectionCount: { fontSize: 12, fontWeight: '600', color: colors.muted },

  providersList: { gap: space.md },
  providerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  providerHeader: { flexDirection: 'row', gap: space.md },
  providerAvatar: { width: 64, height: 64, borderRadius: radius.lg, backgroundColor: colors.mist },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  providerName: { fontSize: 15, fontWeight: '800', color: colors.ink, flex: 1 },
  providerAddress: { fontSize: 12, color: colors.muted, marginTop: 1 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, fontWeight: '800', color: colors.ink },
  reviewCount: { fontSize: 11, color: colors.muted },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.softBrand,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  distanceText: { fontSize: 10, fontWeight: '800', color: colors.brand },

  providerBio: { fontSize: 13, color: colors.muted, marginTop: space.sm, lineHeight: 18 },

  servicesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: space.sm },
  servicePill: {
    backgroundColor: colors.canvas,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  servicePillText: { fontSize: 11, fontWeight: '600', color: colors.ink },
  servicePillMore: {
    backgroundColor: colors.mist,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  servicePillMoreText: { fontSize: 11, fontWeight: '700', color: colors.muted },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.md,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  priceLabel: { fontSize: 10, color: colors.muted, textTransform: 'uppercase', fontWeight: '700' },
  priceValue: { fontSize: 16, fontWeight: '900', color: colors.ink },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.lg,
  },
  bookBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  emptyState: { alignItems: 'center', justifyContent: 'center', padding: space.xxl, gap: space.sm },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  emptyCopy: { fontSize: 13, color: colors.muted, textAlign: 'center' },
});
