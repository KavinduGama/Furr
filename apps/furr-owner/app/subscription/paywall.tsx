import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Button, colors, radius, space } from '@furr/ui';
import { useSubscription, SubscriptionTier } from '@/src/context/subscription';
import type { PaymentProvider } from '@furr/core';
import * as Haptics from 'expo-haptics';

const PLUS_FEATURES = [
  { icon: 'paw', text: 'Unlimited pet profiles & care timelines' },
  { icon: 'document-text', text: 'Generate beautiful PDF health reports' },
  { icon: 'qr-code', text: 'Share secure QR codes with your vet' },
  { icon: 'cloud-upload', text: 'High-res medical document storage' },
];

const FAMILY_FEATURES = [
  { icon: 'people', text: 'All Furr+ features for up to 5 family members' },
  { icon: 'calendar', text: 'Shared household feeding & walk calendar' },
  { icon: 'heart', text: 'Priority vet chat & telemedicine queue' },
  { icon: 'shield-checkmark', text: 'Insurance partner discounts' },
];

export default function PaywallScreen() {
  const { isPremium, tier, billingHistory, upgradeTier, restorePurchases } = useSubscription();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('plus');
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('stripe');
  const [period, setPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const success = await upgradeTier(selectedTier, selectedProvider, period);
      if (success) {
        router.back();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await restorePurchases();
    } finally {
      setLoading(false);
    }
  };

  if (isPremium) {
    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.closeBtn}>
              <Ionicons name="close" size={26} color={colors.ink} />
            </Pressable>
          </View>

          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
            <Text style={styles.successTitle}>Active Subscription: Furr {tier.toUpperCase()}</Text>
            <Text style={styles.successCopy}>
              Thank you for supporting Furr! You have full access to all premium features and priority support.
            </Text>
          </View>

          {/* Billing History Section */}
          {billingHistory && billingHistory.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>Billing & Invoices</Text>
              <View style={styles.historyList}>
                {billingHistory.map((inv) => (
                  <View key={inv.id} style={styles.invoiceItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.invTier}>Furr {inv.tier.toUpperCase()} ({inv.period})</Text>
                      <Text style={styles.invDate}>
                        {new Date(inv.createdAt).toLocaleDateString()} · {inv.paymentMethod}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 11, color: colors.success, fontWeight: '700' }}>PAID ✓</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={{ paddingHorizontal: space.lg, marginTop: space.xl }}>
            <Button label="Back to App" onPress={() => router.back()} />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header & Back */}
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={26} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="star" size={44} color={colors.brand} />
          </View>
          <Text style={styles.title}>Unlock Furr Super App</Text>
          <Text style={styles.subhead}>
            Give your pets the ultimate care with unlimited tracking, family sharing, and priority support.
          </Text>
        </View>

        {/* Feature List */}
        <View style={styles.featureList}>
          {(selectedTier === 'family' ? FAMILY_FEATURES : PLUS_FEATURES).map((feat, idx) => (
            <View key={idx} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name={feat.icon as any} size={18} color={colors.brand} />
              </View>
              <Text style={styles.featureText}>{feat.text}</Text>
            </View>
          ))}
        </View>

        {/* Pricing Selection */}
        <View style={styles.pricingContainer}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedTier('plus');
            }}
            style={[styles.planCard, selectedTier === 'plus' && styles.planCardActive]}
          >
            <View style={styles.planHeader}>
              <View style={[styles.radio, selectedTier === 'plus' && styles.radioActive]}>
                {selectedTier === 'plus' && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.planTitle, selectedTier === 'plus' && styles.planTitleActive]}>
                Furr+ Individual
              </Text>
            </View>
            <Text style={styles.planPrice}>
              LKR 499 <Text style={styles.planPeriod}>/ month</Text>
            </Text>
            <Text style={styles.planDesc}>Unlimited pets, PDF export, medical drive</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedTier('family');
            }}
            style={[styles.planCard, selectedTier === 'family' && styles.planCardActive]}
          >
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>BEST VALUE</Text>
            </View>
            <View style={styles.planHeader}>
              <View style={[styles.radio, selectedTier === 'family' && styles.radioActive]}>
                {selectedTier === 'family' && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.planTitle, selectedTier === 'family' && styles.planTitleActive]}>
                Furr Family Pack
              </Text>
            </View>
            <Text style={styles.planPrice}>
              LKR 799 <Text style={styles.planPeriod}>/ month</Text>
            </Text>
            <Text style={styles.planDesc}>Up to 5 family members, shared care, priority vet queue</Text>
          </Pressable>
        </View>

        {/* Payment Provider Selection */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentSectionTitle}>Payment Gateway</Text>
          <View style={styles.providerRow}>
            <Pressable
              onPress={() => setSelectedProvider('stripe')}
              style={[styles.providerBtn, selectedProvider === 'stripe' && styles.providerBtnActive]}
            >
              <Ionicons name="card" size={18} color={selectedProvider === 'stripe' ? colors.brand : colors.muted} />
              <Text style={[styles.providerText, selectedProvider === 'stripe' && styles.providerTextActive]}>
                Credit / Debit Card
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedProvider('payhere')}
              style={[styles.providerBtn, selectedProvider === 'payhere' && styles.providerBtnActive]}
            >
              <Ionicons name="qr-code" size={18} color={selectedProvider === 'payhere' ? colors.brand : colors.muted} />
              <Text style={[styles.providerText, selectedProvider === 'payhere' && styles.providerTextActive]}>
                PayHere / Genie
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <Button
            label={loading ? 'Processing Payment…' : `Subscribe Now · LKR ${selectedTier === 'family' ? '799' : '499'}/mo`}
            onPress={handlePurchase}
            disabled={loading}
          />
          <Pressable accessibilityRole="button" onPress={handleRestore} style={styles.restoreBtn}>
            <Text style={styles.restoreText}>Restore Existing Purchases</Text>
          </Pressable>
        </View>

        {/* Legal Disclaimer */}
        <View style={styles.legal}>
          <Text style={styles.legalText}>
            7-day free trial. Cancel anytime in profile. By subscribing, you agree to our{' '}
            <Text style={styles.legalLink}>Terms</Text> and <Text style={styles.legalLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingBottom: space.xxl },

  successBox: { justifyContent: 'center', alignItems: 'center', padding: space.xl, gap: space.md },
  successTitle: { fontSize: 22, fontWeight: '900', color: colors.ink, textAlign: 'center' },
  successCopy: { fontSize: 15, color: colors.muted, textAlign: 'center', marginBottom: space.sm },

  topBar: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.sm, alignItems: 'flex-start' },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  hero: { paddingHorizontal: space.xl, alignItems: 'center', marginTop: space.xs },
  heroIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  title: { color: colors.ink, fontSize: 28, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center' },
  subhead: { color: colors.muted, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },

  featureList: { paddingHorizontal: space.xl, marginTop: space.lg, gap: space.sm },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.softBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: '600' },

  pricingContainer: { paddingHorizontal: space.lg, marginTop: space.xl, gap: space.md },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 2,
    borderColor: colors.line,
    position: 'relative',
  },
  planCardActive: { borderColor: colors.brand, backgroundColor: '#FFFDF5' },

  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: colors.brand,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  popularText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },

  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.brand },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand },
  planTitle: { fontSize: 17, fontWeight: '800', color: colors.muted },
  planTitleActive: { color: colors.ink },

  planPrice: { fontSize: 22, fontWeight: '900', color: colors.ink, marginTop: space.xs, paddingLeft: 30 },
  planPeriod: { fontSize: 14, fontWeight: '600', color: colors.muted },
  planDesc: { fontSize: 12, color: colors.muted, marginTop: 2, paddingLeft: 30 },

  paymentSection: { paddingHorizontal: space.lg, marginTop: space.lg },
  paymentSectionTitle: { fontSize: 13, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  providerRow: { flexDirection: 'row', gap: space.sm },
  providerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  providerBtnActive: { borderColor: colors.brand, backgroundColor: '#FFFDF5' },
  providerText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  providerTextActive: { color: colors.ink },

  historyContainer: { paddingHorizontal: space.lg, marginTop: space.md },
  historyTitle: { fontSize: 14, fontWeight: '800', color: colors.ink, marginBottom: space.sm },
  historyList: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  invoiceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: space.md, borderBottomWidth: 1, borderBottomColor: colors.line },
  invTier: { fontSize: 13, fontWeight: '800', color: colors.ink },
  invDate: { fontSize: 11, color: colors.muted, marginTop: 2 },
  invAmount: { fontSize: 13, fontWeight: '900', color: colors.ink },

  actionContainer: { paddingHorizontal: space.lg, marginTop: space.xl },
  restoreBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 2 },
  restoreText: { color: colors.brand, fontSize: 14, fontWeight: '700' },

  legal: { paddingHorizontal: space.xl, marginTop: space.xs },
  legalText: { color: colors.muted, fontSize: 11, textAlign: 'center', lineHeight: 16 },
  legalLink: { fontWeight: '700', color: colors.muted, textDecorationLine: 'underline' },
});
