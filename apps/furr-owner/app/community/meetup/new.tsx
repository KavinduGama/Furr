import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { useCommunity } from '@/src/context/community';

export default function HostMeetupScreen() {
  const { hostMeetup } = useCommunity();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Colombo 07');
  const [date, setDate] = useState(
    new Date(Date.now() + 3 * 24 * 3600000).toISOString().slice(0, 10)
  );
  const [time, setTime] = useState('08:30 AM');
  const [targetSpecies, setTargetSpecies] = useState<'dog' | 'cat' | 'all'>('dog');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !locationName.trim() || !description.trim()) {
      Alert.alert('Missing Info', 'Please fill in title, location, and description.');
      return;
    }

    const meetupDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(meetupDate.getTime()) || meetupDate < today) {
      Alert.alert('Invalid Date', 'Meetup date cannot be in the past.');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const meetup = await hostMeetup({
        title,
        description,
        targetSpecies,
        locationName,
        address,
        city,
        date,
        time,
      });

      if (meetup) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Meetup Published! 🎉',
          'Your local pet event is now live for nearby pet parents to RSVP.',
          [{ text: 'Great!', onPress: () => router.back() }]
        );
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Unable to create meetup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Host a Pet Meetup',
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
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Event Title</Text>
          <TextInput
            placeholder="e.g. Saturday Morning Corgi & Beagle Walk"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            style={styles.textInput}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description & Activity</Text>
          <TextInput
            placeholder="Describe what pet owners and companions will be doing, leash rules, what to bring..."
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={[styles.textInput, { minHeight: 90, textAlignVertical: 'top' }]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Location / Park Name</Text>
          <TextInput
            placeholder="e.g. Viharamahadevi Park, Independence Square"
            placeholderTextColor={colors.muted}
            value={locationName}
            onChangeText={setLocationName}
            style={styles.textInput}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address or Landmark</Text>
          <TextInput
            placeholder="e.g. Near the main fountain"
            placeholderTextColor={colors.muted}
            value={address}
            onChangeText={setAddress}
            style={styles.textInput}
          />
        </View>

        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>City</Text>
            <TextInput
              placeholder="Colombo, Kandy..."
              placeholderTextColor={colors.muted}
              value={city}
              onChangeText={setCity}
              style={styles.textInput}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Time</Text>
            <TextInput
              placeholder="08:30 AM"
              placeholderTextColor={colors.muted}
              value={time}
              onChangeText={setTime}
              style={styles.textInput}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Who is welcome?</Text>
          <View style={styles.speciesRow}>
            {[
              { id: 'dog', label: '🐶 Dogs Only' },
              { id: 'cat', label: '🐱 Cats (Carrier/Leash)' },
              { id: 'all', label: '🐾 All Companions' },
            ].map((sp) => {
              const isSelected = targetSpecies === sp.id;
              return (
                <Pressable
                  key={sp.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setTargetSpecies(sp.id as any);
                  }}
                  style={[styles.speciesPill, isSelected && styles.speciesPillActive]}
                >
                  <Text
                    style={[styles.speciesText, isSelected && styles.speciesTextActive]}
                  >
                    {sp.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ marginTop: space.xl }}>
          <Button
            label={isSubmitting ? 'Publishing...' : 'Publish Meetup'}
            loading={isSubmitting}
            onPress={handleCreate}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  headerBtn: { padding: 6 },
  content: { padding: space.lg, paddingBottom: space.xxl, gap: space.md },

  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '800', color: colors.ink },
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
  rowInputs: { flexDirection: 'row', gap: space.md },

  speciesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  speciesPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  speciesPillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  speciesText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  speciesTextActive: { color: '#FFF' },
});
