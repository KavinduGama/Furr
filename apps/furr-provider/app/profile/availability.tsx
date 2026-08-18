import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@furr/ui';
import { useProviderProfile } from '../../src/context/provider';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AvailabilityScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useProviderProfile();

  const [availableDays, setAvailableDays] = useState<string[]>(
    profile?.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  );
  const [startHour, setStartHour] = useState(profile?.availableHours?.start || '08:30');
  const [endHour, setEndHour] = useState(profile?.availableHours?.end || '18:30');
  const [vacationMode, setVacationMode] = useState(false);
  const [vacationMsg, setVacationMsg] = useState(
    'Studio is temporarily closed for renovations. Resuming on September 1st.'
  );

  const toggleDay = (d: string) => {
    if (availableDays.includes(d)) {
      if (availableDays.length > 1) {
        setAvailableDays(availableDays.filter((day) => day !== d));
      }
    } else {
      setAvailableDays([...availableDays, d]);
    }
  };

  const handleSave = async () => {
    await updateProfile({
      availableDays,
      availableHours: { start: startHour, end: endHour },
      vacationMode,
      vacationMessage: vacationMode ? vacationMsg : undefined,
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Operating Hours & Schedule</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Weekly Schedule Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Working Days</Text>
          <Text style={styles.cardSub}>
            Clients will only be offered slots on the days you select below.
          </Text>

          <View style={styles.daysGrid}>
            {DAYS.map((day) => {
              const isActive = availableDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayPill, isActive && styles.dayPillActive]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[styles.dayPillText, isActive && { color: '#FFF' }]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Operating Hours */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Working Window</Text>
          <Text style={styles.cardSub}>Daily opening and closing hours.</Text>

          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Opening Time</Text>
              <TextInput
                style={styles.input}
                value={startHour}
                onChangeText={setStartHour}
                placeholder="08:30"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Closing Time</Text>
              <TextInput
                style={styles.input}
                value={endHour}
                onChangeText={setEndHour}
                placeholder="18:30"
              />
            </View>
          </View>
        </View>

        {/* Vacation Mode Toggle */}
        <View style={styles.card}>
          <View style={styles.vacationHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Vacation / Temporary Pause</Text>
              <Text style={styles.cardSub}>
                Temporarily pause new client bookings while retaining active orders.
              </Text>
            </View>
            <Switch
              value={vacationMode}
              onValueChange={setVacationMode}
              trackColor={{ false: colors.line, true: colors.brand }}
            />
          </View>

          {vacationMode && (
            <View style={styles.vacationBox}>
              <Text style={styles.label}>Auto-Reply Notice to Pet Parents</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={vacationMsg}
                onChangeText={setVacationMsg}
                multiline
                numberOfLines={3}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer Save */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="checkmark" size={18} color="#FFF" />
          <Text style={styles.saveBtnText}>Save Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: colors.ink },

  scrollContent: { padding: space.lg, paddingBottom: 110, gap: space.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  cardSub: { fontSize: 12, color: colors.muted, marginTop: 2, marginBottom: space.md },

  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dayPillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  dayPillText: { fontSize: 13, fontWeight: '800', color: colors.ink },

  rowInputs: { flexDirection: 'row', gap: space.md },
  label: { fontSize: 11, fontWeight: '800', color: colors.ink, marginBottom: 4, textTransform: 'uppercase' },
  input: {
    backgroundColor: colors.canvas,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    fontSize: 13,
    color: colors.ink,
  },

  vacationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vacationBox: { marginTop: space.md },
  textArea: { height: 75, textAlignVertical: 'top' },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: space.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : space.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  saveBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.brand,
    paddingVertical: 14,
    borderRadius: radius.pill,
  },
  saveBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
});
