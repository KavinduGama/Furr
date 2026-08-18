import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@furr/ui';
import { useProviderChat } from '../../src/context/chat';

export default function ChatListScreen() {
  const router = useRouter();
  const { conversations, markConversationAsRead } = useProviderChat();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Client Messages</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {conversations.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.muted} />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySub}>
              Direct inquiries from pet parents will appear here in real time.
            </Text>
          </View>
        ) : (
          <View style={styles.conversationsList}>
            {conversations.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.convCard}
                onPress={() => {
                  markConversationAsRead(c.id);
                  router.push(`/chat/${c.id}` as any);
                }}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{c.petName[0]}</Text>
                </View>

                <View style={styles.convMeta}>
                  <View style={styles.convTopRow}>
                    <Text style={styles.parentName}>{c.ownerName}</Text>
                    <Text style={styles.timeText}>
                      {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>

                  <Text style={styles.petSubtitle}>
                    {c.petName} ({c.petSpecies}) • {c.serviceCategory.toUpperCase()}
                  </Text>

                  <Text style={styles.lastMsgText} numberOfLines={1}>
                    {c.lastMessageText}
                  </Text>
                </View>

                {c.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{c.unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: colors.ink },

  scrollContent: { padding: space.lg, paddingBottom: 110 },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: space.xl,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.ink, marginTop: 12 },
  emptySub: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 4 },

  conversationsList: { gap: space.sm },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: space.md,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.softBrand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '900', color: colors.brand },
  convMeta: { flex: 1 },
  convTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  parentName: { fontSize: 14, fontWeight: '800', color: colors.ink },
  timeText: { fontSize: 10, color: colors.muted },
  petSubtitle: { fontSize: 11, fontWeight: '700', color: colors.brand, marginTop: 1 },
  lastMsgText: { fontSize: 12, color: colors.muted, marginTop: 3 },
  unreadBadge: {
    backgroundColor: colors.brand,
    borderRadius: radius.pill,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
});
