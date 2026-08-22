import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, motion } from '../tokens';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Background tint when selected. */
  tint?: string;
  /** Text/icon color when selected. */
  color?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Chip({ label, selected = false, onPress, tint, color, icon, disabled }: ChipProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected, disabled: !!disabled }}
      disabled={disabled || !onPress}
      onPressIn={() => {
        scale.value = withSpring(0.94, motion.spring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring);
      }}
      onPress={onPress}
      style={[
        styles.base,
        selected ? [styles.selected, { backgroundColor: tint ?? colors.softBrand }] : styles.unselected,
        disabled && styles.disabled,
        animatedStyle,
      ]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text
        style={[
          styles.label,
          selected && { color: color ?? colors.brandDark },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    minHeight: 36,
  },
  selected: {},
  unselected: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  disabled: {
    opacity: 0.5,
  },
  iconWrap: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
});
