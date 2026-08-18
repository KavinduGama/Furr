import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from '@furr/ui';
import { ProviderAuthProvider } from '../src/context/auth';
import { ProviderProfileProvider } from '../src/context/provider';
import { ProviderBookingsProvider } from '../src/context/bookings';
import { ProviderProductsProvider } from '../src/context/products';
import { ProviderEarningsProvider } from '../src/context/earnings';
import { ProviderChatProvider } from '../src/context/chat';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <ProviderAuthProvider>
            <ProviderProfileProvider>
              <ProviderBookingsProvider>
                <ProviderProductsProvider>
                  <ProviderEarningsProvider>
                    <ProviderChatProvider>
                      <StatusBar style="dark" />
                      <Stack
                        screenOptions={{
                          headerShown: false,
                          animation: 'slide_from_right',
                        }}
                      >
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen
                          name="onboarding/index"
                          options={{
                            headerShown: false,
                            gestureEnabled: false,
                          }}
                        />
                        <Stack.Screen
                          name="bookings/[bookingId]"
                          options={{
                            headerShown: false,
                            presentation: 'card',
                          }}
                        />
                        <Stack.Screen
                          name="bookings/complete"
                          options={{
                            headerShown: false,
                            presentation: 'modal',
                          }}
                        />
                        <Stack.Screen
                          name="products/add"
                          options={{
                            headerShown: false,
                            presentation: 'modal',
                          }}
                        />
                        <Stack.Screen
                          name="chat/[id]"
                          options={{
                            headerShown: false,
                            presentation: 'card',
                          }}
                        />
                        <Stack.Screen
                          name="profile/edit-services"
                          options={{
                            headerShown: false,
                            presentation: 'card',
                          }}
                        />
                        <Stack.Screen
                          name="profile/availability"
                          options={{
                            headerShown: false,
                            presentation: 'card',
                          }}
                        />
                        <Stack.Screen
                          name="profile/portfolio"
                          options={{
                            headerShown: false,
                            presentation: 'card',
                          }}
                        />
                      </Stack>
                    </ProviderChatProvider>
                  </ProviderEarningsProvider>
                </ProviderProductsProvider>
              </ProviderBookingsProvider>
            </ProviderProfileProvider>
          </ProviderAuthProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
