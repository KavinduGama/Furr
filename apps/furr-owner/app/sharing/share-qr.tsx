import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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

const DURATION_OPTIONS: { key: GrantDuration; label: string; sub: string }[] = [
  { key: '24h', label: '24 hours', sub: 'Emergency / single visit' },
  { key: '7d', label: '7 days', sub: 'Ongoing care this week' },
];

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

function CodeDisplay({ code }: { code: string }) {
  const parts = [code.slice(0, 3), code.slice(3, 6)];
  return (
    <View style={codeStyles.wrap} accessibilityLabel={`Share code: ${code.split('').join(' ')}`}>
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
  wrap: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 32, alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: colors.brandSoft, marginVertical: 8 },
  label: { color: colors.muted, fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  codeRow: { flexDirection: 'row', alignItems: 'center' },
  code: { color: colors.ink, fontSize: 46, fontWeight: '900', letterSpacing: 6 },
  dash: { color: colors.muted, fontSize: 32, fontWeight: '300' },
  sub: { color: colors.muted, fontSize: 13 },
  bold: { fontWeight: '900', color: colors.brand },
});

export default function ShareQrScreen() {
  const { firebaseUser } = useAuth();
  const { selectedPet } = usePets();

  const [categories, setCategories] = useState<ShareCategory[]>(['summary', 'vaccinations', 'medications']);
  const [duration, setDuration] = useState<GrantDuration>('24h');

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
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.cancel}>
          <Text style={styles.cancelText}>Close</Text>
        </Pressable>
        <Text style={styles.heading}>Share with vet</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/sharing/manage-access' as never)}>
          <Text style={styles.manageLink}>History</Text>
        </Pressable>
      </View>

      {selectedPet && (
        <View style={styles.petBadge}>
          <Ionicons name="paw" size={16} color={colors.brand} />
          <Text style={styles.petBadgeText}>Sharing {selectedPet.name}'s records</Text>
        </View>
      )}

      {!grant ? (
        <>
          <View style={styles.privacyBox}>
            <View style={styles.privacyIconWrap}>
               <Ionicons name="shield-checkmark" size={24} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.privacyTitle}>You control what's shared</Text>
              <Text style={styles.privacyCopy}>
                Only the categories you select below will be visible. The code expires in 15 minutes and can be used once.
              </Text>
            </View>
          </View>

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
                  trackColor={{ true: colors.brandSoft, false: colors.line }}
                  thumbColor={categories.includes(cat.key) ? colors.brand : "#fff"}
                  accessibilityLabel={cat.label}
                />
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Access duration</Text>
            <View style={styles.durationRow}>
              {DURATION_OPTIONS.map((d) => (
                <Pressable
                  key={d.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: duration === d.key }}
                  style={[styles.durationPill, duration === d.key && styles.durationPillSelected]}
                  onPress={() => setDuration(d.key)}
                >
                  <Text style={[styles.durationLabel, duration === d.key && styles.durationLabelSelected]}>{d.label}</Text>
                  <Text style={[styles.durationSub, duration === d.key && styles.durationSubSelected]}>{d.sub}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>
              Your vet will see: <Text style={styles.bold}>{categories.map((c) => SHARE_CATEGORIES.find((s) => s.key === c)?.label).join(', ')}</Text>
            </Text>
            <Text style={styles.confirmText}>
              Access expires: <Text style={styles.bold}>{duration === '24h' ? '24 hours' : '7 days'} after redemption</Text>
            </Text>
          </View>

          <View style={{marginTop: space.lg}}>
            <Button
              label={generating ? 'Generating…' : 'Generate share code'}
              loading={generating}
              disabled={categories.length === 0}
              onPress={handleGenerate}
            />
          </View>
        </>
      ) : (
        <>
          {!expired ? (
            <>
              <CodeDisplay code={grant.redemptionCode} />

              <View style={styles.countdownRow}>
                <Ionicons name="timer-outline" size={20} color={countdown < '01:00' ? colors.danger : colors.brand} />
                <Text style={[styles.countdown, countdown < '01:00' && styles.countdownUrgent]}>
                  Expires in {countdown}
                </Text>
              </View>

              <View style={styles.sharedBox}>
                <Text style={styles.sharedTitle}>Sharing</Text>
                <View style={styles.sharedCats}>
                  {grant.categories.map((c) => (
                    <View key={c} style={styles.sharedCat}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={styles.sharedCatText}>{SHARE_CATEGORIES.find((s) => s.key === c)?.label}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.sharedDuration}>
                  Access duration: {grant.duration === '24h' ? '24 hours' : '7 days'}
                </Text>
              </View>

              <View style={styles.instructions}>
                <Text style={styles.instructStep}>1. Ask vet to open the Furr portal</Text>
                <Text style={styles.instructStep}>2. They tap "Redeem owner code"</Text>
                <Text style={styles.instructStep}>3. They enter the code above</Text>
              </View>
            </>
          ) : (
            <View style={styles.expiredBox}>
              <Ionicons name="time" size={48} color={colors.muted} />
              <Text style={styles.expiredTitle}>Code expired</Text>
              <Text style={styles.expiredCopy}>The 15-minute window has passed.</Text>
            </View>
          )}

          <View style={{marginTop: space.xl}}>
            <Button label="Generate new code" onPress={handleReset} variant="secondary" />
          </View>

          <Pressable accessibilityRole="button" style={styles.viewHistory} onPress={() => router.push('/sharing/manage-access' as never)}>
            <Text style={styles.viewHistoryText}>View access history</Text>
          </Pressable>
        </>
      )}

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: space.lg, gap: space.md, paddingBottom: 40 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  cancel: { padding: 4 },
  cancelText: { color: colors.muted, fontSize: 16, fontWeight: '700' },
  heading: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  manageLink: { color: colors.brand, fontSize: 16, fontWeight: '800' },
  
  petBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.softBrand, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill },
  petBadgeText: { color: colors.brand, fontSize: 14, fontWeight: '800' },
  
  privacyBox: { flexDirection: 'row', gap: 14, backgroundColor: colors.surface, padding: 18, borderRadius: radius.xl, alignItems: 'flex-start', shadowColor: colors.ink, shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: {width: 0, height: 4}, elevation: 2 },
  privacyIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.mist, alignItems: 'center', justifyContent: 'center' },
  privacyTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  privacyCopy: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 4 },
  
  section: { gap: 12, marginTop: space.sm },
  label: { color: colors.ink, fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  
  catRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, borderWidth: 1, borderColor: colors.line, shadowColor: colors.ink, shadowOpacity: 0.02, shadowRadius: 8, shadowOffset: {width: 0, height: 2} },
  catText: { flex: 1, gap: 4 },
  catLabel: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  catSub: { color: colors.muted, fontSize: 13 },
  
  durationRow: { flexDirection: 'row', gap: 12 },
  durationPill: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, borderWidth: 2, borderColor: colors.line, alignItems: 'center' },
  durationPillSelected: { borderColor: colors.brand, backgroundColor: colors.softBrand },
  durationLabel: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  durationLabelSelected: { color: colors.brand },
  durationSub: { color: colors.muted, fontSize: 12, marginTop: 4, textAlign: 'center' },
  durationSubSelected: { color: colors.brandDark },
  
  confirmBox: { backgroundColor: colors.pearl, borderRadius: radius.lg, padding: 16, gap: 8, marginTop: space.sm },
  confirmText: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  bold: { fontWeight: '800', color: colors.ink },
  
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginVertical: space.sm },
  countdown: { color: colors.brand, fontSize: 24, fontWeight: '900' },
  countdownUrgent: { color: colors.danger },
  
  sharedBox: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20, gap: 12, shadowColor: colors.ink, shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: {width: 0, height: 4}, elevation: 2 },
  sharedTitle: { color: colors.muted, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  sharedCats: { gap: 8 },
  sharedCat: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sharedCatText: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  sharedDuration: { color: colors.muted, fontSize: 14, marginTop: 6, fontWeight: '600' },
  
  instructions: { gap: 10, backgroundColor: colors.pearl, padding: 20, borderRadius: radius.xl, marginTop: space.sm },
  instructStep: { color: colors.ink, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  
  expiredBox: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  expiredTitle: { color: colors.ink, fontSize: 24, fontWeight: '900' },
  expiredCopy: { color: colors.muted, fontSize: 15, textAlign: 'center' },
  
  viewHistory: { alignItems: 'center', paddingVertical: 16 },
  viewHistoryText: { color: colors.brand, fontSize: 15, fontWeight: '800' },
});
