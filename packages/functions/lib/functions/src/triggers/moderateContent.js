"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onCommunityQuestionCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const BANNED_PATTERNS = [
    /\b(scam|abuse|fake|illegal|viagra|casino)\b/i,
];
/**
 * Automated text moderation trigger for community forum questions and posts.
 */
exports.onCommunityQuestionCreated = (0, firestore_1.onDocumentCreated)('community_questions/{questionId}', async (event) => {
    const data = event.data?.data();
    if (!data)
        return;
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
});
//# sourceMappingURL=moderateContent.js.map