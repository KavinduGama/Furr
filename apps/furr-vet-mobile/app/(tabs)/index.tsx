import React from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@furr/ui';
import { useVetAuth } from '@/src/context/auth';
import { useVetGrants } from '@/src/context/grants';
import { DutyStatusToggle } from '@/src/components/DutyStatusToggle';

export default function VetDashboardScreen() {
  const { profile } = useVetAuth();
  const { activeGrants, admittedPets } = useVetGrants();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header with Greeting & Duty Toggle */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>HELLO,</Text>
            <Text style={styles.nameText}>{profile?.fullName || 'Dr. Sarah Smith'}</Text>
            <Text style={styles.subText}>Colombo Central Animal Hospital</Text>
          </View>
          <DutyStatusToggle />
        </View>

        {/* Action Quick-Cards */}
        <View style={styles.quickGrid}>
          <Pressable
            onPress={() => router.push('/(tabs)/scan')}
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.9 }]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="qr-code" size={24} color="#0284C7" />
            </View>
            <Text style={styles.actionTitle}>Scan QR Code</Text>
            <Text style={styles.actionSub}>Redeem 6-digit owner grant</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(tabs)/consults')}
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.9 }]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="chatbubbles" size={24} color="#9333EA" />
            </View>
            <Text style={styles.actionTitle}>Telehealth Queue</Text>
            <Text style={styles.actionSub}>2 triage cases pending</Text>
          </Pressable>
        </View>

        {/* Active Patients Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Admitted Patients &amp; Shared Records</Text>
          <Text style={styles.badgeCount}>{activeGrants.length} Active</Text>
        </View>

        {activeGrants.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="folder-open-outline" size={40} color={colors.muted} />
            <Text style={styles.emptyTitle}>No active shared records</Text>
            <Text style={styles.emptySub}>
              Scan an owner&apos;s QR code or enter their 6-digit grant code to view medical charts.
            </Text>
          </View>
        ) : (
          activeGrants.map((grant) => {
            const pet = admittedPets[grant.petId];
            if (!pet) return null;

            return (
              <Pressable
                key={grant.id}
                onPress={() => router.push(`/pet/${pet.id}` as any)}
                style={({ pressed }) => [styles.petCard, pressed && { opacity: 0.85 }]}
              >
                <View style={styles.petAvatar}>
                  <Text style={styles.avatarText}>{pet.name.charAt(0)}</Text>
                </View>
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petBreed}>
                    {pet.species} · {pet.breed || 'Mixed'} · {pet.sex}
                  </Text>
                  <Text style={styles.accessTime}>
                    Access ends:{' '}
                    {grant.grantExpiresAt
                      ? new Date(grant.grantExpiresAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '24 Hours'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.muted} />
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#006B78',
    letterSpacing: 1.2,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10242D',
    marginTop: 2,
  },
  subText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10242D',
  },
  actionSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10242D',
  },
  badgeCount: {
    fontSize: 11,
    fontWeight: '800',
    color: '#006B78',
    backgroundColor: '#DDF5F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10242D',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  petAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#006B78',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10242D',
  },
  petBreed: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  accessTime: {
    fontSize: 11,
    fontWeight: '600',
    color: '#006B78',
    marginTop: 4,
  },
});
