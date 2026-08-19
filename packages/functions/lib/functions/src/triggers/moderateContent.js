"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onCommunityQuestionCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const BANNED_PATTERNS = [
    /\b(scam|abuse|fake|illegal|viagra|casino|gambling|betting|hack|crypto\s*giveaway)\b/i,
    /\b(cruelty|poison|kill\s*dog|kill\s*cat|torture|fight\s*ring|dog\s*fight)\b/i,
    /\b(counterfeit|unapproved\s*drug|stolen\s*pet|illicit|narcotic)\b/i,
    /https?:\/\/(?:www\.)?(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly)\/[a-zA-Z0-9_-]+/i,
];
/**
 * Automated text moderation trigger for community forum questions, comments, and posts (LOW-001).
 * Normalizes unicode and checks multi-category prohibited content patterns.
 */
exports.onCommunityQuestionCreated = (0, firestore_1.onDocumentCreated)('community_questions/{questionId}', async (event) => {
    const data = event.data?.data();
    if (!data)
        return;
    const title = data.title || '';
    const body = data.body || '';
    const textToCheck = `${title} ${body}`.normalize('NFKD');
    const matchedPattern = BANNED_PATTERNS.find((pattern) => pattern.test(textToCheck));
    if (matchedPattern) {
        await event.data?.ref.update({
            moderationStatus: 'flagged',
            flaggedAt: new Date().toISOString(),
            flagReason: 'Automated Content Safety & Trust Filter Violation',
        });
        console.warn(`[moderateContent] Flagged question ${event.params.questionId} for review.`);
    }
});
//# sourceMappingURL=moderateContent.js.map