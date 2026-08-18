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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@furr/ui';
import type { Order, Product, ProductCategory } from '@furr/core';
import { PRODUCT_CATEGORIES } from '@furr/core';
import { useProviderProducts } from '../../src/context/products';

export default function ProductsScreen() {
  const router = useRouter();
  const {
    products,
    orders,
    updateStock,
    updateOrderStatus,
    totalInventoryCount,
    lowStockCount,
  } = useProviderProducts();

  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'orders'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Shipping Modal State
  const [shipModalVisible, setShipModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('PRONT-LK-');
  const [courierName, setCourierName] = useState('Pronto Logistics');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenShipModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setTrackingNumber('PRONT-LK-' + Math.floor(100000 + Math.random() * 900000));
    setShipModalVisible(true);
  };

  const handleConfirmShip = async () => {
    if (!selectedOrderId) return;
    await updateOrderStatus(selectedOrderId, 'shipped', trackingNumber);
    setShipModalVisible(false);
    setSelectedOrderId(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <div>
            <Text style={styles.headerTitle}>Marketplace Studio</Text>
            <Text style={styles.headerSubtitle}>
              Catalog inventory, stock levels, and courier dispatch.
            </Text>
          </div>
          {activeSubTab === 'inventory' && (
            <TouchableOpacity
              style={styles.addProductBtn}
              onPress={() => router.push('/products/add' as any)}
            >
              <Ionicons name="add" size={18} color="#FFF" />
              <Text style={styles.addProductBtnText}>Add Product</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sub-Tab Selector */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tabBtn, activeSubTab === 'inventory' && styles.tabBtnActive]}
            onPress={() => setActiveSubTab('inventory')}
          >
            <Ionicons
              name="cube"
              size={16}
              color={activeSubTab === 'inventory' ? colors.brand : colors.muted}
            />
            <Text
              style={[
                styles.tabBtnText,
                activeSubTab === 'inventory' && { color: colors.brand },
              ]}
            >
              Inventory ({products.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeSubTab === 'orders' && styles.tabBtnActive]}
            onPress={() => setActiveSubTab('orders')}
          >
            <Ionicons
              name="receipt"
              size={16}
              color={activeSubTab === 'orders' ? colors.brand : colors.muted}
            />
            <Text
              style={[
                styles.tabBtnText,
                activeSubTab === 'orders' && { color: colors.brand },
              ]}
            >
              Customer Orders ({orders.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* INVENTORY SUB-TAB */}
        {activeSubTab === 'inventory' && (
          <View style={{ gap: space.md }}>
            {/* Quick Inventory Summary Cards */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryVal}>{totalInventoryCount}</Text>
                <Text style={styles.summarySub}>Total Units</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryVal}>{products.length}</Text>
                <Text style={styles.summarySub}>Active SKUs</Text>
              </View>
              <View style={[styles.summaryCard, lowStockCount > 0 && { borderColor: colors.danger }]}>
                <Text style={[styles.summaryVal, lowStockCount > 0 && { color: colors.danger }]}>
                  {lowStockCount}
                </Text>
                <Text style={styles.summarySub}>Low Stock Items</Text>
              </View>
            </View>

            {/* Search and Category Filter */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={colors.muted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products, brands, foods..."
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm('')}>
                  <Ionicons name="close-circle" size={16} color={colors.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  selectedCategory === 'all' && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory('all')}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    selectedCategory === 'all' && { color: '#FFF' },
                  ]}
                >
                  All Categories
                </Text>
              </TouchableOpacity>
              {PRODUCT_CATEGORIES.map((c) => {
                const isSel = selectedCategory === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.categoryPill, isSel && styles.categoryPillActive]}
                    onPress={() => setSelectedCategory(c.id)}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        isSel && { color: '#FFF' },
                      ]}
                    >
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Products List */}
            {filteredProducts.map((p) => (
              <View key={p.id} style={styles.productCard}>
                <View style={styles.productTop}>
                  <View style={styles.productMeta}>
                    <Text style={styles.productBrand}>{p.brand}</Text>
                    <Text style={styles.productName}>{p.name}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>LKR {p.price.toLocaleString()}</Text>
                      {p.originalPrice && (
                        <Text style={styles.productOrigPrice}>
                          LKR {p.originalPrice.toLocaleString()}
                        </Text>
                      )}
                      {p.isFeatured && (
                        <View style={styles.featuredBadge}>
                          <Text style={styles.featuredBadgeText}>FEATURED</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Stock Level & Adjustment Controls */}
                <View style={styles.stockFooter}>
                  <View style={styles.stockIndicatorRow}>
                    <View
                      style={[
                        styles.stockDot,
                        {
                          backgroundColor:
                            p.stock > 10
                              ? colors.success
                              : p.stock > 0
                              ? colors.accent
                              : colors.danger,
                        },
                      ]}
                    />
                    <Text style={styles.stockText}>
                      Stock: <Text style={{ fontWeight: '800' }}>{p.stock} units</Text>{' '}
                      {p.stock <= 5 && p.stock > 0 ? '(Low)' : p.stock === 0 ? '(Out of stock)' : ''}
                    </Text>
                  </View>

                  <View style={styles.stockControls}>
                    <TouchableOpacity
                      style={styles.stockAdjustBtn}
                      onPress={() => updateStock(p.id, -1)}
                    >
                      <Ionicons name="remove" size={16} color={colors.ink} />
                    </TouchableOpacity>
                    <Text style={styles.stockCountVal}>{p.stock}</Text>
                    <TouchableOpacity
                      style={styles.stockAdjustBtn}
                      onPress={() => updateStock(p.id, 1)}
                    >
                      <Ionicons name="add" size={16} color={colors.ink} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* CUSTOMER ORDERS SUB-TAB */}
        {activeSubTab === 'orders' && (
          <View style={{ gap: space.md }}>
            {orders.map((ord) => (
              <View key={ord.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderIdText}>Order #{ord.id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.orderDateText}>
                      {new Date(ord.createdAt).toLocaleDateString()} • {ord.paymentMethod.toUpperCase()}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      ord.status === 'confirmed' && { backgroundColor: colors.warm },
                      ord.status === 'shipped' && { backgroundColor: colors.calm },
                      ord.status === 'delivered' && { backgroundColor: '#EDE9FE' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        ord.status === 'confirmed' && { color: colors.accent },
                        ord.status === 'shipped' && { color: colors.success },
                        ord.status === 'delivered' && { color: colors.brand },
                      ]}
                    >
                      {ord.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Items in order */}
                <View style={styles.orderItemsBox}>
                  {ord.items.map((item, idx) => (
                    <View key={idx} style={styles.orderItemRow}>
                      <Text style={styles.orderItemName} numberOfLines={1}>
                        {item.quantity}x {item.product.name}
                      </Text>
                      <Text style={styles.orderItemPrice}>
                        LKR {(item.product.price * item.quantity).toLocaleString()}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Shipping destination */}
                <View style={styles.shippingBox}>
                  <Ionicons name="location" size={14} color={colors.brand} />
                  <Text style={styles.shippingText}>
                    Deliver to: {ord.shippingAddress.fullName}, {ord.shippingAddress.streetAddress},{' '}
                    {ord.shippingAddress.city} ({ord.shippingAddress.phone})
                  </Text>
                </View>

                {ord.trackingNumber && (
                  <View style={styles.trackingBox}>
                    <Ionicons name="airplane" size={14} color={colors.success} />
                    <Text style={styles.trackingText}>
                      Tracking: {ord.trackingNumber} (Pronto Logistics)
                    </Text>
                  </View>
                )}

                {/* Order Footer & Action */}
                <View style={styles.orderFooter}>
                  <View>
                    <Text style={styles.orderTotalLabel}>Net Payout (after 8% fee)</Text>
                    <Text style={styles.orderTotalVal}>
                      LKR {Math.round(ord.total * 0.92).toLocaleString()}
                    </Text>
                  </View>

                  {ord.status === 'confirmed' && (
                    <TouchableOpacity
                      style={styles.shipBtn}
                      onPress={() => handleOpenShipModal(ord.id)}
                    >
                      <Ionicons name="send" size={14} color="#FFF" />
                      <Text style={styles.shipBtnText}>Dispatch Order</Text>
                    </TouchableOpacity>
                  )}

                  {ord.status === 'shipped' && (
                    <TouchableOpacity
                      style={styles.deliveredBtn}
                      onPress={() => updateOrderStatus(ord.id, 'delivered')}
                    >
                      <Ionicons name="checkmark-done" size={14} color="#FFF" />
                      <Text style={styles.deliveredBtnText}>Mark Delivered</Text>
                    </TouchableOpacity>
                  )}

                  {ord.status === 'delivered' && (
                    <View style={styles.payoutSettledRow}>
                      <Ionicons name="shield-checkmark" size={16} color={colors.success} />
                      <Text style={styles.payoutSettledText}>Settled</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Courier Tracking Dispatch Modal */}
      <Modal visible={shipModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Courier Dispatch Details</Text>
              <TouchableOpacity onPress={() => setShipModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.ink} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Enter the courier service and tracking consignment number for the pet parent:
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Courier Partner</Text>
              <TextInput
                style={styles.input}
                value={courierName}
                onChangeText={setCourierName}
                placeholder="e.g. Pronto Logistics / Domex / Prompt"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tracking / Consignment Number</Text>
              <TextInput
                style={styles.input}
                value={trackingNumber}
                onChangeText={setTrackingNumber}
                placeholder="e.g. PRONT-LK-884920"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setShipModalVisible(false)}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmShipBtn}
                onPress={handleConfirmShip}
              >
                <Text style={styles.confirmShipBtnText}>Confirm Dispatch</Text>
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
    paddingBottom: space.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: colors.ink },
  headerSubtitle: { fontSize: 12, color: colors.muted, marginTop: 2 },
  addProductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  addProductBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  tabSelector: {
    flexDirection: 'row',
    backgroundColor: colors.canvas,
    borderRadius: radius.pill,
    padding: 4,
    marginTop: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  tabBtnActive: { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  tabBtnText: { fontSize: 12, fontWeight: '800', color: colors.muted },

  scrollContent: { padding: space.lg, paddingBottom: 110 },

  summaryRow: { flexDirection: 'row', gap: space.sm },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
  },
  summaryVal: { fontSize: 18, fontWeight: '900', color: colors.ink },
  summarySub: { fontSize: 10, color: colors.muted, marginTop: 2, textAlign: 'center' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.ink },

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

  productCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  productTop: { flexDirection: 'row', justifyContent: 'space-between' },
  productMeta: { flex: 1 },
  productBrand: { fontSize: 10, fontWeight: '800', color: colors.brand, textTransform: 'uppercase' },
  productName: { fontSize: 14, fontWeight: '800', color: colors.ink, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  productPrice: { fontSize: 14, fontWeight: '900', color: colors.ink },
  productOrigPrice: { fontSize: 12, color: colors.muted, textDecorationLine: 'line-through' },
  featuredBadge: {
    backgroundColor: colors.warm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  featuredBadgeText: { fontSize: 9, fontWeight: '800', color: colors.accent },

  stockFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.md,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  stockIndicatorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stockDot: { width: 8, height: 8, borderRadius: radius.pill },
  stockText: { fontSize: 12, color: colors.muted },
  stockControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stockAdjustBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  stockCountVal: { fontSize: 13, fontWeight: '800', color: colors.ink, minWidth: 20, textAlign: 'center' },

  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderIdText: { fontSize: 14, fontWeight: '900', color: colors.ink },
  orderDateText: { fontSize: 11, color: colors.muted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },

  orderItemsBox: {
    backgroundColor: colors.canvas,
    borderRadius: radius.md,
    padding: space.sm,
    marginTop: space.sm,
    gap: 4,
  },
  orderItemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  orderItemName: { fontSize: 12, color: colors.ink, fontWeight: '600', flex: 1, marginRight: 8 },
  orderItemPrice: { fontSize: 12, fontWeight: '800', color: colors.ink },

  shippingBox: { flexDirection: 'row', gap: 6, marginTop: space.sm, alignItems: 'center' },
  shippingText: { fontSize: 11, color: colors.muted, flex: 1 },
  trackingBox: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    alignItems: 'center',
    backgroundColor: colors.calm,
    padding: 6,
    borderRadius: radius.sm,
  },
  trackingText: { fontSize: 11, color: colors.success, fontWeight: '700' },

  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.md,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  orderTotalLabel: { fontSize: 10, color: colors.muted, textTransform: 'uppercase', fontWeight: '700' },
  orderTotalVal: { fontSize: 15, fontWeight: '900', color: colors.ink },
  shipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  shipBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  deliveredBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.success,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  deliveredBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  payoutSettledRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  payoutSettledText: { fontSize: 12, fontWeight: '800', color: colors.success },

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
  modalActions: { flexDirection: 'row', gap: space.md, marginTop: space.sm },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
    alignItems: 'center',
  },
  cancelModalBtnText: { fontSize: 13, fontWeight: '800', color: colors.ink },
  confirmShipBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: 'center',
  },
  confirmShipBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
});
