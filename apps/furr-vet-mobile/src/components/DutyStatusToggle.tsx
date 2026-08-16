import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useVetAuth } from '../context/auth';

export function DutyStatusToggle() {
  const { isOnDuty, setIsOnDuty } = useVetAuth();

  return (
    <Pressable
      onPress={() => setIsOnDuty(!isOnDuty)}
      style={({ pressed }) => [
        styles.container,
        isOnDuty ? styles.onDutyBg : styles.offDutyBg,
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={[styles.dot, isOnDuty ? styles.onDutyDot : styles.offDutyDot]} />
      <Text style={[styles.text, isOnDuty ? styles.onDutyText : styles.offDutyText]}>
        {isOnDuty ? 'On Duty (On Call)' : 'Off Duty (Offline)'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  onDutyBg: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
    borderWidth: 1,
  },
  offDutyBg: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  onDutyDot: {
    backgroundColor: '#2E7D32',
  },
  offDutyDot: {
    backgroundColor: '#9E9E9E',
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
  },
  onDutyText: {
    color: '#1B5E20',
  },
  offDutyText: {
    color: '#616161',
  },
});
