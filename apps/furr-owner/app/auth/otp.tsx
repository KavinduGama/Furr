import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { User } from 'firebase/auth';
import { formatPhoneDisplay } from '@furr/core';
import { clearRecaptchaVerifier, DevConfirmationResult, DEV_BYPASS_CODE, sendPhoneOtp, verifyOtp } from '@furr/firebase';
import { Button, KeyboardScreen, OtpInput, colors, radius, space } from '@furr/ui';
import { useAuth, useDevBypass } from '@/src/context/auth';

const RESEND_COOLDOWN = 60; // seconds

export default function OtpScreen() {
  const { phone: routePhone } = useLocalSearchParams<{ phone: string; }>();
  const { setProfile, otpConfirmation, otpPhone, setOtpConfirmation, setOtpPhone } = useAuth();
  const { IS_DEV_BYPASS, DEV_MOCK_PROFILE } = useDevBypass();
  const phone = routePhone ?? otpPhone;

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);

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
      const confirmation = IS_DEV_BYPASS ? new DevConfirmationResult() : otpConfirmation;
      if (!confirmation) {
        setError('Your verification session expired. Request a new code.');
        return;
      }
      const user = await verifyOtp(confirmation, code);
      handleAuthSuccess(user);
    } catch (err: unknown) {
      const code_ = (err as { code?: string }).code ?? '';
      if (code_ === 'auth/invalid-verification-code') setError('That code isn\'t right. Check and try again.');
      else if (code_ === 'auth/code-expired') setError('This code has expired. Request a new one.');
      else setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (user: User) => {
    if (IS_DEV_BYPASS) {
      setProfile({ ...DEV_MOCK_PROFILE, uid: user.uid, phoneE164: phone ?? '+94770000000' });
      return;
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      if (IS_DEV_BYPASS) {
        setOtpConfirmation(new DevConfirmationResult());
      } else {
        if (!phone) throw new Error('Missing phone number');
        setOtpConfirmation(await sendPhoneOtp(phone, 'recaptcha-container'));
      }
      setOtpPhone(phone ?? null);
      setSecondsLeft(RESEND_COOLDOWN);
      setCode('');
    } catch (caught: unknown) {
      const errorCode = (caught as { code?: string }).code;
      clearRecaptchaVerifier();
      setError(errorCode === 'auth/too-many-requests'
        ? 'Too many attempts. Please try again in a few minutes.'
        : 'We could not resend the code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const displayPhone = formatPhoneDisplay(phone ?? '');

  // Auto-verify when 6 digits are entered
  useEffect(() => {
    if (code.length === 6 && !loading) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, loading]);


  return (
    <KeyboardScreen>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Verify your phone</Text>
        <Text style={styles.copy}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={styles.phoneHighlight}>{displayPhone}</Text>
          {IS_DEV_BYPASS && `\n\n⚙ Dev mode: use code ${DEV_BYPASS_CODE}`}
        </Text>
      </View>

      <View style={styles.otpContainer}>
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
      </View>

      <View style={styles.resendRow}>
        {secondsLeft > 0 ? (
          <Text style={styles.countdown}>Resend code in 00:{secondsLeft.toString().padStart(2, '0')}</Text>
        ) : (
          <Pressable accessibilityRole="button" onPress={handleResend} disabled={resending}>
            <Text style={styles.resendLink}>{resending ? 'Sending…' : 'Resend code'}</Text>
          </Pressable>
        )}
      </View>

      {/* Button is mostly for manual trigger or loading state display since it auto-verifies */}
      <View style={styles.actions}>
        <Button label="Verify" loading={loading} disabled={code.length < 6} onPress={handleVerify} />
      </View>
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 44,
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  back: {
    padding: 8,
    marginLeft: -8,
  },
  header: { gap: space.sm, marginBottom: space.xl, alignItems: 'center' },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  copy: { color: colors.muted, fontSize: 16, textAlign: 'center', lineHeight: 24 },
  phoneHighlight: { color: colors.ink, fontWeight: '700' },
  otpContainer: {
    marginBottom: space.lg,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: space.sm,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdown: { color: colors.brand, fontSize: 14, fontWeight: '600' },
  resendLink: { color: colors.brand, fontSize: 14, fontWeight: '700' },
  actions: {
    marginTop: 'auto',
    paddingTop: space.xl,
    paddingBottom: space.lg,
  },
});
