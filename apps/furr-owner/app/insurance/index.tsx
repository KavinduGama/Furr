import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Modal } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { useFamily } from '@/src/context/family';
import { usePets } from '@/src/context/pets';

const SRI_LANKA_PLANS = [
  {
    name: 'Ceylinco PetCare Basic',
    annualLimit: 'Rs 100,000',
    monthlyPremium: 'Rs 1,800',
    coverage: ['Accidental Injuries', 'Emergency Surgery'],
    recommendedFor: 'Young indoor cats & low-risk pets',
  },
  {
    name: 'Ceylinco PetCare Comprehensive',
    annualLimit: 'Rs 250,000',
    monthlyPremium: 'Rs 3,200',
    coverage: ['Illness & Accidents', 'Hospitalization', 'Diagnostics & Scans', 'Prescription Meds'],
    recommendedFor: 'Active dogs, retrievers & Frenchies',
  },
  {
    name: 'Fairfirst Pet Protect Gold',
    annualLimit: 'Rs 500,000',
    monthlyPremium: 'Rs 5,500',
    coverage: ['Full Medical', 'Third Party Liability', 'Lost Pet Recovery Reward', 'Specialist Surgery'],
    recommendedFor: 'Show dogs, multi-pet households & seniors',
  },
];

export default function PetInsuranceScreen() {
  const { insurancePolicies, insuranceClaims, fileClaim } = useFamily();
  const { selectedPet } = usePets();

  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [incidentDesc, setIncidentDesc] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activePolicy = insurancePolicies[0];

  const handleFileClaim = async () => {
    if (!incidentDesc.trim() || !claimAmount.trim()) {
      Alert.alert('Missing Details', 'Please enter incident description and claim amount.');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await fileClaim({
      policyId: activePolicy?.id || 'policy-1',
      claimDate: new Date().toISOString().slice(0, 10),
      incidentDescription: incidentDesc,
      claimAmountLkr: parseFloat(claimAmount) || 5000,
      receiptUrls: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'],
    });

    setIsSubmitting(false);
    setClaimModalVisible(false);
    setIncidentDesc('');
    setClaimAmount('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Claim Submitted! 📄', 'Your digital claim packet has been prepared and sent to the insurer.');
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Pet Insurance & Claims',
          headerStyle: { backgroundColor: colors.canvas },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Policy Card */}
        {activePolicy ? (
          <View style={styles.policyCard}>
            <View style={styles.policyHeader}>
              <View>
                <Text style={styles.policyProvider}>{activePolicy.providerName}</Text>
                <Text style={styles.policyNumber}>Policy #{activePolicy.policyNumber}</Text>
              </View>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            </View>

            <View style={styles.policyLimitsRow}>
              <View style={styles.limitBox}>
                <Text style={styles.limitLabel}>Annual Coverage</Text>
                <Text style={styles.limitValue}>Rs {activePolicy.annualLimitLkr.toLocaleString()}</Text>
              </View>
              <View style={styles.limitBox}>
                <Text style={styles.limitLabel}>Deductible</Text>
                <Text style={styles.limitValue}>Rs {activePolicy.deductibleLkr.toLocaleString()}</Text>
              </View>
              <View style={styles.limitBox}>
                <Text style={styles.limitLabel}>Monthly</Text>
                <Text style={styles.limitValue}>Rs {activePolicy.monthlyPremiumLkr.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.coverageList}>
              <Text style={styles.coverageHeading}>Covered Treatments:</Text>
              <View style={styles.coveragePills}>
                {activePolicy.coveredCategories.map((cat, i) => (
                  <View key={i} style={styles.covPill}>
                    <Text style={styles.covPillText}>✓ {cat}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.policyActions}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setClaimModalVisible(true);
                }}
                style={styles.fileClaimBtn}
              >
                <Ionicons name="receipt-outline" size={16} color="#FFF" />
                <Text style={styles.fileClaimBtnText}>File Insurance Claim</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* Claims History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Claims & Reimbursements</Text>
          <View style={styles.claimsList}>
            {insuranceClaims.map((claim) => (
              <View key={claim.id} style={styles.claimCard}>
                <View style={styles.claimHeader}>
                  <Text style={styles.claimDesc}>{claim.incidentDescription}</Text>
                  <View style={styles.claimStatusBadge}>
                    <Text style={styles.claimStatusText}>{claim.status.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.claimFooter}>
                  <Text style={styles.claimAmount}>Rs {claim.claimAmountLkr.toLocaleString()}</Text>
                  <Text style={styles.claimDate}>Submitted {claim.claimDate}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Comparison Calculator / Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compare Pet Insurance Plans</Text>
          <Text style={styles.sectionSub}>Partnered providers for Sri Lanka pet owners</Text>

          <View style={styles.plansList}>
            {SRI_LANKA_PLANS.map((plan, idx) => (
              <View key={idx} style={styles.planCard}>
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>{plan.monthlyPremium}/mo</Text>
                </View>
                <Text style={styles.planLimit}>Coverage Limit: {plan.annualLimit}/yr</Text>
                <Text style={styles.planRec}>Best for: {plan.recommendedFor}</Text>

                <View style={styles.planPills}>
                  {plan.coverage.map((c, i) => (
                    <View key={i} style={styles.planPill}>
                      <Text style={styles.planPillText}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* File Claim Modal */}
      <Modal visible={claimModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Prepare Insurance Claim</Text>
              <Pressable onPress={() => setClaimModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.ink} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: space.md, paddingBottom: 20 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Incident or Treatment Description</Text>
                <TextInput
                  placeholder="e.g. Emergency gastro treatment & IV fluids at clinic..."
                  placeholderTextColor={colors.muted}
                  value={incidentDesc}
                  onChangeText={setIncidentDesc}
                  multiline
                  numberOfLines={3}
                  style={[styles.textInput, { minHeight: 80, textAlignVertical: 'top' }]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Claim Amount (LKR)</Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="e.g. 15000"
                  placeholderTextColor={colors.muted}
                  value={claimAmount}
                  onChangeText={setClaimAmount}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.receiptAttachBox}>
                <Ionicons name="attach" size={20} color={colors.brand} />
                <Text style={styles.receiptAttachText}>Auto-attaching receipts from Expense Tracker (1 item)</Text>
              </View>

              <View style={{ marginTop: space.sm }}>
                <Button
                  label={isSubmitting ? 'Submitting Claim...' : 'Submit Claim Packet'}
                  loading={isSubmitting}
                  onPress={handleFileClaim}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  headerBtn: { padding: 6 },
  content: { padding: space.lg, paddingBottom: space.xxl, gap: space.xl },

  policyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    gap: space.md,
  },
  policyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  policyProvider: { fontSize: 18, fontWeight: '900', color: colors.ink },
  policyNumber: { fontSize: 12, color: colors.muted, marginTop: 2 },
  activeBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
  activeBadgeText: { fontSize: 10, fontWeight: '900', color: '#166534' },

  policyLimitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.canvas,
    borderRadius: radius.lg,
    padding: space.md,
  },
  limitBox: { alignItems: 'center' },
  limitLabel: { fontSize: 10, fontWeight: '700', color: colors.muted },
  limitValue: { fontSize: 15, fontWeight: '900', color: colors.ink, marginTop: 2 },

  coverageList: { gap: 6 },
  coverageHeading: { fontSize: 12, fontWeight: '800', color: colors.muted },
  coveragePills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  covPill: { backgroundColor: colors.softBrand, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  covPillText: { fontSize: 11, fontWeight: '700', color: colors.brand },

  policyActions: { marginTop: space.xs },
  fileClaimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brand,
    paddingVertical: 12,
    borderRadius: radius.lg,
  },
  fileClaimBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },

  section: { gap: space.sm },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
  sectionSub: { fontSize: 12, color: colors.muted, marginTop: -4 },

  claimsList: { gap: space.sm },
  claimCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  claimHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  claimDesc: { fontSize: 13, fontWeight: '700', color: colors.ink, flex: 1 },
  claimStatusBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  claimStatusText: { fontSize: 10, fontWeight: '900', color: '#B45309' },
  claimFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.sm,
    paddingTop: space.xs,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  claimAmount: { fontSize: 14, fontWeight: '900', color: colors.ink },
  claimDate: { fontSize: 11, color: colors.muted },

  plansList: { gap: space.md, marginTop: space.xs },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 4,
  },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontSize: 15, fontWeight: '800', color: colors.ink },
  planPrice: { fontSize: 14, fontWeight: '900', color: colors.brand },
  planLimit: { fontSize: 12, fontWeight: '700', color: colors.ink },
  planRec: { fontSize: 11, color: colors.muted, fontStyle: 'italic' },
  planPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  planPill: { backgroundColor: colors.canvas, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  planPillText: { fontSize: 10, fontWeight: '600', color: colors.muted },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: space.lg,
    maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.md },
  modalTitle: { fontSize: 18, fontWeight: '900', color: colors.ink },
  closeBtn: { padding: 4 },

  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '800', color: colors.ink },
  textInput: {
    backgroundColor: colors.canvas,
    borderRadius: radius.xl,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
  },
  receiptAttachBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.softBrand,
    padding: space.md,
    borderRadius: radius.lg,
  },
  receiptAttachText: { fontSize: 12, fontWeight: '700', color: colors.brand, flex: 1 },
});
