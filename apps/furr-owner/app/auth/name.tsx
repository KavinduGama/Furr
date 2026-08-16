import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/src/context/auth';
import { createOwnerProfile } from '@furr/firebase';
import type { OwnerProfile } from '@furr/core';
import { Button, KeyboardScreen, TextInput, colors, radius, space } from '@furr/ui';

const MIN_LENGTH = 2;
const MAX_LENGTH = 50;

export default function NameScreen() {
  const { firebaseUser, profile, setProfile } = useAuth();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    const trimmed = name.trim();
    if (trimmed.length < MIN_LENGTH) return `Please enter at least ${MIN_LENGTH} characters.`;
    if (trimmed.length > MAX_LENGTH) return `Name must be ${MAX_LENGTH} characters or fewer.`;
    return null;
  };

  const handleContinue = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const trimmedName = name.trim();

      if (!firebaseUser) throw new Error('No authenticated user');
      const nextProfile: OwnerProfile = {
        uid: firebaseUser.uid,
        displayName: trimmedName,
        phoneE164: firebaseUser.phoneNumber ?? profile?.phoneE164 ?? '',
        timezone: profile?.timezone ?? 'Asia/Colombo',
        notificationsEnabled: profile?.notificationsEnabled ?? true,
        termsAcceptedAt: profile?.termsAcceptedAt ?? new Date().toISOString(),
        termsVersion: profile?.termsVersion ?? '2026-08-01',
        createdAt: profile?.createdAt ?? new Date().toISOString(),
        accountStatus: profile?.accountStatus ?? 'active',
      };
      // Use createOwnerProfile for the first time setup so createdAt is written correctly
      await createOwnerProfile(nextProfile);
      setProfile(nextProfile);
    } catch {
      setError('Couldn\'t save your name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (firebaseUser) {
      void handleContinueWithName('Furr member');
    }
  };

  const handleContinueWithName = async (displayName: string) => {
    const nextProfile: OwnerProfile = {
      uid: firebaseUser!.uid,
      displayName,
      phoneE164: firebaseUser!.phoneNumber ?? profile?.phoneE164 ?? '',
      timezone: profile?.timezone ?? 'Asia/Colombo',
      notificationsEnabled: profile?.notificationsEnabled ?? true,
      termsAcceptedAt: profile?.termsAcceptedAt ?? new Date().toISOString(),
      termsVersion: profile?.termsVersion ?? '2026-08-01',
      createdAt: profile?.createdAt ?? new Date().toISOString(),
      accountStatus: profile?.accountStatus ?? 'active',
    };
    await createOwnerProfile(nextProfile);
    setProfile(nextProfile);
  };

  return (
    <KeyboardScreen>
      {/* Top Bar matching Phone Screen */}
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" style={styles.back} onPress={handleSkip}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.copy}>
          What should we call you?
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Full Name"
          placeholder="e.g. Kavindu Deshappriya"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (error) setError(null);
          }}
          maxLength={MAX_LENGTH}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          error={error ?? undefined}
          autoFocus
          autoCapitalize="words"
          accessibilityLabel="Your full name"
        />

        <TextInput
          label="Phone Number"
          value={firebaseUser?.phoneNumber ?? profile?.phoneE164 ?? ''}
          editable={false}
          style={styles.disabledInput}
        />
      </View>

      <View style={styles.actions}>
        <Button
          label="Complete Sign Up"
          loading={loading}
          disabled={name.trim().length < MIN_LENGTH}
          onPress={handleContinue}
        />
        <Text style={styles.legal}>
          By signing up, you agree to our{'\n'}
          <Text style={styles.legalLink}>Terms & Privacy Policy</Text>
        </Text>
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
  copy: { color: colors.muted, fontSize: 16, textAlign: 'center' },
  form: {
    gap: space.lg,
  },
  disabledInput: {
    backgroundColor: colors.pearl,
    color: colors.muted,
  },
  actions: {
    marginTop: 'auto',
    paddingTop: space.xl,
    paddingBottom: space.lg,
    gap: space.md,
  },
  legal: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: space.sm,
  },
  legalLink: {
    color: colors.brand,
    fontWeight: '700',
  },
});
