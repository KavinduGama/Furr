import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@furr/ui';
import type { BookingStatus, ServiceBooking } from '@furr/core';
import { useProviderBookings } from '../../src/context/bookings';

const FILTER_TABS: { id: 'all' | BookingStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function BookingsScreen() {
  const router = useRouter();
  const { bookings, filter, setFilter, accept, decline, start } = useProviderBookings();

  const [declineModalVisible, setDeclineModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('Slot fully booked during requested time');

  const handleOpenDecline = (id: string) => {
    setSelectedBookingId(id);
    setDeclineModalVisible(true);
  };

  const handleConfirmDecline = async () => {
    if (!selectedBookingId) return;
    await decline(selectedBookingId, declineReason);
    setDeclineModalVisible(false);
    setSelectedBookingId(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Client Bookings</Text>
        <Text style={styles.headerSubtitle}>
          Manage appointment confirmations, ongoing sessions, and completion reports.
        </Text>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setFilter(tab.id)}
              >
                <Text style={[styles.filterPillText, isActive && { color: '#FFF' }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {bookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={48} color={colors.muted} />
            <Text style={styles.emptyTitle}>No bookings in this category</Text>
            <Text style={styles.emptySub}>
              Appointments matching "{filter}" will appear here in real time.
            </Text>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {bookings.map((b) => (
              <View key={b.id} style={styles.bookingCard}>
                {/* Top Status & Date Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.dateBadge}>
                    <Ionicons name="calendar" size={14} color={colors.brand} />
                    <Text style={styles.dateText}>{b.date} • {b.timeSlot}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      b.status === 'pending' && { backgroundColor: colors.warm },
                      b.status === 'confirmed' && { backgroundColor: colors.calm },
                      b.status === 'in_progress' && { backgroundColor: colors.softBrand },
                      b.status === 'completed' && { backgroundColor: '#EDE9FE' },
                      b.status === 'cancelled' && { backgroundColor: '#FEE2E2' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        b.status === 'pending' && { color: colors.accent },
                        b.status === 'confirmed' && { color: colors.success },
                        b.status === 'in_progress' && { color: colors.brand },
                        b.status === 'completed' && { color: colors.brandDark },
                        b.status === 'cancelled' && { color: colors.danger },
                      ]}
                    >
                      {b.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Pet & Service Details */}
                <View style={styles.mainInfo}>
                  <View style={styles.petRow}>
                    <Text style={styles.petName}>
                      {b.petName} ({b.petBreed || b.petSpecies})
                    </Text>
                    <Text style={styles.priceValue}>LKR {b.price.toLocaleString()}</Text>
                  </View>

                  <Text style={styles.serviceName}>{b.serviceName}</Text>
                  <Text style={styles.clientText}>
                    Parent: {b.ownerName || 'Sarah Perera'} • {b.ownerPhone || '+94 77 123 4567'}
                  </Text>

                  {b.specialNotes && (
                    <View style={styles.notesBox}>
                      <Ionicons name="alert-circle" size={14} color={colors.accent} />
                      <Text style={styles.notesText}>{b.specialNotes}</Text>
                    </View>
                  )}

                  {b.cancellationReason && (
                    <View style={[styles.notesBox, { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons name="close-circle" size={14} color={colors.danger} />
                      <Text style={[styles.notesText, { color: colors.danger }]}>
                        Reason: {b.cancellationReason}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Bottom Action Triggers */}
                <View style={styles.cardFooter}>
                  {b.status === 'pending' && (
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.declineBtn}
                        onPress={() => handleOpenDecline(b.id)}
                      >
                        <Text style={styles.declineBtnText}>Decline</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() => accept(b.id)}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFF" />
                        <Text style={styles.acceptBtnText}>Accept Booking</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {b.status === 'confirmed' && (
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.chatBtn}
                        onPress={() => router.push('/chat' as any)}
                      >
                        <Ionicons name="chatbubble-outline" size={16} color={colors.ink} />
                        <Text style={styles.chatBtnText}>Message</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.startServiceBtn}
                        onPress={() => start(b.id)}
                      >
                        <Ionicons name="play" size={16} color="#FFF" />
                        <Text style={styles.startServiceBtnText}>Start Service</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {b.status === 'in_progress' && (
                    <TouchableOpacity
                      style={styles.completeServiceBtn}
                      onPress={() =>
                        router.push({
                          pathname: '/bookings/complete',
                          params: { bookingId: b.id },
                        } as any)
                      }
                    >
                      <Ionicons name="checkmark-done" size={18} color="#FFF" />
                      <Text style={styles.completeServiceBtnText}>
                        Complete & Send Report Card
                      </Text>
                    </TouchableOpacity>
                  )}

                  {b.status === 'completed' && (
                    <View style={styles.completedRow}>
                      <Ionicons name="shield-checkmark" size={16} color={colors.success} />
                      <Text style={styles.completedText}>
                        Report card delivered • Payout settled (LKR {b.providerPayout || Math.round(b.price * 0.9)})
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Decline Reason Modal */}
      <Modal visible={declineModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Decline Booking Request</Text>
              <TouchableOpacity onPress={() => setDeclineModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.ink} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Please select or enter a reason for the pet parent:
            </Text>

            <TextInput
              style={styles.reasonInput}
              value={declineReason}
              onChangeText={setDeclineReason}
              placeholder="e.g. Schedule conflict or fully booked"
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setDeclineModalVisible(false)}
              >
                <Text style={styles.cancelModalBtnText}>Keep Request</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeclineBtn}
                onPress={handleConfirmDecline}
              >
                <Text style={styles.confirmDeclineBtnText}>Confirm Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: colors.ink },
  headerSubtitle: { fontSize: 12, color: colors.muted, marginTop: 2, marginBottom: space.sm },

  filterScroll: { gap: 8, paddingVertical: 6 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
    borderWidth: 1,
    borderColor: colors.line,
  },
  filterPillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  filterPillText: { fontSize: 12, fontWeight: '800', color: colors.ink },

  scrollContent: { padding: space.lg, paddingBottom: 110 },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: space.xl,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.ink, marginTop: 12 },
  emptySub: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 4 },

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
    alignItems: 'center',
    marginBottom: space.sm,
  },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 12, fontWeight: '800', color: colors.ink },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  statusText: { fontSize: 10, fontWeight: '900' },

  mainInfo: { gap: 4 },
  petRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  petName: { fontSize: 15, fontWeight: '800', color: colors.ink },
  priceValue: { fontSize: 15, fontWeight: '900', color: colors.ink },
  serviceName: { fontSize: 13, fontWeight: '700', color: colors.brand },
  clientText: { fontSize: 11, color: colors.muted },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.mist,
    padding: 8,
    borderRadius: radius.sm,
    marginTop: 4,
  },
  notesText: { fontSize: 11, color: colors.ink, flex: 1 },

  cardFooter: {
    marginTop: space.md,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  actionsRow: { flexDirection: 'row', gap: space.sm },
  declineBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
    alignItems: 'center',
  },
  declineBtnText: { fontSize: 13, fontWeight: '800', color: colors.danger },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
  },
  acceptBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
  },
  chatBtnText: { fontSize: 13, fontWeight: '800', color: colors.ink },
  startServiceBtn: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
  },
  startServiceBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  completeServiceBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
  },
  completeServiceBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  completedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  completedText: { fontSize: 11, fontWeight: '700', color: colors.success },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: space.xl,
    paddingBottom: space.xl,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  modalSubtitle: { fontSize: 12, color: colors.muted, marginBottom: space.md },
  reasonInput: {
    backgroundColor: colors.canvas,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 13,
    marginBottom: space.lg,
  },
  modalActions: { flexDirection: 'row', gap: space.md },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
    alignItems: 'center',
  },
  cancelModalBtnText: { fontSize: 13, fontWeight: '800', color: colors.ink },
  confirmDeclineBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    alignItems: 'center',
  },
  confirmDeclineBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
});
