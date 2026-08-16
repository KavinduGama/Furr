import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { PetMeetup, ForumQuestion, PlaydateProfile, ForumAnswer } from '@furr/core';
import {
  subscribeToMeetups,
  subscribeToQuestions,
  createMeetup as firebaseCreateMeetup,
  createQuestion as firebaseCreateQuestion,
  addAnswer as firebaseAddAnswer,
  INITIAL_MEETUPS,
  INITIAL_QUESTIONS,
  INITIAL_PLAYMATES,
} from '@furr/firebase';
import { useAuth } from './auth';

interface CommunityContextType {
  meetups: PetMeetup[];
  questions: ForumQuestion[];
  playmates: PlaydateProfile[];
  toggleRsvp: (meetupId: string) => Promise<void>;
  hostMeetup: (
    data: Omit<PetMeetup, 'id' | 'createdAt' | 'rsvpCount' | 'rsvpUids' | 'creatorUid' | 'creatorName'>
  ) => Promise<PetMeetup | null>;
  postQuestion: (
    data: Omit<ForumQuestion, 'id' | 'createdAt' | 'answersCount' | 'answers' | 'authorUid' | 'authorName'>
  ) => Promise<ForumQuestion | null>;
  postAnswer: (questionId: string, text: string) => Promise<void>;
  upvoteAnswer: (questionId: string, answerId: string) => void;
}

const CommunityContext = createContext<CommunityContextType | null>(null);

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser, profile } = useAuth();
  const [meetups, setMeetups] = useState<PetMeetup[]>(INITIAL_MEETUPS);
  const [questions, setQuestions] = useState<ForumQuestion[]>(INITIAL_QUESTIONS);
  const [playmates] = useState<PlaydateProfile[]>(INITIAL_PLAYMATES);

  useEffect(() => {
    const unsubMeetups = subscribeToMeetups((list) => setMeetups(list));
    const unsubQuestions = subscribeToQuestions((list) => setQuestions(list));
    return () => {
      unsubMeetups();
      unsubQuestions();
    };
  }, []);

  const toggleRsvp = useCallback(
    async (meetupId: string) => {
      const userUid = firebaseUser?.uid || 'demo-uid';
      setMeetups((prev) =>
        prev.map((m) => {
          if (m.id !== meetupId) return m;
          const isAttending = m.rsvpUids.includes(userUid);
          const newUids = isAttending
            ? m.rsvpUids.filter((uid) => uid !== userUid)
            : [...m.rsvpUids, userUid];
          return {
            ...m,
            rsvpUids: newUids,
            rsvpCount: newUids.length,
          };
        })
      );
    },
    [firebaseUser]
  );

  const hostMeetup = useCallback(
    async (
      data: Omit<PetMeetup, 'id' | 'createdAt' | 'rsvpCount' | 'rsvpUids' | 'creatorUid' | 'creatorName'>
    ): Promise<PetMeetup | null> => {
      const creatorUid = firebaseUser?.uid || 'demo-uid';
      const creatorName = profile?.displayName || 'Pet Lover';
      const newMeetup = await firebaseCreateMeetup({
        ...data,
        creatorUid,
        creatorName,
      });
      setMeetups((prev) => [newMeetup, ...prev]);
      return newMeetup;
    },
    [firebaseUser, profile]
  );

  const postQuestion = useCallback(
    async (
      data: Omit<ForumQuestion, 'id' | 'createdAt' | 'answersCount' | 'answers' | 'authorUid' | 'authorName'>
    ): Promise<ForumQuestion | null> => {
      const authorUid = firebaseUser?.uid || 'demo-uid';
      const authorName = profile?.displayName || 'Pet Parent';
      const newQuestion = await firebaseCreateQuestion({
        ...data,
        authorUid,
        authorName,
      });
      setQuestions((prev) => [newQuestion, ...prev]);
      return newQuestion;
    },
    [firebaseUser, profile]
  );

  const postAnswer = useCallback(
    async (questionId: string, text: string) => {
      const authorUid = firebaseUser?.uid || 'demo-uid';
      const authorName = profile?.displayName || 'Fellow Owner';
      const answer = await firebaseAddAnswer(questionId, {
        authorUid,
        authorName,
        authorRole: 'owner',
        text,
      });

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? {
                ...q,
                answersCount: q.answersCount + 1,
                answers: [...q.answers, answer],
              }
            : q
        )
      );
    },
    [firebaseUser, profile]
  );

  const upvoteAnswer = useCallback(
    (questionId: string, answerId: string) => {
      const userUid = firebaseUser?.uid || 'demo-uid';
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== questionId) return q;
          return {
            ...q,
            answers: q.answers.map((ans) => {
              if (ans.id !== answerId) return ans;
              const hasUpvoted = ans.upvotedUids.includes(userUid);
              const newUpvoted = hasUpvoted
                ? ans.upvotedUids.filter((u) => u !== userUid)
                : [...ans.upvotedUids, userUid];
              return {
                ...ans,
                upvotedUids: newUpvoted,
                upvotes: newUpvoted.length,
              };
            }),
          };
        })
      );
    },
    [firebaseUser]
  );

  const value = useMemo(
    () => ({
      meetups,
      questions,
      playmates,
      toggleRsvp,
      hostMeetup,
      postQuestion,
      postAnswer,
      upvoteAnswer,
    }),
    [
      meetups,
      questions,
      playmates,
      toggleRsvp,
      hostMeetup,
      postQuestion,
      postAnswer,
      upvoteAnswer,
    ]
  );

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
}
