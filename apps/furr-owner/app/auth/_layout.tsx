import { Stack } from 'expo-router';

/**
 * Layout for the /auth group.
 * No header, fade animation, no tab bar.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
