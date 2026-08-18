import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@furr/ui';
import { useProviderBookings } from '../../src/context/bookings';

export default function BookingDetailScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const { bookings, accept, start } = useProviderBookings();

  const booking = bookings.find((b) => b.id === bookingId) || bookings[0];

  if (!booking) {
    return (
      <View style={styles.container}>
        <Text>Booking not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Details</Text>
        <TouchableOpacity
          style={styles.chatHeaderBtn}
          onPress={() => router.push('/chat' as any)}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.dateBadge}>
              <Ionicons name="calendar" size={16} color={colors.brand} />
              <Text style={styles.dateText}>{booking.date} • {booking.timeSlot}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                booking.status === 'confirmed' && { backgroundColor: colors.calm },
                booking.status === 'pending' && { backgroundColor: colors.warm },
                booking.status === 'in_progress' && { backgroundColor: colors.softBrand },
                booking.status === 'completed' && { backgroundColor: '#EDE9FE' },
              ]}
            >
              <Text style={styles.statusText}>{booking.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Pet Profile Insights */}
        <Text style={styles.sectionHeader}>Pet Client Profile</Text>
        <View style={styles.card}>
          <View style={styles.petHeader}>
            <View style={styles.petAvatar}>
              <Text style={styles.avatarLetter}>{booking.petName[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.petNameText}>{booking.petName}</Text>
              <Text style={styles.petBreedText}>
                {booking.petBreed || 'Mixed Breed'} • {booking.petSpecies.toUpperCase()}
              </Text>
              <Text style={styles.petAgeText}>Age: {booking.petAgeYears || 2} years old</Text>
            </View>
          </View>

          {booking.specialNotes && (
            <View style={styles.notesBox}>
              <Ionicons name="information-circle" size={16} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.notesTitle}>Special Instructions from Parent</Text>
                <Text style={styles.notesDesc}>{booking.specialNotes}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Service & Pricing Breakdown */}
        <Text style={styles.sectionHeader}>Service Details & Financials</Text>
        <View style={styles.card}>
          <Text style={styles.serviceTitle}>{booking.serviceName}</Text>
          <Text style={styles.serviceCat}>Category: {booking.serviceCategory.toUpperCase()}</Text>

          <View style={styles.priceDivider} />

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Client Paid Gross:</Text>
            <Text style={styles.priceVal}>LKR {booking.price.toLocaleString()}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Platform Take-Rate (10%):</Text>
            <Text style={[styles.priceVal, { color: colors.danger }]}>
              - LKR {(booking.platformFee || Math.round(booking.price * 0.1)).toLocaleString()}
            </Text>
          </View>
          <View style={[styles.priceRow, { marginTop: 4 }]}>
            <Text style={styles.payoutLabel}>Your Net Payout:</Text>
            <Text style={styles.payoutVal}>
              LKR {(booking.providerPayout || Math.round(booking.price * 0.9)).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Parent Contact Information */}
        <Text style={styles.sectionHeader}>Parent Contact</Text>
        <View style={styles.card}>
          <View style={styles.contactRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactName}>{booking.ownerName || 'Sarah Perera'}</Text>
              <Text style={styles.contactPhone}>{booking.ownerPhone || '+94 77 123 4567'}</Text>
            </View>
            <TouchableOpacity
              style={styles.messageBtn}
              onPress={() => router.push('/chat' as any)}
            >
              <Ionicons name="chatbubble" size={16} color="#FFF" />
              <Text style={styles.messageBtnText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View style={styles.footer}>
        {booking.status === 'pending' && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              accept(booking.id);
              router.back();
            }}
          >
            <Ionicons name="checkmark" size={18} color="#FFF" />
            <Text style={styles.actionBtnText}>Accept Booking Request</Text>
          </TouchableOpacity>
        )}

        {booking.status === 'confirmed' && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              start(booking.id);
              router.back();
            }}
          >
            <Ionicons name="play" size={18} color="#FFF" />
            <Text style={styles.actionBtnText}>Start Service Session</Text>
          </TouchableOpacity>
        )}

        {booking.status === 'in_progress' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.success }]}
            onPress={() =>
              router.push({
                pathname: '/bookings/complete',
                params: { bookingId: booking.id },
              } as any)
            }
          >
            <Ionicons name="checkmark-done" size={18} color="#FFF" />
            <Text style={styles.actionBtnText}>Complete & Send Report Card</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: colors.ink },
  chatHeaderBtn: { padding: 4 },

  scrollContent: { padding: space.lg, paddingBottom: 110, gap: space.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 13, fontWeight: '800', color: colors.ink },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  statusText: { fontSize: 11, fontWeight: '900', color: colors.brand },

  sectionHeader: { fontSize: 13, fontWeight: '900', color: colors.ink, marginTop: space.sm },
  petHeader: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  petAvatar: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.softBrand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: { fontSize: 20, fontWeight: '900', color: colors.brand },
  petNameText: { fontSize: 16, fontWeight: '900', color: colors.ink },
  petBreedText: { fontSize: 12, fontWeight: '700', color: colors.brand, marginTop: 2 },
  petAgeText: { fontSize: 11, color: colors.muted, marginTop: 2 },

  notesBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.warm,
    padding: space.md,
    borderRadius: radius.lg,
    marginTop: space.md,
  },
  notesTitle: { fontSize: 11, fontWeight: '800', color: colors.accent, textTransform: 'uppercase' },
  notesDesc: { fontSize: 12, color: colors.ink, marginTop: 2 },

  serviceTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  serviceCat: { fontSize: 11, color: colors.muted, marginTop: 2 },
  priceDivider: { height: 1, backgroundColor: colors.line, marginVertical: space.md },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  priceLabel: { fontSize: 12, color: colors.muted },
  priceVal: { fontSize: 12, fontWeight: '800', color: colors.ink },
  payoutLabel: { fontSize: 14, fontWeight: '900', color: colors.ink },
  payoutVal: { fontSize: 16, fontWeight: '900', color: colors.brand },

  contactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactName: { fontSize: 14, fontWeight: '800', color: colors.ink },
  contactPhone: { fontSize: 12, color: colors.muted, marginTop: 2 },
  messageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  messageBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: space.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : space.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  actionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.brand,
    paddingVertical: 14,
    borderRadius: radius.pill,
  },
  actionBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
});
