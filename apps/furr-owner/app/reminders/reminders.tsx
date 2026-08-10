import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import type { Reminder } from '@furr/core';
import {
  subscribeToReminders,
  completeReminder,
  skipReminder,
  cancelReminder,
} from '@furr/firebase';
import { colors, radius, space } from '@furr/ui';
import { Screen } from '@/src/components/screen';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';

// ─────────────────────────────────────────────────────────────
//  Reminders screen  (REM-001/002)
// ─────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, string> = {
  vaccination_due: 'shield-checkmark',
  medication_dose: 'medical',
  follow_up: 'calendar',
  manual: 'notifications',
};

const TYPE_COLORS: Record<string, string> = {
  vaccination_due: colors.brand,
  medication_dose: colors.accent,
  follow_up: '#7C5CBF',
  manual: '#2D8EC8',
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-LK', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso.slice(0, 16).replace('T', ' ');
  }
}

function isOverdue(scheduledAt: string, status: Reminder['status']): boolean {
  return status === 'scheduled' && new Date(scheduledAt) < new Date();
}

export default function RemindersScreen() {
  const { firebaseUser } = useAuth();
  const { selectedPet } = usePets();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser || !selectedPet) return;
    const unsub = subscribeToReminders(firebaseUser.uid, selectedPet.id, (rems) => {
      setReminders(rems);
      setLoading(false);
    });
    return unsub;
  }, [firebaseUser, selectedPet]);

  const handleComplete = async (rem: Reminder) => {
    if (!firebaseUser || !selectedPet) return;
    setActing(rem.id);
    try {
      await completeReminder(firebaseUser.uid, selectedPet.id, rem.id);
      setReminders((prev) => prev.map((r) => r.id === rem.id ? { ...r, status: 'completed' as const } : r));
    } finally { setActing(null); }
  };

  const handleSkip = async (rem: Reminder) => {
    if (!firebaseUser || !selectedPet) return;
    Alert.alert('Skip this reminder?', 'Mark as skipped for this occurrence.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Skip', onPress: async () => {
          setActing(rem.id);
          try {
            await skipReminder(firebaseUser.uid, selectedPet.id, rem.id);
            setReminders((prev) => prev.map((r) => r.id === rem.id ? { ...r, status: 'skipped' as const } : r));
          } finally { setActing(null); }
        },
      },
    ]);
  };

  const handleCancel = async (rem: Reminder) => {
    if (!firebaseUser || !selectedPet) return;
    Alert.alert('Cancel reminder?', 'This will remove the scheduled notification.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel reminder', style: 'destructive', onPress: async () => {
          setActing(rem.id);
          try {
            await cancelReminder(firebaseUser.uid, selectedPet.id, rem.id, rem.notificationId);
            setReminders((prev) => prev.map((r) => r.id === rem.id ? { ...r, status: 'cancelled' as const } : r));
          } finally { setActing(null); }
        },
      },
    ]);
  };

  const pending = reminders.filter((r) => r.status === 'scheduled' || r.status === 'due');
  const done = reminders.filter((r) => ['completed', 'skipped', 'cancelled'].includes(r.status));

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingBox}><ActivityIndicator color={colors.brand} size="large" /></View>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>CARE SCHEDULE</Text>
          <Text style={styles.title}>Reminders</Text>
          {selectedPet && <Text style={styles.sub}>{selectedPet.name} · {pending.length} pending</Text>}
        </View>
        <Pressable
          accessibilityRole="button"
          style={styles.addBtn}
          onPress={() => router.push('/reminders/add-reminder' as never)}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* Pending */}
      {pending.length === 0 ? (
        <Pressable
          accessibilityRole="button"
          style={styles.emptyCard}
          onPress={() => router.push('/reminders/add-reminder' as never)}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.muted} />
          <View style={{ flex: 1 }}>
            <Text style={styles.emptyTitle}>No pending reminders</Text>
            <Text style={styles.emptyCopy}>Add a vaccination due date or custom care reminder.</Text>
          </View>
          <Ionicons name="arrow-forward" size={15} color={colors.brand} />
        </Pressable>
      ) : (
        pending.map((rem) => {
          const overdue = isOverdue(rem.scheduledAt, rem.status);
          const icon = TYPE_ICONS[rem.type] ?? 'notifications';
          const iconColor = TYPE_COLORS[rem.type] ?? colors.brand;
          const isActing = acting === rem.id;

          return (
            <View key={rem.id} style={[styles.remCard, overdue && styles.remCardOverdue]}>
              <View style={[styles.remIcon, { backgroundColor: `${iconColor}18` }]}>
                <Ionicons name={icon as never} size={18} color={iconColor} />
              </View>
              <View style={styles.remBody}>
                <View style={styles.remTitleRow}>
                  <Text style={styles.remTitle}>{rem.title}</Text>
                  {overdue && (
                    <View style={styles.overdueBadge}>
                      <Text style={styles.overdueBadgeText}>OVERDUE</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.remBodyText}>{rem.body}</Text>
                <Text style={[styles.remDate, overdue && styles.remDateOverdue]}>
                  {formatDateTime(rem.scheduledAt)}
                </Text>

                {/* Actions */}
                <View style={styles.remActions}>
                  <Pressable
                    accessibilityRole="button"
                    style={[styles.actionBtn, styles.actionDone]}
                    onPress={() => handleComplete(rem)}
                    disabled={isActing}
                  >
                    {isActing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.actionDoneText}>✓ Done</Text>}
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    style={styles.actionBtn}
                    onPress={() => handleSkip(rem)}
                    disabled={isActing}
                  >
                    <Text style={styles.actionText}>Skip</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    style={styles.actionBtn}
                    onPress={() => handleCancel(rem)}
                    disabled={isActing}
                  >
                    <Text style={[styles.actionText, { color: colors.danger }]}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })
      )}

      {/* Done */}
      {done.length > 0 && (
        <>
          <View style={styles.historyDivider}>
            <View style={styles.divLine} />
            <Text style={styles.divLabel}>COMPLETED</Text>
            <View style={styles.divLine} />
          </View>
          {done.slice(0, 5).map((rem) => (
            <View key={rem.id} style={[styles.remCard, styles.remCardDone]}>
              <View style={[styles.remIcon, { backgroundColor: colors.pearl }]}>
                <Ionicons
                  name={rem.status === 'completed' ? 'checkmark-circle' : rem.status === 'skipped' ? 'remove-circle' : 'close-circle'}
                  size={18}
                  color={rem.status === 'completed' ? colors.success : colors.muted}
                />
              </View>
              <View style={styles.remBody}>
                <Text style={[styles.remTitle, styles.remTitleDone]}>{rem.title}</Text>
                <Text style={styles.remDate}>{formatDateTime(rem.scheduledAt)}</Text>
                <Text style={styles.remStatusLabel}>{rem.status.charAt(0).toUpperCase() + rem.status.slice(1)}</Text>
              </View>
            </View>
          ))}
        </>
      )}

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
  addBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1, borderColor: colors.line },
  emptyTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  emptyCopy: { color: colors.muted, fontSize: 12, marginTop: 3, lineHeight: 16 },
  remCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 13, flexDirection: 'row', gap: 11, borderWidth: 1, borderColor: colors.line },
  remCardOverdue: { borderColor: colors.danger, backgroundColor: '#FFF8F8' },
  remCardDone: { opacity: 0.7 },
  remIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  remBody: { flex: 1, gap: 4 },
  remTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  remTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  remTitleDone: { color: colors.muted },
  remBodyText: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  remDate: { color: colors.muted, fontSize: 11 },
  remDateOverdue: { color: colors.danger, fontWeight: '800' },
  remStatusLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  overdueBadge: { backgroundColor: '#FFE5E5', paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.pill },
  overdueBadgeText: { color: colors.danger, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  remActions: { flexDirection: 'row', gap: 8, marginTop: 6 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  actionDone: { backgroundColor: colors.success, borderColor: colors.success },
  actionDoneText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  actionText: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  historyDivider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: colors.line },
  divLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
});
