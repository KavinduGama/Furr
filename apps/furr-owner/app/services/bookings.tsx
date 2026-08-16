import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, RefreshControl } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { useServices } from '@/src/context/services';
import type { BookingStatus } from '@furr/core';

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  pending: { label: 'Pending Confirmation', color: '#D97706', bg: '#FEF3C7', icon: 'time' },
  confirmed: { label: 'Confirmed', color: colors.success, bg: colors.calm, icon: 'checkmark-circle' },
  in_progress: { label: 'In Progress', color: '#2563EB', bg: '#DBEAFE', icon: 'cut' },
  completed: { label: 'Completed', color: colors.muted, bg: colors.mist, icon: 'shield-checkmark' },
  cancelled: { label: 'Cancelled', color: colors.danger, bg: '#FEE2E2', icon: 'close-circle' },
};

export default function MyBookingsScreen() {
  const { bookings, cancelBooking } = useServices();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    requestAnimationFrame(() => setRefreshing(false));
  }, []);

  const handleCancel = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking?',
      'Are you sure you want to cancel this appointment? You can reschedule anytime.',
      [
        { text: 'Keep Appointment', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await cancelBooking(bookingId);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'My Bookings',
          headerStyle: { backgroundColor: colors.canvas },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
      >
        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar-outline" size={56} color={colors.brand} />
            </View>
            <Text style={styles.emptyTitle}>No Appointments Booked</Text>
            <Text style={styles.emptyCopy}>
              Book expert grooming, walking, sitting, or transport for your pets with a few taps.
            </Text>
            <Button
              label="Explore Services"
              onPress={() => router.replace('/(tabs)/services' as never)}
            />
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {bookings.map((booking) => {
              const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed;
              const canCancel =
                booking.status === 'pending' || booking.status === 'confirmed';

              return (
                <View key={booking.id} style={styles.bookingCard}>
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.serviceName}>{booking.serviceName}</Text>
                      <Text style={styles.providerName}>{booking.providerName}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                      <Ionicons name={statusCfg.icon} size={12} color={statusCfg.color} />
                      <Text style={[styles.statusText, { color: statusCfg.color }]}>
                        {statusCfg.label}
                      </Text>
                    </View>
                  </View>

                  {/* Booking Details Grid */}
                  <View style={styles.detailsBox}>
                    <View style={styles.detailRow}>
                      <Ionicons name="paw" size={14} color={colors.brand} />
                      <Text style={styles.detailText}>
                        Pet: <Text style={styles.detailBold}>{booking.petName}</Text>
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar" size={14} color={colors.brand} />
                      <Text style={styles.detailText}>
                        Date: <Text style={styles.detailBold}>{booking.date}</Text> at{' '}
                        <Text style={styles.detailBold}>{booking.timeSlot}</Text>
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="cash-outline" size={14} color={colors.brand} />
                      <Text style={styles.detailText}>
                        Fee: <Text style={styles.detailBold}>Rs {booking.price.toLocaleString()}</Text>
                      </Text>
                    </View>
                    {booking.specialNotes ? (
                      <View style={styles.detailRow}>
                        <Ionicons name="chatbox-ellipses-outline" size={14} color={colors.muted} />
                        <Text style={styles.detailText} numberOfLines={2}>
                          Notes: {booking.specialNotes}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Actions Footer */}
                  {canCancel && (
                    <View style={styles.cardFooter}>
                      <Pressable
                        onPress={() => handleCancel(booking.id)}
                        style={styles.cancelBtn}
                      >
                        <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  headerBtn: { padding: 6 },
  content: { padding: space.lg, paddingBottom: space.xxl },

  emptyState: { alignItems: 'center', justifyContent: 'center', padding: space.xxl, gap: space.md },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.softBrand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: colors.ink },
  emptyCopy: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: space.sm },

  bookingsList: { gap: space.md },
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  serviceName: { fontSize: 16, fontWeight: '800', color: colors.ink },
  providerName: { fontSize: 13, color: colors.muted, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusText: { fontSize: 11, fontWeight: '800' },

  detailsBox: { paddingVertical: space.sm, gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13, color: colors.muted },
  detailBold: { fontWeight: '700', color: colors.ink },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  cancelBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  cancelBtnText: { color: colors.danger, fontSize: 13, fontWeight: '700' },
});
