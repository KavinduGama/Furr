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
import { useProviderAuth } from '../../src/context/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile } = useProviderProfile();
  const { signOut, user } = useProviderAuth();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Studio Profile</Text>
        <Text style={styles.headerSubtitle}>
          Manage public business listings, portfolio gallery, operating hours, and bank details.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card Hero */}
        <View style={styles.profileCardHero}>
          <View style={styles.avatarBox}>
            <Ionicons name="storefront" size={32} color={colors.brand} />
          </View>

          <View style={styles.profileMeta}>
            <View style={styles.titleRow}>
              <Text style={styles.businessName}>{profile?.name}</Text>
              <Ionicons name="checkmark-circle" size={18} color={colors.brand} />
            </View>
            <Text style={styles.categoryText}>
              {profile?.providerRoles?.map((r) => r.toUpperCase()).join(' • ') || 'GROOMING'}
            </Text>
            <Text style={styles.addressText}>
              📍 {profile?.address}, {profile?.city}
            </Text>

            <View style={styles.badgeRow}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#FFF" />
                <Text style={styles.ratingText}>4.9 (32 reviews)</Text>
              </View>
              <View style={styles.verifiedPill}>
                <Text style={styles.verifiedPillText}>Verified Specialist</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Studio Setup Actions */}
        <Text style={styles.sectionHeader}>Business Setup & Listings</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/profile/edit-services' as any)}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.softBrand }]}>
              <Ionicons name="pricetags" size={18} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Services & Pricing Menu</Text>
              <Text style={styles.menuSub}>{profile?.services.length || 3} active services configured</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/profile/availability' as any)}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.warm }]}>
              <Ionicons name="time" size={18} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Operating Hours & Schedule</Text>
              <Text style={styles.menuSub}>
                {profile?.availableDays.join(', ')} ({profile?.availableHours.start} - {profile?.availableHours.end})
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/profile/portfolio' as any)}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.calm }]}>
              <Ionicons name="images" size={18} color={colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Work Portfolio Gallery</Text>
              <Text style={styles.menuSub}>Upload client photos & grooming results</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Bank & Payout Configuration */}
        <Text style={styles.sectionHeader}>Bank Account & Payout Details</Text>
        <View style={styles.bankCard}>
          <View style={styles.bankCardHeader}>
            <Ionicons name="card" size={20} color={colors.brand} />
            <Text style={styles.bankNameText}>{profile?.bankDetails?.bankName || 'Commercial Bank'}</Text>
          </View>
          <Text style={styles.accountNumberText}>
            Account: •••• {profile?.bankDetails?.accountNumber?.slice(-4) || '1938'}
          </Text>
          <Text style={styles.bankBranchText}>
            Branch: {profile?.bankDetails?.branch || 'Kollupitiya Branch'}
          </Text>
          <Text style={styles.bankHolderText}>
            Holder: {profile?.bankDetails?.holderName || profile?.name}
          </Text>
        </View>

        {/* Studio Performance Summary */}
        <Text style={styles.sectionHeader}>Reputation & Verification</Text>
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>National Identity (NIC):</Text>
            <Text style={styles.statVal}>{profile?.nicNumber || '199428102941'}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>Platform Trust Tier:</Text>
            <Text style={[styles.statVal, { color: colors.success }]}>Top-Rated Studio (Level 2)</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>Average Acceptance Rate:</Text>
            <Text style={styles.statVal}>95%</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>Average Response Time:</Text>
            <Text style={styles.statVal}>8 minutes</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={async () => {
            await signOut();
            router.replace('/onboarding');
          }}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.signOutBtnText}>Sign Out of Studio</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: colors.ink },
  headerSubtitle: { fontSize: 12, color: colors.muted, marginTop: 2 },

  scrollContent: { padding: space.lg, paddingBottom: 110 },

  profileCardHero: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    gap: space.md,
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.softBrand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileMeta: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  businessName: { fontSize: 16, fontWeight: '900', color: colors.ink, flex: 1 },
  categoryText: { fontSize: 10, fontWeight: '800', color: colors.brand, marginTop: 2 },
  addressText: { fontSize: 12, color: colors.muted, marginTop: 4 },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  ratingText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  verifiedPill: {
    backgroundColor: colors.calm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  verifiedPillText: { fontSize: 10, fontWeight: '800', color: colors.success },

  sectionHeader: { fontSize: 14, fontWeight: '900', color: colors.ink, marginTop: space.lg, marginBottom: space.sm },

  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.md,
    gap: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: { fontSize: 14, fontWeight: '800', color: colors.ink },
  menuSub: { fontSize: 11, color: colors.muted, marginTop: 2 },

  bankCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 4,
  },
  bankCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  bankNameText: { fontSize: 14, fontWeight: '800', color: colors.ink },
  accountNumberText: { fontSize: 13, fontWeight: '900', color: colors.brand },
  bankBranchText: { fontSize: 12, color: colors.muted },
  bankHolderText: { fontSize: 12, color: colors.muted },

  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  statVal: { fontSize: 12, fontWeight: '800', color: colors.ink },

  signOutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: radius.pill,
    marginTop: space.xl,
  },
  signOutBtnText: { color: colors.danger, fontSize: 14, fontWeight: '800' },
});
