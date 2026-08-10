import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@furr/ui';
import { Screen } from '@/src/components/screen';

const items = [
  ['Medication', 'One dose due this evening', 'medical', '#DDF5F1'],
  ['Vaccinations', 'All certificates are current', 'shield-checkmark', '#E5F0FF'],
  ['Documents', 'Four protected health files', 'document-text', '#FFF1D7'],
  ['Share with a vet', 'Create secure temporary access', 'share-social', '#F1E8FF'],
] as const;

export default function CareScreen() {
  return <Screen><View><Text style={styles.eyebrow}>MAX'S HEALTH HOME</Text><Text style={styles.title}>Care centre</Text><Text style={styles.copy}>Small actions. A lifetime of care.</Text></View><View style={styles.healthStrip}><View><Text style={styles.healthLabel}>CARE STATUS</Text><Text style={styles.healthTitle}>Everything is on track.</Text></View><View style={styles.healthBadge}><Ionicons name="heart" size={19} color={colors.brand} /></View></View><Text style={styles.section}>KEEPING MAX WELL</Text>{items.map(([title, detail, icon, tint]) => <Pressable accessibilityRole="button" style={styles.item} key={title}><View style={[styles.icon, { backgroundColor: tint }]}><Ionicons name={icon} size={20} color={colors.brand} /></View><View style={{ flex: 1 }}><Text style={styles.itemTitle}>{title}</Text><Text style={styles.itemCopy}>{detail}</Text></View><Ionicons name="chevron-forward" size={19} color="#A3ADB0" /></Pressable>)}</Screen>;
}

const styles = StyleSheet.create({ eyebrow: { color: colors.brand, fontWeight: '900', fontSize: 10, letterSpacing: 1.2 }, title: { color: colors.ink, fontSize: 31, fontWeight: '900', letterSpacing: -1.2, marginTop: 4 }, copy: { color: colors.muted, marginTop: 6 }, healthStrip: { backgroundColor: colors.brand, borderRadius: radius.lg, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, healthLabel: { color: '#A4E6DF', fontSize: 10, fontWeight: '900', letterSpacing: 1 }, healthTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 5 }, healthBadge: { height: 46, width: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: '#C9F1EA' }, section: { color: '#758187', fontWeight: '900', fontSize: 10, letterSpacing: 1.2, marginTop: 5 }, item: { backgroundColor: colors.surface, padding: 15, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E8E6DF' }, icon: { height: 44, width: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, itemTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' }, itemCopy: { color: colors.muted, fontSize: 12, marginTop: 3, lineHeight: 16 }, });
