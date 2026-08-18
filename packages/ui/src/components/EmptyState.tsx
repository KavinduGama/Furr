import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { colors, radius, space } from '../tokens';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  emoji?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  emoji,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {emoji ? (
        <View style={styles.iconCircle}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
      ) : icon ? (
        <View style={styles.iconCircle}>{icon}</View>
      ) : null}

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {actionLabel && onAction ? (
        <View style={styles.actionContainer}>
          <Button label={actionLabel} onPress={onAction} variant="primary" />
        </View>
      ) : null}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xl,
    paddingHorizontal: space.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.softBrand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  emoji: {
    fontSize: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: space.xs,
  },
  description: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  actionContainer: {
    marginTop: space.lg,
    width: '100%',
    maxWidth: 220,
  },
});
