import 'react-native-gesture-handler';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/src/context/auth';
import { PetProvider } from '@/src/context/pets';
import { HealthProvider } from '@/src/context/health';
import { SubscriptionProvider } from '@/src/context/subscription';
import { ExpenseProvider } from '@/src/context/expenses';
import { RoutineProvider } from '@/src/context/routines';
import { MarketplaceProvider } from '@/src/context/marketplace';
import { ServicesProvider } from '@/src/context/services';
import { AuthNavigationGuard } from '@/src/components/AuthNavigationGuard';
import {
  firebaseOptionsFromEnvironment,
  initFirebase,
} from '@furr/firebase';

LogBox.ignoreLogs([
  '"shadow*" style props are deprecated. Use "boxShadow".',
]);

// Initialise Firebase once at the app root.
// Returns false when env vars are missing → dev-bypass mode activates in AuthProvider.
initFirebase(firebaseOptionsFromEnvironment(process.env as Record<string, string | undefined>));

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <PetProvider>
              <HealthProvider>
                <ExpenseProvider>
                  <RoutineProvider>
                    <MarketplaceProvider>
                      <ServicesProvider>
                        <AuthNavigationGuard>
                          <StatusBar style="dark" />
                          <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
                        </AuthNavigationGuard>
                      </ServicesProvider>
                    </MarketplaceProvider>
                  </RoutineProvider>
                </ExpenseProvider>
              </HealthProvider>
            </PetProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
