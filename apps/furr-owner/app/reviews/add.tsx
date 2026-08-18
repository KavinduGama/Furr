import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space, shadows, Button, ReviewStars } from '@furr/ui';
import { useAuth } from '../../src/context/auth';
import { createUniversalReview } from '@furr/firebase';
import { validateReviewInput, type ReviewTargetType } from '@furr/core';

export default function AddReviewScreen() {
  const { targetId, targetType, targetTitle } = useLocalSearchParams<{
    targetId: string;
    targetType: ReviewTargetType;
    targetTitle: string;
  }>();
  const router = useRouter();
  const { profile, firebaseUser } = useAuth();

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const availableTags =
    targetType === 'provider'
      ? ['Punctual ⏰', 'Gentle Handling 🐶', 'Clean Equipment ✨', 'Calmed Anxious Pet 😌', 'Great Communication 💬']
      : ['High Quality 🌟', 'Fast Delivery 🚚', 'Authentic Product 📦', 'Great Value 💰', 'Pet Loved It ❤️'];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    const val = validateReviewInput(rating, comment);
    if (!val.valid) {
      Alert.alert('Review Error', val.error || 'Please fill in required review fields');
      return;
    }

    setSubmitting(true);
    try {
      await createUniversalReview({
        targetId: targetId || 'prod-1',
        targetType: (targetType as ReviewTargetType) || 'product',
        targetTitle: targetTitle || 'Furr Service',
        authorUid: firebaseUser?.uid || profile?.uid || 'demo-uid',
        authorName: profile?.displayName || 'Pet Parent',
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        verifiedPurchaseOrBooking: true,
      });

      Alert.alert('Thank You! ⭐', 'Your review has been submitted.', [
        {
          text: 'Done',
          onPress: () => router.back(),
        },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not submit your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write a Review</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Target Header Card */}
        <View style={styles.targetCard}>
          <Text style={styles.targetTypeLabel}>
            {targetType === 'provider' ? 'SERVICE SPECIALIST' : 'MARKETPLACE ITEM'}
          </Text>
          <Text style={styles.targetTitle}>{targetTitle || 'Furr Purchase'}</Text>
        </View>

        {/* Rating Stars Picker */}
        <View style={styles.starsCard}>
          <Text style={styles.starsTitle}>How would you rate your experience?</Text>
          <View style={styles.starsRow}>
            <ReviewStars
              rating={rating}
              size={36}
              interactive
              onRatingChange={(newScore) => setRating(newScore)}
            />
          </View>
          <Text style={styles.ratingScoreLabel}>
            {rating === 5
              ? '⭐⭐⭐⭐⭐ Fantastic!'
              : rating === 4
              ? '⭐⭐⭐⭐ Very Good'
              : rating === 3
              ? '⭐⭐⭐ Average'
              : rating === 2
              ? '⭐⭐ Below Expectations'
              : '⭐ Poor'}
          </Text>
        </View>

        {/* Quick Highlights / Tags */}
        <Text style={styles.sectionHeading}>What did you like best?</Text>
        <View style={styles.tagsContainer}>
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[styles.tagChip, isSelected && styles.tagChipActive]}
              >
                <Text style={[styles.tagChipText, isSelected && styles.tagChipTextActive]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Review Form */}
        <Text style={styles.sectionHeading}>Review Details</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Review Headline (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Highly recommend for anxious dogs!"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.fieldLabel}>Your Comments *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={comment}
            onChangeText={setComment}
            placeholder="Share details about the quality of service, how your pet responded, or delivery speed..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={5}
          />
        </View>

        {/* Submit */}
        <View style={{ marginTop: space.lg, marginBottom: space.xl }}>
          <Button
            label={submitting ? 'Submitting Review...' : 'Post Review ⭐'}
            onPress={handleSubmit}
            variant="primary"
            loading={submitting}
          />

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: 54,
    paddingBottom: space.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  scrollContent: {
    padding: space.lg,
    paddingBottom: 40,
  },
  targetCard: {
    backgroundColor: colors.surface,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: space.lg,
  },
  targetTypeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.brand,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  targetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  starsCard: {
    backgroundColor: colors.surface,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    marginBottom: space.lg,
    ...shadows.sm,
  },
  starsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: space.md,
  },
  starsRow: {
    marginVertical: space.xs,
  },
  ratingScoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    marginTop: space.sm,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: space.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
    marginBottom: space.lg,
  },
  tagChip: {
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tagChipActive: {
    backgroundColor: colors.softBrand,
    borderColor: colors.brand,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
  },
  tagChipTextActive: {
    color: colors.brand,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 6,
    marginTop: space.xs,
  },
  textInput: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
    marginBottom: space.sm,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
