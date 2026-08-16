import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, RefreshControl } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space, Button } from '@furr/ui';
import { useMarketplace } from '@/src/context/marketplace';
import type { OrderStatus } from '@furr/core';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  placed: { label: 'Order Placed', color: '#D97706', bg: '#FEF3C7', icon: 'receipt' },
  confirmed: { label: 'Confirmed', color: '#2563EB', bg: '#DBEAFE', icon: 'checkmark-circle' },
  processing: { label: 'Packing', color: '#7C3AED', bg: '#EDE9FE', icon: 'cube' },
  shipped: { label: 'Out for Delivery', color: '#059669', bg: '#D1FAE5', icon: 'bicycle' },
  delivered: { label: 'Delivered', color: colors.success, bg: colors.calm, icon: 'home' },
  cancelled: { label: 'Cancelled', color: colors.danger, bg: '#FEE2E2', icon: 'close-circle' },
};

export default function OrdersScreen() {
  const { orders } = useMarketplace();
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
          title: 'My Orders',
          headerStyle: { backgroundColor: colors.canvas },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={56} color={colors.brand} />
            </View>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptyCopy}>
              When you purchase pet food, medication, or toys, your live tracking will appear here.
            </Text>
            <Button label="Explore Shop" onPress={() => router.replace('/(tabs)/shop' as never)} />
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
              return (
                <View key={order.id} style={styles.orderCard}>
                  {/* Order Top Bar */}
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
                      <Text style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                      <Ionicons name={statusCfg.icon} size={13} color={statusCfg.color} />
                      <Text style={[styles.statusText, { color: statusCfg.color }]}>
                        {statusCfg.label}
                      </Text>
                    </View>
                  </View>

                  {/* Order Items Preview */}
                  <View style={styles.itemsPreview}>
                    {order.items.map((item, idx) => (
                      <View key={idx} style={styles.itemRow}>
                        <Image
                          source={{ uri: item.product.imageUrls[0] }}
                          style={styles.itemThumb}
                          resizeMode="cover"
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemName} numberOfLines={1}>
                            {item.product.name}
                          </Text>
                          <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                        </View>
                        <Text style={styles.itemPrice}>
                          Rs {(item.product.price * item.quantity).toLocaleString()}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Order Footer */}
                  <View style={styles.orderFooter}>
                    <View>
                      <Text style={styles.estimatedLabel}>Estimated Delivery</Text>
                      <Text style={styles.estimatedDate}>{order.estimatedDelivery}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalAmount}>Rs {order.total.toLocaleString()}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  headerBtn: { padding: 6 },
  content: { padding: space.lg, paddingBottom: space.xxl },

  emptyState: { alignItems: 'center', justifyContent: 'center', padding: space.xxl, gap: space.md },
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
  emptyCopy: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: space.sm },

  ordersList: { gap: space.md },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  orderId: { fontSize: 14, fontWeight: '800', color: colors.ink },
  orderDate: { fontSize: 11, color: colors.muted, marginTop: 1 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusText: { fontSize: 11, fontWeight: '800' },

  itemsPreview: { paddingVertical: space.sm, gap: space.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemThumb: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.mist },
  itemName: { fontSize: 13, fontWeight: '700', color: colors.ink },
  itemQty: { fontSize: 11, color: colors.muted },
  itemPrice: { fontSize: 13, fontWeight: '800', color: colors.ink },

  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginTop: 2,
  },
  estimatedLabel: { fontSize: 10, color: colors.muted, textTransform: 'uppercase', fontWeight: '800' },
  estimatedDate: { fontSize: 13, fontWeight: '800', color: colors.brand },
  totalLabel: { fontSize: 10, color: colors.muted, textTransform: 'uppercase', fontWeight: '800' },
  totalAmount: { fontSize: 16, fontWeight: '900', color: colors.ink },
});
