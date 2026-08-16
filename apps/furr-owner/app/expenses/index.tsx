import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useMemo, useState, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Image, RefreshControl } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Swipeable } from 'react-native-gesture-handler';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { colors, radius, space, Button, shadows } from '@furr/ui';
import { usePets } from '@/src/context/pets';
import { useExpenses } from '@/src/context/expenses';
import { QuickAddExpenseSheet } from '@/src/components/QuickAddExpenseSheet';

const CATEGORY_COLORS = {
  Vet: '#2D8EC8',
  Food: '#FF9F43',
  Grooming: '#7C5CBF',
  Toys: colors.brand,
  Other: colors.muted
};

export default function ExpensesScreen() {
  const { selectedPet } = usePets();
  const { expenses, totalExpenses, deleteExpense } = useExpenses();
  const sheetRef = useRef<BottomSheetModal>(null);

  const petExpenses = expenses.filter(e => e.petId === selectedPet?.id);
  const petTotal = petExpenses.reduce((sum, e) => sum + e.amount, 0);

  const chartData = useMemo(() => {
    const agg = petExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(agg).map(([category, amount]) => ({
      value: amount,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.Other,
      text: `$${amount}`
    }));
  }, [petExpenses]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Expenses',
          headerStyle: { backgroundColor: colors.canvas },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={() => sheetRef.current?.present()} style={styles.headerBtn}>
              <Ionicons name="add" size={24} color={colors.ink} />
            </Pressable>
          )
        }}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
      >
        
        {petExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={48} color={colors.muted} />
            <Text style={styles.emptyTitle}>No expenses yet</Text>
            <Text style={styles.emptyCopy}>Track {selectedPet?.name}'s spending to see the true cost of care.</Text>
            <Button label="Log first expense" variant="primary" onPress={() => sheetRef.current?.present()} />
          </View>
        ) : (
          <>
            {/* Summary & Chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Total Spending</Text>
              <Text style={styles.chartTotal}>${petTotal.toFixed(2)}</Text>
              
              <View style={styles.chartWrapper}>
                {/* 
                <PieChart
                  data={chartData}
                  donut
                  radius={80}
                  innerRadius={55}
                  innerCircleColor={colors.surface}
                  centerLabelComponent={() => (
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                      <Text style={{fontSize: 22, color: colors.ink, fontWeight: '900'}}>${petTotal}</Text>
                      <Text style={{fontSize: 10, color: colors.muted}}>Total</Text>
                    </View>
                  )}
                />
                */}
              </View>

              {/* Legend */}
              <View style={styles.legendRow}>
                {Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
                  const amt = petExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
                  if (amt === 0) return null;
                  return (
                    <View key={cat} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: color }]} />
                      <Text style={styles.legendText}>{cat}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Recent Expenses List */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Receipts</Text>
            </View>

            {petExpenses.map(expense => (
              <Swipeable
                key={expense.id}
                renderRightActions={() => (
                  <Pressable 
                    onPress={() => deleteExpense(expense.id)}
                    style={styles.deleteAction}
                  >
                    <Ionicons name="trash" size={24} color="#fff" />
                    <Text style={styles.deleteActionText}>Delete</Text>
                  </Pressable>
                )}
                containerStyle={{ overflow: 'visible' }}
                childrenContainerStyle={{ flex: 1 }}
              >
                <View style={styles.expenseCard}>
                  <View style={styles.expenseMain}>
                    <View style={[styles.expenseIcon, { backgroundColor: CATEGORY_COLORS[expense.category] + '20' }]}>
                      <Ionicons 
                        name={expense.category === 'Vet' ? 'medical' : expense.category === 'Food' ? 'restaurant' : expense.category === 'Toys' ? 'baseball' : expense.category === 'Grooming' ? 'cut' : 'receipt'} 
                        size={18} 
                        color={CATEGORY_COLORS[expense.category]} 
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.expenseTitle}>{expense.category}</Text>
                      <Text style={styles.expenseMeta}>{expense.date} {expense.note ? `· ${expense.note}` : ''}</Text>
                      {expense.receiptImageUri && (
                        <View style={styles.receiptThumbWrap}>
                          <Ionicons name="image" size={12} color={colors.brand} />
                          <Text style={styles.receiptThumbText}>Receipt attached</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.expenseAmount}>-${expense.amount.toFixed(2)}</Text>
                  </View>
                  {expense.receiptImageUri && (
                    <View style={styles.receiptPreview}>
                      <Image source={{ uri: expense.receiptImageUri }} style={styles.receiptPreviewImg} />
                    </View>
                  )}
                </View>
              </Swipeable>
            ))}
          </>
        )}

      </ScrollView>
      <QuickAddExpenseSheet ref={sheetRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: space.lg, paddingBottom: space.xxl, gap: space.md },
  headerBtn: { padding: 4 },
  
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md, marginTop: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: colors.ink },
  emptyCopy: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },

  chartCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: space.lg, alignItems: 'center', ...shadows.md },
  chartTitle: { color: colors.muted, fontSize: 14, fontWeight: '700', alignSelf: 'flex-start' },
  chartTotal: { color: colors.ink, fontSize: 32, fontWeight: '900', alignSelf: 'flex-start', marginBottom: space.lg },
  chartWrapper: { marginVertical: space.md, alignItems: 'center' },
  
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.md, marginTop: space.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: colors.ink, fontSize: 12, fontWeight: '600' },

  sectionHeader: { marginTop: space.lg, marginBottom: space.xs },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },

  expenseCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16,  ...shadows.md },
  expenseMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expenseIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  expenseTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  expenseMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  expenseAmount: { color: colors.ink, fontSize: 16, fontWeight: '900' },

  deleteAction: { backgroundColor: colors.danger, justifyContent: 'center', alignItems: 'center', width: 80, height: '100%', borderRadius: radius.xl, marginLeft: space.md },
  deleteActionText: { color: '#fff', fontSize: 12, fontWeight: '800', marginTop: 4 },

  receiptThumbWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, backgroundColor: colors.softBrand, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, alignSelf: 'flex-start' },
  receiptThumbText: { color: colors.brand, fontSize: 10, fontWeight: '700' },
  receiptPreview: { marginTop: space.md, height: 120, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.line },
  receiptPreviewImg: { width: '100%', height: '100%', resizeMode: 'cover' },
});
