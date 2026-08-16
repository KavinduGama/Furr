import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { VetAuthProvider } from '@/src/context/auth';
import { VetGrantsProvider } from '@/src/context/grants';
import { VetConsultsProvider } from '@/src/context/consults';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <VetAuthProvider>
          <VetGrantsProvider>
            <VetConsultsProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
            </VetConsultsProvider>
          </VetGrantsProvider>
        </VetAuthProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
