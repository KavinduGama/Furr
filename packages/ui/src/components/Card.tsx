import React from 'react';
import { Pressable, StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, radius, shadows, motion } from '../tokens';

export type CardVariant = 'elevated' | 'flat' | 'outline';

interface CardBaseProps {
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({ variant = 'elevated', style, children }: CardBaseProps) {
  return <View style={[styles.base, styles[variant], style]}>{children}</View>;
}

export interface PressableCardProps extends CardBaseProps {
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'link' | 'menuitem';
}

export function PressableCard({
  variant = 'elevated',
  style,
  children,
  onPress,
  disabled,
  accessibilityLabel,
  accessibilityRole,
}: PressableCardProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole={onPress ? accessibilityRole ?? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled || !onPress}
      onPressIn={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        scale.value = withSpring(0.97, motion.spring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring);
      }}
      onPress={onPress}
      style={[styles.base, styles[variant], animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  elevated: { ...shadows.md },
  flat: {
    borderWidth: 1,
    borderColor: colors.line,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: 'transparent',
  },
});
