import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/src/context/auth';
import { AuthNavigationGuard } from '@/src/components/AuthNavigationGuard';
import {
  firebaseOptionsFromEnvironment,
  initFirebase,
} from '@furr/firebase';

// Initialise Firebase once at the app root.
// Returns false when env vars are missing → dev-bypass mode activates in AuthProvider.
initFirebase(firebaseOptionsFromEnvironment(process.env as Record<string, string | undefined>));

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthNavigationGuard>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
      </AuthNavigationGuard>
    </AuthProvider>
  );
}
