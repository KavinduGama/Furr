import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/src/components/screen';
import { colors, radius, space } from '@furr/ui';
import { SERVICE_CATEGORIES } from '@furr/core';
import { usePets } from '@/src/context/pets';

export default function ServicesTab() {
  const { selectedPet } = usePets();
  const petName = selectedPet?.name ?? 'your pet';

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Pet Services</Text>
            <Text style={styles.subtitle}>Book top-rated care for {petName}</Text>
          </View>
          <Pressable style={styles.bookingsBtn}>
            <Ionicons name="calendar-outline" size={20} color={colors.brand} />
            <Text style={styles.bookingsBtnText}>Bookings</Text>
          </Pressable>
        </View>

        {/* Categories Grid */}
        <View style={styles.grid}>
          {SERVICE_CATEGORIES.map((cat) => (
            <Pressable key={cat.id} style={styles.serviceCard}>
              <View style={styles.serviceIconWrap}>
                <Ionicons name={cat.icon as any} size={24} color={colors.brand} />
              </View>
              <Text style={styles.serviceTitle}>{cat.title}</Text>
              <Text style={styles.serviceSubtitle}>{cat.subtitle}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: colors.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 2 },
  bookingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.softBrand,
  },
  bookingsBtnText: { color: colors.brand, fontSize: 13, fontWeight: '800' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
    marginTop: space.xl,
  },
  serviceCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  serviceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.softBrand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  serviceTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  serviceSubtitle: { fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 16 },
});
