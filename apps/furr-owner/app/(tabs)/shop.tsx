import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/src/components/screen';
import { colors, radius, space } from '@furr/ui';
import { PRODUCT_CATEGORIES } from '@furr/core';
import { usePets } from '@/src/context/pets';

export default function ShopTab() {
  const { selectedPet } = usePets();
  const petName = selectedPet?.name ?? 'Your Pet';

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Pet Shop</Text>
            <Text style={styles.subtitle}>Curated products for {petName}</Text>
          </View>
          <Pressable style={styles.cartIconBtn}>
            <Ionicons name="bag-handle-outline" size={22} color={colors.ink} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>0</Text>
            </View>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.muted} />
          <TextInput
            placeholder="Search food, toys, medicine..."
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            editable={false}
          />
        </View>

        {/* Categories Horizontal */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {PRODUCT_CATEGORIES.map((cat) => (
            <View key={cat.id} style={styles.categoryPill}>
              <Ionicons name={cat.icon as any} size={16} color={colors.brand} />
              <Text style={styles.categoryPillText}>{cat.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Recommended for Your Pet Banner */}
        <View style={styles.heroCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroBadge}>RECOMMENDED FOR {selectedPet?.species === 'cat' ? 'CATS' : 'DOGS'}</Text>
            <Text style={styles.heroTitle}>Royal Canin & Wellness Nutrition</Text>
            <Text style={styles.heroCopy}>Formulated specially for {selectedPet?.breed || 'optimal health'}.</Text>
          </View>
          <View style={styles.heroEmojiWrap}>
            <Text style={{ fontSize: 36 }}>🥩</Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: colors.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 2 },
  cartIconBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  cartBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.brand,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    marginTop: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    gap: space.sm,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.ink },
  categoriesRow: { paddingVertical: space.md, gap: space.sm },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  categoryPillText: { fontSize: 13, fontWeight: '700', color: colors.ink },
  heroCard: {
    backgroundColor: '#FFF8EE',
    borderRadius: radius.xl,
    padding: space.lg,
    marginTop: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  heroBadge: { color: '#EA580C', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  heroTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  heroCopy: { fontSize: 13, color: colors.muted, marginTop: 4, lineHeight: 18 },
  heroEmojiWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: space.sm,
  },
});
