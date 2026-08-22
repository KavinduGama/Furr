import React from 'react';
import { Image, StyleSheet, Text, View, type ViewStyle, type StyleProp } from 'react-native';
import { colors } from '../tokens';

export interface AvatarProps {
  uri?: string;
  /** Fallback letter/initials shown when no photo. */
  label?: string;
  /** Fallback emoji/species glyph shown when no photo. */
  emoji?: string;
  size?: number;
  /** Brand ring around the avatar. */
  ring?: boolean;
  /** Thinner ring used to mark the selected item in a strip. */
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ uri, label, emoji, size = 56, ring = false, selected = false, style }: AvatarProps) {
  const ringWidth = ring || selected ? 2 : 0;
  const outer = size + (ringWidth > 0 ? 8 : 0);

  return (
    <View
      style={[
        styles.outer,
        {
          width: outer,
          height: outer,
          borderRadius: outer / 2,
          padding: ringWidth > 0 ? 3 : 0,
          borderWidth: ringWidth,
          borderColor: selected || ring ? colors.brand : 'transparent',
        },
        style,
      ]}
    >
      <View style={[styles.inner, { width: size, height: size, borderRadius: size / 2 }]}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={[styles.fallback, { fontSize: size * 0.45 }]} allowFontScaling={false}>
            {emoji ?? label?.slice(0, 1).toUpperCase() ?? '?'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pearl,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    textAlign: 'center',
  },
});
