import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@furr/ui';
import type { PayoutMethod } from '@furr/core';
import { useProviderEarnings } from '../../src/context/earnings';
import { useProviderProfile } from '../../src/context/provider';

const MOCK_CHART_DAYS = [
  { day: '05', val: 4500 },
  { day: '06', val: 7000 },
  { day: '07', val: 3000 },
  { day: '08', val: 9500 },
  { day: '09', val: 6200 },
  { day: '10', val: 12000 },
  { day: '11', val: 4000 },
  { day: '12', val: 8500 },
  { day: '13', val: 11000 },
  { day: '14', val: 5500 },
  { day: '15', val: 14000 },
  { day: '16', val: 9000 },
  { day: '17', val: 16500 },
  { day: '18', val: 7000 },
];

export default function EarningsScreen() {
  const { summary, breakdown, payouts, requestPayout } = useProviderEarnings();
  const { profile } = useProviderProfile();

  const [payoutModalVisible, setPayoutModalVisible] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState(summary.availableBalance.toString());
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>('bank_transfer');
  const [destinationDetails, setDestinationDetails] = useState(
    profile?.bankDetails?.accountNumber
      ? `${profile.bankDetails.bankName} - ****${profile.bankDetails.accountNumber.slice(-4)}`
      : 'Commercial Bank - ****1938'
  );

  const handleConfirmPayout = async () => {
    const amt = parseInt(payoutAmount, 10);
    if (!amt || amt <= 0) return;
    await requestPayout(amt, payoutMethod, destinationDetails);
    setPayoutModalVisible(false);
  };

  const maxChartVal = Math.max(...MOCK_CHART_DAYS.map((d) => d.val));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Studio Earnings & Payouts</Text>
          <Text style={styles.headerSubtitle}>
            Track multi-stream service revenue, marketplace sales, and direct bank settlements.
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Available Balance & Payout CTA */}
        <View style={styles.balanceHeroCard}>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceVal}>
              LKR {summary.availableBalance.toLocaleString()}
            </Text>
            <Text style={styles.pendingPayoutText}>
              Pending in transit: LKR {summary.pendingPayout.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.requestPayoutBtn}
            onPress={() => setPayoutModalVisible(true)}
          >
            <Ionicons name="arrow-up-circle" size={20} color="#FFF" />
            <Text style={styles.requestPayoutBtnText}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* Revenue Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardVal}>LKR {summary.todayRevenue.toLocaleString()}</Text>
            <Text style={styles.summaryCardSub}>Today's Revenue</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardVal}>LKR {summary.weekRevenue.toLocaleString()}</Text>
            <Text style={styles.summaryCardSub}>This Week</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardVal}>LKR {summary.monthRevenue.toLocaleString()}</Text>
            <Text style={styles.summaryCardSub}>This Month</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardVal}>LKR {summary.lifetimeRevenue.toLocaleString()}</Text>
            <Text style={styles.summaryCardSub}>Lifetime Gross</Text>
          </View>
        </View>

        {/* 14-Day Revenue Trend SVG Bar Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>14-Day Revenue Trend (LKR)</Text>
            <Text style={styles.chartSub}>Daily total earnings</Text>
          </View>

          <View style={{ alignItems: 'center', marginTop: space.sm }}>
            <Svg width="100%" height="140" viewBox="0 0 320 140">
              {/* Baseline */}
              <Line x1="0" y1="120" x2="320" y2="120" stroke={colors.line} strokeWidth="1" />

              {MOCK_CHART_DAYS.map((d, i) => {
                const barWidth = 14;
                const gap = 8;
                const x = i * (barWidth + gap) + 8;
                const barHeight = Math.round((d.val / maxChartVal) * 95);
                const y = 120 - barHeight;
                const isLatest = i === MOCK_CHART_DAYS.length - 1;

                return (
                  <React.Fragment key={i}>
                    <Rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="3"
                      fill={isLatest ? colors.brand : colors.softBrand}
                    />
                    <SvgText
                      x={x + barWidth / 2}
                      y="135"
                      fontSize="9"
                      fill={colors.muted}
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {d.day}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>
        </View>

        {/* Financial Breakdown Table */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Monthly Revenue Breakdown</Text>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItemLabel}>
              <Ionicons name="cut" size={16} color={colors.brand} />
              <Text style={styles.breakdownLabelText}>Service Bookings Gross</Text>
            </View>
            <Text style={styles.breakdownValText}>
              LKR {breakdown.serviceRevenue.toLocaleString()}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItemLabel}>
              <Ionicons name="cart" size={16} color={colors.accent} />
              <Text style={styles.breakdownLabelText}>Product Sales Gross</Text>
            </View>
            <Text style={styles.breakdownValText}>
              LKR {breakdown.productRevenue.toLocaleString()}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItemLabel}>
              <Ionicons name="heart" size={16} color={colors.danger} />
              <Text style={styles.breakdownLabelText}>Client Tips (100% to you)</Text>
            </View>
            <Text style={styles.breakdownValText}>
              LKR {breakdown.tipsReceived.toLocaleString()}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItemLabel}>
              <Ionicons name="receipt" size={16} color={colors.muted} />
              <Text style={styles.breakdownLabelText}>Platform Commissions (8-10%)</Text>
            </View>
            <Text style={[styles.breakdownValText, { color: colors.danger }]}>
              - LKR {breakdown.platformFees.toLocaleString()}
            </Text>
          </View>

          <View style={[styles.breakdownRow, styles.breakdownTotalRow]}>
            <Text style={styles.breakdownTotalLabel}>Net Partner Earnings</Text>
            <Text style={styles.breakdownTotalVal}>
              LKR {breakdown.netPayout.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Payout History */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payout Transfer History</Text>
          <Text style={styles.sectionSub}>Deposited directly to your linked Sri Lanka account</Text>
        </View>

        <View style={styles.payoutList}>
          {payouts.map((p) => (
            <View key={p.id} style={styles.payoutCard}>
              <View style={styles.payoutTop}>
                <View>
                  <Text style={styles.payoutAmount}>LKR {p.amount.toLocaleString()}</Text>
                  <Text style={styles.payoutDest}>{p.destinationDetails}</Text>
                </View>

                <View
                  style={[
                    styles.payoutBadge,
                    p.status === 'completed' && { backgroundColor: colors.calm },
                    p.status === 'pending' && { backgroundColor: colors.warm },
                  ]}
                >
                  <Text
                    style={[
                      styles.payoutBadgeText,
                      p.status === 'completed' && { color: colors.success },
                      p.status === 'pending' && { color: colors.accent },
                    ]}
                  >
                    {p.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.payoutFooter}>
                <Text style={styles.payoutDate}>
                  Requested: {new Date(p.requestedAt).toLocaleDateString()}
                </Text>
                {p.referenceNumber && (
                  <Text style={styles.payoutRef}>Ref: {p.referenceNumber}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Payout Withdrawal Modal */}
      <Modal visible={payoutModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Payout Transfer</Text>
              <TouchableOpacity onPress={() => setPayoutModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.ink} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Available balance: LKR {summary.availableBalance.toLocaleString()}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Withdrawal Amount (LKR)</Text>
              <TextInput
                style={styles.input}
                value={payoutAmount}
                onChangeText={setPayoutAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Payout Method</Text>
              <View style={styles.methodRow}>
                <TouchableOpacity
                  style={[
                    styles.methodPill,
                    payoutMethod === 'bank_transfer' && styles.methodPillActive,
                  ]}
                  onPress={() => {
                    setPayoutMethod('bank_transfer');
                    setDestinationDetails('Commercial Bank - ****1938');
                  }}
                >
                  <Text
                    style={[
                      styles.methodPillText,
                      payoutMethod === 'bank_transfer' && { color: '#FFF' },
                    ]}
                  >
                    Bank Transfer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.methodPill,
                    payoutMethod === 'dialog_genie' && styles.methodPillActive,
                  ]}
                  onPress={() => {
                    setPayoutMethod('dialog_genie');
                    setDestinationDetails('Dialog Genie - 0771234567');
                  }}
                >
                  <Text
                    style={[
                      styles.methodPillText,
                      payoutMethod === 'dialog_genie' && { color: '#FFF' },
                    ]}
                  >
                    Dialog Genie
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Destination Account / Wallet</Text>
              <TextInput
                style={styles.input}
                value={destinationDetails}
                onChangeText={setDestinationDetails}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setPayoutModalVisible(false)}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmPayoutBtn}
                onPress={handleConfirmPayout}
              >
                <Text style={styles.confirmPayoutBtnText}>Confirm Transfer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: colors.ink },
  headerSubtitle: { fontSize: 12, color: colors.muted, marginTop: 2 },

  scrollContent: { padding: space.lg, paddingBottom: 110 },

  balanceHeroCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: colors.brand,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  balanceLabel: { fontSize: 12, fontWeight: '800', color: colors.muted, textTransform: 'uppercase' },
  balanceVal: { fontSize: 26, fontWeight: '900', color: colors.ink, marginVertical: 2 },
  pendingPayoutText: { fontSize: 11, color: colors.muted },
  requestPayoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  requestPayoutBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  summaryCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  summaryCardVal: { fontSize: 16, fontWeight: '900', color: colors.ink },
  summaryCardSub: { fontSize: 11, color: colors.muted, marginTop: 2 },

  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: space.md,
  },
  chartHeader: { marginBottom: 4 },
  chartTitle: { fontSize: 14, fontWeight: '800', color: colors.ink },
  chartSub: { fontSize: 11, color: colors.muted },

  breakdownCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: space.md,
    gap: space.sm,
  },
  breakdownTitle: { fontSize: 14, fontWeight: '900', color: colors.ink, marginBottom: 4 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  breakdownItemLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  breakdownLabelText: { fontSize: 12, color: colors.ink, fontWeight: '600' },
  breakdownValText: { fontSize: 13, fontWeight: '800', color: colors.ink },
  breakdownTotalRow: {
    marginTop: space.xs,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  breakdownTotalLabel: { fontSize: 13, fontWeight: '900', color: colors.ink },
  breakdownTotalVal: { fontSize: 16, fontWeight: '900', color: colors.brand },

  sectionHeader: { marginTop: space.xl, marginBottom: space.sm },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: colors.ink },
  sectionSub: { fontSize: 11, color: colors.muted },

  payoutList: { gap: space.sm },
  payoutCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  payoutTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  payoutAmount: { fontSize: 15, fontWeight: '900', color: colors.ink },
  payoutDest: { fontSize: 11, color: colors.muted, marginTop: 2 },
  payoutBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  payoutBadgeText: { fontSize: 10, fontWeight: '800' },
  payoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  payoutDate: { fontSize: 10, color: colors.muted },
  payoutRef: { fontSize: 10, fontWeight: '700', color: colors.brand },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: space.xl,
    paddingBottom: space.xl,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  modalSubtitle: { fontSize: 12, color: colors.muted, marginBottom: space.md },
  formGroup: { marginBottom: space.md },
  label: { fontSize: 11, fontWeight: '800', color: colors.ink, marginBottom: 4, textTransform: 'uppercase' },
  input: {
    backgroundColor: colors.canvas,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.ink,
  },
  methodRow: { flexDirection: 'row', gap: space.sm },
  methodPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  methodPillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  methodPillText: { fontSize: 12, fontWeight: '800', color: colors.ink },
  modalActions: { flexDirection: 'row', gap: space.md, marginTop: space.sm },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
    alignItems: 'center',
  },
  cancelModalBtnText: { fontSize: 13, fontWeight: '800', color: colors.ink },
  confirmPayoutBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: 'center',
  },
  confirmPayoutBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
});
