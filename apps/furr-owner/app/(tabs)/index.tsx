import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space } from '@furr/ui';
import { Screen } from '@/src/components/screen';
import { DailyChecklist } from '@/src/components/DailyChecklist';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';

const maxHero = require('../../assets/furr/max-hero-editorial.png');
const softgel = require('../../assets/furr/omega-softgel-editorial.png');

export default function TodayScreen() {
  const { profile } = useAuth();
  const { selectedPet, pets } = usePets();
  const [doseGiven, setDoseGiven] = useState(false);
  const petName = selectedPet?.name ?? 'your pet';
  const hasPets = pets.length > 0;
  
  const firstName = profile?.displayName?.split(' ')[0] ?? 'there';

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.topline}>
          <View>
            <Text style={styles.greeting}>Hi, {firstName} 👋</Text>
            <Text style={styles.subhead}>Give your pets the best care</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/notifications' as never)}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons name="notifications-outline" color={colors.ink} size={22} />
          </Pressable>
        </View>


        {/* Pet Avatars (Horizontal List style) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petsScroll} contentContainerStyle={styles.petsContent}>
          {pets.map((pet) => (
            <Pressable key={pet.id} style={styles.petAvatarWrap} onPress={() => router.push('/pet-detail' as never)}>
              <View style={[styles.petAvatar, selectedPet?.id === pet.id && styles.petAvatarSelected]}>
                 <Text style={styles.petAvatarEmoji}>{pet.species === 'cat' ? '🐈' : '🐕'}</Text>
              </View>
            </Pressable>
          ))}
          <Pressable style={styles.petAvatarWrap} onPress={() => router.push('/pet/add' as never)}>
             <View style={styles.petAvatarAdd}>
                <Ionicons name="add" size={24} color={colors.brand} />
             </View>
          </Pressable>
        </ScrollView>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsGrid}>
          <Pressable
            onPress={() => router.push('/care/feeding' as never)}
            style={styles.quickActionCard}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FFF7ED' }]}>
              <Text style={{ fontSize: 20 }}>🥩</Text>
            </View>
            <Text style={styles.quickActionLabel}>Log Meal</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/care/walk' as never)}
            style={styles.quickActionCard}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#EFF6FF' }]}>
              <Text style={{ fontSize: 20 }}>🦮</Text>
            </View>
            <Text style={styles.quickActionLabel}>Track Walk</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/telemedicine' as never)}
            style={styles.quickActionCard}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#ECFDF5' }]}>
              <Text style={{ fontSize: 20 }}>🩺</Text>
            </View>
            <Text style={styles.quickActionLabel}>Ask a Vet</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/community' as never)}
            style={styles.quickActionCard}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.softBrand }]}>
              <Text style={{ fontSize: 20 }}>💬</Text>
            </View>
            <Text style={styles.quickActionLabel}>Community</Text>
          </Pressable>
        </View>

        {/* Widgets Row */}
        {hasPets && (
          <View style={styles.widgetsRow}>
            {/* Next Reminder */}
            <View style={[styles.widget, styles.widgetHighlight]}>
              <Text style={styles.widgetTitle}>Next Reminder</Text>
              <View style={styles.reminderRow}>
                <View style={styles.reminderIconWrap}>
                  <Ionicons name="medical" size={16} color={colors.accent} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.reminderText}>Vaccination</Text>
                  <Text style={styles.reminderSub}>Mar 16</Text>
                </View>
                <Text style={styles.reminderTime}>In 5 days</Text>
              </View>
            </View>

            {/* Health Score */}
            <View style={styles.widget}>
              <Text style={styles.widgetTitle}>Health Score</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreValue}>92<Text style={styles.scoreMax}>/100</Text></Text>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreBadgeText}>Excellent</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Daily Checklist */}
        {hasPets && <DailyChecklist />}

        {/* My Pets List (Card) */}
        {!hasPets ? (
          <Pressable accessibilityRole="button" onPress={() => router.push('/pet/add' as never)} style={({ pressed }) => [styles.firstPet, pressed && styles.pressed]}>
            <View style={styles.firstPetIcon}><Ionicons name="paw" size={25} color={colors.brand} /></View>
            <View style={{ flex: 1 }}><Text style={styles.firstPetTitle}>Add your first pet</Text><Text style={styles.firstPetCopy}>Start tracking health records and more.</Text></View>
            <Ionicons name="arrow-forward" size={20} color={colors.brand} />
          </Pressable>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Pets</Text>
            </View>
            <Pressable onPress={() => router.push('/pet-detail' as never)} style={styles.petCard}>
              <View style={styles.petCardAvatar}>
                <Text style={styles.petAvatarEmoji}>{selectedPet?.species === 'cat' ? '🐈' : '🐕'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.petCardName}>{petName}</Text>
                <Text style={styles.petCardMeta}>Golden Retriever</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          </View>
        )}

        {/* Adoption Hub Banner */}
        <Pressable
          onPress={() => router.push('/adoption' as never)}
          style={({ pressed }) => [styles.adoptionBanner, pressed && styles.pressed]}
        >
          <View style={styles.adoptionIconCircle}>
            <Text style={{ fontSize: 24 }}>🐾</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.adoptionBannerTitle}>Adopt a Rescue Pet ❤️</Text>
            <Text style={styles.adoptionBannerSubtitle}>
              Give a loving forever home to dogs & cats from certified shelters.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={colors.brand} />
        </Pressable>

        {/* Recent Activity */}
        {hasPets && (
          <View style={styles.section}>
             <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
            </View>

            
            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineIcon}>
                  <Ionicons name="shield-checkmark" size={14} color={colors.brand} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineText}>Vaccination record added</Text>
                  <Text style={styles.timelineDate}>Mar 10, 2026</Text>
                </View>
              </View>

              <View style={styles.timelineLine} />

              <View style={styles.timelineItem}>
                <View style={styles.timelineIconSecondary}>
                  <Ionicons name="time" size={14} color={colors.accent} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineText}>Next reminder: Deworming</Text>
                  <Text style={styles.timelineDate}>Mar 20, 2026</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.canvas },
  content: { paddingBottom: space.xxl },
  topline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingTop: space.md },
  greeting: { color: colors.ink, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  subhead: { color: colors.muted, fontSize: 14, marginTop: 2 },
  iconButton: { height: 44, width: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.surface, shadowColor: colors.ink, shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, elevation: 2 },
  pressed: { opacity: 0.8 },
  
  petsScroll: { marginTop: space.lg, flexGrow: 0 },
  petsContent: { paddingHorizontal: space.lg, gap: space.sm },
  petAvatarWrap: { alignItems: 'center', justifyContent: 'center' },
  petAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.pearl, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  petAvatarSelected: { borderColor: colors.brand },
  petAvatarEmoji: { fontSize: 32 },
  petAvatarAdd: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.softBrand, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.brand, borderStyle: 'dashed' },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    marginTop: space.lg,
    gap: space.xs,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: space.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.line,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.ink,
  },

  widgetsRow: { flexDirection: 'column', gap: space.md, paddingHorizontal: space.lg, marginTop: space.lg },
  widget: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: space.lg, shadowColor: colors.ink, shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: {width: 0, height: 4}, elevation: 2 },
  widgetHighlight: { backgroundColor: '#FFFDF5', borderColor: '#FEF3C7', borderWidth: 1 },
  widgetTitle: { color: colors.ink, fontSize: 16, fontWeight: '800', marginBottom: space.sm },
  
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  reminderIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' },
  reminderText: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  reminderSub: { color: colors.muted, fontSize: 13 },
  reminderTime: { color: colors.accent, fontSize: 14, fontWeight: '700' },

  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xs },
  scoreValue: { color: colors.ink, fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  scoreMax: { color: colors.muted, fontSize: 16, fontWeight: '700' },
  scoreBadge: { backgroundColor: colors.calm, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm },
  scoreBadgeText: { color: colors.success, fontSize: 12, fontWeight: '800' },

  section: { marginTop: space.xl, paddingHorizontal: space.lg },
  sectionHeader: { marginBottom: space.sm },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  
  petCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md, flexDirection: 'row', alignItems: 'center', gap: space.md, shadowColor: colors.ink, shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: {width: 0, height: 4}, elevation: 2 },
  petCardAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.pearl, alignItems: 'center', justifyContent: 'center' },
  petCardName: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  petCardMeta: { color: colors.muted, fontSize: 14, marginTop: 2 },

  firstPet: { padding: 18, gap: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, marginTop: space.lg, marginHorizontal: space.lg, shadowColor: colors.ink, shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: {width: 0, height: 4}, elevation: 2 }, 
  firstPetIcon: { height: 52, width: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.softBrand }, 
  firstPetTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' }, 
  firstPetCopy: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 3 },

  timeline: { paddingLeft: space.xs, marginTop: space.sm },
  timelineItem: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  timelineIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.softBrand, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  timelineIconSecondary: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  timelineContent: { flex: 1, paddingTop: 4, paddingBottom: space.md },
  timelineText: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  timelineDate: { color: colors.muted, fontSize: 13, marginTop: 2 },
  timelineLine: { position: 'absolute', left: 23, top: 32, bottom: 0, width: 2, backgroundColor: colors.line, zIndex: 1, height: 40 },

  adoptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    marginHorizontal: space.lg,
    marginTop: space.lg,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    gap: space.md,
  },
  adoptionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adoptionBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6B21A8',
  },
  adoptionBannerSubtitle: {
    fontSize: 12,
    color: '#7E22CE',
    lineHeight: 16,
    marginTop: 2,
  },
});

