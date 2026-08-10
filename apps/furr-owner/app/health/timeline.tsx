import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { buildTimeline, type TimelineFilter, type TimelineItem, DOC_TYPE_LABELS } from '@furr/core';
import { colors, radius, space } from '@furr/ui';
import { Screen } from '@/src/components/screen';
import { usePets } from '@/src/context/pets';
import { useHealth } from '@/src/context/health';

// ─────────────────────────────────────────────────────────────
//  Health Timeline screen  (HLT-004)
// ─────────────────────────────────────────────────────────────

const FILTER_OPTIONS: { key: TimelineFilter; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'vaccinations', label: 'Vaccines', icon: 'shield-checkmark' },
  { key: 'medications', label: 'Meds', icon: 'medical' },
  { key: 'weight', label: 'Weight', icon: 'scale' },
  { key: 'documents', label: 'Docs', icon: 'document-text' },
  { key: 'observations', label: 'Notes', icon: 'eye' },
];

function provenanceBadge(prov: string) {
  if (prov === 'VET_VERIFIED' || prov === 'VET_AUTHORED')
    return { label: 'Vet verified', color: colors.success };
  if (prov === 'OWNER_ENTERED_WITH_DOCUMENT')
    return { label: 'With doc', color: '#B8870F' };
  return { label: 'Owner', color: colors.muted };
}

function TimelineRow({ item }: { item: TimelineItem }) {
  switch (item.kind) {
    case 'vaccination': {
      const r = item.record;
      const badge = provenanceBadge(r.provenance);
      const name = r.vaccineType === 'Other' ? (r.customVaccineName ?? 'Vaccine') : r.vaccineType;
      return (
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: colors.mist }]}>
            <Ionicons name="shield-checkmark" size={17} color={colors.brand} />
          </View>
          <View style={styles.rowBody}>
            <View style={styles.rowTitleRow}>
              <Text style={styles.rowTitle}>{name}</Text>
              <View style={[styles.badge, { backgroundColor: `${badge.color}18` }]}>
                <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
              </View>
            </View>
            <Text style={styles.rowMeta}>{r.administeredOn}</Text>
            {r.nextDueOn && <Text style={styles.rowDue}>Next due {r.nextDueOn}</Text>}
            {r.veterinarian && <Text style={styles.rowMeta}>{r.veterinarian}</Text>}
          </View>
        </View>
      );
    }
    case 'medication': {
      const m = item.plan;
      return (
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: colors.warm }]}>
            <Ionicons name="medical" size={17} color={colors.accent} />
          </View>
          <View style={styles.rowBody}>
            <View style={styles.rowTitleRow}>
              <Text style={styles.rowTitle}>{m.medicationName}</Text>
              <View style={[styles.badge, { backgroundColor: `${colors.success}18` }]}>
                <Text style={[styles.badgeText, { color: colors.success }]}>Active</Text>
              </View>
            </View>
            <Text style={styles.rowMeta}>{m.doseInstruction}</Text>
            <Text style={styles.rowMeta}>Started {m.startAt.slice(0, 10)}</Text>
          </View>
        </View>
      );
    }
    case 'weight': {
      const w = item.entry;
      return (
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: '#F0FAFF' }]}>
            <Ionicons name="scale" size={17} color="#2D8EC8" />
          </View>
          <View style={styles.rowBody}>
            <View style={styles.rowTitleRow}>
              <Text style={styles.rowTitle}>{w.value} {w.unit}</Text>
              <View style={[styles.badge, { backgroundColor: '#EBF6FF' }]}>
                <Text style={[styles.badgeText, { color: '#2D8EC8' }]}>Weight</Text>
              </View>
            </View>
            <Text style={styles.rowMeta}>{w.measuredOn}</Text>
            {w.note && <Text style={styles.rowMeta}>{w.note}</Text>}
          </View>
        </View>
      );
    }
    case 'observation': {
      const o = item.observation;
      return (
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: colors.pearl }]}>
            <Ionicons name="eye" size={17} color={colors.muted} />
          </View>
          <View style={styles.rowBody}>
            <View style={styles.rowTitleRow}>
              <Text style={styles.rowTitle}>{o.category.replace('_', '/')}</Text>
              {o.severity && (
                <View style={[styles.badge, { backgroundColor: '#FFF3E0' }]}>
                  <Text style={[styles.badgeText, { color: '#E65100' }]}>{o.severity}</Text>
                </View>
              )}
            </View>
            <Text style={styles.rowMeta}>{o.description}</Text>
            <Text style={styles.rowMeta}>{o.observedOn}</Text>
          </View>
        </View>
      );
    }
    case 'document': {
      const d = item.document;
      const label = DOC_TYPE_LABELS[d.docType];
      return (
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: '#F3EEFF' }]}>
            <Ionicons name={d.mimeType === 'application/pdf' ? 'document-text' : 'image'} size={17} color="#7C5CBF" />
          </View>
          <View style={styles.rowBody}>
            <View style={styles.rowTitleRow}>
              <Text style={styles.rowTitle} numberOfLines={1}>{d.originalFileName}</Text>
              <View style={[styles.badge, { backgroundColor: '#F3EEFF' }]}>
                <Text style={[styles.badgeText, { color: '#7C5CBF' }]}>{label}</Text>
              </View>
            </View>
            <Text style={styles.rowMeta}>{d.createdAt.slice(0, 10)}</Text>
            {d.notes && <Text style={styles.rowMeta}>{d.notes}</Text>}
          </View>
        </View>
      );
    }
  }
}

export default function TimelineScreen() {
  const { selectedPet } = usePets();
  const { vaccinations, medications, weights, documents, observations, isLoading } = useHealth();
  const [filter, setFilter] = useState<TimelineFilter>('all');

  const allItems = buildTimeline(vaccinations, medications, weights, observations, documents);

  const filtered: TimelineItem[] = filter === 'all' ? allItems : allItems.filter((item) => {
    if (filter === 'vaccinations') return item.kind === 'vaccination';
    if (filter === 'medications') return item.kind === 'medication';
    if (filter === 'weight') return item.kind === 'weight';
    if (filter === 'documents') return item.kind === 'document';
    if (filter === 'observations') return item.kind === 'observation';
    return true;
  });

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.brand} size="large" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>HEALTH HISTORY</Text>
          <Text style={styles.title}>Timeline</Text>
          {selectedPet && <Text style={styles.sub}>{selectedPet.name} · {allItems.length} record{allItems.length !== 1 ? 's' : ''}</Text>}
        </View>
        {/* Add weight shortcut */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log weight"
          style={styles.addWeightBtn}
          onPress={() => router.push('/health/add-weight' as never)}
        >
          <Ionicons name="scale" size={16} color={colors.brand} />
        </Pressable>
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBar}
      >
        {FILTER_OPTIONS.map((f) => (
          <Pressable
            key={f.key}
            accessibilityRole="radio"
            accessibilityState={{ selected: filter === f.key }}
            style={[styles.filterPill, filter === f.key && styles.filterPillSelected]}
            onPress={() => setFilter(f.key)}
          >
            <Ionicons
              name={f.icon as never}
              size={13}
              color={filter === f.key ? '#fff' : colors.muted}
            />
            <Text style={[styles.filterText, filter === f.key && styles.filterTextSelected]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Empty state */}
      {filtered.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="document-text-outline" size={36} color={colors.muted} />
          <Text style={styles.emptyTitle}>
            {filter === 'all' ? 'No records yet' : `No ${filter} yet`}
          </Text>
          <Text style={styles.emptyCopy}>
            {filter === 'all'
              ? 'Add a vaccination, medication, or weight entry to start building the health record.'
              : `Tap the Care Centre tab to add ${filter}.`}
          </Text>
          {filter === 'all' && (
            <View style={styles.emptyActions}>
              <Pressable
                accessibilityRole="button"
                style={styles.emptyAction}
                onPress={() => router.push('/health/add-vaccination' as never)}
              >
                <Ionicons name="shield-checkmark" size={15} color={colors.brand} />
                <Text style={styles.emptyActionText}>Vaccination</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={styles.emptyAction}
                onPress={() => router.push('/health/add-medication' as never)}
              >
                <Ionicons name="medical" size={15} color={colors.accent} />
                <Text style={styles.emptyActionText}>Medication</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={styles.emptyAction}
                onPress={() => router.push('/health/add-weight' as never)}
              >
                <Ionicons name="scale" size={15} color="#2D8EC8" />
                <Text style={styles.emptyActionText}>Weight</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {/* Timeline list */}
      {filtered.map((item, idx) => {
        const key = item.kind === 'vaccination' ? item.record.id
          : item.kind === 'medication' ? item.plan.id
          : item.kind === 'weight' ? item.entry.id
          : item.kind === 'document' ? item.document.id
          : item.observation.id;

        // Date divider
        const prevDate = idx > 0 ? filtered[idx - 1].date : null;
        const showDate = prevDate !== item.date;

        return (
          <View key={key}>
            {showDate && (
              <View style={styles.dateDivider}>
                <View style={styles.dateLine} />
                <Text style={styles.dateLabel}>{item.date}</Text>
                <View style={styles.dateLine} />
              </View>
            )}
            <TimelineRow item={item} />
          </View>
        );
      })}

      <View style={{ height: 24 }} />
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
  addWeightBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: colors.brand, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mist },

  filterBar: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  filterPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  filterPillSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  filterText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  filterTextSelected: { color: '#fff' },

  empty: { alignItems: 'center', gap: 10, paddingVertical: 32 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  emptyCopy: { color: colors.muted, fontSize: 13, lineHeight: 18, textAlign: 'center', maxWidth: 270 },
  emptyActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  emptyAction: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line },
  emptyActionText: { color: colors.ink, fontSize: 13, fontWeight: '800' },

  dateDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  dateLine: { flex: 1, height: 1, backgroundColor: colors.line },
  dateLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },

  row: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 11, borderWidth: 1, borderColor: colors.line },
  iconWrap: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, gap: 2 },
  rowTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  rowTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  rowMeta: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  rowDue: { color: colors.accent, fontSize: 12, fontWeight: '800' },
  badge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.pill },
  badgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },
});
