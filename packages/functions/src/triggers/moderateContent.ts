import { onDocumentCreated } from 'firebase-functions/v2/firestore';

const BANNED_PATTERNS = [
  /\b(scam|abuse|fake|illegal|viagra|casino)\b/i,
];

/**
 * Automated text moderation trigger for community forum questions and posts.
 */
export const onCommunityQuestionCreated = onDocumentCreated(
  'community_questions/{questionId}',
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const title = data.title || '';
    const body = data.body || '';
    const textToCheck = `${title} ${body}`;

    const isFlagged = BANNED_PATTERNS.some((pattern) => pattern.test(textToCheck));

    if (isFlagged) {
      await event.data?.ref.update({
        moderationStatus: 'flagged',
        flaggedAt: new Date().toISOString(),
        flagReason: 'Automated Keyword Moderation Filter',
      });
      console.log(`[moderateContent] Flagged question ${event.params.questionId} for review.`);
    }
  }
);
