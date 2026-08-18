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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@furr/ui';
import { useProviderChat } from '../../src/context/chat';

const QUICK_REPLIES = [
  'On my way!',
  'Running 5 minutes late',
  'All done with the session!',
  'Please share any special instructions',
];

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { messages, sendMessage, conversations } = useProviderChat();

  const conversationId = id || 'conv-1';
  const chatMessages = messages[conversationId] || [];
  const conv = conversations.find((c) => c.id === conversationId) || conversations[0];

  const [inputText, setInputText] = useState('');

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;
    await sendMessage(conversationId, text);
    setInputText('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </TouchableOpacity>

        <View style={styles.headerMeta}>
          <Text style={styles.headerTitle}>{conv?.ownerName || 'Pet Parent'}</Text>
          <Text style={styles.headerSub}>
            Regarding {conv?.petName} ({conv?.serviceCategory.toUpperCase()})
          </Text>
        </View>

        <TouchableOpacity style={styles.callBtn}>
          <Ionicons name="call" size={18} color={colors.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.messagesList} showsVerticalScrollIndicator={false}>
        {chatMessages.map((msg) => {
          const isMe = msg.senderRole === 'provider';
          return (
            <View
              key={msg.id}
              style={[
                styles.bubbleWrapper,
                isMe ? styles.bubbleWrapperMe : styles.bubbleWrapperOther,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  isMe ? styles.bubbleMe : styles.bubbleOther,
                ]}
              >
                <Text style={[styles.bubbleText, isMe && { color: '#FFF' }]}>
                  {msg.text}
                </Text>
                <Text
                  style={[
                    styles.timeText,
                    isMe ? { color: 'rgba(255,255,255,0.7)' } : { color: colors.muted },
                  ]}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Quick Reply Chips */}
      <View style={styles.quickRepliesBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {QUICK_REPLIES.map((reply, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickChip}
              onPress={() => handleSend(reply)}
            >
              <Text style={styles.quickChipText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type message to pet parent..."
          placeholderTextColor={colors.muted}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()}>
          <Ionicons name="send" size={18} color="#FFF" />
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: space.md,
  },
  backBtn: { padding: 4 },
  headerMeta: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: '900', color: colors.ink },
  headerSub: { fontSize: 11, color: colors.brand, fontWeight: '700', marginTop: 1 },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.softBrand,
    justifyContent: 'center',
    alignItems: 'center',
  },

  messagesList: { padding: space.lg, paddingBottom: 20, gap: space.sm },
  bubbleWrapper: { flexDirection: 'row', marginBottom: 4 },
  bubbleWrapperMe: { justifyContent: 'flex-end' },
  bubbleWrapperOther: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '80%',
    padding: space.md,
    borderRadius: radius.lg,
  },
  bubbleMe: {
    backgroundColor: colors.brand,
    borderBottomRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  bubbleText: { fontSize: 13, color: colors.ink, lineHeight: 18 },
  timeText: { fontSize: 10, marginTop: 4, textAlign: 'right' },

  quickRepliesBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  quickChip: {
    backgroundColor: colors.softBrand,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  quickChipText: { color: colors.brand, fontSize: 11, fontWeight: '700' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : space.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: space.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.canvas,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
