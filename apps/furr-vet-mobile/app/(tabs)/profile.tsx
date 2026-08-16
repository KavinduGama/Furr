import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@furr/ui';
import { useVetAuth } from '@/src/context/auth';

export default function VetProfileScreen() {
  const { profile, signOut } = useVetAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Practitioner Account</Text>
          <Text style={styles.subTitle}>Verified Veterinary Council Credentials</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {profile?.fullName ? profile.fullName.charAt(0) : 'D'}
            </Text>
          </View>
          <Text style={styles.doctorName}>{profile?.fullName || 'Dr. Sarah Smith'}</Text>
          <Text style={styles.doctorEmail}>{profile?.email || 'dr.smith@example.com'}</Text>

          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#059669" />
            <Text style={styles.verifiedText}>SLVC Verified Practitioner</Text>
          </View>
        </View>

        {/* Credential Details Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registration No.</Text>
            <Text style={styles.infoValue}>{profile?.registrationNumber || 'VET-12345'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Council / Authority</Text>
            <Text style={styles.infoValue}>Sri Lanka Veterinary Council</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registered District</Text>
            <Text style={styles.infoValue}>{profile?.district || 'Colombo'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hospital Branch</Text>
            <Text style={styles.infoValue}>Colombo Central Animal Hospital</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <Pressable
          onPress={signOut}
          style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.8 }]}
        >
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={styles.signOutText}>Sign Out of Mobile Workspace</Text>
        </Pressable>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10242D',
  },
  subTitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#006B78',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10242D',
  },
  doctorEmail: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    marginBottom: 20,
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    color: '#10242D',
    fontWeight: '800',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    paddingVertical: 14,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
});
