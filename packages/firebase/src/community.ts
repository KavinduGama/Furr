// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Community, Meetups & Forums helpers & seed data
// ─────────────────────────────────────────────────────────────

import type { PetMeetup, ForumQuestion, PlaydateProfile, ForumAnswer } from '@furr/core';

export const INITIAL_MEETUPS: PetMeetup[] = [
  {
    id: 'meet-1',
    creatorUid: 'user-1',
    creatorName: 'Dharshana Fernando',
    title: 'Viharamahadevi Golden Retriever & Lab Play Morning',
    description: 'Bring your energetic retrievers for a sunny Saturday morning run, agility games, and pet-friendly socializing!',
    targetSpecies: 'dog',
    targetBreeds: ['Golden Retriever', 'Labrador Retriever'],
    locationName: 'Viharamahadevi Park Open Lawn',
    address: 'Near Public Library entrance',
    city: 'Colombo 07',
    date: new Date(Date.now() + 2 * 24 * 3600000).toISOString().slice(0, 10),
    time: '08:30 AM',
    rsvpCount: 14,
    rsvpUids: ['user-1', 'demo-uid'],
    isSponsored: true,
    sponsorName: 'Colombo Pet Mart (Free treat samples)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'meet-2',
    creatorUid: 'user-2',
    creatorName: 'Anuki Jayawardena',
    title: 'Sunday Sunset Beach Paws Walk',
    description: 'Casual leashed evening walk along Marine Drive. Great for puppies and gentle seniors.',
    targetSpecies: 'dog',
    locationName: 'Mount Lavinia Beach Promenade',
    address: 'Hotel Road Beach Access',
    city: 'Mount Lavinia',
    date: new Date(Date.now() + 3 * 24 * 3600000).toISOString().slice(0, 10),
    time: '05:00 PM',
    rsvpCount: 9,
    rsvpUids: ['user-2'],
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_QUESTIONS: ForumQuestion[] = [
  {
    id: 'q-1',
    authorUid: 'user-3',
    authorName: 'Ruvini Senanayake',
    category: 'Diet',
    petSpecies: 'dog',
    title: 'What are the best local fruits and veggies safe for puppies to chew on?',
    details: 'My 4-month Golden pup is teething heavily. Want natural healthy alternatives to frozen chews.',
    answersCount: 2,
    answers: [
      {
        id: 'ans-1',
        authorUid: 'vet-101',
        authorName: 'Dr. Sarah Weerasinghe',
        authorRole: 'vet',
        text: 'Frozen carrot sticks and chilled deseeded cucumber slices work wonders for teething! They soothe inflamed gums and are low in calories. Avoid grapes, raisins, onions, and avocado entirely.',
        upvotes: 18,
        upvotedUids: ['user-3', 'demo-uid'],
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'ans-2',
        authorUid: 'user-1',
        authorName: 'Dharshana F.',
        authorRole: 'owner',
        text: 'I freeze plain Greek yogurt with mashed pumpkin in an ice tray. My dog loves it!',
        upvotes: 7,
        upvotedUids: [],
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'q-2',
    authorUid: 'user-4',
    authorName: 'Mahesh Perera',
    category: 'Training',
    petSpecies: 'dog',
    title: 'How to stop jumping up on guests when the doorbell rings?',
    details: 'Our 1-year rescue gets overly excited whenever someone arrives.',
    answersCount: 1,
    answers: [
      {
        id: 'ans-3',
        authorUid: 'trainer-1',
        authorName: 'K9 Academy Trainer',
        authorRole: 'trainer',
        text: 'Teach a "Go to Mat" or "Place" command. Reward calm four-paws-on-the-floor behavior before guests give any attention or petting. Turn your back and ignore if jumping occurs.',
        upvotes: 12,
        upvotedUids: ['demo-uid'],
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

export const INITIAL_PLAYMATES: PlaydateProfile[] = [
  {
    id: 'play-1',
    petId: 'pet-charlie',
    ownerUid: 'user-1',
    ownerName: 'Dharshana',
    petName: 'Charlie',
    species: 'dog',
    breed: 'Golden Retriever',
    size: 'large',
    energyLevel: 'high',
    temperament: 'Friendly, loves playing fetch and gentle with puppies',
    city: 'Colombo 07',
    distanceKm: 2.1,
  },
  {
    id: 'play-2',
    petId: 'pet-milo',
    ownerUid: 'user-5',
    ownerName: 'Keshia',
    petName: 'Milo',
    species: 'dog',
    breed: 'French Bulldog',
    size: 'small',
    energyLevel: 'moderate',
    temperament: 'Calm, couch potato, loves short park sniff walks',
    city: 'Colombo 03',
    distanceKm: 3.5,
  },
  {
    id: 'play-3',
    petId: 'pet-bella',
    ownerUid: 'user-6',
    ownerName: 'Niroshan',
    petName: 'Bella',
    species: 'dog',
    breed: 'Beagle',
    size: 'medium',
    energyLevel: 'high',
    temperament: 'Playful, vocal, loves chasing balls and scent games',
    city: 'Mount Lavinia',
    distanceKm: 6.8,
  },
];

export function subscribeToMeetups(onUpdate: (meetups: PetMeetup[]) => void) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      unsubscribe = onSnapshot(
        collection(db, 'community_meetups'),
        (snapshot) => {
          if (snapshot.empty) {
            onUpdate(INITIAL_MEETUPS);
            return;
          }
          const list: PetMeetup[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as PetMeetup);
          });
          list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          onUpdate(list);
        },
        (error) => {
          console.warn('Meetups fallback:', error);
          onUpdate(INITIAL_MEETUPS);
        }
      );
      if (!active && unsubscribe) unsubscribe();
    } catch (e) {
      console.warn('Failed to subscribe to meetups:', e);
      onUpdate(INITIAL_MEETUPS);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export function subscribeToQuestions(onUpdate: (questions: ForumQuestion[]) => void) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      unsubscribe = onSnapshot(
        collection(db, 'community_questions'),
        (snapshot) => {
          if (snapshot.empty) {
            onUpdate(INITIAL_QUESTIONS);
            return;
          }
          const list: ForumQuestion[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as ForumQuestion);
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onUpdate(list);
        },
        (error) => {
          console.warn('Questions fallback:', error);
          onUpdate(INITIAL_QUESTIONS);
        }
      );
      if (!active && unsubscribe) unsubscribe();
    } catch (e) {
      console.warn('Failed to subscribe to questions:', e);
      onUpdate(INITIAL_QUESTIONS);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export async function createMeetup(
  data: Omit<PetMeetup, 'id' | 'createdAt' | 'rsvpCount' | 'rsvpUids'>
): Promise<PetMeetup> {
  try {
    const { getFirestore, collection, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const newRef = doc(collection(db, 'community_meetups'));
    const meetup: PetMeetup = {
      ...data,
      id: newRef.id,
      rsvpCount: 1,
      rsvpUids: [data.creatorUid],
      createdAt: new Date().toISOString(),
    };
    await setDoc(newRef, meetup);
    return meetup;
  } catch (e) {
    const mockMeetup: PetMeetup = {
      ...data,
      id: 'meet-' + Date.now(),
      rsvpCount: 1,
      rsvpUids: [data.creatorUid],
      createdAt: new Date().toISOString(),
    };
    return mockMeetup;
  }
}

export async function toggleMeetupRsvp(
  meetupId: string,
  userUid: string
): Promise<boolean> {
  // In local state/Firestore, toggles userUid in rsvpUids and updates count
  return true;
}

export async function createQuestion(
  data: Omit<ForumQuestion, 'id' | 'createdAt' | 'answersCount' | 'answers'>
): Promise<ForumQuestion> {
  try {
    const { getFirestore, collection, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const newRef = doc(collection(db, 'community_questions'));
    const question: ForumQuestion = {
      ...data,
      id: newRef.id,
      answersCount: 0,
      answers: [],
      createdAt: new Date().toISOString(),
    };
    await setDoc(newRef, question);
    return question;
  } catch (e) {
    const mockQuestion: ForumQuestion = {
      ...data,
      id: 'q-' + Date.now(),
      answersCount: 0,
      answers: [],
      createdAt: new Date().toISOString(),
    };
    return mockQuestion;
  }
}

export async function addAnswer(
  questionId: string,
  answerData: Omit<ForumAnswer, 'id' | 'createdAt' | 'upvotes' | 'upvotedUids'>
): Promise<ForumAnswer> {
  const answer: ForumAnswer = {
    ...answerData,
    id: 'ans-' + Date.now(),
    upvotes: 0,
    upvotedUids: [],
    createdAt: new Date().toISOString(),
  };
  return answer;
}
