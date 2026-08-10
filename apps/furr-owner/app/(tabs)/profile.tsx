import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@furr/ui';
import { Screen } from '@/src/components/screen';
import { useAuth } from '@/src/context/auth';
import { formatPhoneDisplay } from '@furr/core';

const options = [
  { label: 'Account details', icon: 'person-circle', route: null },
  { label: 'Notifications', icon: 'notifications', route: '/reminders/reminders' },
  { label: 'Privacy and sharing', icon: 'lock-closed', route: '/sharing/manage-access' },
  { label: 'Help centre', icon: 'help-circle', route: null },
] as const;

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();

  const displayName = profile?.displayName ?? 'Furr member';
  const phoneDisplay = profile?.phoneE164 ? formatPhoneDisplay(profile.phoneE164) : '—';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <Screen>
      <View style={styles.top}>
        <Text style={styles.eyebrow}>YOUR FURR SPACE</Text>
        <Text style={styles.title}>Hello, {displayName.split(' ')[0]}</Text>
      </View>

      <View style={styles.person}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.phone}>{phoneDisplay}</Text>
          <View style={styles.member}>
            <Ionicons name="sparkles" size={12} color={colors.brand} />
            <Text style={styles.memberText}>Furr member</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#A3ADB0" />
      </View>

      <Text style={styles.section}>PREFERENCES</Text>
      <View style={styles.optionGroup}>
        {options.map(({ label, icon, route }, index) => (
          <Pressable
            accessibilityRole="button"
            key={label}
            style={[styles.item, index !== options.length - 1 && styles.itemBorder]}
            onPress={() => route && router.push(route as never)}
          >
            <View style={styles.itemIcon}>
              <Ionicons name={icon as never} size={18} color={colors.brand} />
            </View>
            <Text style={styles.label}>{label}</Text>
            <Ionicons name="chevron-forward" size={18} color="#A3ADB0" />
          </Pressable>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        style={styles.signOut}
        onPress={signOut}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>

      <Text style={styles.version}>FURR · VERSION 0.1.0</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { marginTop: 3 },
  eyebrow: { color: colors.brand, fontSize: 10, letterSpacing: 1.2, fontWeight: '900' },
  title: { color: colors.ink, fontSize: 31, fontWeight: '900', letterSpacing: -1.2, marginTop: 4 },
  person: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E6DF',
  },
  avatar: {
    height: 58,
    width: 58,
    borderRadius: 21,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 23 },
  name: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  phone: { color: colors.muted, fontSize: 12, marginTop: 3 },
  member: { flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 8 },
  memberText: { color: colors.brand, fontSize: 11, fontWeight: '800' },
  section: {
    color: '#758187',
    fontWeight: '900',
    letterSpacing: 1.1,
    fontSize: 10,
    marginTop: 7,
  },
  optionGroup: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E6DF',
  },
  item: {
    minHeight: 65,
    paddingHorizontal: 15,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  itemBorder: { borderBottomWidth: 1, borderColor: '#ECE9E2' },
  itemIcon: {
    height: 34,
    width: 34,
    borderRadius: 12,
    backgroundColor: colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: colors.ink, fontWeight: '800', flex: 1 },
  signOut: { alignItems: 'center', paddingVertical: 11 },
  signOutText: { color: colors.danger, fontWeight: '900', fontSize: 13 },
  version: {
    textAlign: 'center',
    color: '#9BA4A6',
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 1,
  },
});
