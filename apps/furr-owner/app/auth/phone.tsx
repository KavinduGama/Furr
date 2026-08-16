import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ConfirmationResult } from 'firebase/auth';
import { normalisePhone, isValidE164 } from '@furr/core';
import { clearRecaptchaVerifier, sendPhoneOtp, DevConfirmationResult } from '@furr/firebase';
import { Button, KeyboardScreen, colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';

const IS_DEV_BYPASS = !process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

export default function PhoneScreen() {
  const [rawPhone, setRawPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { isLocalPreview, setOtpConfirmation, setOtpPhone, startPreviewSession } = useAuth();
  const [isFocused, setIsFocused] = useState(false);

  const handleContinue = async () => {
    setError(null);
    const e164 = normalisePhone(rawPhone.trim(), '94');
    if (!e164 || !isValidE164(e164)) {
      setError('Please enter a valid Sri Lankan mobile number.');
      return;
    }
    setLoading(true);
    try {
      let confirmation: ConfirmationResult;
      if (IS_DEV_BYPASS) {
        confirmation = new DevConfirmationResult();
      } else {
        confirmation = await sendPhoneOtp(e164, 'recaptcha-container');
      }
      setOtpConfirmation(confirmation);
      setOtpPhone(e164);
      router.push({
        pathname: '/auth/otp' as never,
        params: { phone: e164 },
      });
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      clearRecaptchaVerifier();
      if (code === 'auth/too-many-requests') setError('Too many attempts. Please try again in a few minutes.');
      else if (code === 'auth/invalid-phone-number') setError('That number doesn\'t look right. Check and try again.');
      else if (code === 'auth/operation-not-allowed') setError('Phone sign-in is not enabled.');
      else if (code === 'auth/quota-exceeded') setError('SMS sending is temporarily unavailable. Please try again later.');
      else if (code === 'auth/unauthorized-domain') setError('This app address is not approved for phone sign-in.');
      else if (code === 'auth/invalid-app-credential' || code === 'auth/captcha-check-failed') setError('Browser verification expired. Please try sending the code again.');
      else setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    const e164 = normalisePhone(rawPhone.trim(), '94') ?? '+94770000000';
    startPreviewSession(e164);
  };

  return (
    <KeyboardScreen>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Furr</Text>
        <Text style={styles.copy}>
          Track. Care. Love.
          {IS_DEV_BYPASS && '\n\n⚙ Dev mode: any number works.'}
        </Text>
      </View>

      <View style={[styles.inputContainer, isFocused && styles.inputFocused, !!error && styles.inputError]}>
        <View style={styles.prefix}>
          <Text style={styles.flag}>LK</Text>
          <Text style={styles.prefixText}>+94</Text>
        </View>

        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="71 234 5678"
          placeholderTextColor={colors.muted}
          keyboardType="phone-pad"
          returnKeyType="done"
          maxLength={12}
          value={rawPhone}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChangeText={(t) => {
            setRawPhone(t);
            if (error) setError(null);
          }}
          onSubmitEditing={handleContinue}
          accessibilityLabel="Mobile number"
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}

      <View nativeID="recaptcha-container" />

      <View style={styles.actions}>
        <Button label="Continue" loading={loading} onPress={handleContinue} />
        {isLocalPreview && (
          <Button label="Preview without SMS" variant="text" onPress={handlePreview} />
        )}
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
  header: { gap: space.xs, marginBottom: space.xl, alignItems: 'center' },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  copy: { color: colors.muted, fontSize: 16, textAlign: 'center' },
  inputContainer: {
    flexDirection: 'row',
    height: 64,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  inputFocused: {
    borderColor: colors.brand,
  },
  inputError: {
    borderColor: colors.danger,
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: colors.line,
  },
  flag: { color: colors.muted, fontSize: 14, fontWeight: '700' },
  prefixText: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 1,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  actions: {
    marginTop: 'auto',
    paddingTop: space.xl,
    paddingBottom: space.lg,
    gap: space.md,
  },
});
