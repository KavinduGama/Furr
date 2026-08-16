import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Pet } from '@furr/core';
import { archivePet } from '@furr/firebase';
import { colors, radius, space, Button } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';
import { useHealth } from '@/src/context/health';
import { generateAndSharePdf } from '@/src/utils/pdf';

function speciesEmoji(pet: Pet) {
  return pet.species === 'cat' ? '🐈' : '🐕';
}

type TabKey = 'Overview' | 'Records' | 'Growth' | 'More';

export default function PetDetailScreen() {
  const { firebaseUser } = useAuth();
  const { selectedPet, removePet } = usePets();
  const { vaccinations, medications, flags } = useHealth();
  const [archiving, setArchiving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('Overview');

  if (!selectedPet) {
    return (
      <View style={styles.screen}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No pet selected.</Text>
          <Pressable onPress={() => router.back()} accessibilityRole="button">
            <Text style={styles.backLink}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleArchive = () => {
    Alert.alert(
      `Archive ${selectedPet.name}?`,
      'Their records will remain safe. You can restore them anytime from your archived pets.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            if (!firebaseUser) return;
            setArchiving(true);
            try {
              await archivePet(firebaseUser.uid, selectedPet.id);
              removePet(selectedPet.id);
              router.back();
            } catch {
              Alert.alert('Something went wrong', 'Couldn\'t archive. Please try again.');
            } finally {
              setArchiving(false);
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '', // Custom title below
          headerStyle: { backgroundColor: colors.canvas },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => router.back()}
              style={styles.headerBtn}
            >
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit pet"
              onPress={() => router.push({ pathname: '/pet/add' as never, params: { petId: selectedPet.id } })}
              style={styles.headerBtn}
            >
              <Ionicons name="create-outline" size={24} color={colors.ink} />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>{speciesEmoji(selectedPet)}</Text>
          </View>
          <Text style={styles.name}>{selectedPet.name}</Text>
          <Text style={styles.meta}>
            {selectedPet.breed || 'Mixed Breed'} · {selectedPet.sex === 'male' ? 'Male' : selectedPet.sex === 'female' ? 'Female' : 'Unknown'}
          </Text>
        </View>

        {/* Custom Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {(['Overview', 'Records', 'Growth', 'More'] as TabKey[]).map((tab) => (
              <Pressable
                key={tab}
                style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                {activeTab === tab && <View style={styles.tabIndicator} />}
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        {activeTab === 'Overview' && (
          <View style={styles.tabContent}>
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Weight</Text>
                <Text style={styles.statValue}>28.4 kg</Text>
                <Text style={styles.statSub}>Last updated</Text>
                <Text style={styles.statSub}>Mar 10, 2026</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Height</Text>
                <Text style={styles.statValue}>56 cm</Text>
                <Text style={styles.statSub}>Last updated</Text>
                <Text style={styles.statSub}>Mar 10, 2026</Text>
              </View>
            </View>

            {/* Health Score */}
            <View style={styles.healthScoreBox}>
              <Text style={styles.statLabel}>Health Score</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreValue}>92<Text style={styles.scoreMax}>/100</Text></Text>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreBadgeText}>Excellent</Text>
                </View>
              </View>
            </View>

            {/* Recent Activity */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </View>
            
            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineIcon}>
                  <Ionicons name="shield-checkmark" size={14} color={colors.brand} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineText}>Vaccination record added</Text>
                  <Text style={styles.timelineDate}>Mar 10, 2026</Text>
                </View>
              </View>
              <View style={styles.timelineLine} />
              <View style={styles.timelineItem}>
                <View style={styles.timelineIconSecondary}>
                  <Ionicons name="time" size={14} color={colors.accent} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineText}>Next reminder: Deworming</Text>
                  <Text style={styles.timelineDate}>Mar 20, 2026</Text>
                </View>
              </View>
            </View>

          </View>
        )}

        {activeTab === 'Records' && (
          <View style={styles.tabContent}>
            
            {/* Quick Record Add Button */}
            <View style={{marginBottom: space.lg}}>
              <Button 
                label="+ Add Record" 
                variant="primary" 
                onPress={() => router.push('/health/add-vaccination' as never)} 
              />
            </View>

            {/* Record List */}
            {vaccinations.length === 0 && medications.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No records found.</Text>
              </View>
            ) : (
              <View style={styles.recordList}>
                {vaccinations.map(vac => (
                  <View key={vac.id} style={styles.recordCard}>
                    <View style={styles.recordIconWrap}>
                       <Ionicons name="shield" size={20} color={colors.brand} />
                    </View>
                    <View style={styles.recordCardContent}>
                      <Text style={styles.recordTitle}>{vac.vaccineType === 'Other' ? (vac.customVaccineName ?? 'Vaccine') : vac.vaccineType}</Text>
                      <Text style={styles.recordDate}>{vac.administeredOn}</Text>
                      <View style={styles.recordVerifiedRow}>
                        <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                        <Text style={styles.recordVerifiedText}>Verified by Vet</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                  </View>
                ))}
              </View>
            )}

            {/* Export PDF (SHR-003) */}
            <Pressable
              accessibilityRole="button"
              style={styles.exportBtn}
              onPress={() => generateAndSharePdf(selectedPet, flags, vaccinations, medications)}
            >
              <Ionicons name="document-text" size={18} color={colors.brand} />
              <Text style={styles.exportBtnText}>Export Documents</Text>
            </Pressable>

          </View>
        )}

        {(activeTab === 'Growth' || activeTab === 'More') && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>This section is coming soon.</Text>
            {activeTab === 'More' && (
              <Pressable
                accessibilityRole="button"
                style={styles.archiveBtn}
                onPress={handleArchive}
                disabled={archiving}
              >
                <Ionicons name="archive-outline" size={16} color={colors.danger} />
                <Text style={styles.archiveBtnText}>
                  {archiving ? 'Archiving…' : `Archive ${selectedPet.name}`}
                </Text>
              </Pressable>
            )}
          </View>
        )}

      </ScrollView>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  scroll: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingBottom: 48 },
  headerBtn: { paddingHorizontal: 16 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { color: colors.muted, fontSize: 16 },
  backLink: { color: colors.brand, fontWeight: '800' },

  profileHeader: { alignItems: 'center', paddingVertical: space.md },
  avatarWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.pearl, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm, shadowColor: colors.ink, shadowOpacity: 0.1, shadowRadius: 15, shadowOffset: {width: 0, height: 8}, elevation: 4 },
  avatarEmoji: { fontSize: 48 },
  name: { color: colors.ink, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  meta: { color: colors.muted, fontSize: 15, marginTop: 4 },

  tabsContainer: { borderBottomWidth: 1, borderBottomColor: colors.line, marginTop: space.sm },
  tabsScroll: { paddingHorizontal: space.md },
  tabItem: { paddingHorizontal: space.md, paddingVertical: space.sm, position: 'relative' },
  tabItemActive: { },
  tabText: { color: colors.muted, fontSize: 16, fontWeight: '600' },
  tabTextActive: { color: colors.brand, fontWeight: '800' },
  tabIndicator: { position: 'absolute', bottom: -1, left: space.md, right: space.md, height: 3, backgroundColor: colors.brand, borderTopLeftRadius: 3, borderTopRightRadius: 3 },

  tabContent: { padding: space.lg },

  statsRow: { flexDirection: 'row', gap: space.md, marginBottom: space.md },
  statBox: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.xl, padding: space.lg, shadowColor: colors.ink, shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: {width: 0, height: 4}, elevation: 2 },
  statLabel: { color: colors.ink, fontSize: 16, fontWeight: '700', marginBottom: space.sm },
  statValue: { color: colors.ink, fontSize: 24, fontWeight: '900', marginBottom: space.sm },
  statSub: { color: colors.muted, fontSize: 12 },
  
  healthScoreBox: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: space.lg, marginBottom: space.xl, shadowColor: colors.ink, shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: {width: 0, height: 4}, elevation: 2 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xs },
  scoreValue: { color: colors.ink, fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  scoreMax: { color: colors.muted, fontSize: 16, fontWeight: '700' },
  scoreBadge: { backgroundColor: colors.calm, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm },
  scoreBadgeText: { color: colors.success, fontSize: 12, fontWeight: '800' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.sm },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },

  timeline: { paddingLeft: space.xs, marginTop: space.sm },
  timelineItem: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  timelineIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.softBrand, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  timelineIconSecondary: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  timelineContent: { flex: 1, paddingTop: 4, paddingBottom: space.md },
  timelineText: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  timelineDate: { color: colors.muted, fontSize: 13, marginTop: 2 },
  timelineLine: { position: 'absolute', left: 15, top: 32, bottom: 0, width: 2, backgroundColor: colors.line, zIndex: 1, height: 40 },

  recordList: { gap: space.md },
  recordCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.xl, padding: space.md, shadowColor: colors.ink, shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: {width: 0, height: 4}, elevation: 2 },
  recordIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.softBrand, alignItems: 'center', justifyContent: 'center', marginRight: space.md },
  recordCardContent: { flex: 1 },
  recordTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  recordDate: { color: colors.muted, fontSize: 13, marginTop: 2, marginBottom: 4 },
  recordVerifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recordVerifiedText: { color: colors.success, fontSize: 12, fontWeight: '700' },

  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, marginTop: space.xl, backgroundColor: colors.surface, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line },
  exportBtnText: { color: colors.brand, fontSize: 16, fontWeight: '700' },

  emptyState: { padding: space.xl, alignItems: 'center', justifyContent: 'center', gap: space.lg },

  archiveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 14, marginTop: 20 },
  archiveBtnText: { color: colors.danger, fontSize: 14, fontWeight: '700' },
});
