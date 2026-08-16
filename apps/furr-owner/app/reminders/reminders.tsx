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
} from '@furr/firebase/src/reminders';
import { colors, radius, space, Button } from '@furr/ui';
import { Screen } from '@/src/components/screen';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';

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
      await completeReminder(firebaseUser.uid, selectedPet.id, rem.id, rem.notificationId);
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
            await skipReminder(firebaseUser.uid, selectedPet.id, rem.id, undefined, rem.notificationId);
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
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Pending */}
      {pending.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="calendar-clear" size={48} color={colors.brandSoft} />
          </View>
          <Text style={styles.emptyTitle}>No reminders</Text>
          <Text style={styles.emptyCopy}>Your pet's schedule is completely clear right now.</Text>
          <View style={{marginTop: space.lg}}>
            <Button 
              label="Add Reminder" 
              variant="secondary" 
              onPress={() => router.push('/reminders/add-reminder' as never)} 
            />
          </View>
        </View>
      ) : (
        <View style={styles.list}>
          {pending.map((rem) => {
            const overdue = isOverdue(rem.scheduledAt, rem.status);
            const icon = TYPE_ICONS[rem.type] ?? 'notifications';
            const iconColor = TYPE_COLORS[rem.type] ?? colors.brand;
            const isActing = acting === rem.id;

            return (
              <View key={rem.id} style={[styles.remCard, overdue && styles.remCardOverdue]}>
                <View style={styles.remCardHeader}>
                  <View style={[styles.remIcon, { backgroundColor: `${iconColor}18` }]}>
                    <Ionicons name={icon as never} size={20} color={iconColor} />
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
                  </View>
                </View>

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
                    style={[styles.actionBtn, styles.actionSecondary]}
                    onPress={() => handleSkip(rem)}
                    disabled={isActing}
                  >
                    <Text style={styles.actionText}>Skip</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    style={[styles.actionBtn, styles.actionSecondary]}
                    onPress={() => handleCancel(rem)}
                    disabled={isActing}
                  >
                    <Text style={[styles.actionText, { color: colors.danger }]}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Done */}
      {done.length > 0 && (
        <View style={styles.historySection}>
          <View style={styles.historyDivider}>
            <Text style={styles.divLabel}>PAST REMINDERS</Text>
          </View>
          {done.slice(0, 5).map((rem) => (
            <View key={rem.id} style={[styles.remCardDoneRow]}>
              <View style={[styles.remIconDone, { backgroundColor: colors.pearl }]}>
                <Ionicons
                  name={rem.status === 'completed' ? 'checkmark-circle' : rem.status === 'skipped' ? 'remove-circle' : 'close-circle'}
                  size={16}
                  color={rem.status === 'completed' ? colors.success : colors.muted}
                />
              </View>
              <View style={styles.remBody}>
                <Text style={[styles.remTitle, styles.remTitleDone]}>{rem.title}</Text>
                <Text style={styles.remDateDone}>{formatDateTime(rem.scheduledAt)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 48 }} />
    </Screen>
  );
}

// ── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.canvas },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { color: colors.brand, fontWeight: '900', fontSize: 10, letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 32, lineHeight: 36, fontWeight: '900', letterSpacing: -1, marginTop: 4 },
  sub: { color: colors.muted, fontSize: 14, marginTop: 4 },
  
  addBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center', shadowColor: colors.brand, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: {width: 0, height: 4}, elevation: 4 },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, paddingHorizontal: space.lg },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: space.md },
  emptyTitle: { color: colors.ink, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptyCopy: { color: colors.muted, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  
  list: { marginTop: space.lg, gap: space.md },
  remCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: space.md, shadowColor: colors.ink, shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: {width: 0, height: 4}, elevation: 2 },
  remCardOverdue: { borderWidth: 1, borderColor: colors.danger, backgroundColor: '#FFFDFD' },
  
  remCardHeader: { flexDirection: 'row', gap: space.md },
  remIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  remBody: { flex: 1, gap: 4, justifyContent: 'center' },
  remTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  remTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  remBodyText: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  remDate: { color: colors.ink, fontSize: 13, fontWeight: '600', marginTop: 2 },
  remDateOverdue: { color: colors.danger, fontWeight: '800' },
  
  overdueBadge: { backgroundColor: '#FFE5E5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
  overdueBadgeText: { color: colors.danger, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  
  remActions: { flexDirection: 'row', gap: space.sm, marginTop: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.line },
  actionBtn: { flex: 1, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  actionDone: { backgroundColor: colors.brand },
  actionDoneText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  actionSecondary: { backgroundColor: colors.pearl },
  actionText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  
  historySection: { marginTop: space.xxl },
  historyDivider: { marginBottom: space.sm },
  divLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  
  remCardDoneRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  remIconDone: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  remTitleDone: { color: colors.ink, fontWeight: '600', fontSize: 15 },
  remDateDone: { color: colors.muted, fontSize: 13 },
});
