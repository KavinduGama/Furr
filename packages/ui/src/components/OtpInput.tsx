import React, { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radius } from '../index';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  error = false,
  disabled = false,
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const digits = value.split('').slice(0, length);
  // Pad to length with empty strings
  while (digits.length < length) digits.push('');

  const handleChange = (text: string) => {
    // Only keep digits, max `length` chars
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
    onChange(cleaned);
  };

  return (
    <Pressable
      style={styles.wrapper}
      onPress={() => inputRef.current?.focus()}
      accessible={false}
    >
      {/* Hidden text input captures all input */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        caretHidden
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.hiddenInput}
        editable={!disabled}
        accessibilityLabel={`Enter ${length}-digit verification code`}
      />
      {/* Visual digit boxes */}
      {Array.from({ length }).map((_, i) => {
        const isActive = focused && digits.join('').length === i;
        const isFilled = !!digits[i];
        return (
          <View
            key={i}
            style={[
              styles.box,
              isActive && styles.boxActive,
              isFilled && styles.boxFilled,
              error && styles.boxError,
            ]}
          >
            <Text style={[styles.digit, error && styles.digitError]}>
              {digits[i] ?? ''}
            </Text>
            {isActive && !isFilled && <View style={styles.cursor} />}
          </View>
        );
      })}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  box: {
    flex: 1,
    aspectRatio: 0.88,
    maxWidth: 54,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {
    borderColor: colors.brand,
    backgroundColor: colors.mist,
  },
  boxFilled: {
    borderColor: colors.brand,
    backgroundColor: colors.surface,
  },
  boxError: {
    borderColor: colors.danger,
    backgroundColor: '#FFF5F5',
  },
  digit: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: 0,
  },
  digitError: {
    color: colors.danger,
  },
  cursor: {
    position: 'absolute',
    width: 2,
    height: 28,
    borderRadius: 1,
    backgroundColor: colors.brand,
    opacity: 0.9,
  },
});
