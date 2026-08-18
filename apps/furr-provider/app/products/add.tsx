import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@furr/ui';
import { PRODUCT_CATEGORIES, type ProductCategory } from '@furr/core';
import { useProviderProducts } from '../../src/context/products';
import { useProviderAuth } from '../../src/context/auth';

export default function AddProductScreen() {
  const router = useRouter();
  const { addProduct } = useProviderProducts();
  const { user } = useProviderAuth();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ProductCategory>('food');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('20');
  const [description, setDescription] = useState('');
  const [species, setSpecies] = useState<'dog' | 'cat' | 'all'>('dog');

  const handleSave = async () => {
    if (!name || !brand || !price) return;

    await addProduct({
      name,
      brand,
      category,
      price: parseInt(price, 10) || 3500,
      originalPrice: originalPrice ? parseInt(originalPrice, 10) : undefined,
      stock: parseInt(stock, 10) || 20,
      inStock: (parseInt(stock, 10) || 20) > 0,
      description: description || 'High quality certified pet food and wellness nutrition.',
      rating: 5.0,
      reviewCount: 0,
      imageUrls: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800'],
      targetSpecies: species === 'all' ? ['dog', 'cat'] : [species],
      sellerId: user?.uid || 'prov-1',
      sellerName: 'Premier Pet Care Studio',
      isFeatured: false,
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Marketplace Product</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Photo Box */}
        <View style={styles.photoBox}>
          <Ionicons name="camera" size={32} color={colors.brand} />
          <Text style={styles.photoBoxTitle}>Product Photo Attached ✓</Text>
          <Text style={styles.photoBoxSub}>High-resolution catalog preview</Text>
        </View>

        {/* Basic Details */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Royal Canin Maxi Adult Dry Dog Food (4kg)"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Brand</Text>
          <TextInput
            style={styles.input}
            value={brand}
            onChangeText={setBrand}
            placeholder="e.g. Royal Canin / Pedigree / Whiskas"
          />
        </View>

        {/* Category Picker */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {PRODUCT_CATEGORIES.map((cat) => {
              const isSel = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryPill, isSel && styles.categoryPillActive]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={[styles.categoryPillText, isSel && { color: '#FFF' }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Pricing & Stock Grid */}
        <View style={styles.rowInputs}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Selling Price (LKR)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="4500"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Original Price (LKR)</Text>
            <TextInput
              style={styles.input}
              value={originalPrice}
              onChangeText={setOriginalPrice}
              keyboardType="numeric"
              placeholder="5000"
            />
          </View>
          <View style={{ width: 80 }}>
            <Text style={styles.label}>Stock</Text>
            <TextInput
              style={styles.input}
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
              placeholder="25"
            />
          </View>
        </View>

        {/* Target Species */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Target Species</Text>
          <View style={styles.speciesRow}>
            {[
              { id: 'dog', label: 'Dogs Only 🐕' },
              { id: 'cat', label: 'Cats Only 🐈' },
              { id: 'all', label: 'All Pets 🐾' },
            ].map((s) => {
              const isSel = species === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.speciesPill, isSel && styles.speciesPillActive]}
                  onPress={() => setSpecies(s.id as any)}
                >
                  <Text style={[styles.speciesPillText, isSel && { color: '#FFF' }]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description & Key Ingredients</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            placeholder="Detailed nutritional info, portion guidelines, and key benefits..."
          />
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="checkmark-done" size={20} color="#FFF" />
          <Text style={styles.saveBtnText}>Publish to Marketplace</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: colors.ink },

  scrollContent: { padding: space.lg, paddingBottom: 110, gap: space.sm },
  photoBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.brand,
    borderStyle: 'dashed',
    marginBottom: space.sm,
  },
  photoBoxTitle: { fontSize: 14, fontWeight: '800', color: colors.brand, marginTop: 4 },
  photoBoxSub: { fontSize: 11, color: colors.muted },

  formGroup: { marginBottom: space.xs },
  label: { fontSize: 11, fontWeight: '800', color: colors.ink, marginBottom: 4, textTransform: 'uppercase' },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    fontSize: 13,
    color: colors.ink,
  },
  rowInputs: { flexDirection: 'row', gap: space.sm, marginBottom: space.sm },
  textArea: { height: 80, textAlignVertical: 'top' },

  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  categoryPillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  categoryPillText: { fontSize: 11, fontWeight: '700', color: colors.ink },

  speciesRow: { flexDirection: 'row', gap: space.sm },
  speciesPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  speciesPillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  speciesPillText: { fontSize: 11, fontWeight: '800', color: colors.ink },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: space.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : space.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  saveBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.brand,
    paddingVertical: 14,
    borderRadius: radius.pill,
  },
  saveBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
});
