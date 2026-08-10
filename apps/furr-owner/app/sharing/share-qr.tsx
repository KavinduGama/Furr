import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SHARE_CATEGORIES, type ShareCategory, type GrantDuration, type AccessGrant } from '@furr/core';
import { createAccessGrant } from '@furr/firebase';
import { Button, colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';

// ─────────────────────────────────────────────────────────────
//  Share QR screen  (SHR-001)
//  Generates a time-limited access grant and displays a QR code
//  + alphanumeric code the vet can redeem.
// ─────────────────────────────────────────────────────────────

const DURATION_OPTIONS: { key: GrantDuration; label: string; sub: string }[] = [
  { key: '24h', label: '24 hours', sub: 'Emergency / single visit' },
  { key: '7d', label: '7 days', sub: 'Ongoing care this week' },
];

/** Countdown mm:ss from an ISO expiry string */
function useCountdown(expiresAt: string | null): string {
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      const m = Math.floor(diff / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setRemaining(`${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return remaining;
}

/** Simple SVG-free QR-like display: show code in big chunked text with a decorative border */
function CodeDisplay({ code }: { code: string }) {
  const parts = [code.slice(0, 3), code.slice(3, 6)];
  return (
    <View style={codeStyles.wrap} accessibilityLabel={`Share code: ${code.split('').join(' ')}`}>
      {/* Corner markers (QR style) */}
      <View style={[codeStyles.corner, codeStyles.tl]} />
      <View style={[codeStyles.corner, codeStyles.tr]} />
      <View style={[codeStyles.corner, codeStyles.bl]} />
      <View style={[codeStyles.corner, codeStyles.br]} />

      <Text style={codeStyles.label}>Share this code with your vet</Text>
      <View style={codeStyles.codeRow}>
        <Text style={codeStyles.code}>{parts[0]}</Text>
        <Text style={codeStyles.dash}> – </Text>
        <Text style={codeStyles.code}>{parts[1]}</Text>
      </View>
      <Text style={codeStyles.sub}>One-time use · valid for <Text style={codeStyles.bold}>15 minutes</Text></Text>
    </View>
  );
}

const codeStyles = StyleSheet.create({
  wrap: { backgroundColor: colors.surface, borderRadius: 20, padding: 28, alignItems: 'center', gap: 10, borderWidth: 2, borderColor: colors.brand, position: 'relative', marginVertical: 4 },
  corner: { position: 'absolute', width: 18, height: 18, borderColor: colors.brand },
  tl: { top: -1, left: -1, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 20 },
  tr: { top: -1, right: -1, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 20 },
  bl: { bottom: -1, left: -1, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 20 },
  br: { bottom: -1, right: -1, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 20 },
  label: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  codeRow: { flexDirection: 'row', alignItems: 'center' },
  code: { color: colors.ink, fontSize: 42, fontWeight: '900', letterSpacing: 6 },
  dash: { color: colors.muted, fontSize: 28, fontWeight: '300' },
  sub: { color: colors.muted, fontSize: 12 },
  bold: { fontWeight: '900', color: colors.brand },
});

// ─────────────────────────────────────────────────────────────

export default function ShareQrScreen() {
  const { firebaseUser } = useAuth();
  const { selectedPet } = usePets();

  // ── Step 1: configure
  const [categories, setCategories] = useState<ShareCategory[]>(['summary', 'vaccinations', 'medications']);
  const [duration, setDuration] = useState<GrantDuration>('24h');

  // ── Step 2: generated grant
  const [grant, setGrant] = useState<AccessGrant | null>(null);
  const [generating, setGenerating] = useState(false);
  const countdown = useCountdown(grant?.codeExpiresAt ?? null);
  const expired = grant ? new Date(grant.codeExpiresAt) < new Date() : false;

  const toggleCategory = (cat: ShareCategory) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handleGenerate = async () => {
    if (!firebaseUser || !selectedPet || categories.length === 0) return;
    setGenerating(true);
    try {
      const g = await createAccessGrant(firebaseUser.uid, selectedPet.id, categories, duration);
      setGrant(g);
    } catch {
      Alert.alert('Something went wrong', 'Couldn\'t create the share code. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => setGrant(null);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.cancel}>
          <Text style={styles.cancelText}>Close</Text>
        </Pressable>
        <Text style={styles.heading}>Share with vet</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/sharing/manage-access' as never)}
        >
          <Text style={styles.manageLink}>History</Text>
        </Pressable>
      </View>

      {/* Pet badge */}
      {selectedPet && (
        <View style={styles.petBadge}>
          <Ionicons name="paw" size={13} color={colors.brand} />
          <Text style={styles.petBadgeText}>Sharing {selectedPet.name}'s records</Text>
        </View>
      )}

      {!grant ? (
        <>
          {/* Privacy callout */}
          <View style={styles.privacyBox}>
            <Ionicons name="shield-checkmark" size={18} color={colors.brand} />
            <View style={{ flex: 1 }}>
              <Text style={styles.privacyTitle}>You control what's shared</Text>
              <Text style={styles.privacyCopy}>
                Only the categories you select below will be visible. The code expires in 15 minutes and can be used once.
              </Text>
            </View>
          </View>

          {/* Category selector */}
          <View style={styles.section}>
            <Text style={styles.label}>What to share</Text>
            {SHARE_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.key}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: categories.includes(cat.key) }}
                style={styles.catRow}
                onPress={() => toggleCategory(cat.key)}
              >
                <View style={styles.catText}>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                  <Text style={styles.catSub}>{cat.description}</Text>
                </View>
                <Switch
                  value={categories.includes(cat.key)}
                  onValueChange={() => toggleCategory(cat.key)}
                  trackColor={{ true: colors.brand, false: colors.line }}
                  thumbColor="#fff"
                  accessibilityLabel={cat.label}
                />
              </Pressable>
            ))}
          </View>

          {/* Duration */}
          <View style={styles.section}>
            <Text style={styles.label}>Access duration (after vet redeems)</Text>
            <View style={styles.durationRow}>
              {DURATION_OPTIONS.map((d) => (
                <Pressable
                  key={d.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: duration === d.key }}
                  style={[styles.durationPill, duration === d.key && styles.durationPillSelected]}
                  onPress={() => setDuration(d.key)}
                >
                  <Text style={[styles.durationLabel, duration === d.key && styles.durationLabelSelected]}>
                    {d.label}
                  </Text>
                  <Text style={[styles.durationSub, duration === d.key && styles.durationSubSelected]}>
                    {d.sub}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Confirmation summary */}
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>
              Your vet will see: <Text style={styles.bold}>{categories.map((c) => SHARE_CATEGORIES.find((s) => s.key === c)?.label).join(', ')}</Text>
            </Text>
            <Text style={styles.confirmText}>
              Access expires: <Text style={styles.bold}>{duration === '24h' ? '24 hours after redemption' : '7 days after redemption'}</Text>
            </Text>
          </View>

          <Button
            label={generating ? 'Generating…' : 'Generate share code'}
            loading={generating}
            disabled={categories.length === 0}
            onPress={handleGenerate}
          />
        </>
      ) : (
        <>
          {/* QR/Code display */}
          {!expired ? (
            <>
              <CodeDisplay code={grant.redemptionCode} />

              {/* Countdown */}
              <View style={styles.countdownRow}>
                <Ionicons name="timer-outline" size={16} color={countdown < '01:00' ? colors.danger : colors.brand} />
                <Text style={[styles.countdown, countdown < '01:00' && styles.countdownUrgent]}>
                  Expires in {countdown}
                </Text>
              </View>

              {/* What's shared */}
              <View style={styles.sharedBox}>
                <Text style={styles.sharedTitle}>Sharing</Text>
                <View style={styles.sharedCats}>
                  {grant.categories.map((c) => (
                    <View key={c} style={styles.sharedCat}>
                      <Ionicons name="checkmark-circle" size={13} color={colors.success} />
                      <Text style={styles.sharedCatText}>{SHARE_CATEGORIES.find((s) => s.key === c)?.label}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.sharedDuration}>
                  Access duration: {grant.duration === '24h' ? '24 hours' : '7 days'} after redemption
                </Text>
              </View>

              <View style={styles.instructions}>
                <Text style={styles.instructStep}>① Ask your vet to open the Furr professional portal</Text>
                <Text style={styles.instructStep}>② They tap "Redeem owner code"</Text>
                <Text style={styles.instructStep}>③ They enter the code above</Text>
              </View>
            </>
          ) : (
            <View style={styles.expiredBox}>
              <Ionicons name="time" size={32} color={colors.muted} />
              <Text style={styles.expiredTitle}>Code expired</Text>
              <Text style={styles.expiredCopy}>The 15-minute window has passed. Generate a new code.</Text>
            </View>
          )}

          <Button
            label="Generate new code"
            onPress={handleReset}
          />

          <Pressable
            accessibilityRole="button"
            style={styles.viewHistory}
            onPress={() => router.push('/sharing/manage-access' as never)}
          >
            <Text style={styles.viewHistoryText}>View all access grants →</Text>
          </Pressable>
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: space.md, gap: space.md, paddingBottom: 40 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  cancel: { padding: 4 },
  cancelText: { color: colors.brand, fontSize: 15, fontWeight: '700' },
  heading: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  manageLink: { color: colors.brand, fontSize: 13, fontWeight: '800' },
  petBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: colors.mist, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  petBadgeText: { color: colors.brand, fontSize: 12, fontWeight: '800' },
  privacyBox: { flexDirection: 'row', gap: 11, backgroundColor: colors.mist, padding: 14, borderRadius: radius.md, alignItems: 'flex-start' },
  privacyTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  privacyCopy: { color: colors.brand, fontSize: 12, lineHeight: 17, marginTop: 3 },
  section: { gap: 10 },
  label: { color: colors.ink, fontSize: 13, fontWeight: '800', letterSpacing: 0.2 },
  catRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: 13, borderWidth: 1, borderColor: colors.line },
  catText: { flex: 1, gap: 2 },
  catLabel: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  catSub: { color: colors.muted, fontSize: 11 },
  durationRow: { flexDirection: 'row', gap: 10 },
  durationPill: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, borderWidth: 1.5, borderColor: colors.line },
  durationPillSelected: { borderColor: colors.brand, backgroundColor: colors.mist },
  durationLabel: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  durationLabelSelected: { color: colors.brand },
  durationSub: { color: colors.muted, fontSize: 11, marginTop: 2 },
  durationSubSelected: { color: colors.brand },
  confirmBox: { backgroundColor: colors.pearl, borderRadius: radius.md, padding: 13, gap: 5 },
  confirmText: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  bold: { fontWeight: '900', color: colors.ink },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 7, justifyContent: 'center' },
  countdown: { color: colors.brand, fontSize: 20, fontWeight: '900' },
  countdownUrgent: { color: colors.danger },
  sharedBox: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, gap: 8, borderWidth: 1, borderColor: colors.line },
  sharedTitle: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  sharedCats: { gap: 5 },
  sharedCat: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  sharedCatText: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  sharedDuration: { color: colors.muted, fontSize: 12, marginTop: 4 },
  instructions: { gap: 7, backgroundColor: colors.pearl, padding: 14, borderRadius: radius.md },
  instructStep: { color: colors.ink, fontSize: 13, fontWeight: '700', lineHeight: 19 },
  expiredBox: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  expiredTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  expiredCopy: { color: colors.muted, fontSize: 13, textAlign: 'center' },
  viewHistory: { alignItems: 'center', paddingVertical: 6 },
  viewHistoryText: { color: colors.brand, fontSize: 13, fontWeight: '800' },
});
