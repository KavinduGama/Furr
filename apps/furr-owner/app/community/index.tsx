import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { useCommunity } from '@/src/context/community';
import { useAuth } from '@/src/context/auth';

type CommunityTab = 'meetups' | 'forum' | 'playdates';

export default function CommunityHubScreen() {
  const { meetups, questions, playmates, toggleRsvp, upvoteAnswer } = useCommunity();
  const { firebaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState<CommunityTab>('meetups');
  const [forumCategory, setForumCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const userUid = firebaseUser?.uid || 'demo-uid';

  const filteredQuestions = questions.filter((q) => {
    const matchesCat = forumCategory === 'All' || q.category === forumCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Pet Community',
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
        {/* Navigation Sub-Tabs */}
        <View style={styles.tabSelector}>
          {[
            { id: 'meetups', label: 'Meetups & Walks', icon: 'people' },
            { id: 'forum', label: 'Local Q&A', icon: 'chatbubbles' },
            { id: 'playdates', label: 'Playdates', icon: 'paw' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveTab(tab.id as CommunityTab);
                }}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={14}
                  color={isActive ? colors.brand : colors.muted}
                />
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ─── TAB 1: MEETUPS & WALKS ─── */}
        {activeTab === 'meetups' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Upcoming Local Walks</Text>
                <Text style={styles.sectionSubtitle}>Socialize your companion safely</Text>
              </View>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/community/meetup/new' as never);
                }}
                style={styles.actionPill}
              >
                <Ionicons name="add" size={16} color="#FFF" />
                <Text style={styles.actionPillText}>Host Meetup</Text>
              </Pressable>
            </View>

            <View style={styles.cardList}>
              {meetups.map((meetup) => {
                const isAttending = meetup.rsvpUids.includes(userUid);

                return (
                  <View key={meetup.id} style={styles.meetupCard}>
                    {meetup.isSponsored && (
                      <View style={styles.sponsorBanner}>
                        <Ionicons name="gift-outline" size={13} color="#C2410C" />
                        <Text style={styles.sponsorText}>{meetup.sponsorName}</Text>
                      </View>
                    )}

                    <Text style={styles.meetupTitle}>{meetup.title}</Text>
                    <Text style={styles.meetupDesc}>{meetup.description}</Text>

                    <View style={styles.meetupMeta}>
                      <View style={styles.metaRow}>
                        <Ionicons name="location-sharp" size={14} color={colors.brand} />
                        <Text style={styles.metaText}>
                          {meetup.locationName}, {meetup.city}
                        </Text>
                      </View>
                      <View style={styles.metaRow}>
                        <Ionicons name="calendar-outline" size={14} color={colors.brand} />
                        <Text style={styles.metaText}>
                          {meetup.date} at {meetup.time}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.meetupFooter}>
                      <View style={styles.rsvpAvatarRow}>
                        <View style={styles.rsvpBadge}>
                          <Text style={styles.rsvpBadgeText}>🐾 {meetup.rsvpCount} going</Text>
                        </View>
                        <Text style={styles.hostName}>By {meetup.creatorName}</Text>
                      </View>

                      <Pressable
                        onPress={() => {
                          Haptics.notificationAsync(
                            isAttending
                              ? Haptics.NotificationFeedbackType.Warning
                              : Haptics.NotificationFeedbackType.Success
                          );
                          toggleRsvp(meetup.id);
                        }}
                        style={[styles.rsvpBtn, isAttending && styles.rsvpBtnActive]}
                      >
                        <Ionicons
                          name={isAttending ? 'checkmark-circle' : 'add-circle-outline'}
                          size={16}
                          color={isAttending ? '#FFF' : colors.brand}
                        />
                        <Text
                          style={[
                            styles.rsvpBtnText,
                            isAttending && styles.rsvpBtnTextActive,
                          ]}
                        >
                          {isAttending ? "I'm Going!" : 'RSVP'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ─── TAB 2: LOCAL Q&A FORUM ─── */}
        {activeTab === 'forum' && (
          <View style={styles.tabContent}>
            {/* Search and Categories */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={colors.muted} />
              <TextInput
                placeholder="Search questions on diet, behavior, health..."
                placeholderTextColor={colors.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.forumCatRow}
            >
              {['All', 'Health', 'Diet', 'Training', 'Behavior'].map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setForumCategory(cat);
                  }}
                  style={[
                    styles.forumCatPill,
                    forumCategory === cat && styles.forumCatPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.forumCatText,
                      forumCategory === cat && styles.forumCatTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.cardList}>
              {filteredQuestions.map((q) => (
                <Pressable
                  key={q.id}
                  onPress={() => router.push(`/community/forum/${q.id}` as never)}
                  style={styles.questionCard}
                >
                  <View style={styles.questionHeader}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{q.category}</Text>
                    </View>
                    <Text style={styles.questionAuthor}>Asked by {q.authorName}</Text>
                  </View>

                  <Text style={styles.questionTitle}>{q.title}</Text>
                  <Text style={styles.questionDetails} numberOfLines={2}>
                    {q.details}
                  </Text>

                  {/* Top Answer Preview */}
                  {q.answers.length > 0 && (
                    <View style={styles.topAnswerBox}>
                      <View style={styles.answerAuthorRow}>
                        {q.answers[0].authorRole === 'vet' ? (
                          <View style={styles.vetAnswerBadge}>
                            <Ionicons name="medical" size={10} color="#006B78" />
                            <Text style={styles.vetAnswerText}>Verified Vet Answer</Text>
                          </View>
                        ) : (
                          <Text style={styles.answerAuthor}>{q.answers[0].authorName}</Text>
                        )}
                      </View>
                      <Text style={styles.topAnswerText} numberOfLines={2}>
                        "{q.answers[0].text}"
                      </Text>
                    </View>
                  )}

                  <View style={styles.questionFooter}>
                    <Text style={styles.answersCount}>
                      💬 {q.answersCount} {q.answersCount === 1 ? 'answer' : 'answers'}
                    </Text>
                    <Text style={styles.viewThreadText}>View Thread →</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ─── TAB 3: PLAYDATE FINDER ─── */}
        {activeTab === 'playdates' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Playmates Nearby</Text>
                <Text style={styles.sectionSubtitle}>Find temperament-matched friends</Text>
              </View>
            </View>

            <View style={styles.cardList}>
              {playmates.map((playmate) => (
                <View key={playmate.id} style={styles.playmateCard}>
                  <View style={styles.playmateHeader}>
                    <View style={styles.playmateAvatarWrap}>
                      <Text style={{ fontSize: 28 }}>🐶</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.playmateName}>{playmate.petName}</Text>
                      <Text style={styles.playmateBreed}>
                        {playmate.breed} · {playmate.size.toUpperCase()}
                      </Text>
                      <Text style={styles.playmateCity}>
                        📍 {playmate.city} ({playmate.distanceKm} km away)
                      </Text>
                    </View>
                    <View style={styles.energyBadge}>
                      <Text style={styles.energyText}>{playmate.energyLevel.toUpperCase()} ENERGY</Text>
                    </View>
                  </View>

                  <Text style={styles.temperamentText}>"{playmate.temperament}"</Text>

                  <Pressable
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      Alert.alert('Playdate Requested!', `Playdate invitation sent to ${playmate.ownerName}!`);
                    }}
                    style={styles.requestPlaydateBtn}
                  >
                    <Ionicons name="paw" size={16} color="#FFF" />
                    <Text style={styles.requestPlaydateText}>Request Playdate</Text>
                  </Pressable>
                </View>
              ))}
            </View>
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

  tabSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.lg,
  },
  tabButtonActive: { backgroundColor: colors.softBrand },
  tabButtonText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  tabButtonTextActive: { color: colors.brand, fontWeight: '800' },

  tabContent: { marginTop: space.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.md },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.ink },
  sectionSubtitle: { fontSize: 12, color: colors.muted, marginTop: 1 },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  actionPillText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  cardList: { gap: space.md },
  meetupCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sponsorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginBottom: space.sm,
    alignSelf: 'flex-start',
  },
  sponsorText: { fontSize: 11, fontWeight: '800', color: '#C2410C' },
  meetupTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
  meetupDesc: { fontSize: 13, color: colors.muted, marginTop: 4, lineHeight: 18 },

  meetupMeta: { gap: 4, marginTop: space.sm, paddingTop: space.xs, borderTopWidth: 1, borderTopColor: colors.line },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: colors.ink, fontWeight: '600' },

  meetupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.md,
  },
  rsvpAvatarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rsvpBadge: { backgroundColor: colors.canvas, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
  rsvpBadgeText: { fontSize: 11, fontWeight: '800', color: colors.brand },
  hostName: { fontSize: 11, color: colors.muted },
  rsvpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.softBrand,
  },
  rsvpBtnActive: { backgroundColor: colors.brand },
  rsvpBtnText: { color: colors.brand, fontSize: 12, fontWeight: '800' },
  rsvpBtnTextActive: { color: '#FFF' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.line,
    gap: space.sm,
    marginBottom: space.sm,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.ink },
  forumCatRow: { gap: 8, paddingBottom: space.md },
  forumCatPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  forumCatPillActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  forumCatText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  forumCatTextActive: { color: '#FFF' },

  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: { backgroundColor: colors.canvas, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm },
  categoryBadgeText: { fontSize: 10, fontWeight: '800', color: colors.brand, textTransform: 'uppercase' },
  questionAuthor: { fontSize: 11, color: colors.muted },
  questionTitle: { fontSize: 15, fontWeight: '800', color: colors.ink, marginTop: 6 },
  questionDetails: { fontSize: 13, color: colors.muted, marginTop: 4, lineHeight: 18 },

  topAnswerBox: {
    backgroundColor: '#FAF9F5',
    borderRadius: radius.lg,
    padding: space.sm,
    marginTop: space.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  answerAuthorRow: { marginBottom: 2 },
  vetAnswerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  vetAnswerText: { fontSize: 10, fontWeight: '800', color: '#006B78' },
  answerAuthor: { fontSize: 11, fontWeight: '700', color: colors.ink },
  topAnswerText: { fontSize: 12, color: colors.ink, lineHeight: 16 },

  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.sm,
    paddingTop: space.xs,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  answersCount: { fontSize: 11, fontWeight: '700', color: colors.muted },
  viewThreadText: { fontSize: 12, fontWeight: '800', color: colors.brand },

  playmateCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  playmateHeader: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  playmateAvatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playmateName: { fontSize: 15, fontWeight: '900', color: colors.ink },
  playmateBreed: { fontSize: 12, color: colors.muted, marginTop: 1 },
  playmateCity: { fontSize: 11, color: colors.brand, marginTop: 2, fontWeight: '600' },
  energyBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 3, borderRadius: radius.sm },
  energyText: { fontSize: 9, fontWeight: '900', color: '#B45309' },
  temperamentText: { fontSize: 13, color: colors.ink, marginTop: space.sm, fontStyle: 'italic' },
  requestPlaydateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.brand,
    paddingVertical: 10,
    borderRadius: radius.lg,
    marginTop: space.md,
  },
  requestPlaydateText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
});
