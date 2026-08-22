import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, TextInput, ScrollView, Alert } from 'react-native';
import { colors, radius, space, Button } from '@furr/ui';
import { usePets } from '@/src/context/pets';
import { useExpenses, ExpenseCategory } from '@/src/context/expenses';

const CATEGORIES: ExpenseCategory[] = ['Vet', 'Food', 'Grooming', 'Toys', 'Other'];

export default function AddExpenseScreen() {
  const { selectedPet } = usePets();
  const { addExpense } = useExpenses();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Vet');
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (!selectedPet) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid expense amount.');
      return;
    }

    addExpense({
      petId: selectedPet.id,
      amount: numAmount,
      category,
      date: new Date().toISOString().slice(0, 10),
      note
    });

    router.back();
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Log Expense',
          headerStyle: { backgroundColor: colors.canvas },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerBtn}>
              <Ionicons name="close" size={24} color={colors.ink} />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.amountInputWrap}>
          <Text style={styles.currencySymbol}>Rs.</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <Pressable 
              key={cat} 
              style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Note (optional)</Text>
        <TextInput
          style={styles.textInput}
          value={note}
          onChangeText={setNote}
          placeholder="e.g. Annual Checkup, Premium Kibble"
          placeholderTextColor={colors.muted}
        />

        <View style={{marginTop: space.xl}}>
          <Button label="Save Expense" variant="primary" onPress={handleSave} />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: space.lg },
  headerBtn: { padding: 4 },
  
  amountInputWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: space.xl },
  currencySymbol: { fontSize: 32, fontWeight: '900', color: colors.muted, marginRight: 8 },
  amountInput: { fontSize: 48, fontWeight: '900', color: colors.ink, minWidth: 100 },
  
  label: { color: colors.ink, fontSize: 14, fontWeight: '800', marginBottom: space.sm, marginTop: space.lg },
  
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  categoryBtnActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  categoryText: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  categoryTextActive: { color: '#fff' },

  textInput: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, fontSize: 16, color: colors.ink, borderWidth: 1, borderColor: colors.line },
});
