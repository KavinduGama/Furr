import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Share, Alert, Image } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { usePets } from '@/src/context/pets';
import { useAuth } from '@/src/context/auth';

export default function DigitalPetIdScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const { pets } = usePets();
  const { profile } = useAuth();

  const pet = pets.find((p) => p.id === petId) || pets[0];

  if (!pet) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Pet record not found</Text>
        <Button label="Back" onPress={() => router.back()} />
      </View>
    );
  }

  const emergencyUrl = `https://furr.app/id/${pet.id}`;

  const handleShareId = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        title: `${pet.name}'s Emergency Furr ID`,
        message: `🐾 Official Digital Pet ID for ${pet.name} (${pet.species}, ${pet.breed}). In case of emergency or if found, contact owner via: ${emergencyUrl}`,
      });
    } catch {
      Alert.alert('Share Failed', 'Unable to share Pet ID.');
    }
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Digital Pet ID',
          headerStyle: { backgroundColor: colors.canvas },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleShareId} style={styles.headerBtn}>
              <Ionicons name="share-outline" size={24} color={colors.brand} />
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* The Digital Passport Card */}
        <View style={styles.passportCard}>
          {/* Card Top Brand */}
          <View style={styles.passportHeader}>
            <View style={styles.brandRow}>
              <View style={styles.brandBadge}>
                <Text style={styles.brandBadgeText}>FURR</Text>
              </View>
              <Text style={styles.passportHeading}>OFFICIAL COMPANION ID</Text>
            </View>
            <Ionicons name="shield-checkmark" size={22} color={colors.brand} />
          </View>

          {/* Main Info */}
          <View style={styles.petIdentityRow}>
            <View style={styles.avatarWrap}>
              <Text style={{ fontSize: 44 }}>{pet.species === 'cat' ? '🐈' : '🐕'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petBreed}>
                {pet.breed || 'Companion'} · {pet.sex ? pet.sex.toUpperCase() : 'MALE'}
              </Text>
              <Text style={styles.petDob}>Born: {pet.birthDate || '2023-04-12'}</Text>
            </View>
          </View>

          {/* Microchip & Registration */}
          <View style={styles.detailsTable}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>MICROCHIP / ID</Text>
              <Text style={styles.tableValue}>{pet.microchipNumber || '985141003482190'}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>COLOUR</Text>
              <Text style={styles.tableValue}>{pet.colour || 'Golden / Cream'}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>PRIMARY OWNER</Text>
              <Text style={styles.tableValue}>{profile?.displayName || 'Pet Owner'}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>EMERGENCY PHONE</Text>
              <Text style={styles.tableValue}>{profile?.phoneE164 || '+94 77 000 0000'}</Text>
            </View>
          </View>

          {/* QR Code Presentation Box */}
          <View style={styles.qrSection}>
            <View style={styles.qrMock}>
              <Image
                source={{
                  uri: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(emergencyUrl)}&color=02202B`,
                }}
                style={{ width: 140, height: 140 }}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.qrInstruction}>
              Scan to view verified health records, allergy warnings, and emergency finder contact.
            </Text>
            <Text style={styles.qrUrl}>{emergencyUrl}</Text>
          </View>
        </View>

        {/* Action Button */}
        <View style={{ marginTop: space.sm }}>
          <Button label="Share Emergency Card" onPress={handleShareId} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  headerBtn: { padding: 6 },
  content: { padding: space.lg, paddingBottom: space.xxl, gap: space.md },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md },
  notFoundText: { fontSize: 18, fontWeight: '800', color: colors.ink },

  passportCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: colors.ink,
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  passportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandBadge: { backgroundColor: colors.brand, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm },
  brandBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  passportHeading: { fontSize: 11, fontWeight: '800', color: colors.muted, letterSpacing: 1 },

  petIdentityRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginVertical: space.md },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.pearl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.softBrand,
  },
  petName: { fontSize: 22, fontWeight: '900', color: colors.ink },
  petBreed: { fontSize: 13, fontWeight: '700', color: colors.brand, marginTop: 1 },
  petDob: { fontSize: 12, color: colors.muted, marginTop: 2 },

  detailsTable: {
    backgroundColor: colors.canvas,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.xs,
  },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  tableLabel: { fontSize: 10, fontWeight: '800', color: colors.muted, letterSpacing: 0.5 },
  tableValue: { fontSize: 12, fontWeight: '800', color: colors.ink },

  qrSection: { alignItems: 'center', marginTop: space.lg, gap: space.xs },
  qrMock: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
  },
  qrInstruction: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 6, lineHeight: 16 },
  qrUrl: { fontSize: 11, fontWeight: '800', color: colors.brand, marginTop: 2 },
});
