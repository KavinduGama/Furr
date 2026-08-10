import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { demoRecords } from '@furr/core';
import { colors, radius, space } from '@furr/ui';
import { Screen } from '@/src/components/screen';

const maxHero = require('../../assets/furr/max-hero-editorial.png');
const softgel = require('../../assets/furr/omega-softgel-editorial.png');

export default function TodayScreen() {
  const [doseGiven, setDoseGiven] = useState(false);
  const [snoozed, setSnoozed] = useState(false);

  return <Screen>
    <View style={styles.topline}>
      <View><Text style={styles.wordmark}>Furr</Text><Text style={styles.eyebrow}>MONDAY, AUGUST 10</Text></View>
      <Pressable accessibilityLabel="Open notifications" accessibilityRole="button" style={styles.notification}><Ionicons name="notifications-outline" color={colors.ink} size={21} /><View style={styles.notificationDot} /></Pressable>
    </View>

    <View style={styles.intro}><Text style={styles.greeting}>Good morning,{`\n`}Kavindu.</Text><Text style={styles.subhead}>A calm, healthy day starts here.</Text></View>

    <View style={styles.hero}>
      <Image source={maxHero} style={styles.heroImage} resizeMode="cover" />
      <View style={styles.heroShade} />
      <View style={styles.heroCaption}><View style={styles.captionRow}><View style={styles.liveDot} /><Text style={styles.captionEyebrow}>MAX'S HEALTH</Text></View><Text style={styles.heroTitle}>Looking good.</Text><Text style={styles.heroCopy}>Vaccinations are current and his care plan is on track.</Text></View>
      <View style={styles.verifiedPill}><Ionicons name="shield-checkmark" size={14} color={colors.success} /><Text style={styles.verifiedText}>Verified record</Text></View>
    </View>

    <View style={styles.sectionHeading}><View><Text style={styles.eyebrow}>TODAY'S CARE</Text><Text style={styles.sectionTitle}>{doseGiven ? 'All set for now.' : 'One thing to do.'}</Text></View><Text style={styles.time}>{doseGiven ? 'COMPLETE' : '8:00 PM'}</Text></View>

    <View style={[styles.careSheet, doseGiven && styles.careSheetDone]}>
      <View style={styles.careContent}><View style={styles.careCopyWrap}><Text style={styles.careLabel}>{doseGiven ? 'DONE TODAY' : 'OMEGA-3 · 1 CAPSULE'}</Text><Text style={styles.careTitle}>{doseGiven ? 'Dose recorded' : 'Omega-3 dose'}</Text><Text style={styles.careCopy}>{doseGiven ? 'Max is all caught up. Nice work.' : 'Supports his joints, skin and coat.'}</Text></View><Image source={softgel} style={styles.softgel} resizeMode="cover" /></View>
      <Pressable accessibilityRole="button" style={[styles.primaryAction, doseGiven && styles.primaryActionDone]} onPress={() => setDoseGiven(!doseGiven)}><Ionicons name={doseGiven ? 'checkmark-circle' : 'checkmark'} size={20} color="#fff" /><Text style={styles.primaryActionText}>{doseGiven ? 'Recorded for Max' : 'Mark dose as given'}</Text></Pressable>
      {!doseGiven && <Pressable accessibilityRole="button" style={styles.snooze} onPress={() => setSnoozed(!snoozed)}><Text style={styles.snoozeText}>{snoozed ? 'Snoozed for one hour' : 'Snooze for one hour'}</Text></Pressable>}
    </View>

    <View style={styles.activityHeader}><Text style={styles.eyebrow}>RECENTLY ADDED</Text><Pressable accessibilityRole="button"><Text style={styles.seeAll}>See timeline</Text></Pressable></View>
    {demoRecords.slice(0, 2).map((record) => <View style={styles.activity} key={record.id}><View style={styles.activityIcon}><Ionicons name={record.category === 'vaccination' ? 'shield-checkmark' : 'medical'} size={17} color={colors.brand} /></View><View style={{ flex: 1 }}><Text style={styles.activityTitle}>{record.title}</Text><Text style={styles.activityMeta}>{record.provenance === 'VET_VERIFIED' || record.provenance === 'VET_AUTHORED' ? 'Verified by your vet' : 'Added by you'} · {record.occurredAt}</Text></View><Ionicons name="chevron-forward" size={18} color="#A3ADB0" /></View>)}
  </Screen>;
}

const styles = StyleSheet.create({
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 },
  wordmark: { color: colors.brand, fontSize: 29, fontWeight: '900', letterSpacing: -1.2 },
  eyebrow: { color: '#758187', fontSize: 10, letterSpacing: 1.35, fontWeight: '900', marginTop: 2 },
  notification: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: '#ECE9E1' }, notificationDot: { position: 'absolute', top: 11, right: 12, height: 7, width: 7, borderRadius: 4, backgroundColor: colors.accent, borderWidth: 1.5, borderColor: colors.surface },
  intro: { marginTop: 10 }, greeting: { color: colors.ink, fontSize: 34, lineHeight: 38, fontWeight: '900', letterSpacing: -1.6 }, subhead: { color: colors.muted, fontSize: 15, marginTop: 8, lineHeight: 21 },
  hero: { height: 250, borderRadius: radius.xl, overflow: 'hidden', position: 'relative', backgroundColor: colors.pearl }, heroImage: { width: '100%', height: '100%' }, heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(7, 28, 32, 0.16)' }, heroCaption: { position: 'absolute', left: 18, right: 18, bottom: 17 }, captionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 }, liveDot: { height: 7, width: 7, borderRadius: 4, backgroundColor: '#97F2DA' }, captionEyebrow: { color: '#E5F9F3', fontSize: 10, letterSpacing: 1.15, fontWeight: '900' }, heroTitle: { color: '#fff', fontSize: 27, lineHeight: 31, fontWeight: '900', letterSpacing: -1, marginTop: 5 }, heroCopy: { color: '#ECF8F5', fontSize: 12, lineHeight: 16, maxWidth: 232, marginTop: 3 }, verifiedPill: { position: 'absolute', top: 14, right: 14, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.93)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 7 }, verifiedText: { color: colors.success, fontSize: 11, fontWeight: '800' },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }, sectionTitle: { color: colors.ink, fontSize: 24, lineHeight: 29, fontWeight: '900', letterSpacing: -0.7, marginTop: 2 }, time: { color: colors.brand, fontSize: 11, letterSpacing: 0.9, fontWeight: '900', marginBottom: 3 },
  careSheet: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 15, borderWidth: 1, borderColor: '#EAE7E0' }, careSheetDone: { backgroundColor: '#F0FAF6', borderColor: '#D2EDE2' }, careContent: { flexDirection: 'row', minHeight: 94 }, careCopyWrap: { flex: 1, paddingTop: 2 }, careLabel: { color: colors.brand, fontSize: 9, letterSpacing: 1, fontWeight: '900' }, careTitle: { color: colors.ink, fontSize: 22, fontWeight: '900', letterSpacing: -0.7, marginTop: 5 }, careCopy: { color: colors.muted, fontSize: 12, lineHeight: 16, marginTop: 4, maxWidth: 180 }, softgel: { width: 94, height: 94, borderRadius: 18, marginLeft: 6 }, primaryAction: { minHeight: 50, backgroundColor: colors.brand, borderRadius: radius.md, flexDirection: 'row', gap: 9, justifyContent: 'center', alignItems: 'center', marginTop: 10 }, primaryActionDone: { backgroundColor: colors.success }, primaryActionText: { color: '#fff', fontSize: 15, fontWeight: '900' }, snooze: { alignItems: 'center', paddingTop: 10, paddingBottom: 0 }, snoozeText: { color: colors.brand, fontSize: 12, fontWeight: '800' },
  activityHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }, seeAll: { color: colors.brand, fontSize: 12, fontWeight: '900' }, activity: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#E7E5DF' }, activityIcon: { height: 38, width: 38, borderRadius: 13, backgroundColor: colors.mist, alignItems: 'center', justifyContent: 'center' }, activityTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' }, activityMeta: { color: colors.muted, fontSize: 11, marginTop: 3 },
});
