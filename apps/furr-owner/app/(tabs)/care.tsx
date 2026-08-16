import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View, ActivityIndicator, Alert, ScrollView, Platform } from 'react-native';
import { useMemo } from 'react';
import { LineChart } from 'react-native-gifted-charts';
import type { VaccinationRecord, MedicationPlan, WeightEntry } from '@furr/core';
import { colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';
import { useHealth } from '@/src/context/health';

// ─────────────────────────────────────────────────────────────
//  Care Centre tab  (VAC-001/002, MED-001/002, WGT-001/002)
// ─────────────────────────────────────────────────────────────

function provenanceBadge(prov: VaccinationRecord['provenance']) {
  switch (prov) {
    case 'VET_VERIFIED':
    case 'VET_AUTHORED':
      return { label: 'Vet verified', color: colors.success, bg: '#EEFAF5' };
    case 'OWNER_ENTERED_WITH_DOCUMENT':
      return { label: 'With document', color: '#B8870F', bg: colors.warm };
    default:
      return { label: 'Owner entered', color: colors.muted, bg: colors.pearl };
  }
}

function freqLabel(plan: MedicationPlan): string {
  const f = plan.frequency;
  switch (f.kind) {
    case 'once': return 'One time';
    case 'every_n_hours': return `Every ${f.hours}h`;
    case 'daily': return `Daily · ${f.times.join(', ')}`;
    case 'weekly': return 'Weekly';
  }
}

function weightTrend(entries: WeightEntry[]): string | null {
  if (entries.length < 2) return null;
  const latest = entries[0];
  const prev = entries[1];
  const prevVal = prev.unit === latest.unit ? prev.value
    : prev.unit === 'kg' ? prev.value * 2.205 : prev.value / 2.205;
  const diff = latest.value - prevVal;
  if (Math.abs(diff) < 0.05) return null;
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)} ${latest.unit} since last entry`;
}

export default function CareScreen() {
  const { firebaseUser } = useAuth();
  const { selectedPet } = usePets();
  const { vaccinations, medications, weights, documents, isLoading, removeMedication } = useHealth();

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.brand} size="large" />
        </View>
      </View>
    );
  }

  const petName = selectedPet?.name ?? 'your pet';

  const weightData = useMemo(() => {
    if (weights.length === 0) return [];
    // Sort oldest first for the chart
    const sorted = [...weights].sort((a, b) => new Date(a.measuredOn).getTime() - new Date(b.measuredOn).getTime());
    return sorted.map(w => {
      // Normalize to kg for consistent charting if units differ
      const val = w.unit === 'kg' ? w.value : w.value / 2.205;
      const dateObj = new Date(w.measuredOn);
      return {
        value: parseFloat(val.toFixed(2)),
        label: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`,
      };
    });
  }, [weights]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>HEALTH RECORDS</Text>
          <Text style={styles.title}>Care centre</Text>
          {selectedPet && <Text style={styles.sub}>Showing records for {petName}</Text>}
        </View>
        {/* Add record buttons */}
        <View style={styles.addBtns}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add vaccination"
            style={styles.addBtn}
            onPress={() => router.push('/health/add-vaccination' as never)}
          >
            <Ionicons name="shield-checkmark" size={16} color="#fff" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add medication"
            style={[styles.addBtn, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/health/add-medication' as never)}
          >
            <Ionicons name="medical" size={16} color="#fff" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log weight"
            style={[styles.addBtn, { backgroundColor: '#2D8EC8' }]}
            onPress={() => router.push('/health/add-weight' as never)}
          >
            <Ionicons name="scale" size={16} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* ── Vaccinations ─────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="shield-checkmark" size={15} color={colors.brand} />
          <Text style={styles.sectionTitle}>VACCINATIONS</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/health/add-vaccination' as never)}
        >
          <Text style={styles.addLink}>+ Add</Text>
        </Pressable>
      </View>

      {vaccinations.length === 0 ? (
        <Pressable
          accessibilityRole="button"
          style={styles.emptyCard}
          onPress={() => router.push('/health/add-vaccination' as never)}
        >
          <Ionicons name="shield-outline" size={20} color={colors.muted} />
          <View style={{ flex: 1 }}>
            <Text style={styles.emptyTitle}>No vaccinations yet</Text>
            <Text style={styles.emptyCopy}>Add {petName}'s vaccination history to build a trusted record.</Text>
          </View>
          <Ionicons name="arrow-forward" size={15} color={colors.brand} />
        </Pressable>
      ) : (
        vaccinations.map((vac) => {
          const badge = provenanceBadge(vac.provenance);
          const displayName = vac.vaccineType === 'Other' ? (vac.customVaccineName ?? 'Vaccine') : vac.vaccineType;
          return (
            <View key={vac.id} style={styles.recordCard}>
              <View style={styles.recordMain}>
                <View style={styles.recordIcon}>
                  <Ionicons name="shield-checkmark" size={17} color={colors.brand} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recordTitle}>{displayName}</Text>
                  <Text style={styles.recordMeta}>Administered {vac.administeredOn}</Text>
                  {vac.nextDueOn && (
                    <Text style={styles.recordDue}>Next due {vac.nextDueOn}</Text>
                  )}
                  {vac.veterinarian && (
                    <Text style={styles.recordMeta}>{vac.veterinarian}{vac.clinic ? ` · ${vac.clinic}` : ''}</Text>
                  )}
                </View>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                </View>
              </View>
            </View>
          );
        })
      )}

      {/* ── Medications ──────────────────────────────── */}
      <View style={[styles.sectionHeader, { marginTop: space.sm }]}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="medical" size={15} color={colors.accent} />
          <Text style={styles.sectionTitle}>MEDICATIONS</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/health/add-medication' as never)}
        >
          <Text style={styles.addLink}>+ Add</Text>
        </Pressable>
      </View>

      {medications.length === 0 ? (
        <Pressable
          accessibilityRole="button"
          style={styles.emptyCard}
          onPress={() => router.push('/health/add-medication' as never)}
        >
          <Ionicons name="medkit-outline" size={20} color={colors.muted} />
          <View style={{ flex: 1 }}>
            <Text style={styles.emptyTitle}>No active medications</Text>
            <Text style={styles.emptyCopy}>Track {petName}'s supplements, prescriptions and treatments.</Text>
          </View>
          <Ionicons name="arrow-forward" size={15} color={colors.brand} />
        </Pressable>
      ) : (
        medications.map((med) => (
          <Pressable
            key={med.id}
            style={styles.recordCard}
            onPress={() => {
              Alert.alert(
                `End ${med.medicationName}?`,
                'This will archive the medication plan. It will still show in the timeline but will no longer be active.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'End plan',
                    style: 'destructive',
                    onPress: async () => {
                      if (!firebaseUser || !selectedPet) return;
                      try {
                        const { deactivateMedication } = await import('@furr/firebase');
                        await deactivateMedication(firebaseUser.uid, selectedPet.id, med.id);
                        removeMedication(med.id);
                      } catch {
                        Alert.alert('Error', 'Could not end medication plan.');
                      }
                    },
                  },
                ]
              );
            }}
          >
            <View style={styles.recordMain}>
              <View style={[styles.recordIcon, { backgroundColor: colors.warm }]}>
                <Ionicons name="medical" size={17} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recordTitle}>{med.medicationName}</Text>
                <Text style={styles.recordMeta}>{med.doseInstruction}</Text>
                <Text style={styles.recordMeta}>{freqLabel(med)}</Text>
                {med.reason && <Text style={styles.recordMeta}>Reason: {med.reason}</Text>}
                <Text style={{ color: colors.danger, fontSize: 11, fontWeight: '800', marginTop: 4 }}>Tap to end plan</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: '#EEFAF5' }]}>
                <Text style={[styles.badgeText, { color: colors.success }]}>Active</Text>
              </View>
            </View>
          </Pressable>
        ))
      )}

      {/* ── Weight ───────────────────────────────────── */}
      <View style={[styles.sectionHeader, { marginTop: space.sm }]}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="scale" size={15} color="#2D8EC8" />
          <Text style={styles.sectionTitle}>WEIGHT</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/health/add-weight' as never)}
        >
          <Text style={styles.addLink}>+ Log</Text>
        </Pressable>
      </View>

      {weights.length === 0 ? (
        <Pressable
          accessibilityRole="button"
          style={styles.emptyCard}
          onPress={() => router.push('/health/add-weight' as never)}
        >
          <Ionicons name="scale-outline" size={20} color={colors.muted} />
          <View style={{ flex: 1 }}>
            <Text style={styles.emptyTitle}>No weight entries</Text>
            <Text style={styles.emptyCopy}>Track {petName}'s weight over time to spot trends early.</Text>
          </View>
          <Ionicons name="arrow-forward" size={15} color={colors.brand} />
        </Pressable>
      ) : (
        <View style={styles.chartCard}>
          <View style={styles.recordMain}>
            <View style={[styles.recordIcon, { backgroundColor: '#EBF6FF' }]}>
              <Ionicons name="scale" size={17} color="#2D8EC8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recordTitle}>
                {weights[0].value} {weights[0].unit}
              </Text>
              <Text style={styles.recordMeta}>Last measured {weights[0].measuredOn}</Text>
              {(() => {
                const trend = weightTrend(weights);
                return trend ? <Text style={[styles.recordMeta, { color: '#2D8EC8', fontWeight: '800' }]}>{trend}</Text> : null;
              })()}
              <Text style={styles.recordMeta}>{weights.length} entr{weights.length === 1 ? 'y' : 'ies'} total</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/health/timeline' as never)}
              style={[styles.badge, { backgroundColor: '#EBF6FF' }]}
            >
              <Text style={[styles.badgeText, { color: '#2D8EC8' }]}>View all →</Text>
            </Pressable>
          </View>
          
          {Platform.OS !== 'web' && weightData.length > 1 && (
            <View style={{ marginTop: space.xl, alignItems: 'center', marginHorizontal: -10 }}>
              <LineChart
                data={weightData}
                width={280}
                height={120}
                thickness={3}
                color="#2D8EC8"
                hideDataPoints
                hideRules
                hideYAxisText
                xAxisColor={colors.line}
                yAxisColor={colors.line}
                rulesType="solid"
                rulesColor={colors.line}
                xAxisLabelTextStyle={{ color: colors.muted, fontSize: 10, fontWeight: '700' }}
                curved
                animateOnDataChange
                animationDuration={1000}
                isAnimated
              />
            </View>
          )}
        </View>
      )}

      {/* Timeline shortcut */}
      <Pressable
        accessibilityRole="button"
        style={styles.timelineLink}
        onPress={() => router.push('/health/timeline' as never)}
      >
        <Ionicons name="time-outline" size={16} color={colors.brand} />
        <Text style={styles.timelineLinkText}>View full health timeline</Text>
        <Ionicons name="arrow-forward" size={14} color={colors.brand} />
      </Pressable>

      {/* ── Documents ────────────────────────────────── */}
      <View style={[styles.sectionHeader, { marginTop: space.sm }]}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="document-text" size={15} color="#7C5CBF" />
          <Text style={styles.sectionTitle}>DOCUMENTS</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/health/documents' as never)}
        >
          <Text style={styles.addLink}>View all</Text>
        </Pressable>
      </View>

      <View style={styles.docsBanner}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View documents"
          style={styles.docsContent}
          onPress={() => router.push('/health/documents' as never)}
        >
          <View style={[styles.recordIcon, { backgroundColor: '#F3EEFF' }]}>
            <Ionicons name="document-text" size={17} color="#7C5CBF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.recordTitle}>
              {documents.length === 0
                ? 'No documents uploaded'
                : `${documents.length} document${documents.length !== 1 ? 's' : ''}`}
            </Text>
            <Text style={styles.recordMeta}>
              {documents.length === 0
                ? `Upload vaccination cards, prescriptions and lab reports for ${petName}.`
                : 'Tap to view, or upload another document.'}
            </Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.addBtn}
          onPress={() => router.push('/health/upload-document' as never)}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* ── Share + Reminders + Observations ─────────────────────── */}
      <View style={styles.actionGrid}>
        <Pressable
          accessibilityRole="button"
          style={styles.actionCard}
          onPress={() => router.push('/sharing/share-qr' as never)}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.mist }]}>
            <Ionicons name="qr-code" size={20} color={colors.brand} />
          </View>
          <Text style={styles.actionTitle}>Share with vet</Text>
          <Text style={styles.actionSub}>Generate a secure QR code</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.actionCard}
          onPress={() => router.push('/reminders/reminders' as never)}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#EBF6FF' }]}>
            <Ionicons name="notifications" size={20} color="#2D8EC8" />
          </View>
          <Text style={styles.actionTitle}>Reminders</Text>
          <Text style={styles.actionSub}>Care schedule and alerts</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.actionCard}
          onPress={() => router.push('/health/add-observation' as never)}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#F3EEFF' }]}>
            <Ionicons name="medical" size={20} color="#7C5CBF" />
          </View>
          <Text style={styles.actionTitle}>Observation</Text>
          <Text style={styles.actionSub}>Log a symptom or note</Text>
        </Pressable>
      </View>
    </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingBottom: space.xxl, gap: space.md },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: space.lg, paddingTop: space.md },
  eyebrow: { color: colors.brand, fontWeight: '900', fontSize: 10, letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 32, lineHeight: 36, fontWeight: '900', letterSpacing: -1, marginTop: 4 },
  sub: { color: colors.muted, fontSize: 14, marginTop: 4 },
  addBtns: { flexDirection: 'row', gap: 8, marginTop: 4 },
  addBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center', shadowColor: colors.brandDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.sm, paddingHorizontal: space.lg },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  addLink: { color: colors.brand, fontSize: 13, fontWeight: '900' },
  
  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: space.lg, borderWidth: 1, borderColor: colors.line },
  emptyTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  emptyCopy: { color: colors.muted, fontSize: 13, marginTop: 4, lineHeight: 18 },
  
  recordCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 18, shadowColor: colors.ink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, marginHorizontal: space.lg },
  chartCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 18, shadowColor: colors.ink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, marginHorizontal: space.lg },
  recordMain: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  recordIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.mist, alignItems: 'center', justifyContent: 'center' },
  recordTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  recordMeta: { color: colors.muted, fontSize: 13, marginTop: 3 },
  recordDue: { color: colors.accent, fontSize: 13, fontWeight: '800', marginTop: 3 },
  
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.4 },
  
  comingSoon: { backgroundColor: colors.brand, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
  comingSoonText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  
  timelineLink: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingVertical: 14, backgroundColor: colors.mist, borderRadius: radius.xl, marginHorizontal: space.lg, marginTop: space.sm },
  timelineLinkText: { color: colors.brand, fontSize: 14, fontWeight: '900' },
  
  docsBanner: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.line, marginHorizontal: space.lg },
  docsContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  
  actionGrid: { flexDirection: 'row', gap: 12, marginHorizontal: space.lg },
  actionCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, gap: 10, borderWidth: 1, borderColor: colors.line, alignItems: 'flex-start', shadowColor: colors.ink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8 },
  actionIcon: { width: 48, height: 48, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  actionSub: { color: colors.muted, fontSize: 12, lineHeight: 16 },
});
