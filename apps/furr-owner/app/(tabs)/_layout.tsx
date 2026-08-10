import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { colors } from '@furr/ui';

const icon = (name: keyof typeof Ionicons.glyphMap) => ({ color, focused }: { color: ColorValue; focused: boolean }) => (
  <Ionicons name={focused ? name : `${name}-outline` as keyof typeof Ionicons.glyphMap} size={23} color={color} />
);

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      headerStyle: { backgroundColor: colors.canvas },
      headerShadowVisible: false,
      headerTitleStyle: { color: colors.ink, fontWeight: '800' },
      tabBarActiveTintColor: colors.brand,
      tabBarInactiveTintColor: '#81919A',
      tabBarActiveBackgroundColor: colors.softBrand,
      tabBarStyle: { height: 82, paddingTop: 9, paddingBottom: 9, borderTopColor: colors.line, backgroundColor: '#FFFEFC' },
      tabBarItemStyle: { marginHorizontal: 5, borderRadius: 18 },
      tabBarLabelStyle: { fontWeight: '800', fontSize: 11, marginTop: 2 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="pets" options={{ title: 'Pets', tabBarIcon: icon('paw') }} />
      <Tabs.Screen name="care" options={{ title: 'Care', tabBarIcon: icon('medical') }} />
      <Tabs.Screen name="profile" options={{ title: 'You', tabBarIcon: icon('person') }} />
    </Tabs>
  );
}
