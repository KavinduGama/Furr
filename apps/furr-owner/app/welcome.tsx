import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@furr/ui';

const maxHero = require('../assets/furr/max-hero-editorial.png');

export default function WelcomeScreen() {
  return (
    <View style={styles.page}>
      <Image source={maxHero} style={styles.image} resizeMode="cover" />
      <View style={styles.overlay} />

      {/* Brand mark */}
      <View style={styles.brand}>
        <Text style={styles.wordmark}>Furr</Text>
        <View style={styles.brandPill}>
          <Ionicons name="heart" size={12} color="#D6FFEF" />
          <Text style={styles.brandPillText}>HEALTH, HELD CLOSE</Text>
        </View>
      </View>

      {/* Bottom sheet */}
      <View style={styles.sheet}>
        <Text style={styles.title}>Care that stays{'\n'}with them.</Text>
        <Text style={styles.copy}>
          One beautiful, secure health home for every part of your pet's life.
        </Text>

        {/* Primary CTA — enters the real auth flow */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue with mobile number"
          style={styles.primary}
          onPress={() => router.push('/auth/phone' as never)}
        >
          <Text style={styles.primaryText}>Continue with mobile number</Text>
          <Ionicons name="arrow-forward" color="#fff" size={19} />
        </Pressable>

        {/* Returning user — same flow, OTP re-authenticates */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="I already have an account"
          style={styles.secondary}
          onPress={() => router.push('/auth/phone' as never)}
        >
          <Text style={styles.secondaryText}>I already have an account</Text>
        </Pressable>

        <Text style={styles.legal}>
          By continuing, you agree to Furr's Terms and Privacy Notice.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.brand },
  image: { ...StyleSheet.absoluteFill, width: undefined, height: undefined },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0, 72, 82, 0.28)' },
  brand: { position: 'absolute', top: 64, left: 25 },
  wordmark: { color: '#fff', fontSize: 31, letterSpacing: -1.4, fontWeight: '900' },
  brandPill: { flexDirection: 'row', gap: 5, alignItems: 'center', marginTop: 8 },
  brandPillText: { color: '#D6FFEF', fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  sheet: {
    backgroundColor: '#FFFEFC',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 23,
    paddingTop: 25,
    paddingBottom: 28,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  title: {
    color: colors.ink,
    fontSize: 31,
    lineHeight: 36,
    letterSpacing: -1.3,
    fontWeight: '900',
  },
  copy: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 21,
  },
  primary: {
    minHeight: 56,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  secondary: { alignItems: 'center', paddingVertical: 15 },
  secondaryText: { color: colors.brand, fontWeight: '900', fontSize: 13 },
  legal: {
    color: '#909A9C',
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
});
