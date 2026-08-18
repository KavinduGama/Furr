import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space, shadows, EmptyState } from '@furr/ui';

interface NotificationItem {
  id: string;
  category: 'health' | 'order' | 'booking' | 'social' | 'amber_alert';
  title: string;
  body: string;
  timeAgo: string;
  isRead: boolean;
  actionUrl?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    category: 'health',
    title: 'Vaccination Due Next Week 💉',
    body: "Max's Annual DHPP Booster is scheduled for August 25. Check with your vet.",
    timeAgo: '2 hours ago',
    isRead: false,
    actionUrl: '/(tabs)/care',
  },
  {
    id: 'notif-2',
    category: 'booking',
    title: 'Grooming Confirmed ✨',
    body: 'Paws & Bubbles confirmed your Luxury Grooming appointment for tomorrow at 10:00 AM.',
    timeAgo: '5 hours ago',
    isRead: false,
    actionUrl: '/services/bookings',
  },
  {
    id: 'notif-3',
    category: 'order',
    title: 'Order Out for Delivery 🚚',
    body: 'Your marketplace order #ORD-2026-91 has been dispatched with Pronto Logistics.',
    timeAgo: '1 day ago',
    isRead: true,
    actionUrl: '/shop/orders',
  },
  {
    id: 'notif-4',
    category: 'amber_alert',
    title: 'Lost Pet Alert in Your Area 🚨',
    body: 'Oliver (Persian Cat) was reported lost near Queens Road, Colombo 03.',
    timeAgo: '2 days ago',
    isRead: true,
    actionUrl: '/lost-found',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'health':
        return { name: 'medical' as const, color: '#059669', bg: '#E0FAEB' };
      case 'booking':
        return { name: 'calendar' as const, color: colors.brand, bg: colors.softBrand };
      case 'order':
        return { name: 'cube' as const, color: '#D97706', bg: '#FEF3C7' };
      case 'amber_alert':
        return { name: 'warning' as const, color: colors.danger, bg: '#FEE2E2' };
      default:
        return { name: 'notifications' as const, color: colors.muted, bg: colors.pearl };
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filtered = notifications.filter((n) =>
    activeCategory === 'all' ? true : n.category === activeCategory
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.markReadText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Pills */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { id: 'all', label: 'All' },
            { id: 'health', label: '💉 Health' },
            { id: 'booking', label: '✂️ Bookings' },
            { id: 'order', label: '📦 Orders' },
            { id: 'amber_alert', label: '🚨 Alerts' },
          ].map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setActiveCategory(cat.id)}
              style={[
                styles.filterPill,
                activeCategory === cat.id && styles.filterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activeCategory === cat.id && styles.filterPillTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notification List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <EmptyState
            emoji="🔔"
            title="All Caught Up!"
            description="You don't have any notifications in this category right now."
          />
        ) : (
          filtered.map((item) => {
            const iconInfo = getCategoryIcon(item.category);
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
                onPress={() => {
                  if (item.actionUrl) {
                    router.push(item.actionUrl as any);
                  }
                }}
              >
                <View style={[styles.iconCircle, { backgroundColor: iconInfo.bg }]}>
                  <Ionicons name={iconInfo.name} size={20} color={iconInfo.color} />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    {!item.isRead ? <View style={styles.unreadDot} /> : null}
                  </View>
                  <Text style={styles.cardBody}>{item.body}</Text>
                  <Text style={styles.cardTime}>{item.timeAgo}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: 54,
    paddingBottom: space.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  markReadText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brand,
  },
  filterRow: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: space.xs,
  },
  filterScroll: {
    paddingHorizontal: space.lg,
    gap: space.xs,
  },
  filterPill: {
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.line,
  },
  filterPillActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
  filterPillTextActive: {
    color: colors.onBrand,
  },
  listContent: {
    padding: space.lg,
    paddingBottom: 40,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.sm,
    borderWidth: 1,
    borderColor: colors.line,
    gap: space.md,
    ...shadows.sm,
  },
  unreadCard: {
    borderColor: colors.brand,
    backgroundColor: '#FAF9FF',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
  },
  cardBody: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  cardTime: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 6,
  },
});
