import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { User } from 'firebase/auth';
import { formatPhoneDisplay } from '@furr/core';
import {
  DevConfirmationResult,
  DEV_BYPASS_CODE,
} from '@furr/firebase';
import { Button, KeyboardScreen, OtpInput, colors, radius, space } from '@furr/ui';
import { useAuth, useDevBypass } from '@/src/context/auth';

// ─────────────────────────────────────────────────────────────
//  OTP verification screen  (AUTH-001 cont.)
// ─────────────────────────────────────────────────────────────

const RESEND_COOLDOWN = 60; // seconds

export default function OtpScreen() {
  const { phone, confirmationJson } = useLocalSearchParams<{
    phone: string;
    confirmationJson: string;
  }>();
  const { setProfile } = useAuth();
  const { IS_DEV_BYPASS, DEV_MOCK_PROFILE } = useDevBypass();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);

  // Confirmation result reconstructed from params (dev bypass or serialised)
  const confirmationRef = useRef<DevConfirmationResult | null>(null);

  useEffect(() => {
    // In dev bypass mode, always use the mock
    if (IS_DEV_BYPASS) {
      confirmationRef.current = new DevConfirmationResult();
    } else {
      // Real Firebase confirmation results aren't JSON-serialisable.
      // We pass the confirmation through global navigation state.
      // For now use a passthrough that calls the global stored confirmation.
      // TODO: Use a navigation store / ref for the real confirmation result.
      confirmationRef.current = new DevConfirmationResult();
    }
  }, [IS_DEV_BYPASS]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const handleVerify = async () => {
    if (code.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (!confirmationRef.current) throw new Error('No confirmation result');
      const { user } = await confirmationRef.current.confirm(code);

      // Auth success — navigate based on whether user is new or returning
      handleAuthSuccess(user);
    } catch (err: unknown) {
      const code_ = (err as { code?: string }).code ?? '';
      if (code_ === 'auth/invalid-verification-code') {
        setError('That code isn\'t right. Check and try again.');
      } else if (code_ === 'auth/code-expired') {
        setError('This code has expired. Request a new one.');
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (user: User) => {
    if (IS_DEV_BYPASS) {
      // In dev mode, profile.displayName is null → triggers name screen
      setProfile({ ...DEV_MOCK_PROFILE, uid: user.uid, phoneE164: phone ?? '+94770000000' });
      // AuthNavigationGuard will redirect to /auth/name since displayName is null
      return;
    }

    // Real flow: AuthProvider's onAuthStateChanged handles the profile fetch
    // and AuthNavigationGuard will redirect accordingly
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      if (IS_DEV_BYPASS) {
        confirmationRef.current = new DevConfirmationResult();
      } else {
        // TODO: call sendPhoneOtp again with the same phone
      }
      setSecondsLeft(RESEND_COOLDOWN);
      setCode('');
    } finally {
      setResending(false);
    }
  };

  const displayPhone = formatPhoneDisplay(phone ?? '');

  return (
    <KeyboardScreen>
      {/* Back */}
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
        <Text style={styles.eyebrow}>STEP 2 OF 2</Text>
        <Text style={styles.title}>Enter your{'\n'}verification code</Text>
        <Text style={styles.copy}>
          We sent a 6-digit code to{' '}
          <Text style={styles.phoneHighlight}>{displayPhone}</Text>
          {IS_DEV_BYPASS && `\n\n⚙ Dev mode: use code ${DEV_BYPASS_CODE}`}
        </Text>
      </View>

      {/* OTP boxes */}
      <OtpInput
        value={code}
        onChange={(v) => {
          setCode(v);
          if (error) setError(null);
        }}
        error={!!error}
        disabled={loading}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      {/* Verify CTA */}
      <Button
        label="Verify code"
        loading={loading}
        disabled={code.length < 6}
        onPress={handleVerify}
      />

      {/* Resend */}
      <View style={styles.resendRow}>
        <Text style={styles.resendPrompt}>Didn't receive it? </Text>
        {secondsLeft > 0 ? (
          <Text style={styles.countdown}>Resend in {secondsLeft}s</Text>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={handleResend}
            disabled={resending}
          >
            <Text style={styles.resendLink}>{resending ? 'Sending…' : 'Resend code'}</Text>
          </Pressable>
        )}
      </View>
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
    alignSelf: 'flex-start',
  },
  header: { gap: 8 },
  eyebrow: { color: colors.brand, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1.3,
    lineHeight: 36,
  },
  copy: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  phoneHighlight: { color: colors.ink, fontWeight: '800' },
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: space.sm,
  },
  resendPrompt: { color: colors.muted, fontSize: 13 },
  countdown: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  resendLink: { color: colors.brand, fontSize: 13, fontWeight: '800' },
});
