import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { useMarketplace } from '@/src/context/marketplace';
import { useAuth } from '@/src/context/auth';

export default function CartScreen() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    discountAmount,
    placeOrder,
  } = useMarketplace();
  const { profile } = useAuth();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Delivery Address State
  const [fullName, setFullName] = useState(profile?.displayName || 'Pet Owner');
  const [phone, setPhone] = useState(profile?.phoneE164 || '+94771234567');
  const [streetAddress, setStreetAddress] = useState('No. 45, Flower Road');
  const [city, setCity] = useState(profile?.district || 'Colombo');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'wallet'>('cod');

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleApplyCoupon = () => {
    if (applyCoupon(couponCode)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCouponError('');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setCouponError('Invalid coupon code. Try "FURR10"');
    }
  };

  const handleCheckout = async () => {
    if (!fullName.trim() || !streetAddress.trim() || !city.trim()) {
      Alert.alert('Incomplete Address', 'Please provide a valid delivery address.');
      return;
    }

    setIsCheckingOut(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const order = await placeOrder(
        { fullName, phone, streetAddress, city },
        paymentMethod
      );
      if (order) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Order Placed! 🎉',
          `Your order has been received and will be delivered by ${order.estimatedDelivery}.`,
          [
            {
              text: 'View Orders',
              onPress: () => router.replace('/shop/orders' as never),
            },
          ]
        );
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Checkout Error', 'Unable to complete order. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cart.length === 0) {
    return (
      <View style={styles.emptyScreen}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Your Cart',
            headerStyle: { backgroundColor: colors.canvas },
            headerShadowVisible: false,
            headerLeft: () => (
              <Pressable onPress={() => router.back()} style={styles.headerBtn}>
                <Ionicons name="arrow-back" size={24} color={colors.ink} />
              </Pressable>
            ),
          }}
        />
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bag-handle-outline" size={56} color={colors.brand} />
          </View>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Explore our curated pet food, treats, toys and healthcare essentials.
          </Text>
          <Button label="Start Shopping" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: `Shopping Cart (${cart.length})`,
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
        {/* Cart Items List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.itemsList}>
            {cart.map(({ product, quantity }) => (
              <View key={product.id} style={styles.cartItemCard}>
                <Image
                  source={{ uri: product.imageUrls[0] }}
                  style={styles.cartItemImg}
                  resizeMode="cover"
                />
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemBrand}>{product.brand}</Text>
                  <Text style={styles.cartItemName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.cartItemPrice}>
                    Rs {(product.price * quantity).toLocaleString()}
                  </Text>

                  {/* Quantity Controls */}
                  <View style={styles.itemControls}>
                    <View style={styles.quantityRow}>
                      <Pressable
                        onPress={() => updateQuantity(product.id, quantity - 1)}
                        style={styles.qtyControlBtn}
                      >
                        <Ionicons name="remove" size={14} color={colors.ink} />
                      </Pressable>
                      <Text style={styles.qtyText}>{quantity}</Text>
                      <Pressable
                        onPress={() => updateQuantity(product.id, quantity + 1)}
                        style={styles.qtyControlBtn}
                      >
                        <Ionicons name="add" size={14} color={colors.ink} />
                      </Pressable>
                    </View>

                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        removeFromCart(product.id);
                      }}
                      style={styles.removeBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Promo Code Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coupon Code</Text>
          <View style={styles.couponRow}>
            <TextInput
              placeholder="Enter promo code (e.g. FURR10)"
              placeholderTextColor={colors.muted}
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
              style={styles.couponInput}
            />
            <Pressable onPress={handleApplyCoupon} style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </Pressable>
          </View>
          {appliedCoupon && (
            <Text style={styles.couponSuccess}>✓ Coupon FURR10 applied (-10% off)</Text>
          )}
          {couponError ? <Text style={styles.couponError}>{couponError}</Text> : null}
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <View style={styles.addressForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Recipient Name</Text>
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full Name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="+94 77 123 4567"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Street Address</Text>
              <TextInput
                style={styles.textInput}
                value={streetAddress}
                onChangeText={setStreetAddress}
                placeholder="House / Apartment & Street"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City / District</Text>
              <TextInput
                style={styles.textInput}
                value={city}
                onChangeText={setCity}
                placeholder="Colombo, Kandy, Gampaha..."
              />
            </View>
          </View>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            {[
              { id: 'cod', label: 'Cash on Delivery', icon: 'cash-outline' },
              { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline' },
              { id: 'wallet', label: 'Furr Wallet', icon: 'wallet-outline' },
            ].map((method) => (
              <Pressable
                key={method.id}
                onPress={() => setPaymentMethod(method.id as any)}
                style={[
                  styles.paymentOption,
                  paymentMethod === method.id && styles.paymentOptionActive,
                ]}
              >
                <Ionicons
                  name={method.icon as any}
                  size={20}
                  color={paymentMethod === method.id ? colors.brand : colors.muted}
                />
                <Text
                  style={[
                    styles.paymentOptionText,
                    paymentMethod === method.id && styles.paymentOptionTextActive,
                  ]}
                >
                  {method.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Order Summary Breakdown */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>Rs {subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Standard Delivery</Text>
            <Text style={styles.summaryValue}>Rs 350</Text>
          </View>
          {discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.success }]}>Discount (10%)</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                -Rs {discountAmount.toLocaleString()}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>Rs {cartTotal.toLocaleString()}</Text>
          </View>
        </View>

        {/* Place Order CTA */}
        <View style={{ marginTop: space.xl }}>
          <Button
            label={isCheckingOut ? 'Placing Order...' : `Place Order · Rs ${cartTotal.toLocaleString()}`}
            loading={isCheckingOut}
            onPress={handleCheckout}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  headerBtn: { padding: 6 },
  content: { padding: space.lg, paddingBottom: space.xxl },

  emptyScreen: { flex: 1, backgroundColor: colors.canvas },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xxl, gap: space.md },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.softBrand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: colors.ink },
  emptySubtitle: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: space.sm },

  section: { marginTop: space.lg },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: space.sm },

  itemsList: { gap: space.sm },
  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.sm,
    gap: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cartItemImg: { width: 72, height: 72, borderRadius: radius.lg, backgroundColor: colors.mist },
  cartItemInfo: { flex: 1 },
  cartItemBrand: { fontSize: 10, fontWeight: '800', color: colors.muted, textTransform: 'uppercase' },
  cartItemName: { fontSize: 13, fontWeight: '700', color: colors.ink, marginTop: 1 },
  cartItemPrice: { fontSize: 14, fontWeight: '900', color: colors.ink, marginTop: 4 },
  itemControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.canvas,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  qtyControlBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 13, fontWeight: '800', color: colors.ink, marginHorizontal: 8 },
  removeBtn: { padding: 4 },

  couponRow: { flexDirection: 'row', gap: space.sm },
  couponInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.line,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '700',
  },
  applyBtn: {
    backgroundColor: colors.ink,
    borderRadius: radius.xl,
    paddingHorizontal: space.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  couponSuccess: { color: colors.success, fontSize: 12, fontWeight: '700', marginTop: 4 },
  couponError: { color: colors.danger, fontSize: 12, fontWeight: '700', marginTop: 4 },

  addressForm: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    gap: space.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  inputGroup: { gap: 4 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: colors.muted },
  textInput: {
    backgroundColor: colors.canvas,
    borderRadius: radius.lg,
    paddingHorizontal: space.sm,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
  },

  paymentMethods: { gap: space.xs },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  paymentOptionActive: { borderColor: colors.brand, backgroundColor: colors.softBrand },
  paymentOptionText: { fontSize: 14, fontWeight: '700', color: colors.muted },
  paymentOptionTextActive: { color: colors.ink },

  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    marginTop: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    gap: space.xs,
  },
  summaryTitle: { fontSize: 15, fontWeight: '800', color: colors.ink, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  summaryLabel: { fontSize: 13, color: colors.muted },
  summaryValue: { fontSize: 13, fontWeight: '700', color: colors.ink },
  totalRow: {
    marginTop: space.sm,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  totalLabel: { fontSize: 15, fontWeight: '900', color: colors.ink },
  totalValue: { fontSize: 18, fontWeight: '900', color: colors.brand },
});
