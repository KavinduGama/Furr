import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { useMarketplace } from '@/src/context/marketplace';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, addToCart, cartItemCount } = useMarketplace();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Product not found</Text>
        <Button label="Back to Shop" onPress={() => router.back()} />
      </View>
    );
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      Alert.alert('Out of Stock', 'Sorry, this product is currently out of stock.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: product.brand,
          headerStyle: { backgroundColor: colors.canvas },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={() => router.push('/shop/cart' as never)} style={styles.headerBtn}>
              <Ionicons name="bag-handle-outline" size={22} color={colors.ink} />
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                </View>
              )}
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image Gallery */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.imageUrls[0] }} style={styles.heroImage} resizeMode="cover" />
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>SAVE {discountPercent}%</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoCard}>
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>{product.brand}</Text>
            <View style={styles.stockBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.stockText}>In Stock ({product.stock} left)</Text>
            </View>
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={16}
                  color={star <= Math.round(product.rating) ? '#F59E0B' : colors.line}
                />
              ))}
            </View>
            <Text style={styles.ratingValue}>{product.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>· {product.reviewCount} customer reviews</Text>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>Rs {product.price.toLocaleString()}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>Rs {product.originalPrice?.toLocaleString()}</Text>
            )}
          </View>

          {/* Seller / Vendor */}
          <View style={styles.sellerRow}>
            <View style={styles.sellerIcon}>
              <Ionicons name="storefront-outline" size={18} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sellerLabel}>Sold and dispatched by</Text>
              <Text style={styles.sellerName}>{product.sellerName}</Text>
            </View>
            <Ionicons name="shield-checkmark" size={18} color={colors.brand} />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>

          {/* Key Features */}
          {product.features && product.features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Key Benefits</Text>
              <View style={styles.featuresList}>
                {product.features.map((feat, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={colors.brand} />
                    <Text style={styles.featureText}>{feat}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantitySelector}>
          <Pressable
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={styles.qtyBtn}
            hitSlop={8}
          >
            <Ionicons name="remove" size={18} color={colors.ink} />
          </Pressable>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <Pressable
            onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
            style={styles.qtyBtn}
            hitSlop={8}
          >
            <Ionicons name="add" size={18} color={colors.ink} />
          </Pressable>
        </View>

        <Pressable
          onPress={handleAddToCart}
          disabled={isOutOfStock}
          style={[styles.actionBtn, isOutOfStock && { backgroundColor: '#9E9E9E' }, added && styles.actionBtnSuccess]}
        >
          <Ionicons name={isOutOfStock ? 'alert-circle' : added ? 'checkmark' : 'bag-add'} size={20} color="#FFF" />
          <Text style={styles.actionBtnText}>
            {isOutOfStock ? 'Out of Stock' : added ? 'Added to Cart!' : `Add Rs ${(product.price * quantity).toLocaleString()}`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  headerBtn: { padding: 6, position: 'relative' },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.brand,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  content: { paddingBottom: 110 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md },
  notFoundText: { fontSize: 18, fontWeight: '800', color: colors.ink },

  imageContainer: { width: '100%', height: 260, backgroundColor: colors.mist, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  discountBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '900' },

  infoCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -20,
    padding: space.lg,
  },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandText: { fontSize: 12, fontWeight: '900', color: colors.brand, textTransform: 'uppercase' },
  stockBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stockText: { fontSize: 12, fontWeight: '700', color: colors.success },
  productName: { fontSize: 20, fontWeight: '900', color: colors.ink, marginTop: 6, lineHeight: 26 },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.sm },
  stars: { flexDirection: 'row', gap: 2 },
  ratingValue: { fontSize: 14, fontWeight: '800', color: colors.ink },
  reviewCount: { fontSize: 13, color: colors.muted },

  priceContainer: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm, marginTop: space.md },
  price: { fontSize: 28, fontWeight: '900', color: colors.ink },
  originalPrice: { fontSize: 16, color: colors.muted, textDecorationLine: 'line-through' },

  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.canvas,
    borderRadius: radius.xl,
    padding: space.md,
    marginTop: space.lg,
  },
  sellerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.softBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerLabel: { fontSize: 11, color: colors.muted },
  sellerName: { fontSize: 14, fontWeight: '800', color: colors.ink, marginTop: 1 },

  section: { marginTop: space.xl },
  sectionHeading: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: space.sm },
  descriptionText: { fontSize: 14, color: colors.muted, lineHeight: 22 },

  featuresList: { gap: space.sm },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 14, color: colors.ink, fontWeight: '600', flex: 1 },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.canvas,
    borderRadius: radius.xl,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  qtyBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  qtyValue: { fontSize: 15, fontWeight: '900', color: colors.ink },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brand,
    paddingVertical: 14,
    borderRadius: radius.xl,
  },
  actionBtnSuccess: { backgroundColor: colors.success },
  actionBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
