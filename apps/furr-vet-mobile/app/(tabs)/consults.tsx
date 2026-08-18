import React, { useState, useEffect } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@furr/ui';
import { useVetConsults } from '@/src/context/consults';
import type { Consultation } from '@furr/core';

export default function VetConsultsScreen() {
  const { consultations, messages, sendMessage, subscribeToRoomMessages } = useVetConsults();
  const [selectedConsult, setSelectedConsult] = useState<Consultation | null>(consultations[0] || null);
  const [replyText, setReplyText] = useState('');

  // Keep selected consult in sync when consultations list updates
  useEffect(() => {
    if (consultations.length > 0 && !selectedConsult) {
      setSelectedConsult(consultations[0]);
    }
  }, [consultations, selectedConsult]);

  // Subscribe to live room messages when consultation is selected
  useEffect(() => {
    if (!selectedConsult?.id) return;
    const unsub = subscribeToRoomMessages(selectedConsult.id);
    return () => unsub();
  }, [selectedConsult?.id, subscribeToRoomMessages]);

  const currentMessages = selectedConsult ? (messages[selectedConsult.id] || []) : [];

  const handleSend = () => {
    if (!selectedConsult || !replyText.trim()) return;
    sendMessage(selectedConsult.id, replyText);
    setReplyText('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Telehealth Duty Queue</Text>
          <Text style={styles.subTitle}>Live chat triage and medical consultation stream.</Text>
        </View>

        {/* Horizontal Case Queue Picker */}
        <View style={styles.casePicker}>
          <FlatList
            horizontal
            data={consultations}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = selectedConsult?.id === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedConsult(item)}
                  style={[styles.caseChip, isSelected && styles.caseChipSelected]}
                >
                  <Text style={[styles.caseChipName, isSelected && styles.caseChipTextSelected]}>
                    {item.petName} ({item.petSpecies})
                  </Text>
                  <Text
                    style={[
                      styles.caseChipSeverity,
                      { color: item.severity === 'urgent' ? '#DC2626' : '#D97706' },
                    ]}
                  >
                    {item.severity.toUpperCase()}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {/* Selected Case Summary Card */}
        {selectedConsult ? (
          <View style={styles.caseDetailsCard}>
            <View style={styles.caseRow}>
              <Text style={styles.caseHeading}>
                {selectedConsult.petName} · {selectedConsult.ownerName}
              </Text>
              <Text style={styles.caseDuration}>{selectedConsult.duration}</Text>
            </View>
            <Text style={styles.symptomsText} numberOfLines={2}>
              Symptoms: {selectedConsult.symptoms}
            </Text>
          </View>
        ) : (
          <View style={styles.caseDetailsCard}>
            <Text style={styles.caseHeading}>No Active Consultations</Text>
            <Text style={styles.symptomsText}>All triage queues are currently clear.</Text>
          </View>
        )}

        {/* Message Thread */}
        <FlatList
          data={currentMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => {
            const isVet = item.senderRole === 'vet';
            return (
              <View style={[styles.msgWrapper, isVet ? styles.msgRight : styles.msgLeft]}>
                <Text style={styles.senderLabel}>{item.senderName}</Text>
                <View style={[styles.msgBubble, isVet ? styles.bubbleVet : styles.bubbleOwner]}>
                  <Text style={[styles.msgText, isVet ? styles.msgTextVet : styles.msgTextOwner]}>
                    {item.text}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* Reply Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.replyInput}
            placeholder="Type medical response..."
            placeholderTextColor="#9E9E9E"
            value={replyText}
            onChangeText={setReplyText}
          />
          <Pressable onPress={handleSend} style={styles.sendButton}>
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    paddingBottom: 80,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10242D',
  },
  subTitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  casePicker: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  caseChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    marginRight: 8,
    alignItems: 'center',
  },
  caseChipSelected: {
    backgroundColor: '#006B78',
    borderColor: '#006B78',
  },
  caseChipName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10242D',
  },
  caseChipTextSelected: {
    color: '#FFFFFF',
  },
  caseChipSeverity: {
    fontSize: 9,
    fontWeight: '900',
    marginTop: 2,
  },
  caseDetailsCard: {
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: '#FAF9F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    marginBottom: 8,
  },
  caseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  caseHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10242D',
  },
  caseDuration: {
    fontSize: 11,
    fontWeight: '700',
    color: '#006B78',
  },
  symptomsText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  msgWrapper: {
    marginBottom: 14,
    maxWidth: '82%',
  },
  msgLeft: {
    alignSelf: 'flex-start',
  },
  msgRight: {
    alignSelf: 'flex-end',
  },
  senderLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    marginBottom: 3,
    paddingHorizontal: 4,
  },
  msgBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleVet: {
    backgroundColor: '#006B78',
    borderBottomRightRadius: 2,
  },
  bubbleOwner: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 2,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 18,
  },
  msgTextVet: {
    color: '#FFFFFF',
  },
  msgTextOwner: {
    color: '#1E293B',
  },
  inputBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
    gap: 8,
    alignItems: 'center',
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#10242D',
  },
  sendButton: {
    backgroundColor: '#006B78',
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
