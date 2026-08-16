import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, Button } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { useSubscription } from '@/src/context/subscription';
import { formatPhoneDisplay } from '@furr/core';

const options = [
  { label: 'Account details', detail: 'Name and phone number', icon: 'person', route: null },
  { label: 'Care reminders', detail: 'Upcoming routines and alerts', icon: 'notifications', route: '/reminders/reminders' },
  { label: 'Privacy and sharing', detail: 'Control who can view records', icon: 'shield-checkmark', route: '/sharing/manage-access' },
  { label: 'Help and support', detail: 'Get guidance with FURR', icon: 'help-circle', route: null },
] as const;

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const { isPremium } = useSubscription();
  const name = profile?.displayName ?? 'Furr member';
  const phone = profile?.phoneE164 ? formatPhoneDisplay(profile.phoneE164) : 'Phone number not added';
  
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>SETTINGS</Text>
          <Text style={styles.title}>Your space</Text>
          <Text style={styles.copy}>Preferences, sharing, and support.</Text>
        </View>

        {/* Identity Card */}
        <Pressable 
          accessibilityRole="button" 
          style={({ pressed }) => [styles.identity, pressed && styles.pressed]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.identityInfo}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.phone}>{phone}</Text>
            <View style={styles.member}>
              <Ionicons name="heart" size={14} color={colors.surface} />
              <Text style={styles.memberText}>FURR member</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.surface} />
        </Pressable>

        {/* Furr Premium Banner */}
        <Pressable 
          accessibilityRole="button"
          onPress={() => router.push('/subscription/paywall' as never)}
          style={({ pressed }) => [styles.premiumBanner, pressed && styles.pressedRow]}
        >
          <View style={styles.premiumIconWrap}>
            <Ionicons name="star" size={20} color={colors.brand} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.premiumTitle}>{isPremium ? 'Furr Premium Active' : 'Upgrade to Furr Premium'}</Text>
            <Text style={styles.premiumSub}>{isPremium ? 'Manage your subscription' : 'Unlock unlimited pets and features'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>

        {/* Settings Group */}
        <View style={styles.group}>
          {options.map(({ label, detail, icon, route }, index) => (
            <Pressable 
              accessibilityRole="button" 
              key={label} 
              onPress={() => route && router.push(route as never)} 
              style={({ pressed }) => [styles.row, index < options.length - 1 && styles.rowBorder, pressed && styles.pressedRow]}
            >
              <View style={styles.rowIcon}>
                <Ionicons name={icon} size={20} color={colors.brand} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.detail}>{detail}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        {/* Sign Out */}
        <View style={styles.actions}>
          <Button 
            label="Sign Out" 
            variant="secondary" 
            onPress={signOut} 
            icon={<Ionicons name="log-out-outline" size={20} color={colors.brand} />} 
          />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.canvas },
  content: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.xxl },
  
  header: { marginBottom: space.lg },
  eyebrow: { color: colors.brand, fontWeight: '900', fontSize: 10, letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 32, fontWeight: '900', letterSpacing: -1, marginTop: 4 },
  copy: { color: colors.muted, fontSize: 15, marginTop: 4 },
  
  identity: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.brand, borderRadius: radius.xl, padding: space.lg, shadowColor: colors.brandDark, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 4 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  
  avatar: { height: 64, width: 64, borderRadius: 32, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: colors.brand, fontSize: 28, fontWeight: '900' },
  
  identityInfo: { flex: 1, gap: 2, justifyContent: 'center' },
  name: { color: colors.onBrand, fontSize: 20, fontWeight: '800' },
  phone: { color: colors.brandSoft, fontSize: 14, fontWeight: '600' },
  
  member: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  memberText: { color: colors.surface, fontSize: 12, fontWeight: '800' },
  
  premiumBanner: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: '#FEF3C7', borderRadius: radius.xl, padding: space.lg, marginTop: space.xl, shadowColor: colors.ink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#FDE68A' },
  premiumIconWrap: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  premiumTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  premiumSub: { color: colors.muted, fontSize: 13, fontWeight: '600' },

  group: { marginTop: space.xl, backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.line, shadowColor: colors.ink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  
  row: { padding: space.md, flexDirection: 'row', alignItems: 'center', gap: space.md },
  pressedRow: { backgroundColor: colors.mist },
  rowBorder: { borderBottomColor: colors.line, borderBottomWidth: 1 },
  
  rowIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mist },
  
  rowContent: { flex: 1, gap: 2 },
  label: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  detail: { color: colors.muted, fontSize: 13 },
  
  actions: { marginTop: space.xl, paddingHorizontal: space.lg },
});
