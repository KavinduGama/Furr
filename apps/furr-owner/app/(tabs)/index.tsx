import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Avatar, Card, Chip, PressableCard, colors, moments, motion, radius, space, typography } from '@furr/ui';
import type { Pet } from '@furr/core';
import { DailyChecklist } from '@/src/components/DailyChecklist';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';
import { useHealth } from '@/src/context/health';
import { useRoutines } from '@/src/context/routines';

function formatTaskTime(time?: string): string {
  if (!time) return 'Anytime';
  const [hRaw, mRaw] = time.split(':');
  const h = Number(hRaw);
  if (Number.isNaN(h)) return time;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${(mRaw ?? '00').padStart(2, '0')} ${suffix}`;
}

function formatAge(birthDate?: string): string | null {
  if (!birthDate) return null;
  const born = new Date(birthDate);
  if (Number.isNaN(born.getTime())) return null;
  const now = new Date();
  let months =
    (now.getFullYear() - born.getFullYear()) * 12 + (now.getMonth() - born.getMonth());
  if (now.getDate() < born.getDate()) months -= 1;
  if (months < 0) return 'New';
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo old`;
  return rest ? `${years} yr ${rest} mo` : `${years} yr old`;
}

const SPECIES_LABEL: Record<Pet['species'], string> = { dog: 'Dog', cat: 'Cat' };

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { pets, selectedPet } = usePets();
  const { tasks } = useRoutines();
  const { vaccinations, medications, weights } = useHealth();

  const firstName = profile?.displayName?.split(' ')[0] ?? 'there';
  const hasPets = pets.length > 0;

  const upNext = useMemo(() => {
    const pending = tasks.filter((t) => !t.isCompleted);
    if (pending.length === 0) return null;
    return [...pending].sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'))[0];
  }, [tasks]);

  const lastWeight = useMemo(() => {
    if (weights.length === 0) return null;
    return [...weights].sort((a, b) => (b.measuredOn ?? '').localeCompare(a.measuredOn ?? ''))[0];
  }, [weights]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.sm }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.topline}>
          <View style={{ flex: 1 }}>
            <Text style={typography.display}>Hi, {firstName}</Text>
            <Text style={styles.subhead}>Give your pets the best care</Text>
          </View>
          <PressableCard
            variant="flat"
            accessibilityLabel="Notifications"
            onPress={() => router.push('/notifications' as never)}
            style={styles.iconButton}
          >
            <Ionicons name="notifications-outline" color={colors.ink} size={22} />
          </PressableCard>
        </View>

        {/* Pet strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.petsContent}
        >
          {pets.map((pet) => (
            <PressableCard
              key={pet.id}
              variant="outline"
              accessibilityLabel={`Open ${pet.name}`}
              onPress={() => router.push('/pet-detail' as never)}
              style={styles.petAvatarWrap}
            >
              <Avatar
                uri={pet.photoPath}
                emoji={pet.species === 'cat' ? '🐈' : '🐕'}
                label={pet.avatarLabel}
                size={58}
                selected={selectedPet?.id === pet.id}
              />
              <Text style={styles.petAvatarName} numberOfLines={1}>
                {pet.name}
              </Text>
            </PressableCard>
          ))}
          <PressableCard
            variant="outline"
            accessibilityLabel="Add a pet"
            onPress={() => router.push('/pet/add' as never)}
            style={styles.petAvatarWrap}
          >
            <View style={styles.petAvatarAdd}>
              <Ionicons name="add" size={24} color={colors.brand} />
            </View>
            <Text style={styles.petAvatarName}>Add</Text>
          </PressableCard>
        </ScrollView>

        {/* Quick actions */}
        <View style={styles.quickActionsGrid}>
          <QuickAction
            icon="restaurant"
            label="Log Meal"
            moment={moments.meal}
            route="/care/feeding"
          />
          <QuickAction
            icon="paw"
            label="Track Walk"
            moment={moments.walk}
            route="/care/walk"
          />
          <QuickAction
            icon="medical"
            label="Ask a Vet"
            moment={moments.vet}
            route="/telemedicine"
          />
          <QuickAction
            icon="chatbubbles"
            label="Community"
            moment={moments.social}
            route="/community"
          />
        </View>

        {/* Widgets */}
        {hasPets && (
          <View style={styles.widgetsRow}>
            <WidgetCard
              tint={moments.alert.soft}
              icon={'alarm' as const}
              iconColor={moments.alert.icon}
              title="Up next"
              accessibilityLabel="Up next reminder"
              onPress={() => router.push('/reminders/reminders' as never)}
            >
              {upNext ? (
                <>
                  <Text style={styles.widgetValue} numberOfLines={1}>
                    {upNext.title}
                  </Text>
                  <Text style={styles.widgetMeta}>{formatTaskTime(upNext.time)}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.widgetValue} numberOfLines={1}>
                    All clear
                  </Text>
                  <Text style={styles.widgetMeta}>No tasks left today</Text>
                </>
              )}
            </WidgetCard>

            <WidgetCard
              tint={colors.softBrand}
              icon={'folder-open' as const}
              iconColor={colors.brand}
              title="Records"
              accessibilityLabel="Health records summary"
              onPress={() => router.push('/care' as never)}
            >
              <Text style={styles.widgetValue}>
                {vaccinations.length + medications.length + weights.length}
                <Text style={styles.widgetMax}> items</Text>
              </Text>
              <Text style={styles.widgetMeta} numberOfLines={1}>
                {lastWeight
                  ? `Last weigh-in ${lastWeight.value} ${lastWeight.unit}`
                  : 'Start their history'}
              </Text>
            </WidgetCard>
          </View>
        )}

        {/* Daily checklist */}
        {hasPets && <DailyChecklist />}

        {/* Pets */}
        {!hasPets ? (
          <PressableCard
            accessibilityLabel="Add your first pet"
            onPress={() => router.push('/pet/add' as never)}
            style={styles.firstPet}
          >
            <View style={styles.firstPetIcon}>
              <Ionicons name="paw" size={25} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.firstPetTitle}>Add your first pet</Text>
              <Text style={styles.firstPetCopy}>
                Start tracking health records and more.
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.brand} />
          </PressableCard>
        ) : (
          <ScrollView
            horizontal
            pagingEnabled={false}
            snapToInterval={276}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.heroCarousel}
          >
            {pets.map((pet) => (
              <PetHeroCard
                key={pet.id}
                pet={pet}
                weightLabel={
                  selectedPet?.id === pet.id && lastWeight
                    ? `${lastWeight.value} ${lastWeight.unit}`
                    : undefined
                }
              />
            ))}
          </ScrollView>
        )}

        {/* Adoption banner */}
        <PressableCard
          accessibilityLabel="Adopt a rescue pet"
          onPress={() => router.push('/adoption' as never)}
          style={styles.adoptionBanner}
        >
          <View style={[styles.adoptionIconCircle, { backgroundColor: '#FFFFFF' }]}>
            <Ionicons name="heart" size={22} color={moments.adopt.icon} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.adoptionBannerTitle, { color: moments.adopt.icon }]}>
              Adopt a Rescue Pet
            </Text>
            <Text style={styles.adoptionBannerSubtitle}>
              Give a loving forever home to dogs & cats from certified shelters.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={moments.adopt.icon} />
        </PressableCard>
      </ScrollView>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  moment,
  route,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  moment: { icon: string; soft: string };
  route: string;
}) {
  return (
    <PressableCard
      variant="flat"
      accessibilityLabel={label}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        router.push(route as never);
      }}
      style={styles.quickActionCard}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: moment.soft }]}>
        <Ionicons name={icon} size={20} color={moment.icon} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </PressableCard>
  );
}

function WidgetCard({
  tint,
  icon,
  iconColor,
  title,
  children,
  onPress,
  accessibilityLabel,
}: {
  tint: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  children: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <PressableCard
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[styles.widget, { backgroundColor: tint }]}
    >
      <View style={styles.widgetHeader}>
        <View style={[styles.widgetIcon, { backgroundColor: 'rgba(255,255,255,0.75)' }]}>
          <Ionicons name={icon} size={15} color={iconColor} />
        </View>
        <Text style={styles.widgetTitle}>{title}</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.muted} />
      </View>
      {children}
    </PressableCard>
  );
}

function PetHeroCard({
  pet,
  weightLabel,
}: {
  pet: Pet;
  weightLabel?: string;
}) {
  const age = formatAge(pet.birthDate);
  return (
    <PressableCard
      accessibilityLabel={`Open ${pet.name}'s profile`}
      onPress={() => router.push('/pet-detail' as never)}
      style={styles.heroCard}
    >
      <View style={styles.heroTop}>
        <Avatar
          uri={pet.photoPath}
          emoji={pet.species === 'cat' ? '🐈' : '🐕'}
          label={pet.avatarLabel}
          size={52}
          ring
        />
        <View style={{ flex: 1, marginLeft: space.md }}>
          <Text style={styles.heroName} numberOfLines={1}>
            {pet.name}
          </Text>
          <Text style={styles.heroBreed} numberOfLines={1}>
            {pet.breed || SPECIES_LABEL[pet.species]}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
      </View>
      <View style={styles.heroChips}>
        <Chip label={SPECIES_LABEL[pet.species]} tint={moments.health.soft} color={moments.health.icon} />
        {age ? <Chip label={age} tint={moments.social.soft} color={colors.brandDark} /> : null}
        {weightLabel ? <Chip label={weightLabel} tint={moments.meal.soft} color={moments.meal.icon} /> : null}
      </View>
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingBottom: space.xxl,
  },

  topline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
  subhead: {
    ...typography.body,
    color: colors.muted,
    marginTop: 2,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  petsContent: {
    paddingHorizontal: space.lg,
    gap: space.sm,
    marginTop: space.lg,
  },
  petAvatarWrap: {
    borderRadius: radius.lg,
    borderWidth: 0,
    alignItems: 'center',
    paddingTop: space.xxs,
    paddingBottom: space.xs,
    width: 86,
  },
  petAvatarName: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
    maxWidth: 78,
  },
  petAvatarAdd: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.softBrand,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.brand,
    borderStyle: 'dashed',
  },

  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    marginTop: space.md,
    gap: space.xs,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: radius.xl,
    paddingVertical: space.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    ...typography.micro,
    color: colors.ink,
  },

  widgetsRow: {
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.lg,
    marginTop: space.md,
  },
  widget: {
    flex: 1,
    padding: space.md,
    borderRadius: radius.lg,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: space.sm,
  },
  widgetIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetTitle: {
    flex: 1,
    ...typography.label,
    color: colors.ink,
  },
  widgetValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  widgetMeta: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  widgetMax: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },

  firstPet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: space.lg,
    marginTop: space.lg,
    padding: space.md,
  },
  firstPetIcon: {
    height: 52,
    width: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softBrand,
  },
  firstPetTitle: {
    ...typography.subheading,
    color: colors.ink,
  },
  firstPetCopy: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
    marginTop: 3,
  },

  heroCarousel: {
    paddingHorizontal: space.lg,
    gap: space.md,
    marginTop: space.xs,
  },
  heroCard: {
    width: 264,
    padding: space.md,
    borderRadius: radius.xl,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroName: {
    ...typography.heading,
    color: colors.ink,
  },
  heroBreed: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  heroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
    marginTop: space.md,
  },

  adoptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: moments.adopt.soft,
    marginHorizontal: space.lg,
    marginTop: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    gap: space.md,
  },
  adoptionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adoptionBannerTitle: {
    ...typography.subheading,
  },
  adoptionBannerSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted,
    marginTop: 2,
  },
});
