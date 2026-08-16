import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '@furr/ui';

const icon = (name: keyof typeof Ionicons.glyphMap) => ({ color, focused }: { color: ColorValue; focused: boolean }) => (
  <Ionicons name={focused ? name : (`${name}-outline` as keyof typeof Ionicons.glyphMap)} size={22} color={color} />
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.canvas },
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.ink, fontWeight: '800' },
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          position: 'absolute',
          height: Platform.OS === 'ios' ? 84 : 72,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          borderTopColor: colors.line,
          borderTopWidth: StyleSheet.hairlineWidth,
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        ),
        tabBarLabelStyle: { fontWeight: '700', fontSize: 10, marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop', tabBarIcon: icon('cart') }} />
      <Tabs.Screen name="services" options={{ title: 'Services', tabBarIcon: icon('cut') }} />
      <Tabs.Screen name="care" options={{ title: 'Care', tabBarIcon: icon('medical') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person') }} />
      {/* Hide pets tab from bar since pet selector is integrated into home header and profile */}
      <Tabs.Screen name="pets" options={{ href: null }} />
    </Tabs>
  );
}
