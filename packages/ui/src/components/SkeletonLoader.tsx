import React, { useEffect, useState } from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius } from '../tokens';

export interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = radius.sm,
  style,
}: SkeletonLoaderProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const sweep = useSharedValue(0);

  useEffect(() => {
    if (containerWidth <= 0) return;
    sweep.value = -containerWidth * 0.5;
    sweep.value = withRepeat(
      withTiming(containerWidth * 1.2, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
      -1,
      false,
    );
    return () => cancelAnimation(sweep);
  }, [containerWidth, sweep]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sweep.value }],
  }));

  return (
    <View
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      style={[
        styles.skeleton,
        {
          width: width as number | `${number}%`,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.sweep, sweepStyle]} />
    </View>
  );
}

export function SkeletonCard({ height = 120, style }: { height?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.card, height ? { minHeight: height } : undefined, style]}>
      <SkeletonLoader width="60%" height={16} style={{ marginBottom: 10 }} />
      <SkeletonLoader width="90%" height={12} style={{ marginBottom: 6 }} />
      <SkeletonLoader width="40%" height={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.pearl,
    overflow: 'hidden',
  },
  sweep: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '50%',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: radius.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
});
