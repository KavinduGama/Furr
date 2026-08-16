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
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { useLostFound } from '@/src/context/lostfound';
import { usePets } from '@/src/context/pets';

export default function ReportPetScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const isLostReport = type !== 'found';

  const { broadcastLostAlert, reportFoundPet } = useLostFound();
  const { selectedPet } = usePets();

  const [petName, setPetName] = useState(isLostReport ? selectedPet?.name || '' : '');
  const [species, setSpecies] = useState<'dog' | 'cat'>(selectedPet?.species || 'dog');
  const [breed, setBreed] = useState(isLostReport ? selectedPet?.breed || '' : '');
  const [color, setColor] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('Colombo');
  const [phone, setPhone] = useState('+94 77 123 4567');
  const [reward, setReward] = useState('Rs 10,000');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!breed.trim() || !location.trim() || !phone.trim()) {
      Alert.alert('Missing Info', 'Please fill in breed/description, location, and contact phone.');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      if (isLostReport) {
        await broadcastLostAlert({
          petId: selectedPet?.id || 'pet-' + Date.now(),
          petName: petName || 'Missing Pet',
          species,
          breed,
          colour: color || 'Standard',
          photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80',
          lastSeenAddress: location,
          lastSeenCity: city,
          lastSeenTime: new Date().toISOString(),
          latitude: 6.9271,
          longitude: 79.8612,
          rewardAmount: reward,
          ownerPhone: phone,
          description: notes || 'Missing companion. Please help locate!',
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Amber Alert Broadcasted! 🚨',
          'Your missing pet alert has been sent to nearby pet parents and community radars.',
          [{ text: 'View Radar', onPress: () => router.replace('/lost-found' as never) }]
        );
      } else {
        await reportFoundPet({
          species,
          colour: color || 'Standard',
          photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80',
          foundAddress: location,
          foundCity: city,
          foundTime: new Date().toISOString(),
          reporterPhone: phone,
          description: `${breed}. ${notes || 'Holding safely with fresh water and food.'}`,
          currentCareStatus: 'with_me',
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Found Pet Reported! 🐾',
          'Thank you for reporting this sighting. The owner can now contact you.',
          [{ text: 'View Radar', onPress: () => router.replace('/lost-found' as never) }]
        );
      }
    } catch {
      Alert.alert('Error', 'Unable to submit report. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isLostReport ? 'Broadcast Missing Pet' : 'Report Found Pet',
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
        {/* Banner */}
        <View style={[styles.banner, isLostReport ? styles.bannerLost : styles.bannerFound]}>
          <Ionicons
            name={isLostReport ? 'alert-circle' : 'shield-checkmark'}
            size={22}
            color={isLostReport ? colors.danger : colors.success}
          />
          <Text style={[styles.bannerText, isLostReport ? styles.bannerTextLost : styles.bannerTextFound]}>
            {isLostReport
              ? 'Broadcasts an urgent Amber Alert to all Furr users within a 15km radius.'
              : 'Helps anxious owners find their companion by posting your sighting in the radar.'}
          </Text>
        </View>

        {isLostReport && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pet's Name</Text>
            <TextInput
              placeholder="e.g. Charlie"
              placeholderTextColor={colors.muted}
              value={petName}
              onChangeText={setPetName}
              style={styles.textInput}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Species</Text>
          <View style={styles.speciesRow}>
            {(['dog', 'cat'] as const).map((sp) => (
              <Pressable
                key={sp}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSpecies(sp);
                }}
                style={[styles.speciesPill, species === sp && styles.speciesPillActive]}
              >
                <Text style={styles.speciesEmoji}>{sp === 'dog' ? '🐶' : '🐱'}</Text>
                <Text
                  style={[
                    styles.speciesText,
                    species === sp && styles.speciesTextActive,
                  ]}
                >
                  {sp === 'dog' ? 'Dog' : 'Cat'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Breed / Visual Description</Text>
          <TextInput
            placeholder="e.g. Golden Retriever / Fluffy ginger Persian"
            placeholderTextColor={colors.muted}
            value={breed}
            onChangeText={setBreed}
            style={styles.textInput}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Color / Distinct Markings</Text>
          <TextInput
            placeholder="e.g. Golden cream with white chest star, blue collar"
            placeholderTextColor={colors.muted}
            value={color}
            onChangeText={setColor}
            style={styles.textInput}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {isLostReport ? 'Last Seen Location' : 'Where Did You Find The Pet?'}
          </Text>
          <TextInput
            placeholder="e.g. Near Viharamahadevi Park / Green Path"
            placeholderTextColor={colors.muted}
            value={location}
            onChangeText={setLocation}
            style={styles.textInput}
          />
        </View>

        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>City</Text>
            <TextInput
              placeholder="Colombo"
              placeholderTextColor={colors.muted}
              value={city}
              onChangeText={setCity}
              style={styles.textInput}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Contact Phone</Text>
            <TextInput
              placeholder="+94 77 123 4567"
              placeholderTextColor={colors.muted}
              value={phone}
              onChangeText={setPhone}
              style={styles.textInput}
            />
          </View>
        </View>

        {isLostReport && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reward Amount (Optional)</Text>
            <TextInput
              placeholder="e.g. Rs 10,000"
              placeholderTextColor={colors.muted}
              value={reward}
              onChangeText={setReward}
              style={styles.textInput}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {isLostReport ? 'Temperament / Crucial Notes' : 'Current Status / Safe Shelter Location'}
          </Text>
          <TextInput
            placeholder={
              isLostReport
                ? 'e.g. Scared of honking cars, answers to whistle and cheese treats...'
                : 'e.g. Given water, safe in gated compound, taking to vet for microchip scan tomorrow...'
            }
            placeholderTextColor={colors.muted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={[styles.textInput, { minHeight: 80, textAlignVertical: 'top' }]}
          />
        </View>

        <View style={{ marginTop: space.lg }}>
          <Button
            label={
              isSubmitting
                ? 'Submitting...'
                : isLostReport
                ? 'Broadcast Emergency Alert'
                : 'Publish Sighting Report'
            }
            loading={isSubmitting}
            onPress={handleSubmit}
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

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  bannerLost: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  bannerFound: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  bannerText: { flex: 1, fontSize: 12, lineHeight: 16, fontWeight: '600' },
  bannerTextLost: { color: '#991B1B' },
  bannerTextFound: { color: '#166534' },

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

  speciesRow: { flexDirection: 'row', gap: space.md },
  speciesPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.line,
  },
  speciesPillActive: { borderColor: colors.brand, backgroundColor: colors.softBrand },
  speciesEmoji: { fontSize: 18 },
  speciesText: { fontSize: 14, fontWeight: '800', color: colors.muted },
  speciesTextActive: { color: colors.brand },
});
