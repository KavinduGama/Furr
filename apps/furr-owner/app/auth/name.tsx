import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/src/context/auth';
import { Button, KeyboardScreen, TextInput, colors, radius, space } from '@furr/ui';

// ─────────────────────────────────────────────────────────────
//  Display name setup screen (new users only)
//  Shown by AuthNavigationGuard when profile.displayName === null
// ─────────────────────────────────────────────────────────────

const MIN_LENGTH = 2;
const MAX_LENGTH = 50;

export default function NameScreen() {
  const { profile, setProfile } = useAuth();
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

      // TODO: Write to Firestore ownerProfiles/{uid}
      // await setDoc(doc(db, 'ownerProfiles', profile!.uid), {
      //   ...profile,
      //   displayName: trimmedName,
      //   updatedAt: serverTimestamp(),
      // }, { merge: true });

      // Update local context so AuthNavigationGuard redirects to /(tabs)
      if (profile) {
        setProfile({ ...profile, displayName: trimmedName });
      }
    } catch {
      setError('Couldn\'t save your name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow skipping — set a placeholder so the guard passes
    if (profile) {
      setProfile({ ...profile, displayName: 'Furr member' });
    }
  };

  return (
    <KeyboardScreen>
      {/* Paw icon */}
      <View style={styles.iconWrap}>
        <Ionicons name="paw" size={34} color={colors.brand} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>ALMOST THERE</Text>
        <Text style={styles.title}>What should{'\n'}we call you?</Text>
        <Text style={styles.copy}>
          This is the name your pets and records will be associated with.
          You can change it anytime in your profile.
        </Text>
      </View>

      {/* Name input */}
      <TextInput
        label="Your name"
        placeholder="e.g. Kavindu"
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
        accessibilityLabel="Your display name"
      />

      {/* Character count */}
      <Text style={styles.charCount}>
        {name.trim().length}/{MAX_LENGTH}
      </Text>

      {/* CTA */}
      <Button
        label="Continue to Furr"
        loading={loading}
        disabled={name.trim().length < MIN_LENGTH}
        onPress={handleContinue}
      />

      {/* Skip */}
      <Pressable
        accessibilityRole="button"
        style={styles.skip}
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>Skip for now</Text>
      </Pressable>
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: radius.lg,
    backgroundColor: colors.mist,
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
  charCount: {
    color: colors.muted,
    fontSize: 11,
    textAlign: 'right',
    marginTop: -8,
  },
  skip: { alignItems: 'center', paddingVertical: space.sm },
  skipText: { color: colors.brand, fontSize: 13, fontWeight: '800' },
});
