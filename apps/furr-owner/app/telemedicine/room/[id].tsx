import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { useTelemedicine } from '@/src/context/telemedicine';

export default function TelemedicineRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { consultations, messages, sendMessage } = useTelemedicine();
  const [inputText, setInputText] = useState('');

  const consult = consultations.find((c) => c.id === id) || consultations[0];

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sendMessage(id, text);
  };

  if (!consult) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Consultation not found</Text>
        <Button label="Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          title: consult.vetName || 'Duty Veterinarian',
          headerStyle: { backgroundColor: colors.canvas },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
          ),
        }}
      />

      {/* Vet Credentials Header Bar */}
      <View style={styles.vetBar}>
        <View style={styles.vetAvatar}>
          <Ionicons name="medical" size={16} color={colors.brand} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.vetBarName}>{consult.vetName || 'Duty Veterinarian'}</Text>
          <Text style={styles.vetBarClinic}>{consult.vetClinicName || 'Licensed Care Team'}</Text>
        </View>
        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Live</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.chatScroll} showsVerticalScrollIndicator={false}>
        {/* Case Intake Summary Card */}
        <View style={styles.caseCard}>
          <View style={styles.caseHeader}>
            <Ionicons name="clipboard-outline" size={16} color={colors.brand} />
            <Text style={styles.caseTitle}>Intake Symptoms: {consult.petName}</Text>
          </View>
          <Text style={styles.caseSymptoms}>{consult.symptoms}</Text>
          <View style={styles.caseFooter}>
            <Text style={styles.caseMeta}>Duration: {consult.duration}</Text>
            <Text style={styles.caseMeta}>Urgency: {consult.severity.toUpperCase()}</Text>
          </View>
        </View>

        {/* Digital Prescription Card */}
        {consult.prescriptions && consult.prescriptions.length > 0 && (
          <View style={styles.rxCard}>
            <View style={styles.rxHeader}>
              <Ionicons name="document-text" size={18} color="#2D8EC8" />
              <Text style={styles.rxTitle}>Official Digital Prescription</Text>
            </View>

            {consult.prescriptions.map((rx, idx) => (
              <View key={idx} style={styles.rxItem}>
                <Text style={styles.rxMedName}>💊 {rx.medicationName}</Text>
                <Text style={styles.rxDosage}>
                  Dosage: {rx.dosage} · Frequency: {rx.frequency} ({rx.durationDays} days)
                </Text>
                <Text style={styles.rxInstructions}>{rx.instructions}</Text>

                {rx.marketplaceProductId && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(`/shop/${rx.marketplaceProductId}` as never);
                    }}
                    style={styles.buyRxBtn}
                  >
                    <Ionicons name="cart" size={14} color="#FFF" />
                    <Text style={styles.buyRxBtnText}>Order Medication in Shop</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Messages Stream */}
        <View style={styles.messagesList}>
          {messages.map((msg) => {
            const isMe = msg.senderRole === 'owner';
            return (
              <View
                key={msg.id}
                style={[styles.messageBubble, isMe ? styles.myBubble : styles.vetBubble]}
              >
                {!isMe && <Text style={styles.senderName}>{msg.senderName}</Text>}
                <Text style={[styles.messageText, isMe && styles.myMessageText]}>
                  {msg.text}
                </Text>
                <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Chat Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          placeholder="Type message to vet..."
          placeholderTextColor={colors.muted}
          value={inputText}
          onChangeText={setInputText}
          style={styles.chatInput}
        />
        <Pressable
          onPress={handleSend}
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={18} color="#FFF" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  headerBtn: { padding: 6 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md },
  notFoundText: { fontSize: 18, fontWeight: '800', color: colors.ink },

  vetBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  vetAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.softBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vetBarName: { fontSize: 13, fontWeight: '800', color: colors.ink },
  vetBarClinic: { fontSize: 11, color: colors.muted },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  onlineText: { fontSize: 10, fontWeight: '800', color: '#166534' },

  chatScroll: { padding: space.lg, paddingBottom: 30, gap: space.md },

  caseCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  caseHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  caseTitle: { fontSize: 13, fontWeight: '800', color: colors.ink },
  caseSymptoms: { fontSize: 13, color: colors.ink, marginTop: 4, lineHeight: 18 },
  caseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: space.sm,
    paddingTop: space.xs,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  caseMeta: { fontSize: 11, color: colors.muted, fontWeight: '600' },

  rxCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  rxHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rxTitle: { fontSize: 14, fontWeight: '900', color: '#0369A1' },
  rxItem: { marginTop: space.sm },
  rxMedName: { fontSize: 14, fontWeight: '800', color: '#0C4A6E' },
  rxDosage: { fontSize: 12, color: '#0284C7', fontWeight: '700', marginTop: 2 },
  rxInstructions: { fontSize: 12, color: colors.muted, marginTop: 2 },
  buyRxBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
    alignSelf: 'flex-start',
    marginTop: space.sm,
  },
  buyRxBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  messagesList: { gap: space.sm, marginTop: space.sm },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.xl,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.brand,
    borderBottomRightRadius: 4,
  },
  vetBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.line,
  },
  senderName: { fontSize: 11, fontWeight: '800', color: colors.brand, marginBottom: 2 },
  messageText: { fontSize: 14, color: colors.ink, lineHeight: 20 },
  myMessageText: { color: '#FFF' },
  messageTime: { fontSize: 10, color: colors.muted, alignSelf: 'flex-end', marginTop: 4 },
  myMessageTime: { color: 'rgba(255,255,255,0.7)' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.canvas,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
