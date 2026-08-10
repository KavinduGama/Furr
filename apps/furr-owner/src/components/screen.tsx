import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { colors, space } from '@furr/ui';

export function Screen({ children }: PropsWithChildren) {
  return <ScrollView contentContainerStyle={styles.content} style={styles.scroll} showsVerticalScrollIndicator={false}>{children}</ScrollView>;
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: space.md, paddingBottom: 36, gap: space.md },
});
