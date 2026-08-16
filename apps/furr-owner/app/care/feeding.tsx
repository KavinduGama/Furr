import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { useCare } from '@/src/context/care';
import { usePets } from '@/src/context/pets';

export default function FeedingScreen() {
  const { feedingSchedules, feedingLogs, logMeal } = useCare();
  const { selectedPet } = usePets();
  const [loggingMeal, setLoggingMeal] = useState<string | null>(null);

  const petName = selectedPet?.name || 'Your Pet';

  const handleMarkFed = async (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', portion: string) => {
    setLoggingMeal(mealType);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await logMeal(mealType, portion);
    setLoggingMeal(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Meal Logged! 🍲', `${petName}'s ${mealType} (${portion}) has been recorded.`);
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Daily Feeding Plan',
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
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Text style={{ fontSize: 32 }}>🥩</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Nutrition Schedule</Text>
            <Text style={styles.bannerCopy}>
              Maintain consistent feeding times and precise portions for {petName}'s digestive health.
            </Text>
          </View>
        </View>

        {/* Feeding Schedules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Meals</Text>
          <View style={styles.scheduleList}>
            {feedingSchedules.map((schedule) => (
              <View key={schedule.id} style={styles.scheduleCard}>
                <View style={styles.scheduleHeader}>
                  <View style={styles.mealTypeRow}>
                    <Ionicons
                      name={schedule.mealType === 'breakfast' ? 'sunny' : 'moon'}
                      size={16}
                      color="#F59E0B"
                    />
                    <Text style={styles.mealTypeName}>
                      {schedule.mealType.toUpperCase()} ({schedule.time})
                    </Text>
                  </View>
                  <Text style={styles.portionText}>{schedule.portion}</Text>
                </View>

                <Text style={styles.brandName}>🥣 {schedule.foodBrand}</Text>
                {schedule.notes && <Text style={styles.notesText}>Note: {schedule.notes}</Text>}

                <View style={styles.cardActions}>
                  <Pressable
                    onPress={() => handleMarkFed(schedule.mealType, schedule.portion)}
                    style={styles.markFedBtn}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                    <Text style={styles.markFedBtnText}>
                      {loggingMeal === schedule.mealType ? 'Saving...' : 'Mark as Fed'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => router.push('/(tabs)/shop' as never)}
                    style={styles.reorderBtn}
                  >
                    <Ionicons name="cart-outline" size={16} color={colors.brand} />
                    <Text style={styles.reorderBtnText}>Reorder Food</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Feeding History Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Feeding Logs</Text>
          <View style={styles.logsList}>
            {feedingLogs.map((log) => (
              <View key={log.id} style={styles.logItem}>
                <View style={styles.logDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.logTitle}>
                    {log.mealType.toUpperCase()} · {log.amount}
                  </Text>
                  <Text style={styles.logSubtitle}>Fed by {log.fedByName}</Text>
                </View>
                <Text style={styles.logTime}>
                  {new Date(log.fedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
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
  content: { padding: space.lg, paddingBottom: space.xxl, gap: space.lg },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    padding: space.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
  },
  bannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
  bannerCopy: { fontSize: 12, color: colors.muted, marginTop: 2, lineHeight: 16 },

  section: { gap: space.sm },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },

  scheduleList: { gap: space.md },
  scheduleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: space.xs,
  },
  scheduleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mealTypeName: { fontSize: 13, fontWeight: '900', color: colors.ink },
  portionText: { fontSize: 13, fontWeight: '800', color: colors.brand },
  brandName: { fontSize: 14, fontWeight: '700', color: colors.ink, marginTop: 2 },
  notesText: { fontSize: 12, color: colors.muted, fontStyle: 'italic', marginTop: 2 },

  cardActions: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.md,
    paddingTop: space.xs,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  markFedBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.brand,
    paddingVertical: 10,
    borderRadius: radius.lg,
  },
  markFedBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.softBrand,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.lg,
  },
  reorderBtnText: { color: colors.brand, fontSize: 13, fontWeight: '800' },

  logsList: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: space.md,
  },
  logItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  logTitle: { fontSize: 13, fontWeight: '800', color: colors.ink },
  logSubtitle: { fontSize: 11, color: colors.muted },
  logTime: { fontSize: 11, fontWeight: '700', color: colors.muted },
});
