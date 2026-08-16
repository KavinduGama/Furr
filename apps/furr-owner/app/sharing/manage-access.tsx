import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import type { AccessGrant } from '@furr/core';
import { SHARE_CATEGORIES } from '@furr/core';
import { subscribeToGrants, revokeGrant } from '@furr/firebase';
import { colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';

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
      <View style={styles.screen}>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.brand} size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>ACCESS CONTROL</Text>
            <Text style={styles.title}>Active grants</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.newBtn, pressed && { opacity: 0.8 }]}
            onPress={() => router.push('/sharing/share-qr' as never)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.newBtnText}>New</Text>
          </Pressable>
        </View>

        {/* Active / redeemed grants */}
        {active.length === 0 ? (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.emptyCard, pressed && { backgroundColor: colors.pearl }]}
            onPress={() => router.push('/sharing/share-qr' as never)}
          >
            <View style={styles.emptyIconWrap}>
              <Ionicons name="share-social" size={24} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.emptyTitle}>No active grants</Text>
              <Text style={styles.emptyCopy}>Generate a QR code to share records with your vet securely.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        ) : (
          <View style={styles.grantList}>
            {active.map((grant) => {
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
                      <Ionicons name="person" size={14} color={colors.muted} /> {grant.redeemedByName}
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
                      style={({ pressed }) => [styles.revokeBtn, pressed && { backgroundColor: '#FFF0F0' }]}
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
            })}
          </View>
        )}

        {/* Historical */}
        {historical.length > 0 && (
          <>
            <View style={styles.historyDivider}>
              <View style={styles.historyLine} />
              <Text style={styles.historyLabel}>HISTORY</Text>
              <View style={styles.historyLine} />
            </View>

            <View style={styles.grantList}>
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
            </View>
          </>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  content: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.xxl },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: space.lg },
  eyebrow: { color: colors.brand, fontWeight: '900', fontSize: 11, letterSpacing: 1.5 },
  title: { color: colors.ink, fontSize: 32, lineHeight: 36, fontWeight: '900', letterSpacing: -1, marginTop: 4 },
  
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.brand, paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.pill, shadowColor: colors.brandDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  newBtnText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  
  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: colors.line },
  emptyIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.mist, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  emptyCopy: { color: colors.muted, fontSize: 14, marginTop: 4, lineHeight: 20 },
  
  grantList: { gap: space.md },
  grantCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 18, gap: 12, shadowColor: colors.ink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  grantCardFaded: { opacity: 0.6, elevation: 0, shadowOpacity: 0, borderWidth: 1, borderColor: colors.line },
  
  grantTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  statusText: { fontSize: 12, fontWeight: '900', letterSpacing: 0.4 },
  grantTime: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  
  grantVet: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { backgroundColor: colors.mist, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.md },
  catChipFaded: { backgroundColor: colors.pearl },
  catChipText: { color: colors.brand, fontSize: 12, fontWeight: '800' },
  
  grantMeta: { gap: 4 },
  grantMetaText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  
  revokeBtn: { marginTop: space.sm, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 16, alignItems: 'center', borderRadius: radius.lg },
  revokeBtnText: { color: colors.danger, fontSize: 15, fontWeight: '900' },
  
  historyDivider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: space.xl, marginBottom: space.sm },
  historyLine: { flex: 1, height: 1, backgroundColor: colors.line },
  historyLabel: { color: colors.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
});
