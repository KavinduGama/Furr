import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
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
        height: 80, 
        paddingTop: 12, 
        paddingBottom: 24, 
        borderTopColor: colors.line, 
        borderTopWidth: 1,
        backgroundColor: colors.surface, 
        elevation: 0 
      },
      tabBarLabelStyle: { fontWeight: '700', fontSize: 11, marginTop: 4 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="pets" options={{ title: 'Pets', tabBarIcon: icon('paw') }} />
      <Tabs.Screen name="care" options={{ title: 'Records', tabBarIcon: icon('medical') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person') }} />
    </Tabs>
  );
}
