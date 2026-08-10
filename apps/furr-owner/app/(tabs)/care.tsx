import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import type { VaccinationRecord, MedicationPlan, WeightEntry } from '@furr/core';
import { colors, radius, space } from '@furr/ui';
import { Screen } from '@/src/components/screen';
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
  const { selectedPet } = usePets();
  const { vaccinations, medications, weights, documents, isLoading } = useHealth();

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.brand} size="large" />
        </View>
      </Screen>
    );
  }

  const petName = selectedPet?.name ?? 'your pet';

  return (
    <Screen>
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
          <View key={med.id} style={styles.recordCard}>
            <View style={styles.recordMain}>
              <View style={[styles.recordIcon, { backgroundColor: colors.warm }]}>
                <Ionicons name="medical" size={17} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recordTitle}>{med.medicationName}</Text>
                <Text style={styles.recordMeta}>{med.doseInstruction}</Text>
                <Text style={styles.recordMeta}>{freqLabel(med)}</Text>
                {med.reason && <Text style={styles.recordMeta}>Reason: {med.reason}</Text>}
              </View>
              <View style={[styles.badge, { backgroundColor: '#EEFAF5' }]}>
                <Text style={[styles.badgeText, { color: colors.success }]}>Active</Text>
              </View>
            </View>
          </View>
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
        <View style={styles.recordCard}>
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

      <Pressable
        accessibilityRole="button"
        style={styles.docsBanner}
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
        <Pressable
          accessibilityRole="button"
          style={styles.addBtn}
          onPress={() => router.push('/health/upload-document' as never)}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </Pressable>
      </Pressable>

      {/* ── Share + Reminders ─────────────────────── */}
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
      </View>
    </Screen>
  );
}

// ── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { color: colors.brand, fontWeight: '900', fontSize: 10, letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 31, lineHeight: 35, fontWeight: '900', letterSpacing: -1.2, marginTop: 4 },
  sub: { color: colors.muted, fontSize: 12, marginTop: 4 },
  addBtns: { flexDirection: 'row', gap: 8, marginTop: 4 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  addLink: { color: colors.brand, fontSize: 12, fontWeight: '900' },
  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.line },
  emptyTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  emptyCopy: { color: colors.muted, fontSize: 12, marginTop: 2, lineHeight: 16 },
  recordCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.line },
  recordMain: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  recordIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.mist, alignItems: 'center', justifyContent: 'center' },
  recordTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  recordMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  recordDue: { color: colors.accent, fontSize: 12, fontWeight: '800', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  comingSoon: { backgroundColor: colors.brand, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
  comingSoonText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  timelineLink: { flexDirection: 'row', alignItems: 'center', gap: 7, justifyContent: 'center', paddingVertical: 10, backgroundColor: colors.mist, borderRadius: radius.md },
  timelineLinkText: { color: colors.brand, fontSize: 13, fontWeight: '900' },
  docsBanner: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderColor: colors.line },
  actionGrid: { flexDirection: 'row', gap: 10 },
  actionCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, gap: 7, borderWidth: 1, borderColor: colors.line, alignItems: 'flex-start' },
  actionIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  actionSub: { color: colors.muted, fontSize: 11, lineHeight: 15 },
});
