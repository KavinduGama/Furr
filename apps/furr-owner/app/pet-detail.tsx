import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { demoRecords } from '@furr/core';
import { colors, radius, space } from '@furr/ui';
import { Screen } from '@/src/components/screen';

const maxPortrait = require('../assets/furr/max-hero-editorial.png');

export default function PetDetailScreen() {
  return <><Stack.Screen options={{ headerShown: true, title: 'Max', headerStyle: { backgroundColor: colors.canvas }, headerShadowVisible: false }} /><Screen><View style={styles.identity}><Image source={maxPortrait} style={styles.avatar} resizeMode="cover" /><View><Text style={styles.name}>Max</Text><Text style={styles.meta}>Golden Retriever · Male · 2 years</Text></View></View><View style={styles.metrics}><View><Text style={styles.metricLabel}>WEIGHT</Text><Text style={styles.metric}>28.5 kg</Text></View><View><Text style={styles.metricLabel}>BLOOD TYPE</Text><Text style={styles.metric}>DEA 1.1+</Text></View></View><Text style={styles.section}>HEALTH TIMELINE</Text>{demoRecords.filter((record) => record.petId === 'max').map((record) => <View key={record.id} style={styles.record}><Ionicons name={record.category === 'vaccination' ? 'shield-checkmark' : 'medical'} size={19} color={colors.brand} /><View><Text style={styles.recordTitle}>{record.title}</Text><Text style={styles.recordMeta}>{record.occurredAt} · {record.provenance === 'VET_VERIFIED' || record.provenance === 'VET_AUTHORED' ? 'Vet verified' : 'Owner recorded'}</Text></View></View>)}</Screen></>;
}

const styles = StyleSheet.create({
  identity: { backgroundColor: colors.surface, padding: space.md, borderRadius: radius.lg, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#E8E6DF' }, avatar: { width: 64, height: 64, borderRadius: 24, backgroundColor: '#E8C9A6' }, name: { color: colors.ink, fontSize: 22, fontWeight: '900' }, meta: { color: colors.muted, fontSize: 13, marginTop: 4 }, metrics: { backgroundColor: colors.surface, padding: space.md, borderRadius: radius.md, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E8E6DF' }, metricLabel: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1 }, metric: { color: colors.ink, fontSize: 16, fontWeight: '900', marginTop: 6 }, section: { color: colors.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1.2, marginTop: 4 }, record: { backgroundColor: colors.surface, padding: 14, borderRadius: radius.md, flexDirection: 'row', gap: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E8E6DF' }, recordTitle: { color: colors.ink, fontWeight: '900' }, recordMeta: { color: colors.muted, fontSize: 12, marginTop: 4 },
});
