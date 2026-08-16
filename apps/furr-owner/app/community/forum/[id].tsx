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
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { useCommunity } from '@/src/context/community';
import { useAuth } from '@/src/context/auth';

export default function QuestionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { questions, postAnswer, upvoteAnswer } = useCommunity();
  const { firebaseUser } = useAuth();
  const [replyText, setReplyText] = useState('');

  const question = questions.find((q) => q.id === id);
  const userUid = firebaseUser?.uid || 'demo-uid';

  if (!question) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.canvas }}>
        <Stack.Screen options={{ headerShown: true, title: 'Question Not Found', headerStyle: { backgroundColor: colors.canvas }, headerShadowVisible: false }} />
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.ink }}>Question not found</Text>
        <Text style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>This thread may have been removed.</Text>
      </View>
    );
  }

  const handlePostAnswer = async () => {
    if (!replyText.trim()) return;
    const text = replyText;
    setReplyText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await postAnswer(id, text);
  };

  if (!question) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Question not found</Text>
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
          title: question.category + ' Discussion',
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
        {/* Main Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{question.category}</Text>
            </View>
            <Text style={styles.authorText}>Asked by {question.authorName}</Text>
          </View>

          <Text style={styles.questionTitle}>{question.title}</Text>
          <Text style={styles.questionDetails}>{question.details}</Text>
        </View>

        {/* Answers List */}
        <View style={styles.answersSection}>
          <Text style={styles.answersHeading}>
            {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
          </Text>

          {question.answers.length === 0 ? (
            <View style={styles.noAnswers}>
              <Text style={styles.noAnswersText}>No answers yet. Be the first to help!</Text>
            </View>
          ) : (
            <View style={styles.answersList}>
              {question.answers.map((ans) => {
                const hasUpvoted = ans.upvotedUids?.includes(userUid);

                return (
                  <View key={ans.id} style={styles.answerCard}>
                    <View style={styles.answerHeader}>
                      <View style={styles.authorRow}>
                        {ans.authorRole === 'vet' ? (
                          <View style={styles.vetBadge}>
                            <Ionicons name="medical" size={10} color="#006B78" />
                            <Text style={styles.vetBadgeText}>Dr. Verified Veterinarian</Text>
                          </View>
                        ) : (
                          <Text style={styles.authorName}>{ans.authorName}</Text>
                        )}
                      </View>

                      {/* Upvote Button */}
                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          upvoteAnswer(question.id, ans.id);
                        }}
                        style={[styles.upvoteBtn, hasUpvoted && styles.upvoteBtnActive]}
                      >
                        <Ionicons
                          name={hasUpvoted ? 'heart' : 'heart-outline'}
                          size={14}
                          color={hasUpvoted ? '#DC2626' : colors.muted}
                        />
                        <Text
                          style={[styles.upvoteText, hasUpvoted && styles.upvoteTextActive]}
                        >
                          {ans.upvotes}
                        </Text>
                      </Pressable>
                    </View>

                    <Text style={styles.answerText}>{ans.text}</Text>
                    <Text style={styles.answerTime}>
                      {new Date(ans.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Answer Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          placeholder="Share your advice or pet experience..."
          placeholderTextColor={colors.muted}
          value={replyText}
          onChangeText={setReplyText}
          style={styles.replyInput}
        />
        <Pressable
          onPress={handlePostAnswer}
          style={[styles.sendBtn, !replyText.trim() && styles.sendBtnDisabled]}
          disabled={!replyText.trim()}
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
  content: { padding: space.lg, paddingBottom: 80, gap: space.md },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md },
  notFoundText: { fontSize: 18, fontWeight: '800', color: colors.ink },

  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: { backgroundColor: colors.softBrand, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm },
  categoryBadgeText: { fontSize: 10, fontWeight: '800', color: colors.brand, textTransform: 'uppercase' },
  authorText: { fontSize: 11, color: colors.muted },
  questionTitle: { fontSize: 18, fontWeight: '900', color: colors.ink, marginTop: 8 },
  questionDetails: { fontSize: 14, color: colors.muted, marginTop: 6, lineHeight: 22 },

  answersSection: { marginTop: space.sm },
  answersHeading: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: space.sm },
  noAnswers: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    alignItems: 'center',
  },
  noAnswersText: { fontSize: 13, color: colors.muted },

  answersList: { gap: space.sm },
  answerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  answerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  authorRow: { flex: 1 },
  vetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  vetBadgeText: { fontSize: 10, fontWeight: '800', color: '#006B78' },
  authorName: { fontSize: 13, fontWeight: '700', color: colors.ink },

  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.canvas,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  upvoteBtnActive: { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
  upvoteText: { fontSize: 11, fontWeight: '700', color: colors.muted },
  upvoteTextActive: { color: '#DC2626' },

  answerText: { fontSize: 13, color: colors.ink, marginTop: space.sm, lineHeight: 20 },
  answerTime: { fontSize: 10, color: colors.muted, marginTop: 6 },

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
  replyInput: {
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
