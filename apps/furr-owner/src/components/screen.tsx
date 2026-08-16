import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { colors, space } from '@furr/ui';

export function Screen({ children }: PropsWithChildren) {
  return <ScrollView contentContainerStyle={styles.content} style={styles.scroll} showsVerticalScrollIndicator={false}>{children}</ScrollView>;
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 38, gap: space.lg },
});
