import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, type TextStyle, type StyleProp } from 'react-native';
import { Easing, runOnJS, useAnimatedReaction, useSharedValue, withTiming } from 'react-native-reanimated';

export interface CountUpTextProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: StyleProp<TextStyle>;
}

/** Text that animates from its previous value to `value` whenever it changes. */
export function CountUpText({ value, duration = 900, prefix = '', suffix = '', style }: CountUpTextProps) {
  const [display, setDisplay] = useState(value);
  const current = useSharedValue(value);

  useEffect(() => {
    current.value = withTiming(value, { duration, easing: Easing.out(Easing.cubic) });
  }, [value, duration, current]);

  useAnimatedReaction(
    () => Math.round(current.value),
    (next, prev) => {
      if (next !== prev) runOnJS(setDisplay)(next);
    },
    [],
  );

  return (
    <Text style={[styles.text, style]} allowFontScaling={false}>
      {prefix}
      {display}
      {suffix}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontVariant: ['tabular-nums'],
  },
});
