import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, colors, radius, space } from '@furr/ui';
import { useSubscription } from '@/src/context/subscription';

const FEATURES = [
  { icon: 'paw', text: 'Add unlimited pets to your account' },
  { icon: 'document-text', text: 'Generate beautiful PDF health reports' },
  { icon: 'qr-code', text: 'Share secure QR codes with your vet' },
  { icon: 'cloud-upload', text: 'Unlimited secure document storage' },
];

export default function PaywallScreen() {
  const { isPremium, purchaseMonthly, purchaseYearly, restorePurchases } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      if (selectedPlan === 'yearly') {
        await purchaseYearly();
      } else {
        await purchaseMonthly();
      }
      router.back();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      await restorePurchases();
    } finally {
      setLoading(false);
    }
  };

  if (isPremium) {
    return (
      <View style={styles.screen}>
        <View style={styles.successBox}>
          <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          <Text style={styles.successTitle}>You are a Premium Member!</Text>
          <Text style={styles.successCopy}>Thank you for supporting Furr. You have full access to all premium features.</Text>
          <Button label="Go back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header & Back */}
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="star" size={48} color={colors.brand} />
          </View>
          <Text style={styles.title}>Unlock Furr Premium</Text>
          <Text style={styles.subhead}>Give your companions the best care possible with advanced tracking and unlimited features.</Text>
        </View>

        {/* Feature List */}
        <View style={styles.featureList}>
          {FEATURES.map((feat, idx) => (
            <View key={idx} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name={feat.icon as any} size={20} color={colors.brand} />
              </View>
              <Text style={styles.featureText}>{feat.text}</Text>
            </View>
          ))}
        </View>

        {/* Pricing Toggle */}
        <View style={styles.pricingContainer}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setSelectedPlan('yearly')}
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardActive]}
          >
            {selectedPlan === 'yearly' && <View style={styles.popularBadge}><Text style={styles.popularText}>BEST VALUE</Text></View>}
            <View style={styles.planHeader}>
              <View style={[styles.radio, selectedPlan === 'yearly' && styles.radioActive]}>
                {selectedPlan === 'yearly' && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.planTitle, selectedPlan === 'yearly' && styles.planTitleActive]}>Yearly</Text>
            </View>
            <Text style={styles.planPrice}>Rs 2,990 <Text style={styles.planPeriod}>/ year</Text></Text>
            <Text style={styles.planSavings}>Save 50% compared to monthly</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => setSelectedPlan('monthly')}
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardActive]}
          >
            <View style={styles.planHeader}>
              <View style={[styles.radio, selectedPlan === 'monthly' && styles.radioActive]}>
                {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.planTitle, selectedPlan === 'monthly' && styles.planTitleActive]}>Monthly</Text>
            </View>
            <Text style={styles.planPrice}>Rs 490 <Text style={styles.planPeriod}>/ month</Text></Text>
          </Pressable>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <Button 
            label={loading ? 'Processing...' : `Subscribe ${selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'}`} 
            loading={loading}
            onPress={handlePurchase} 
          />
          <Pressable onPress={handleRestore} style={styles.restoreBtn} disabled={loading}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </Pressable>
        </View>

        {/* Legal */}
        <View style={styles.legal}>
          <Text style={styles.legalText}>
            Recurring billing. Cancel anytime. By subscribing, you agree to our <Text style={styles.legalLink}>Terms of Service</Text> and <Text style={styles.legalLink}>Privacy Policy</Text>.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingBottom: space.xxl },
  
  successBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: space.xl, gap: space.md },
  successTitle: { fontSize: 24, fontWeight: '900', color: colors.ink },
  successCopy: { fontSize: 16, color: colors.muted, textAlign: 'center', marginBottom: space.lg },

  topBar: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.sm, alignItems: 'flex-start' },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', shadowColor: colors.ink, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },

  hero: { paddingHorizontal: space.xl, alignItems: 'center', marginTop: space.sm },
  heroIconWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginBottom: space.lg },
  title: { color: colors.ink, fontSize: 32, fontWeight: '900', letterSpacing: -1, textAlign: 'center' },
  subhead: { color: colors.muted, fontSize: 16, textAlign: 'center', marginTop: 12, lineHeight: 24 },

  featureList: { paddingHorizontal: space.xl, marginTop: space.xl, gap: space.md },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.mist, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1, color: colors.ink, fontSize: 15, fontWeight: '600' },

  pricingContainer: { paddingHorizontal: space.lg, marginTop: space.xxl, gap: space.md },
  planCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: space.lg, borderWidth: 2, borderColor: colors.line, position: 'relative' },
  planCardActive: { borderColor: colors.brand, backgroundColor: colors.softBrand },
  
  popularBadge: { position: 'absolute', top: -12, right: 24, backgroundColor: colors.brand, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill },
  popularText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.brand },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.brand },
  planTitle: { fontSize: 18, fontWeight: '800', color: colors.muted },
  planTitleActive: { color: colors.ink },
  
  planPrice: { fontSize: 24, fontWeight: '900', color: colors.ink, marginTop: space.sm, paddingLeft: 32 },
  planPeriod: { fontSize: 16, fontWeight: '600', color: colors.muted },
  planSavings: { fontSize: 13, fontWeight: '800', color: colors.success, marginTop: 4, paddingLeft: 32 },

  actionContainer: { paddingHorizontal: space.lg, marginTop: space.xl },
  restoreBtn: { paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  restoreText: { color: colors.brand, fontSize: 15, fontWeight: '700' },

  legal: { paddingHorizontal: space.xl, marginTop: space.sm },
  legalText: { color: colors.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  legalLink: { fontWeight: '700', color: colors.muted, textDecorationLine: 'underline' },
});
