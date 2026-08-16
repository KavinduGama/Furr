import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Linking, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { useLostFound } from '@/src/context/lostfound';
import { usePets } from '@/src/context/pets';

export default function LostFoundRadarScreen() {
  const { lostAlerts, foundReports } = useLostFound();
  const { selectedPet } = usePets();
  const [activeSegment, setActiveSegment] = useState<'lost' | 'found'>('lost');

  const handleCall = (phone: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(`Contact ${name}`, `Call ${phone} regarding this pet?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', onPress: () => Linking.openURL(`tel:${phone}`) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Lost & Found Pet Radar',
          headerStyle: { backgroundColor: colors.canvas },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
          ),
          headerRight: () =>
            selectedPet ? (
              <Pressable
                onPress={() => router.push(`/lost-found/pet-id/${selectedPet.id}` as never)}
                style={styles.petIdNavBtn}
              >
                <Ionicons name="qr-code-outline" size={16} color={colors.brand} />
                <Text style={styles.petIdNavText}>Pet ID</Text>
              </Pressable>
            ) : null,
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Action Header Card */}
        <View style={styles.alertBanner}>
          <View style={styles.alertIconWrap}>
            <Ionicons name="megaphone" size={24} color={colors.danger} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Community Emergency Network</Text>
            <Text style={styles.alertCopy}>
              Every second counts. Broadcast missing alerts to nearby owners or report a stray pet safely.
            </Text>
          </View>
        </View>

        {/* Primary CTA Buttons */}
        <View style={styles.ctaRow}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              router.push('/lost-found/report?type=lost' as never);
            }}
            style={[styles.ctaBtn, styles.ctaBtnLost]}
          >
            <Ionicons name="warning" size={18} color="#FFF" />
            <Text style={styles.ctaBtnText}>Report Lost Pet</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/lost-found/report?type=found' as never);
            }}
            style={[styles.ctaBtn, styles.ctaBtnFound]}
          >
            <Ionicons name="eye" size={18} color="#FFF" />
            <Text style={styles.ctaBtnText}>I Found a Pet</Text>
          </Pressable>
        </View>

        {/* Segmented Control */}
        <View style={styles.segmentBar}>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setActiveSegment('lost');
            }}
            style={[styles.segmentBtn, activeSegment === 'lost' && styles.segmentBtnActive]}
          >
            <Text
              style={[
                styles.segmentBtnText,
                activeSegment === 'lost' && styles.segmentBtnTextActive,
              ]}
            >
              Missing Pets ({lostAlerts.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setActiveSegment('found');
            }}
            style={[styles.segmentBtn, activeSegment === 'found' && styles.segmentBtnActive]}
          >
            <Text
              style={[
                styles.segmentBtnText,
                activeSegment === 'found' && styles.segmentBtnTextActive,
              ]}
            >
              Found Sightings ({foundReports.length})
            </Text>
          </Pressable>
        </View>

        {/* ─── SECTION 1: MISSING PET ALERTS ─── */}
        {activeSegment === 'lost' && (
          <View style={styles.cardList}>
            {lostAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <Image source={{ uri: alert.photoUrl }} style={styles.petImage} resizeMode="cover" />

                <View style={styles.cardBody}>
                  <View style={styles.tagRow}>
                    <View style={styles.missingBadge}>
                      <Text style={styles.missingBadgeText}>🚨 MISSING</Text>
                    </View>
                    {alert.rewardAmount && (
                      <View style={styles.rewardBadge}>
                        <Text style={styles.rewardText}>Reward: {alert.rewardAmount}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.petName}>{alert.petName}</Text>
                  <Text style={styles.petBreed}>
                    {alert.breed || 'Unknown breed'} · {alert.colour}
                  </Text>

                  <View style={styles.locationBox}>
                    <Ionicons name="location" size={14} color={colors.danger} />
                    <Text style={styles.locationText}>
                      Last seen at {alert.lastSeenAddress}, {alert.lastSeenCity} (
                      {new Date(alert.lastSeenTime).toLocaleDateString()})
                    </Text>
                  </View>

                  {alert.description && (
                    <Text style={styles.notesText}>"{alert.description}"</Text>
                  )}

                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.ownerLabel}>Owner Contact</Text>
                      <Text style={styles.ownerName}>{alert.ownerName}</Text>
                    </View>

                    <Pressable
                      onPress={() => handleCall(alert.ownerPhone, alert.ownerName)}
                      style={styles.callBtn}
                    >
                      <Ionicons name="call" size={14} color="#FFF" />
                      <Text style={styles.callBtnText}>Call Owner</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ─── SECTION 2: FOUND SIGHTINGS ─── */}
        {activeSegment === 'found' && (
          <View style={styles.cardList}>
            {foundReports.map((report) => (
              <View key={report.id} style={styles.alertCard}>
                <Image
                  source={{ uri: report.photoUrl }}
                  style={styles.petImage}
                  resizeMode="cover"
                />

                <View style={styles.cardBody}>
                  <View style={styles.tagRow}>
                    <View style={styles.foundBadge}>
                      <Text style={styles.foundBadgeText}>🐾 FOUND SIGHTING</Text>
                    </View>
                  </View>

                  <Text style={styles.petName}>{report.species === 'dog' ? 'Found Dog' : 'Found Cat'}</Text>
                  <Text style={styles.petBreed}>Color: {report.colour}</Text>

                  <View style={styles.locationBox}>
                    <Ionicons name="location" size={14} color={colors.success} />
                    <Text style={styles.locationText}>
                      Found at {report.foundAddress}, {report.foundCity} (
                      {new Date(report.foundTime).toLocaleDateString()})
                    </Text>
                  </View>

                  <Text style={styles.notesText}>"{report.description}"</Text>

                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.ownerLabel}>Finder</Text>
                      <Text style={styles.ownerName}>{report.reporterName}</Text>
                    </View>

                    <Pressable
                      onPress={() => handleCall(report.reporterPhone, report.reporterName)}
                      style={[styles.callBtn, { backgroundColor: colors.success }]}
                    >
                      <Ionicons name="call" size={14} color="#FFF" />
                      <Text style={styles.callBtnText}>Contact Finder</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  headerBtn: { padding: 6 },
  petIdNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.softBrand,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  petIdNavText: { fontSize: 12, fontWeight: '800', color: colors.brand },

  content: { padding: space.lg, paddingBottom: space.xxl, gap: space.md },

  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: '#FEF2F2',
    padding: space.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  alertIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: { fontSize: 15, fontWeight: '900', color: '#991B1B' },
  alertCopy: { fontSize: 12, color: '#B91C1C', marginTop: 2, lineHeight: 16 },

  ctaRow: { flexDirection: 'row', gap: space.md },
  ctaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.lg,
  },
  ctaBtnLost: { backgroundColor: colors.danger },
  ctaBtnFound: { backgroundColor: colors.success },
  ctaBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  segmentBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: space.xs,
  },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.lg },
  segmentBtnActive: { backgroundColor: colors.brand },
  segmentBtnText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  segmentBtnTextActive: { color: '#FFF', fontWeight: '800' },

  cardList: { gap: space.lg, marginTop: space.xs },
  alertCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
  },
  petImage: { width: '100%', height: 200, backgroundColor: colors.mist },
  cardBody: { padding: space.md, gap: space.xs },

  tagRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  missingBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  missingBadgeText: { fontSize: 11, fontWeight: '900', color: '#DC2626' },
  foundBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  foundBadgeText: { fontSize: 11, fontWeight: '900', color: '#166534' },
  rewardBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  rewardText: { fontSize: 11, fontWeight: '900', color: '#B45309' },

  petName: { fontSize: 20, fontWeight: '900', color: colors.ink, marginTop: 4 },
  petBreed: { fontSize: 13, color: colors.muted },

  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.canvas,
    padding: space.sm,
    borderRadius: radius.md,
    marginTop: 4,
  },
  locationText: { fontSize: 12, fontWeight: '600', color: colors.ink, flex: 1 },

  notesText: { fontSize: 12, color: colors.muted, fontStyle: 'italic', marginTop: 4, lineHeight: 16 },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.sm,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  ownerLabel: { fontSize: 10, color: colors.muted, textTransform: 'uppercase', fontWeight: '700' },
  ownerName: { fontSize: 13, fontWeight: '800', color: colors.ink },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  callBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
});
