import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { useCare } from '@/src/context/care';
import { usePets } from '@/src/context/pets';

const POPULAR_COMMANDS = ['Sit', 'Stay', 'Come (Recall)', 'Heel', 'Leave It', 'Paw/Shake', 'Down'];

export default function TrainingLogScreen() {
  const { trainingLogs, recordTraining } = useCare();
  const { selectedPet } = usePets();

  const [selectedCommand, setSelectedCommand] = useState(POPULAR_COMMANDS[0]);
  const [successRate, setSuccessRate] = useState(80);
  const [duration, setDuration] = useState('15');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const petName = selectedPet?.name || 'Pet';

  const handleSave = async () => {
    const parsedDuration = parseInt(duration, 10);
    if (isNaN(parsedDuration) || parsedDuration <= 0 || parsedDuration > 300) {
      Alert.alert('Invalid Duration', 'Please enter a training duration between 1 and 300 minutes.');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await recordTraining(selectedCommand, successRate, parsedDuration, notes);

    setIsSubmitting(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Session Logged! 🎓', `${selectedCommand} training for ${petName} saved.`);
    setNotes('');
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Training & Skills',
          headerStyle: { backgroundColor: colors.canvas },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Command Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Command or Skill</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.commandsRow}
          >
            {POPULAR_COMMANDS.map((cmd) => {
              const isSelected = selectedCommand === cmd;
              return (
                <Pressable
                  key={cmd}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedCommand(cmd);
                  }}
                  style={[styles.cmdPill, isSelected && styles.cmdPillActive]}
                >
                  <Text style={[styles.cmdText, isSelected && styles.cmdTextActive]}>{cmd}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Step 2: Success Rate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Success Rate: {successRate}%</Text>
          <View style={styles.ratesRow}>
            {[50, 70, 80, 90, 100].map((rate) => {
              const isSelected = successRate === rate;
              return (
                <Pressable
                  key={rate}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSuccessRate(rate);
                  }}
                  style={[styles.ratePill, isSelected && styles.ratePillActive]}
                >
                  <Text style={[styles.rateText, isSelected && styles.rateTextActive]}>
                    {rate}%
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Step 3: Session Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Duration (Minutes)</Text>
          <TextInput
            keyboardType="number-pad"
            placeholder="15"
            placeholderTextColor={colors.muted}
            value={duration}
            onChangeText={setDuration}
            style={styles.textInput}
          />
        </View>

        {/* Step 4: Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observations & Rewards</Text>
          <TextInput
            placeholder="e.g. Great focus with chicken liver treats, struggled with distant distractions..."
            placeholderTextColor={colors.muted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={[styles.textInput, { minHeight: 80, textAlignVertical: 'top' }]}
          />
        </View>

        <View style={{ marginTop: space.md }}>
          <Button
            label={isSubmitting ? 'Logging...' : 'Log Training Session'}
            loading={isSubmitting}
            onPress={handleSave}
          />
        </View>

        {/* Training History */}
        <View style={[styles.section, { marginTop: space.xl }]}>
          <Text style={styles.sectionTitle}>Past Training Logs</Text>
          <View style={styles.logsList}>
            {trainingLogs.map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <Text style={styles.logCmdName}>{log.commandName}</Text>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>{log.successRatePercent}%</Text>
                  </View>
                </View>
                {log.notes && <Text style={styles.logNotes}>"{log.notes}"</Text>}
                <Text style={styles.logMeta}>
                  {log.durationMinutes} mins ·{' '}
                  {new Date(log.loggedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  headerBtn: { padding: 6 },
  content: { padding: space.lg, paddingBottom: space.xxl, gap: space.md },

  section: { gap: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.ink },

  commandsRow: { gap: 8, paddingVertical: 4 },
  cmdPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cmdPillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  cmdText: { fontSize: 13, fontWeight: '700', color: colors.ink },
  cmdTextActive: { color: '#FFF' },

  ratesRow: { flexDirection: 'row', gap: 8 },
  ratePill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  ratePillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  rateText: { fontSize: 13, fontWeight: '800', color: colors.ink },
  rateTextActive: { color: '#FFF' },

  textInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
  },

  logsList: { gap: space.sm },
  logCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logCmdName: { fontSize: 14, fontWeight: '800', color: colors.ink },
  scoreBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  scoreText: { fontSize: 11, fontWeight: '900', color: '#166534' },
  logNotes: { fontSize: 12, color: colors.muted, fontStyle: 'italic', marginTop: 4 },
  logMeta: { fontSize: 11, color: colors.muted, marginTop: 6 },
});
