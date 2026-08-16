import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { colors, radius, space, Button } from '@furr/ui';
import { useCare } from '@/src/context/care';
import { usePets } from '@/src/context/pets';

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function WalkTrackerScreen() {
  const { walks, recordWalk } = useCare();
  const { selectedPet } = usePets();

  const [isWalking, setIsWalking] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [peeCount, setPeeCount] = useState(0);
  const [poopCount, setPoopCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const timerRef = useRef<any>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const lastLocationRef = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (isWalking) {
      // Start duration timer
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

      // Start GPS location watcher
      void (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            locationSubRef.current = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.High,
                distanceInterval: 5, // update every 5 meters
                timeInterval: 3000,
              },
              (location) => {
                const { latitude, longitude } = location.coords;
                if (lastLocationRef.current) {
                  const delta = getDistanceFromLatLonInKm(
                    lastLocationRef.current.latitude,
                    lastLocationRef.current.longitude,
                    latitude,
                    longitude
                  );
                  // Filter out GPS drift / jumps > 1km in 3s
                  if (delta > 0.002 && delta < 0.2) {
                    setDistanceKm((prev) => Math.round((prev + delta) * 100) / 100);
                  }
                }
                lastLocationRef.current = { latitude, longitude };
              }
            );
          }
        } catch {
          // Fallback if GPS unavailable
        }
      })();
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (locationSubRef.current) {
        locationSubRef.current.remove();
        locationSubRef.current = null;
      }
      lastLocationRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (locationSubRef.current) {
        locationSubRef.current.remove();
        locationSubRef.current = null;
      }
    };
  }, [isWalking]);

  const formatDuration = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartWalk = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsWalking(true);
    setSeconds(0);
    setDistanceKm(0);
    setPeeCount(0);
    setPoopCount(0);
  };

  const handleFinishWalk = async () => {
    if (seconds < 10 && distanceKm === 0) {
      setIsWalking(false);
      return;
    }

    setIsSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const durationMins = Math.max(1, Math.round(seconds / 60));
    const pace = distanceKm > 0 ? Math.round((durationMins / distanceKm) * 10) / 10 : 15;

    await recordWalk({
      startTime: new Date(Date.now() - seconds * 1000).toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes: durationMins,
      distanceKm: Math.max(0.1, distanceKm),
      avgPaceMinPerKm: pace,
      peeCount,
      poopCount,
      notes: `Great walk with ${selectedPet?.name || 'companion'}!`,
    });

    setIsWalking(false);
    setIsSaving(false);
    Alert.alert(
      'Walk Completed! 🦮',
      `Logged ${distanceKm.toFixed(2)} km in ${durationMins} minutes.`
    );
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Walk & Activity Tracker',
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
        {/* Live GPS Tracker HUD */}
        <View style={[styles.hudCard, isWalking && styles.hudCardActive]}>
          <View style={styles.hudHeader}>
            <View style={styles.liveBadge}>
              <View style={[styles.liveDot, isWalking && styles.liveDotActive]} />
              <Text style={styles.liveText}>{isWalking ? 'RECORDING WALK' : 'READY TO WALK'}</Text>
            </View>
            <Ionicons
              name={isWalking ? 'walk' : 'navigate-outline'}
              size={20}
              color={isWalking ? '#FFF' : colors.brand}
            />
          </View>

          <View style={styles.timerDisplay}>
            <Text style={[styles.timerValue, isWalking && styles.timerValueActive]}>
              {formatDuration(seconds)}
            </Text>
            <Text style={[styles.timerLabel, isWalking && styles.timerLabelActive]}>
              DURATION
            </Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, isWalking && styles.statNumActive]}>
                {distanceKm.toFixed(2)}
              </Text>
              <Text style={[styles.statTag, isWalking && styles.statTagActive]}>KILOMETERS</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, isWalking && styles.statNumActive]}>
                {seconds > 60 && distanceKm > 0
                  ? (seconds / 60 / distanceKm).toFixed(1)
                  : '0.0'}
              </Text>
              <Text style={[styles.statTag, isWalking && styles.statTagActive]}>PACE (MIN/KM)</Text>
            </View>
          </View>

          {/* Pee & Poop Counter while walking */}
          {isWalking && (
            <View style={styles.pottyRow}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPeeCount((c) => c + 1);
                }}
                style={styles.pottyBtn}
              >
                <Text style={styles.pottyEmoji}>💧</Text>
                <Text style={styles.pottyLabel}>Pee ({peeCount})</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPoopCount((c) => c + 1);
                }}
                style={styles.pottyBtn}
              >
                <Text style={styles.pottyEmoji}>💩</Text>
                <Text style={styles.pottyLabel}>Poop ({poopCount})</Text>
              </Pressable>
            </View>
          )}

          {/* Action Trigger */}
          <View style={{ marginTop: space.lg }}>
            {!isWalking ? (
              <Button label="Start New Walk" onPress={handleStartWalk} />
            ) : (
              <Button
                label={isSaving ? 'Finishing...' : 'Finish & Save Walk'}
                variant="secondary"
                onPress={handleFinishWalk}
              />
            )}
          </View>
        </View>

        {/* Walk History List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Walk History</Text>
          <View style={styles.historyList}>
            {walks.map((walk) => (
              <View key={walk.id} style={styles.walkCard}>
                <View style={styles.walkCardHeader}>
                  <View style={styles.walkIconWrap}>
                    <Ionicons name="walk" size={18} color={colors.brand} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.walkDistance}>{walk.distanceKm.toFixed(1)} km Outdoor Walk</Text>
                    <Text style={styles.walkDate}>
                      {new Date(walk.startTime).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <Text style={styles.walkDuration}>{walk.durationMinutes} mins</Text>
                </View>

                {(walk.poopCount || 0) + (walk.peeCount || 0) > 0 && (
                  <View style={styles.pottySummary}>
                    <Text style={styles.pottySummaryText}>
                      💧 {walk.peeCount || 0} pees · 💩 {walk.poopCount || 0} poops
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  headerBtn: { padding: 6 },
  content: { padding: space.lg, paddingBottom: space.xxl, gap: space.xl },

  hudCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  hudCardActive: { backgroundColor: '#02202B', borderColor: '#02202B' },

  hudHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.muted },
  liveDotActive: { backgroundColor: colors.danger },
  liveText: { fontSize: 11, fontWeight: '800', color: colors.muted, letterSpacing: 0.5 },

  timerDisplay: { alignItems: 'center', marginVertical: space.md },
  timerValue: { fontSize: 44, fontWeight: '900', color: colors.ink, letterSpacing: -1 },
  timerValueActive: { color: '#FFF' },
  timerLabel: { fontSize: 10, fontWeight: '800', color: colors.muted, letterSpacing: 1 },
  timerLabelActive: { color: 'rgba(255,255,255,0.6)' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: space.xs },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '900', color: colors.ink },
  statNumActive: { color: '#FFF' },
  statTag: { fontSize: 10, fontWeight: '800', color: colors.muted, letterSpacing: 0.5, marginTop: 2 },
  statTagActive: { color: 'rgba(255,255,255,0.6)' },

  pottyRow: { flexDirection: 'row', gap: space.md, marginTop: space.md },
  pottyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    borderRadius: radius.lg,
  },
  pottyEmoji: { fontSize: 16 },
  pottyLabel: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  section: { gap: space.sm },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },

  historyList: { gap: space.sm },
  walkCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  walkCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  walkIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.softBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkDistance: { fontSize: 14, fontWeight: '800', color: colors.ink },
  walkDate: { fontSize: 11, color: colors.muted, marginTop: 1 },
  walkDuration: { fontSize: 14, fontWeight: '900', color: colors.brand },
  pottySummary: {
    marginTop: space.sm,
    paddingTop: space.xs,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  pottySummaryText: { fontSize: 11, color: colors.muted, fontWeight: '600' },
});
