import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '@furr/ui';

const icon = (name: keyof typeof Ionicons.glyphMap) => ({ color, focused }: { color: ColorValue; focused: boolean }) => (
  <Ionicons name={focused ? name : `${name}-outline` as keyof typeof Ionicons.glyphMap} size={24} color={color} />
);

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      headerStyle: { backgroundColor: colors.canvas },
      headerShadowVisible: false,
      headerTitleStyle: { color: colors.ink, fontWeight: '800' },
      tabBarActiveTintColor: colors.brand,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { 
        position: 'absolute',
        height: 80, 
        paddingTop: 12, 
        paddingBottom: 24, 
        borderTopColor: colors.line, 
        borderTopWidth: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255, 255, 255, 0.6)', 
        elevation: 0 
      },
      tabBarBackground: () => (
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
      ),
      tabBarLabelStyle: { fontWeight: '700', fontSize: 11, marginTop: 4 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="pets" options={{ title: 'Pets', tabBarIcon: icon('paw') }} />
      <Tabs.Screen name="care" options={{ title: 'Records', tabBarIcon: icon('medical') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person') }} />
    </Tabs>
  );
}
