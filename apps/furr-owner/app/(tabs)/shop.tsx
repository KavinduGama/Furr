import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/src/components/screen';
import { colors, radius, space } from '@furr/ui';
import { PRODUCT_CATEGORIES, type ProductCategory, type Product } from '@furr/core';
import { useMarketplace } from '@/src/context/marketplace';
import { usePets } from '@/src/context/pets';

export default function ShopTab() {
  const {
    filteredProducts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    cartItemCount,
    addToCart,
  } = useMarketplace();
  const { selectedPet } = usePets();

  const handleAddToCart = (product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addToCart(product, 1);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>PET MARKETPLACE</Text>
            <Text style={styles.title}>Shop</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/shop/orders' as never)}
              style={styles.ordersBtn}
            >
              <Ionicons name="receipt-outline" size={20} color={colors.ink} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/shop/cart' as never)}
              style={styles.cartIconBtn}
            >
              <Ionicons name="bag-handle-outline" size={22} color={colors.brand} />
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            placeholder="Search food, toys, medicine, beds..."
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>

        {/* Category Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedCategory('all');
            }}
            style={[styles.categoryPill, selectedCategory === 'all' && styles.categoryPillActive]}
          >
            <Ionicons
              name="grid"
              size={14}
              color={selectedCategory === 'all' ? '#FFF' : colors.muted}
            />
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === 'all' && styles.categoryPillTextActive,
              ]}
            >
              All Items
            </Text>
          </Pressable>
          {PRODUCT_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedCategory(cat.id);
                }}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={isActive ? '#FFF' : colors.muted}
                />
                <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Pet-Specific Hero Banner */}
        {selectedCategory === 'all' && searchQuery === '' && (
          <View style={styles.heroCard}>
            <View style={{ flex: 1 }}>
              <View style={styles.heroBadgeWrap}>
                <Text style={styles.heroBadge}>
                  RECOMMENDED FOR {selectedPet ? selectedPet.name.toUpperCase() : 'YOUR PET'}
                </Text>
              </View>
              <Text style={styles.heroTitle}>Premium Nutrition & Essentials</Text>
              <Text style={styles.heroCopy}>
                Formulated for {selectedPet?.breed || 'high energy & immunity'} support.
              </Text>
            </View>
            <View style={styles.heroEmojiWrap}>
              <Text style={{ fontSize: 32 }}>{selectedPet?.species === 'cat' ? '🐟' : '🥩'}</Text>
            </View>
          </View>
        )}

        {/* Product Grid Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all'
              ? 'Featured Products'
              : PRODUCT_CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Products'}
          </Text>
          <Text style={styles.sectionCount}>{filteredProducts.length} items</Text>
        </View>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={48} color={colors.muted} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyCopy}>Try searching for something else or change category.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map((product) => {
              const hasDiscount =
                product.originalPrice && product.originalPrice > product.price;
              const discountPercent = hasDiscount
                ? Math.round(
                    ((product.originalPrice! - product.price) / product.originalPrice!) * 100
                  )
                : 0;

              return (
                <Pressable
                  key={product.id}
                  onPress={() => router.push(`/shop/${product.id}` as never)}
                  style={styles.productCard}
                >
                  <View style={styles.productImgWrap}>
                    <Image
                      source={{ uri: product.imageUrls[0] }}
                      style={styles.productImg}
                      resizeMode="cover"
                    />
                    {hasDiscount && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountBadgeText}>-{discountPercent}%</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.productInfo}>
                    <Text style={styles.productBrand}>{product.brand}</Text>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>

                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
                      <Text style={styles.reviewCount}>({product.reviewCount})</Text>
                    </View>

                    <View style={styles.priceRow}>
                      <View>
                        <Text style={styles.productPrice}>Rs {product.price.toLocaleString()}</Text>
                        {hasDiscount && (
                          <Text style={styles.originalPrice}>
                            Rs {product.originalPrice?.toLocaleString()}
                          </Text>
                        )}
                      </View>
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        style={styles.addCartBtn}
                        hitSlop={6}
                      >
                        <Ionicons name="add" size={18} color="#FFF" />
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: 110 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontSize: 11, fontWeight: '800', color: colors.brand, letterSpacing: 0.8 },
  title: { fontSize: 28, fontWeight: '900', color: colors.ink, letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: space.sm },
  ordersBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  cartIconBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.softBrand,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.brand,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  cartBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    marginTop: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: space.sm,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.ink },
  categoriesRow: { paddingVertical: space.md, gap: 8 },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  categoryPillActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  categoryPillText: { fontSize: 12, fontWeight: '700', color: colors.ink },
  categoryPillTextActive: { color: '#FFF' },
  heroCard: {
    backgroundColor: '#FFF8EE',
    borderRadius: radius.xl,
    padding: space.md,
    marginBottom: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  heroBadgeWrap: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  heroBadge: { color: '#C2410C', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  heroTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  heroCopy: { fontSize: 12, color: colors.muted, marginTop: 2, lineHeight: 16 },
  heroEmojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: space.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.sm,
    marginBottom: space.sm,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  sectionCount: { fontSize: 12, fontWeight: '600', color: colors.muted },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: space.md,
  },
  productCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
  },
  productImgWrap: {
    width: '100%',
    height: 125,
    backgroundColor: colors.mist,
    position: 'relative',
  },
  productImg: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  discountBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  productInfo: { padding: space.sm },
  productBrand: { fontSize: 10, fontWeight: '800', color: colors.muted, textTransform: 'uppercase' },
  productName: { fontSize: 13, fontWeight: '700', color: colors.ink, marginTop: 2, minHeight: 34 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 11, fontWeight: '800', color: colors.ink },
  reviewCount: { fontSize: 10, color: colors.muted },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  productPrice: { fontSize: 14, fontWeight: '900', color: colors.ink },
  originalPrice: { fontSize: 10, color: colors.muted, textDecorationLine: 'line-through' },
  addCartBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: space.xxl, gap: space.sm },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  emptyCopy: { fontSize: 13, color: colors.muted, textAlign: 'center' },
});
