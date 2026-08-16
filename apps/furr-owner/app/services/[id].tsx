import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { useServices } from '@/src/context/services';

export default function ProviderProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { providers } = useServices();

  const provider = providers.find((p) => p.id === id);

  if (!provider) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Service provider not found</Text>
        <Button label="Back to Services" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Specialist Profile',
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
        {/* Cover Photo */}
        <View style={styles.coverWrap}>
          {provider.coverUrl && (
            <Image source={{ uri: provider.coverUrl }} style={styles.coverImg} resizeMode="cover" />
          )}
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <Image
              source={{ uri: provider.avatarUrl }}
              style={styles.avatar}
              resizeMode="cover"
            />
            {provider.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#FFF" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          <Text style={styles.providerName}>{provider.name}</Text>
          <Text style={styles.address}>
            {provider.address}, {provider.city}
          </Text>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <View style={styles.statIconRow}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.statValue}>{provider.rating.toFixed(1)}</Text>
              </View>
              <Text style={styles.statLabel}>{provider.reviewCount} reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{provider.experienceYears} Yrs</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{provider.availableDays.length} Days</Text>
              <Text style={styles.statLabel}>A Week</Text>
            </View>
          </View>

          {/* About Bio */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>About Specialist</Text>
            <Text style={styles.bioText}>{provider.bio}</Text>
          </View>

          {/* Working Hours */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Operating Hours</Text>
            <View style={styles.hoursCard}>
              <Ionicons name="time-outline" size={18} color={colors.brand} />
              <Text style={styles.hoursText}>
                {provider.availableHours.start} - {provider.availableHours.end} (
                {provider.availableDays.join(', ')})
              </Text>
            </View>
          </View>

          {/* Available Services Menu */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Services & Pricing</Text>
            <View style={styles.servicesMenu}>
              {provider.services.map((srv) => (
                <View key={srv.id} style={styles.serviceMenuItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceName}>{srv.name}</Text>
                    {srv.description ? (
                      <Text style={styles.serviceDesc}>{srv.description}</Text>
                    ) : null}
                    <View style={styles.durationRow}>
                      <Ionicons name="stopwatch-outline" size={12} color={colors.muted} />
                      <Text style={styles.durationText}>{srv.durationMinutes} mins</Text>
                    </View>
                  </View>
                  <Text style={styles.servicePrice}>Rs {srv.price.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom CTA */}
      <View style={styles.bottomBar}>
        <Button
          label="Book Appointment"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push(`/services/book/${provider.id}` as never);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  headerBtn: { padding: 6 },
  content: { paddingBottom: 110 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md },
  notFoundText: { fontSize: 18, fontWeight: '800', color: colors.ink },

  coverWrap: { width: '100%', height: 180, backgroundColor: colors.mist },
  coverImg: { width: '100%', height: '100%' },

  profileCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -24,
    padding: space.lg,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: -50,
    marginBottom: space.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.surface,
    backgroundColor: colors.mist,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  verifiedText: { color: '#FFF', fontSize: 11, fontWeight: '800' },

  providerName: { fontSize: 22, fontWeight: '900', color: colors.ink },
  address: { fontSize: 13, color: colors.muted, marginTop: 2 },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.canvas,
    borderRadius: radius.xl,
    padding: space.md,
    marginTop: space.md,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: colors.line,
  },
  statItem: { alignItems: 'center' },
  statIconRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 16, fontWeight: '900', color: colors.ink },
  statLabel: { fontSize: 11, color: colors.muted, marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: colors.line },

  section: { marginTop: space.xl },
  sectionHeading: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: space.sm },
  bioText: { fontSize: 14, color: colors.muted, lineHeight: 22 },

  hoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.canvas,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  hoursText: { fontSize: 13, fontWeight: '700', color: colors.ink, flex: 1 },

  servicesMenu: { gap: space.sm },
  serviceMenuItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.canvas,
    borderRadius: radius.xl,
    padding: space.md,
    gap: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  serviceName: { fontSize: 15, fontWeight: '800', color: colors.ink },
  serviceDesc: { fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 16 },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  durationText: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  servicePrice: { fontSize: 16, fontWeight: '900', color: colors.brand },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xl,
  },
});
