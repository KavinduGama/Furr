import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '@furr/ui';

const icon = (name: keyof typeof Ionicons.glyphMap) => ({
  color,
  focused,
}: {
  color: ColorValue;
  focused: boolean;
}) => (
  <Ionicons
    name={focused ? name : (`${name}-outline` as keyof typeof Ionicons.glyphMap)}
    size={22}
    color={color}
  />
);

export default function VetTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.canvas },
        headerShadowVisible: false,
        tabBarActiveTintColor: '#006B78',
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          position: 'absolute',
          height: Platform.OS === 'ios' ? 84 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          borderTopColor: colors.line,
          borderTopWidth: StyleSheet.hairlineWidth,
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView intensity={85} tint="light" style={StyleSheet.absoluteFill} />
        ),
        tabBarLabelStyle: { fontWeight: '700', fontSize: 10, marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Duty Desk',
          tabBarIcon: icon('medkit'),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Intake / QR',
          tabBarIcon: icon('qr-code'),
        }}
      />
      <Tabs.Screen
        name="consults"
        options={{
          title: 'Telehealth',
          tabBarIcon: icon('chatbubbles'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: icon('person-circle'),
        }}
      />
    </Tabs>
  );
}
