import { useRouter, useSegments } from 'expo-router';
import { type PropsWithChildren, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/src/context/auth';
import { colors } from '@furr/ui';

/**
 * Wraps the entire navigator tree and enforces auth-based redirects.
 *
 * - If status is 'loading' → show a fullscreen spinner (avoids flash)
 * - If unauthenticated and NOT on a public route → redirect to /welcome
 * - If authenticated but not onboarded → redirect to /auth/name
 * - If authenticated and onboarded and on a public route → redirect to /(tabs)
 *
 * Note: route strings are cast `as never` here because the Expo Router typed-routes
 * cache is generated at dev-server start and won't know about new /auth/* routes
 * until the next `expo start`. This is intentional and safe.
 */
export function AuthNavigationGuard({ children }: PropsWithChildren) {
  const { status, isOnboarded } = useAuth();
  // segments[0] is a plain string at runtime — cast to string[] to avoid
  // the typed-routes enum union which doesn't include 'auth' yet.
  const segments = useSegments() as string[];
  const router = useRouter();

  const inAuthGroup = segments[0] === 'auth';
  const onWelcome = segments[0] === 'welcome' || segments.length === 0;
  const isPublic = inAuthGroup || onWelcome;

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      if (!isPublic) {
        router.replace('/welcome' as never);
      }
      return;
    }

    // Authenticated
    if (!isOnboarded) {
      // New user — needs to set their name
      if (!(inAuthGroup && segments[1] === 'name')) {
        router.replace('/auth/name' as never);
      }
      return;
    }

    // Fully authenticated + onboarded — move off public screens
    if (isPublic) {
      router.replace('/(tabs)' as never);
    }
  }, [status, isOnboarded, isPublic, inAuthGroup, segments, router]);

  // Show spinner while Firebase resolves the initial auth state
  if (status === 'loading') {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
