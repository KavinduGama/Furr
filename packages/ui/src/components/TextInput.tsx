import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
  type TextInputProps as RNTextInputProps,
} from 'react-native';
import { colors, radius } from '../index';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  hint?: string;
  error?: string;
}

export function TextInput({ label, hint, error, style, ...rest }: TextInputProps) {
  const hasError = !!error;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[styles.input, hasError && styles.inputError, style]}
        placeholderTextColor={colors.muted}
        {...rest}
      />
      {hasError && <Text style={styles.error}>{error}</Text>}
      {!hasError && hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  input: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    fontSize: 17,
    color: colors.ink,
    fontWeight: '600',
  },
  inputError: {
    borderColor: colors.danger,
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
});
