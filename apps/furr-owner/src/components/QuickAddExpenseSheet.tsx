import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert, Keyboard, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { colors, radius, space, Button } from '@furr/ui';
import { usePets } from '@/src/context/pets';
import { useExpenses, ExpenseCategory } from '@/src/context/expenses';

const CATEGORIES: ExpenseCategory[] = ['Vet', 'Food', 'Grooming', 'Toys', 'Other'];

export const QuickAddExpenseSheet = forwardRef<BottomSheetModal>((props, ref) => {
  const { selectedPet } = usePets();
  const { addExpense } = useExpenses();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Vet');
  const [note, setNote] = useState('');
  const [receiptUri, setReceiptUri] = useState<string | null>(null);

  const snapPoints = useMemo(() => ['70%'], []);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

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
      note,
      ...(receiptUri && { receiptImageUri: receiptUri })
    });

    Keyboard.dismiss();
    // @ts-ignore - The ref passed in has a dismiss method
    if (ref && 'current' in ref && ref.current) {
      ref.current.dismiss();
    }
    
    // Reset form
    setAmount('');
    setCategory('Vet');
    setNote('');
    setReceiptUri(null);
  };

  const handlePickReceipt = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.canvas }}
      handleIndicatorStyle={{ backgroundColor: colors.line }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Log Expense</Text>
        </View>

        <View style={styles.amountInputWrap}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
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

        <Text style={styles.label}>Receipt (optional)</Text>
        <Pressable style={styles.receiptBtn} onPress={handlePickReceipt}>
          {receiptUri ? (
            <>
              <Image source={{ uri: receiptUri }} style={styles.receiptImage} />
              <View style={styles.receiptOverlay}>
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={{color: '#fff', fontSize: 12, fontWeight: '700', marginTop: 4}}>Change</Text>
              </View>
            </>
          ) : (
            <>
              <Ionicons name="receipt-outline" size={24} color={colors.brand} />
              <Text style={styles.receiptBtnText}>Attach Photo</Text>
            </>
          )}
        </Pressable>

        <View style={{marginTop: space.xl, paddingBottom: space.xxl}}>
          <Button label="Save Expense" variant="primary" onPress={handleSave} />
        </View>

      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  content: { padding: space.lg },
  header: { alignItems: 'center', marginBottom: space.sm },
  title: { fontSize: 18, fontWeight: '800', color: colors.ink },
  
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

  receiptBtn: { height: 100, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  receiptBtnText: { color: colors.brand, fontSize: 14, fontWeight: '700', marginTop: 8 },
  receiptImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  receiptOverlay: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.5)', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
});
