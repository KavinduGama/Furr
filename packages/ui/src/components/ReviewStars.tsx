import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { colors, space } from '../tokens';

export interface ReviewStarsProps {
  rating: number; // 0 - 5
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  showScore?: boolean;
  reviewCount?: number;
  style?: ViewStyle;
}

export function ReviewStars({
  rating,
  maxStars = 5,
  size = 16,
  interactive = false,
  onRatingChange,
  showScore = false,
  reviewCount,
  style,
}: ReviewStarsProps) {
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    const isFilled = i <= Math.round(rating);

    if (interactive && onRatingChange) {
      stars.push(
        <TouchableOpacity
          key={i}
          activeOpacity={0.7}
          onPress={() => onRatingChange(i)}
          style={{ paddingHorizontal: 2 }}
        >
          <Text style={{ fontSize: size, color: isFilled ? colors.accent : colors.line }}>
            ★
          </Text>
        </TouchableOpacity>
      );
    } else {
      stars.push(
        <Text key={i} style={{ fontSize: size, color: isFilled ? colors.accent : colors.line, marginHorizontal: 1 }}>
          ★
        </Text>
      );
    }
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsRow}>{stars}</View>

      {showScore ? (
        <Text style={[styles.scoreText, { fontSize: size * 0.85 }]}>
          {rating.toFixed(1)}
        </Text>
      ) : null}

      {reviewCount !== undefined ? (
        <Text style={[styles.countText, { fontSize: size * 0.8 }]}>
          ({reviewCount})
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontWeight: '700',
    color: colors.ink,
    marginLeft: space.xs,
  },
  countText: {
    color: colors.muted,
    marginLeft: 4,
  },
});
