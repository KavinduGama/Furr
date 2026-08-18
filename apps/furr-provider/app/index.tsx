import { Redirect } from 'expo-router';
import { useProviderProfile } from '../src/context/provider';

export default function Index() {
  const { hasCompletedOnboarding, isLoading } = useProviderProfile();

  if (isLoading) {
    return null;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
