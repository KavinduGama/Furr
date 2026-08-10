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
import type { AccessGrant } from '@furr/core';
import { SHARE_CATEGORIES } from '@furr/core';
import { subscribeToGrants, revokeGrant } from '@furr/firebase';
import { colors, radius, space } from '@furr/ui';
import { Screen } from '@/src/components/screen';
import { useAuth } from '@/src/context/auth';

// ─────────────────────────────────────────────────────────────
//  Manage Access screen  (SHR-002)
// ─────────────────────────────────────────────────────────────

function statusColor(status: AccessGrant['status']): { text: string; bg: string } {
  switch (status) {
    case 'active': return { text: colors.success, bg: '#EEFAF5' };
    case 'redeemed': return { text: colors.brand, bg: colors.mist };
    case 'expired': return { text: colors.muted, bg: colors.pearl };
    case 'revoked': return { text: colors.danger, bg: '#FFF0F0' };
  }
}

function statusLabel(status: AccessGrant['status']): string {
  switch (status) {
    case 'active': return 'Active';
    case 'redeemed': return 'Redeemed';
    case 'expired': return 'Expired';
    case 'revoked': return 'Revoked';
  }
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-LK', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso.slice(0, 16).replace('T', ' ');
  }
}

export default function ManageAccessScreen() {
  const { firebaseUser } = useAuth();
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    const unsub = subscribeToGrants(firebaseUser.uid, (gs) => {
      setGrants(gs);
      setLoading(false);
    });
    return unsub;
  }, [firebaseUser]);

  const handleRevoke = (grant: AccessGrant) => {
    Alert.alert(
      'Revoke access?',
      `This will immediately remove the vet's access to ${grant.categories.length} record categor${grant.categories.length === 1 ? 'y' : 'ies'}. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            if (!firebaseUser) return;
            setRevoking(grant.id);
            try {
              await revokeGrant(firebaseUser.uid, grant.id);
            } catch {
              Alert.alert('Something went wrong', 'Couldn\'t revoke access. Please try again.');
            } finally {
              setRevoking(null);
            }
          },
        },
      ],
    );
  };

  const active = grants.filter((g) => g.status === 'active' || g.status === 'redeemed');
  const historical = grants.filter((g) => g.status === 'expired' || g.status === 'revoked');

  if (loading) {
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
          <Text style={styles.eyebrow}>ACCESS CONTROL</Text>
          <Text style={styles.title}>Active grants</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          style={styles.newBtn}
          onPress={() => router.push('/sharing/share-qr' as never)}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.newBtnText}>New</Text>
        </Pressable>
      </View>

      {/* Active / redeemed grants */}
      {active.length === 0 ? (
        <Pressable
          accessibilityRole="button"
          style={styles.emptyCard}
          onPress={() => router.push('/sharing/share-qr' as never)}
        >
          <Ionicons name="share-social-outline" size={22} color={colors.muted} />
          <View style={{ flex: 1 }}>
            <Text style={styles.emptyTitle}>No active grants</Text>
            <Text style={styles.emptyCopy}>Generate a QR code to share records with your vet securely.</Text>
          </View>
          <Ionicons name="arrow-forward" size={15} color={colors.brand} />
        </Pressable>
      ) : (
        active.map((grant) => {
          const { text, bg } = statusColor(grant.status);
          const isRevoking = revoking === grant.id;
          return (
            <View key={grant.id} style={styles.grantCard}>
              <View style={styles.grantTop}>
                <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                  <Text style={[styles.statusText, { color: text }]}>{statusLabel(grant.status)}</Text>
                </View>
                <Text style={styles.grantTime}>{formatDateTime(grant.createdAt)}</Text>
              </View>

              {grant.redeemedByName && (
                <Text style={styles.grantVet}>
                  <Ionicons name="person" size={11} color={colors.muted} /> {grant.redeemedByName}
                  {grant.redeemedByClinic ? ` · ${grant.redeemedByClinic}` : ''}
                </Text>
              )}

              <View style={styles.catRow}>
                {grant.categories.slice(0, 4).map((c) => (
                  <View key={c} style={styles.catChip}>
                    <Text style={styles.catChipText}>{SHARE_CATEGORIES.find((s) => s.key === c)?.label}</Text>
                  </View>
                ))}
                {grant.categories.length > 4 && (
                  <View style={styles.catChip}>
                    <Text style={styles.catChipText}>+{grant.categories.length - 4}</Text>
                  </View>
                )}
              </View>

              <View style={styles.grantMeta}>
                <Text style={styles.grantMetaText}>Duration: {grant.duration === '24h' ? '24 hours' : '7 days'}</Text>
                {grant.grantExpiresAt && (
                  <Text style={styles.grantMetaText}>Expires: {formatDateTime(grant.grantExpiresAt)}</Text>
                )}
              </View>

              {grant.status === 'active' && (
                <Pressable
                  accessibilityRole="button"
                  style={styles.revokeBtn}
                  onPress={() => handleRevoke(grant)}
                  disabled={isRevoking}
                >
                  {isRevoking
                    ? <ActivityIndicator size="small" color={colors.danger} />
                    : <Text style={styles.revokeBtnText}>Revoke access</Text>}
                </Pressable>
              )}
            </View>
          );
        })
      )}

      {/* Historical */}
      {historical.length > 0 && (
        <>
          <View style={styles.historyDivider}>
            <View style={styles.historyLine} />
            <Text style={styles.historyLabel}>HISTORY</Text>
            <View style={styles.historyLine} />
          </View>

          {historical.map((grant) => {
            const { text, bg } = statusColor(grant.status);
            return (
              <View key={grant.id} style={[styles.grantCard, styles.grantCardFaded]}>
                <View style={styles.grantTop}>
                  <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                    <Text style={[styles.statusText, { color: text }]}>{statusLabel(grant.status)}</Text>
                  </View>
                  <Text style={styles.grantTime}>{formatDateTime(grant.createdAt)}</Text>
                </View>
                <View style={styles.catRow}>
                  {grant.categories.slice(0, 3).map((c) => (
                    <View key={c} style={[styles.catChip, styles.catChipFaded]}>
                      <Text style={[styles.catChipText, { color: colors.muted }]}>
                        {SHARE_CATEGORIES.find((s) => s.key === c)?.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
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
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.brand, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill },
  newBtnText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1, borderColor: colors.line },
  emptyTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  emptyCopy: { color: colors.muted, fontSize: 12, marginTop: 3, lineHeight: 16 },
  grantCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, gap: 10, borderWidth: 1, borderColor: colors.line },
  grantCardFaded: { opacity: 0.7 },
  grantTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill },
  statusText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.3 },
  grantTime: { color: colors.muted, fontSize: 11 },
  grantVet: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catChip: { backgroundColor: colors.mist, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  catChipFaded: { backgroundColor: colors.pearl },
  catChipText: { color: colors.brand, fontSize: 10, fontWeight: '800' },
  grantMeta: { gap: 2 },
  grantMetaText: { color: colors.muted, fontSize: 11 },
  revokeBtn: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, alignItems: 'center' },
  revokeBtnText: { color: colors.danger, fontSize: 13, fontWeight: '900' },
  historyDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  historyLine: { flex: 1, height: 1, backgroundColor: colors.line },
  historyLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
});
