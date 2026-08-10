import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ConfirmationResult } from 'firebase/auth';
import { normalisePhone, isValidE164 } from '@furr/core';
import { sendPhoneOtp, DevConfirmationResult } from '@furr/firebase';
import { Button, KeyboardScreen, colors, radius, space } from '@furr/ui';

// ── Dev bypass ───────────────────────────────────────────────

const IS_DEV_BYPASS = !process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

// ─────────────────────────────────────────────────────────────
//  Phone entry screen  (AUTH-001)
// ─────────────────────────────────────────────────────────────

export default function PhoneScreen() {
  const [rawPhone, setRawPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleContinue = async () => {
    setError(null);

    // Normalise to E.164 (default country Sri Lanka +94)
    const e164 = normalisePhone(rawPhone.trim(), '94');

    if (!e164 || !isValidE164(e164)) {
      setError('Please enter a valid Sri Lankan mobile number.');
      return;
    }

    setLoading(true);

    try {
      let confirmation: ConfirmationResult;

      if (IS_DEV_BYPASS) {
        // No Firebase — use mock confirmation
        confirmation = new DevConfirmationResult();
      } else {
        confirmation = await sendPhoneOtp(e164, 'recaptcha-container');
      }

      // Navigate to OTP screen, passing along the phone and confirmation
      router.push({
        pathname: '/auth/otp' as never,
        params: { phone: e164 },
      });
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again in a few minutes.');
      } else if (code === 'auth/invalid-phone-number') {
        setError('That number doesn\'t look right. Check and try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardScreen>
      {/* Back button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={styles.back}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={22} color={colors.ink} />
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>STEP 1 OF 2</Text>
        <Text style={styles.title}>What's your{'\n'}mobile number?</Text>
        <Text style={styles.copy}>
          We'll send a one-time code to verify it's you.
          {IS_DEV_BYPASS && '\n\n⚙ Dev mode: any number works.'}
        </Text>
      </View>

      {/* Phone input */}
      <View style={styles.inputRow}>
        {/* Country prefix badge */}
        <View style={styles.prefix}>
          <Text style={styles.flag}>🇱🇰</Text>
          <Text style={styles.prefixText}>+94</Text>
        </View>

        <TextInput
          ref={inputRef}
          style={[styles.input, !!error && styles.inputError]}
          placeholder="77 123 4567"
          placeholderTextColor={colors.muted}
          keyboardType="phone-pad"
          returnKeyType="done"
          maxLength={12}
          value={rawPhone}
          onChangeText={(t) => {
            setRawPhone(t);
            if (error) setError(null);
          }}
          onSubmitEditing={handleContinue}
          accessibilityLabel="Mobile number"
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {/* Invisible reCAPTCHA container (web only, noop on native) */}
      <View nativeID="recaptcha-container" />

      {/* CTA */}
      <Button label="Send verification code" loading={loading} onPress={handleContinue} />

      {/* Legal */}
      <Text style={styles.legal}>
        By continuing you agree to Furr's{' '}
        <Text style={styles.legalLink}>Terms of Service</Text> and{' '}
        <Text style={styles.legalLink}>Privacy Notice</Text>.
      </Text>
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  back: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
    alignSelf: 'flex-start',
  },
  header: { gap: 8 },
  eyebrow: {
    color: colors.brand,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1.3,
    lineHeight: 36,
  },
  copy: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  prefix: {
    height: 56,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  flag: { fontSize: 20 },
  prefixText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  input: {
    flex: 1,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 0.5,
  },
  inputError: { borderColor: colors.danger },
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
    marginTop: -4,
  },
  legal: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: 16,
  },
  legalLink: { color: colors.brand, fontWeight: '700' },
});
