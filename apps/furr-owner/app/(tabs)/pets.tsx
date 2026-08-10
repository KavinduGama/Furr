import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { demoPets } from '@furr/core';
import { colors, radius, space } from '@furr/ui';
import { Screen } from '@/src/components/screen';

const maxPortrait = require('../../assets/furr/max-hero-editorial.png');
const lunaPortrait = require('../../assets/furr/luna-portrait-editorial.png');

export default function PetsScreen() {
  return <Screen>
    <View style={styles.header}><View><Text style={styles.eyebrow}>YOUR FAMILY</Text><Text style={styles.title}>Your pets</Text><Text style={styles.copy}>Every little health detail, held close.</Text></View><Pressable accessibilityLabel="Add a pet" accessibilityRole="button" style={styles.add}><Ionicons name="add" color="#fff" size={24} /></Pressable></View>
    {demoPets.map((pet, index) => <Pressable key={pet.id} accessibilityRole="button" style={styles.petCard} onPress={() => router.push('/pet-detail')}><Image source={index === 0 ? maxPortrait : lunaPortrait} style={styles.petImage} resizeMode="cover" /><View style={styles.petCopy}><View style={styles.nameRow}><Text style={styles.petName}>{pet.name}</Text>{index === 0 && <View style={styles.verified}><Ionicons name="shield-checkmark" size={13} color={colors.success} /></View>}</View><Text style={styles.meta}>{pet.breed}</Text><View style={styles.status}><View style={styles.statusDot} /><Text style={styles.statusText}>{index === 0 ? 'Care plan is current' : 'New update this week'}</Text></View></View><Ionicons name="arrow-forward" size={18} color={colors.brand} /></Pressable>)}
    <Pressable style={styles.addPet} accessibilityRole="button"><View style={styles.addPetIcon}><Ionicons name="add" color={colors.brand} size={20} /></View><View><Text style={styles.addPetTitle}>Add a new companion</Text><Text style={styles.addPetCopy}>Set up their health home in minutes.</Text></View></Pressable>
  </Screen>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, eyebrow: { color: colors.brand, fontWeight: '900', fontSize: 10, letterSpacing: 1.2 }, title: { color: colors.ink, fontSize: 31, lineHeight: 35, fontWeight: '900', letterSpacing: -1.2, marginTop: 4 }, copy: { color: colors.muted, marginTop: 6, fontSize: 14 }, add: { height: 46, width: 46, borderRadius: 23, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  petCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1, borderColor: '#E8E6DF' }, petImage: { height: 84, width: 84, borderRadius: 20, backgroundColor: colors.pearl }, petCopy: { flex: 1 }, nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 }, petName: { color: colors.ink, fontSize: 20, fontWeight: '900', letterSpacing: -0.4 }, verified: { height: 20, width: 20, borderRadius: 10, backgroundColor: '#E4F5EE', alignItems: 'center', justifyContent: 'center' }, meta: { color: colors.muted, fontSize: 12, marginTop: 3 }, status: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 11 }, statusDot: { height: 6, width: 6, borderRadius: 3, backgroundColor: colors.success }, statusText: { color: colors.success, fontSize: 11, fontWeight: '800' },
  addPet: { borderRadius: radius.md, backgroundColor: colors.mist, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 }, addPetIcon: { height: 42, width: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }, addPetTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' }, addPetCopy: { color: colors.muted, fontSize: 12, marginTop: 3 },
});
