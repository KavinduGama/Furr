import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@furr/ui';
import { useProviderProfile } from '../../src/context/provider';
import { useProviderBookings } from '../../src/context/bookings';
import { useProviderEarnings } from '../../src/context/earnings';
import { useProviderProducts } from '../../src/context/products';
import { useProviderChat } from '../../src/context/chat';

export default function StudioDashboard() {
  const router = useRouter();
  const { profile, isOnline, toggleOnlineStatus } = useProviderProfile();
  const { bookings, accept, start } = useProviderBookings();
  const { summary } = useProviderEarnings();
  const { lowStockCount, orders } = useProviderProducts();
  const { totalUnreadCount } = useProviderChat();

  const todayBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'in_progress');
  const pendingRequests = bookings.filter((b) => b.status === 'pending');

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingText}>
            Welcome back, {profile?.name.split(' ')[0] || 'Partner'}
          </Text>
          <View style={styles.verifiedRow}>
            <Ionicons name="shield-checkmark" size={14} color={colors.brand} />
            <Text style={styles.verifiedText}>Verified Studio Specialist</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Messages button with badge */}
          <TouchableOpacity
            style={styles.chatIconBtn}
            onPress={() => router.push('/chat' as any)}
          >
            <Ionicons name="chatbubbles-outline" size={22} color={colors.ink} />
            {totalUnreadCount > 0 && (
              <View style={styles.chatBadge}>
                <Text style={styles.chatBadgeText}>{totalUnreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Online/Offline status toggle */}
          <TouchableOpacity
            style={[styles.statusPill, isOnline ? styles.statusPillOnline : styles.statusPillOffline]}
            onPress={toggleOnlineStatus}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOnline ? colors.success : colors.muted },
              ]}
            />
            <Text
              style={[
                styles.statusPillText,
                { color: isOnline ? colors.success : colors.muted },
              ]}
            >
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Today's Key Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconCircle, { backgroundColor: colors.calm }]}>
              <Ionicons name="calendar" size={18} color={colors.success} />
            </View>
            <Text style={styles.metricValue}>{todayBookings.length}</Text>
            <Text style={styles.metricLabel}>Today's Schedule</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconCircle, { backgroundColor: colors.softBrand }]}>
              <Ionicons name="wallet" size={18} color={colors.brand} />
            </View>
            <Text style={styles.metricValue}>LKR {summary.todayRevenue.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Today's Earnings</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconCircle, { backgroundColor: colors.warm }]}>
              <Ionicons name="notifications" size={18} color={colors.accent} />
            </View>
            <Text style={styles.metricValue}>{pendingRequests.length}</Text>
            <Text style={styles.metricLabel}>Pending Requests</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconCircle, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="cube" size={18} color={colors.danger} />
            </View>
            <Text style={styles.metricValue}>{lowStockCount}</Text>
            <Text style={styles.metricLabel}>Low Stock Items</Text>
          </View>
        </View>

        {/* Pending Requests Alert Banner */}
        {pendingRequests.length > 0 && (
          <View style={styles.alertBanner}>
            <Ionicons name="time" size={22} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>
                {pendingRequests.length} New Booking Request{pendingRequests.length > 1 ? 's' : ''}!
              </Text>
              <Text style={styles.alertSub}>
                Pet parents are waiting for your confirmation.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.alertActionBtn}
              onPress={() => router.push('/(tabs)/bookings' as any)}
            >
              <Text style={styles.alertActionText}>Review</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Today's Appointments Timeline */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Today's Appointments</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/bookings' as any)}>
            <Text style={styles.sectionLink}>View All ({bookings.length})</Text>
          </TouchableOpacity>
        </View>

        {todayBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-done-circle" size={40} color={colors.success} />
            <Text style={styles.emptyTitle}>All caught up for today!</Text>
            <Text style={styles.emptySub}>No more appointments scheduled on your calendar today.</Text>
          </View>
        ) : (
          <View style={styles.timelineList}>
            {todayBookings.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={styles.appointmentCard}
                onPress={() => router.push(`/bookings/${b.id}` as any)}
              >
                <View style={styles.timeBadge}>
                  <Text style={styles.timeBadgeText}>{b.timeSlot}</Text>
                  <View
                    style={[
                      styles.categoryTag,
                      b.status === 'in_progress' && { backgroundColor: colors.calm },
                    ]}
                  >
                    <Text style={styles.categoryTagText}>
                      {b.status === 'in_progress' ? 'ACTIVE' : b.serviceCategory.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.appointmentBody}>
                  <View style={styles.petHeaderRow}>
                    <Text style={styles.petName}>
                      {b.petName} ({b.petBreed || b.petSpecies})
                    </Text>
                    <Text style={styles.priceText}>LKR {b.price.toLocaleString()}</Text>
                  </View>
                  <Text style={styles.serviceName}>{b.serviceName}</Text>
                  <Text style={styles.ownerText}>Parent: {b.ownerName || 'Sarah Perera'}</Text>

                  {b.specialNotes && (
                    <View style={styles.notesBox}>
                      <Ionicons name="information-circle" size={14} color={colors.accent} />
                      <Text style={styles.notesText} numberOfLines={2}>
                        {b.specialNotes}
                      </Text>
                    </View>
                  )}

                  <View style={styles.cardActionsRow}>
                    {b.status === 'confirmed' && (
                      <TouchableOpacity
                        style={styles.startBtn}
                        onPress={() => start(b.id)}
                      >
                        <Ionicons name="play" size={14} color="#FFF" />
                        <Text style={styles.startBtnText}>Start Service</Text>
                      </TouchableOpacity>
                    )}
                    {b.status === 'in_progress' && (
                      <TouchableOpacity
                        style={styles.completeBtn}
                        onPress={() =>
                          router.push({
                            pathname: '/bookings/complete',
                            params: { bookingId: b.id },
                          } as any)
                        }
                      >
                        <Ionicons name="checkmark-done" size={14} color="#FFF" />
                        <Text style={styles.completeBtnText}>Complete & Report</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.detailBtn}
                      onPress={() => router.push(`/bookings/${b.id}` as any)}
                    >
                      <Text style={styles.detailBtnText}>Details</Text>
                      <Ionicons name="chevron-forward" size={14} color={colors.muted} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Studio Actions */}
        <Text style={[styles.sectionTitle, { marginTop: space.xl, marginBottom: space.sm }]}>
          Studio Quick Actions
        </Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/products/add' as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.softBrand }]}>
              <Ionicons name="add-circle" size={22} color={colors.brand} />
            </View>
            <Text style={styles.quickActionTitle}>Add Product</Text>
            <Text style={styles.quickActionSub}>List new inventory</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/profile/availability' as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.warm }]}>
              <Ionicons name="time" size={22} color={colors.accent} />
            </View>
            <Text style={styles.quickActionTitle}>Set Schedule</Text>
            <Text style={styles.quickActionSub}>Hours & blocked dates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/profile/edit-services' as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.calm }]}>
              <Ionicons name="pricetag" size={22} color={colors.success} />
            </View>
            <Text style={styles.quickActionTitle}>Service Menu</Text>
            <Text style={styles.quickActionSub}>Manage prices</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/(tabs)/earnings' as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="cash" size={22} color={colors.brand} />
            </View>
            <Text style={styles.quickActionTitle}>Payouts</Text>
            <Text style={styles.quickActionSub}>Request bank transfer</Text>
          </TouchableOpacity>
        </View>

        {/* Studio Performance Stats */}
        <Text style={[styles.sectionTitle, { marginTop: space.xl, marginBottom: space.sm }]}>
          Performance & Reputation
        </Text>
        <View style={styles.performanceCard}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>4.9 ★</Text>
            <Text style={styles.statSub}>Rating (32 reviews)</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>98%</Text>
            <Text style={styles.statSub}>Completion</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>8 mins</Text>
            <Text style={styles.statSub}>Avg Response</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerLeft: { flex: 1 },
  greetingText: { fontSize: 18, fontWeight: '900', color: colors.ink },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  verifiedText: { fontSize: 12, fontWeight: '700', color: colors.brand },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chatIconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.danger,
    borderRadius: radius.pill,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  chatBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  statusPillOnline: { backgroundColor: colors.calm, borderColor: colors.success },
  statusPillOffline: { backgroundColor: colors.mist, borderColor: colors.line },
  statusDot: { width: 8, height: 8, borderRadius: radius.pill },
  statusPillText: { fontSize: 12, fontWeight: '800' },

  scrollContent: { padding: space.lg, paddingBottom: 110 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  metricCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  metricIconCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricValue: { fontSize: 16, fontWeight: '900', color: colors.ink },
  metricLabel: { fontSize: 11, color: colors.muted, marginTop: 2 },

  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warm,
    borderRadius: radius.lg,
    padding: space.md,
    marginTop: space.md,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  alertTitle: { fontSize: 13, fontWeight: '800', color: colors.ink },
  alertSub: { fontSize: 11, color: colors.muted },
  alertActionBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  alertActionText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: colors.ink },
  sectionLink: { fontSize: 12, fontWeight: '800', color: colors.brand },

  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyTitle: { fontSize: 14, fontWeight: '800', color: colors.ink, marginTop: 8 },
  emptySub: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 2 },

  timelineList: { gap: space.sm },
  appointmentCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  timeBadge: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  timeBadgeText: { fontSize: 12, fontWeight: '800', color: colors.brand },
  categoryTag: {
    backgroundColor: colors.softBrand,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  categoryTagText: { fontSize: 10, fontWeight: '800', color: colors.brand },
  appointmentBody: { gap: 2 },
  petHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  petName: { fontSize: 14, fontWeight: '800', color: colors.ink },
  priceText: { fontSize: 14, fontWeight: '900', color: colors.ink },
  serviceName: { fontSize: 12, fontWeight: '700', color: colors.brand },
  ownerText: { fontSize: 11, color: colors.muted },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.mist,
    padding: 6,
    borderRadius: radius.sm,
    marginTop: 4,
  },
  notesText: { fontSize: 11, color: colors.ink, flex: 1 },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  startBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  completeBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  detailBtn: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  detailBtnText: { fontSize: 12, fontWeight: '700', color: colors.muted },

  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  quickActionItem: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: { fontSize: 13, fontWeight: '800', color: colors.ink },
  quickActionSub: { fontSize: 11, color: colors.muted, marginTop: 2 },

  performanceCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statCol: { alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '900', color: colors.ink },
  statSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: colors.line },
});
