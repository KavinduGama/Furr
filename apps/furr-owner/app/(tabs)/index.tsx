import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space } from '@furr/ui';
import { Screen } from '@/src/components/screen';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';

const maxHero = require('../../assets/furr/max-hero-editorial.png');
const softgel = require('../../assets/furr/omega-softgel-editorial.png');

// ─────────────────────────────────────────────────────────────
//  Today dashboard  (DASH-001)
// ─────────────────────────────────────────────────────────────

function greetingFor(name: string | null): string {
  const hour = new Date().getHours();
  const time = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const first = name?.split(' ')[0] ?? 'there';
  return `Good ${time},\n${first}.`;
}

function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).toUpperCase();
}

export default function TodayScreen() {
  const { profile } = useAuth();
  const { selectedPet, pets } = usePets();
  const [doseGiven, setDoseGiven] = useState(false);
  const [snoozed, setSnoozed] = useState(false);

  const hasPets = pets.length > 0;
  const petName = selectedPet?.name ?? 'your pet';

  return (
    <Screen>
      {/* Top bar */}
      <View style={styles.topline}>
        <View>
          <Text style={styles.wordmark}>Furr</Text>
          <Text style={styles.eyebrow}>{todayLabel()}</Text>
        </View>
        <Pressable
          accessibilityLabel="Open notifications"
          accessibilityRole="button"
          style={styles.notification}
        >
          <Ionicons name="notifications-outline" color={colors.ink} size={21} />
          <View style={styles.notificationDot} />
        </Pressable>
      </View>

      {/* Greeting */}
      <View style={styles.intro}>
        <Text style={styles.greeting}>{greetingFor(profile?.displayName ?? null)}</Text>
        <Text style={styles.subhead}>A calm, healthy day starts here.</Text>
      </View>

      {/* Hero card */}
      {hasPets ? (
        <Pressable
          accessibilityRole="button"
          style={styles.hero}
          onPress={() => router.push('/pet-detail' as never)}
        >
          <Image source={maxHero} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroShade} />
          <View style={styles.heroCaption}>
            <View style={styles.captionRow}>
              <View style={styles.liveDot} />
              <Text style={styles.captionEyebrow}>{petName.toUpperCase()}'S HEALTH</Text>
            </View>
            <Text style={styles.heroTitle}>Looking good.</Text>
            <Text style={styles.heroCopy}>
              Keep building a complete record — it helps every vet who sees {petName}.
            </Text>
          </View>
          <View style={styles.verifiedPill}>
            <Ionicons name="paw" size={13} color={colors.brand} />
            <Text style={styles.verifiedText}>{petName}</Text>
          </View>
        </Pressable>
      ) : (
        /* No pets yet — onboarding CTA */
        <Pressable
          accessibilityRole="button"
          style={styles.heroCta}
          onPress={() => router.push('/pet/add' as never)}
        >
          <View style={styles.heroCtaIcon}>
            <Ionicons name="paw" size={30} color={colors.brand} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroCtaTitle}>Add your first pet</Text>
            <Text style={styles.heroCtaCopy}>
              Set up their health home in under 60 seconds to unlock reminders and sharing.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={colors.brand} />
        </Pressable>
      )}

      {/* Today's care — only shown when a pet exists */}
      {hasPets && (
        <>
          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.eyebrow}>TODAY'S CARE</Text>
              <Text style={styles.sectionTitle}>
                {doseGiven ? 'All set for now.' : 'One thing to do.'}
              </Text>
            </View>
            <Text style={styles.time}>{doseGiven ? 'COMPLETE' : '8:00 PM'}</Text>
          </View>

          <View style={[styles.careSheet, doseGiven && styles.careSheetDone]}>
            <View style={styles.careContent}>
              <View style={styles.careCopyWrap}>
                <Text style={styles.careLabel}>{doseGiven ? 'DONE TODAY' : 'OMEGA-3 · 1 CAPSULE'}</Text>
                <Text style={styles.careTitle}>{doseGiven ? 'Dose recorded' : 'Omega-3 dose'}</Text>
                <Text style={styles.careCopy}>
                  {doseGiven
                    ? `${petName} is all caught up. Nice work.`
                    : `Supports ${petName}'s joints, skin and coat.`}
                </Text>
              </View>
              <Image source={softgel} style={styles.softgel} resizeMode="cover" />
            </View>
            <Pressable
              accessibilityRole="button"
              style={[styles.primaryAction, doseGiven && styles.primaryActionDone]}
              onPress={() => setDoseGiven(!doseGiven)}
            >
              <Ionicons name={doseGiven ? 'checkmark-circle' : 'checkmark'} size={20} color="#fff" />
              <Text style={styles.primaryActionText}>
                {doseGiven ? `Recorded for ${petName}` : 'Mark dose as given'}
              </Text>
            </Pressable>
            {!doseGiven && (
              <Pressable
                accessibilityRole="button"
                style={styles.snooze}
                onPress={() => setSnoozed(!snoozed)}
              >
                <Text style={styles.snoozeText}>
                  {snoozed ? 'Snoozed for one hour' : 'Snooze for one hour'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Recent activity — placeholder until health records are built */}
          <View style={styles.activityHeader}>
            <Text style={styles.eyebrow}>RECENTLY ADDED</Text>
            <Pressable accessibilityRole="button">
              <Text style={styles.seeAll}>See timeline</Text>
            </Pressable>
          </View>

          <View style={styles.emptyActivity}>
            <Ionicons name="time-outline" size={22} color={colors.muted} />
            <Text style={styles.emptyActivityText}>
              Health records will appear here as you add them.
            </Text>
          </View>
        </>
      )}
    </Screen>
  );
}

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 },
  wordmark: { color: colors.brand, fontSize: 29, fontWeight: '900', letterSpacing: -1.2 },
  eyebrow: { color: '#758187', fontSize: 10, letterSpacing: 1.35, fontWeight: '900', marginTop: 2 },
  notification: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: '#ECE9E1' },
  notificationDot: { position: 'absolute', top: 11, right: 12, height: 7, width: 7, borderRadius: 4, backgroundColor: colors.accent, borderWidth: 1.5, borderColor: colors.surface },

  intro: { marginTop: 10 },
  greeting: { color: colors.ink, fontSize: 34, lineHeight: 38, fontWeight: '900', letterSpacing: -1.6 },
  subhead: { color: colors.muted, fontSize: 15, marginTop: 8, lineHeight: 21 },

  // Hero with pet
  hero: { height: 240, borderRadius: radius.xl, overflow: 'hidden', position: 'relative', backgroundColor: colors.pearl },
  heroImage: { width: '100%', height: '100%' },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(7, 28, 32, 0.18)' },
  heroCaption: { position: 'absolute', left: 18, right: 18, bottom: 17 },
  captionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { height: 7, width: 7, borderRadius: 4, backgroundColor: '#97F2DA' },
  captionEyebrow: { color: '#E5F9F3', fontSize: 10, letterSpacing: 1.15, fontWeight: '900' },
  heroTitle: { color: '#fff', fontSize: 27, lineHeight: 31, fontWeight: '900', letterSpacing: -1, marginTop: 5 },
  heroCopy: { color: '#ECF8F5', fontSize: 12, lineHeight: 16, maxWidth: 232, marginTop: 3 },
  verifiedPill: { position: 'absolute', top: 14, right: 14, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.93)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 7 },
  verifiedText: { color: colors.brand, fontSize: 11, fontWeight: '800' },

  // Hero CTA (no pets)
  heroCta: { backgroundColor: colors.mist, borderRadius: radius.xl, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1.5, borderColor: colors.softBrand, minHeight: 100 },
  heroCtaIcon: { width: 60, height: 60, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  heroCtaTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  heroCtaCopy: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 5 },

  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 },
  sectionTitle: { color: colors.ink, fontSize: 24, lineHeight: 29, fontWeight: '900', letterSpacing: -0.7, marginTop: 2 },
  time: { color: colors.brand, fontSize: 11, letterSpacing: 0.9, fontWeight: '900', marginBottom: 3 },

  careSheet: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 15, borderWidth: 1, borderColor: '#EAE7E0' },
  careSheetDone: { backgroundColor: '#F0FAF6', borderColor: '#D2EDE2' },
  careContent: { flexDirection: 'row', minHeight: 94 },
  careCopyWrap: { flex: 1, paddingTop: 2 },
  careLabel: { color: colors.brand, fontSize: 9, letterSpacing: 1, fontWeight: '900' },
  careTitle: { color: colors.ink, fontSize: 22, fontWeight: '900', letterSpacing: -0.7, marginTop: 5 },
  careCopy: { color: colors.muted, fontSize: 12, lineHeight: 16, marginTop: 4, maxWidth: 180 },
  softgel: { width: 94, height: 94, borderRadius: 18, marginLeft: 6 },
  primaryAction: { minHeight: 50, backgroundColor: colors.brand, borderRadius: radius.md, flexDirection: 'row', gap: 9, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  primaryActionDone: { backgroundColor: colors.success },
  primaryActionText: { color: '#fff', fontSize: 15, fontWeight: '900' },
  snooze: { alignItems: 'center', paddingTop: 10, paddingBottom: 0 },
  snoozeText: { color: colors.brand, fontSize: 12, fontWeight: '800' },

  activityHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  seeAll: { color: colors.brand, fontSize: 12, fontWeight: '900' },
  emptyActivity: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16, borderBottomWidth: 1, borderColor: colors.line },
  emptyActivityText: { color: colors.muted, fontSize: 13, flex: 1, lineHeight: 18 },
});
