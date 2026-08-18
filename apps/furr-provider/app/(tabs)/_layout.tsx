import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';
import { StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '@furr/ui';
import { useProviderBookings } from '../../src/context/bookings';
import { useProviderProfile } from '../../src/context/provider';

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

export default function ProviderTabsLayout() {
  const { pendingCount } = useProviderBookings();
  const { profile } = useProviderProfile();

  const isVendor = profile?.isMarketplaceVendor !== false;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.canvas },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          position: 'absolute',
          height: Platform.OS === 'ios' ? 84 : 72,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          borderTopColor: colors.line,
          borderTopWidth: StyleSheet.hairlineWidth,
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        ),
        tabBarLabelStyle: { fontWeight: '700', fontSize: 10, marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Studio',
          tabBarIcon: icon('speedometer'),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: icon('calendar'),
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.danger, fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: icon('cart'),
          href: isVendor ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: icon('wallet'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: icon('person'),
        }}
      />
    </Tabs>
  );
}
