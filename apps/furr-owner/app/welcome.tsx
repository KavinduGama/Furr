import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, motion, radius, space, Button, typography } from '@furr/ui';

const maxHero = require('../assets/furr/max-hero-editorial.png');

const VALUE_CHIPS = [
  { icon: 'shield-checkmark' as const, label: 'Health records', tint: colors.calm },
  { icon: 'notifications' as const, label: 'Care reminders', tint: colors.warm },
  { icon: 'qr-code' as const, label: 'Share with your vet', tint: colors.softBrand },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  const logoScale = useSharedValue(0);
  const wordmarkY = useSharedValue(24);
  const wordmarkOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const chipsOpacity = useSharedValue(0);
  const actionsOpacity = useSharedValue(0);
  const heroFloat = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 160 });
    wordmarkY.value = withDelay(120, withSpring(0, motion.springSoft));
    wordmarkOpacity.value = withDelay(120, withTiming(1, { duration: motion.durationBase }));
    taglineOpacity.value = withDelay(260, withTiming(1, { duration: motion.durationBase }));
    chipsOpacity.value = withDelay(420, withTiming(1, { duration: motion.durationSlow }));
    actionsOpacity.value = withDelay(600, withTiming(1, { duration: motion.durationSlow }));
    heroFloat.value = withDelay(
      700,
      withRepeat(
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(heroFloat);
  }, [logoScale, wordmarkY, wordmarkOpacity, taglineOpacity, chipsOpacity, actionsOpacity, heroFloat]);

  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: logoScale.value }] }));
  const wordmarkStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: wordmarkY.value }],
    opacity: wordmarkOpacity.value,
  }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));
  const chipsStyle = useAnimatedStyle(() => ({ opacity: chipsOpacity.value }));
  const actionsStyle = useAnimatedStyle(() => ({ opacity: actionsOpacity.value }));
  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -6 * heroFloat.value },
      { rotate: `${heroFloat.value * 1.2}deg` },
    ],
  }));

  return (
    <View style={[styles.page, { paddingTop: insets.top + space.xl, paddingBottom: Math.max(insets.bottom, 24) }]}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <View style={styles.brandContainer}>
        <Animated.View style={[styles.logoBadge, logoStyle]}>
          <Ionicons name="paw" size={30} color={colors.onBrand} />
        </Animated.View>
        <Animated.View style={wordmarkStyle}>
          <Text style={styles.wordmark}>Furr</Text>
        </Animated.View>
        <Animated.View style={taglineStyle}>
          <Text style={styles.tagline}>A happier, healthier{'\n'}pet life</Text>
        </Animated.View>
      </View>

      <View style={styles.imageContainer}>
        <Animated.Image source={maxHero} style={[styles.image, heroStyle]} resizeMode="contain" />
      </View>

      <Animated.View style={[styles.actionsContainer, chipsStyle]}>
        <View style={styles.chipRow}>
          {VALUE_CHIPS.map((chip) => (
            <View key={chip.label} style={[styles.chip, { backgroundColor: chip.tint }]}>
              <Ionicons name={chip.icon} size={14} color={colors.ink} />
              <Text style={styles.chipLabel}>{chip.label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View style={[styles.actionsContainer, actionsStyle]}>
        <Button
          label="Get Started"
          variant="primary"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            router.push('/auth/phone' as never);
          }}
        />
        <Button
          label="Log In"
          variant="secondary"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            router.push('/auth/phone' as never);
          }}
        />
        <Text style={styles.legal}>By continuing you agree to our Terms and Privacy Policy</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  glowOne: {
    position: 'absolute',
    top: -140,
    right: -120,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: colors.softBrand,
    opacity: 0.7,
  },
  glowTwo: {
    position: 'absolute',
    bottom: -180,
    left: -140,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: colors.pearl,
    opacity: 0.9,
  },

  brandContainer: {
    alignItems: 'center',
    paddingHorizontal: space.xl,
    gap: space.xs,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xs,
    shadowColor: colors.brand,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  wordmark: {
    color: colors.ink,
    fontSize: 40,
    letterSpacing: -1.5,
    fontWeight: '900',
  },
  tagline: {
    color: colors.muted,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: space.xxs,
  },

  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space.lg,
  },
  image: {
    width: '100%',
    height: '100%',
    maxHeight: 300,
  },

  actionsContainer: {
    paddingHorizontal: space.xl,
    gap: space.md,
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: space.sm,
    marginBottom: space.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  chipLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.ink,
  },

  legal: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: space.xs,
  },
});
