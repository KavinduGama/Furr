import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { useServices } from '@/src/context/services';
import { usePets } from '@/src/context/pets';

const AVAILABLE_TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '01:00 PM',
  '02:30 PM',
  '04:00 PM',
  '05:30 PM',
];

export default function BookServiceScreen() {
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const { providers, bookService } = useServices();
  const { pets, selectedPet } = usePets();

  const provider = providers.find((p) => p.id === providerId);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    provider?.services[0]?.id || ''
  );
  const [selectedPetId, setSelectedPetId] = useState<string>(selectedPet?.id || pets[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [selectedTime, setSelectedTime] = useState<string>(AVAILABLE_TIME_SLOTS[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!provider) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Provider not found</Text>
        <Button label="Back" onPress={() => router.back()} />
      </View>
    );
  }

  const activeService = provider.services.find((s) => s.id === selectedServiceId) || provider.services[0];
  const activePet = pets.find((p) => p.id === selectedPetId) || selectedPet;

  const handleConfirmBooking = async () => {
    if (!activeService || !activePet) {
      Alert.alert('Missing Info', 'Please select a service and pet.');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const booking = await bookService({
        petId: activePet.id,
        petName: activePet.name,
        petSpecies: activePet.species,
        providerId: provider.id,
        providerName: provider.name,
        providerAvatar: provider.avatarUrl,
        serviceId: activeService.id,
        serviceName: activeService.name,
        serviceCategory: provider.category,
        price: activeService.price,
        date: selectedDate,
        timeSlot: selectedTime,
        specialNotes: notes,
      });

      if (booking) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Booking Confirmed! 🐾',
          `Your appointment with ${provider.name} is scheduled for ${selectedDate} at ${selectedTime}.`,
          [
            {
              text: 'View My Bookings',
              onPress: () => router.replace('/services/bookings' as never),
            },
          ]
        );
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Booking Error', 'Could not complete booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Schedule Appointment',
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
        {/* Provider Brief Banner */}
        <View style={styles.providerBanner}>
          <Ionicons name="storefront-outline" size={20} color={colors.brand} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>{provider.name}</Text>
            <Text style={styles.bannerSubtitle}>
              {provider.address}, {provider.city}
            </Text>
          </View>
        </View>

        {/* Step 1: Select Service */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Select Service</Text>
          <View style={styles.optionsList}>
            {provider.services.map((srv) => {
              const isSelected = selectedServiceId === srv.id;
              return (
                <Pressable
                  key={srv.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedServiceId(srv.id);
                  }}
                  style={[styles.serviceOption, isSelected && styles.serviceOptionActive]}
                >
                  <View style={[styles.radio, isSelected && styles.radioActive]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionTitle, isSelected && styles.optionTitleActive]}>
                      {srv.name}
                    </Text>
                    {srv.description ? (
                      <Text style={styles.optionDesc}>{srv.description}</Text>
                    ) : null}
                    <Text style={styles.optionDuration}>⏱ {srv.durationMinutes} minutes</Text>
                  </View>
                  <Text style={styles.optionPrice}>Rs {srv.price.toLocaleString()}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Step 2: Select Pet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. For Which Companion?</Text>
          <View style={styles.petsRow}>
            {pets.map((p) => {
              const isSelected = selectedPetId === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedPetId(p.id);
                  }}
                  style={[styles.petPill, isSelected && styles.petPillActive]}
                >
                  <Text style={styles.petEmoji}>{p.species === 'cat' ? '🐱' : '🐶'}</Text>
                  <Text style={[styles.petPillName, isSelected && styles.petPillNameActive]}>
                    {p.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Step 3: Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Select Time Slot</Text>
          <View style={styles.timeGrid}>
            {AVAILABLE_TIME_SLOTS.map((slot) => {
              const isSelected = selectedTime === slot;
              return (
                <Pressable
                  key={slot}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedTime(slot);
                  }}
                  style={[styles.timeSlot, isSelected && styles.timeSlotActive]}
                >
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={isSelected ? '#FFF' : colors.muted}
                  />
                  <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextActive]}>
                    {slot}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Step 4: Special Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Notes / Instructions (Optional)</Text>
          <TextInput
            placeholder="e.g. Needs gentle handling around paws, nervous with hair dryers..."
            placeholderTextColor={colors.muted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.notesInput}
          />
        </View>

        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Appointment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={styles.summaryValue}>{activeService?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pet</Text>
            <Text style={styles.summaryValue}>{activePet?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date & Time</Text>
            <Text style={styles.summaryValue}>
              {selectedDate} at {selectedTime}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Pay at Clinic/Service</Text>
            <Text style={styles.totalValue}>Rs {activeService?.price.toLocaleString()}</Text>
          </View>
        </View>

        {/* Submit Button */}
        <View style={{ marginTop: space.xl }}>
          <Button
            label={isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
            loading={isSubmitting}
            onPress={handleConfirmBooking}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  headerBtn: { padding: 6 },
  content: { padding: space.lg, paddingBottom: space.xxl },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md },
  notFoundText: { fontSize: 18, fontWeight: '800', color: colors.ink },

  providerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    padding: space.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
  },
  bannerTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  bannerSubtitle: { fontSize: 12, color: colors.muted, marginTop: 1 },

  section: { marginTop: space.xl },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: space.sm },

  optionsList: { gap: space.sm },
  serviceOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    gap: space.md,
    borderWidth: 2,
    borderColor: colors.line,
  },
  serviceOptionActive: { borderColor: colors.brand, backgroundColor: '#FFFDF5' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioActive: { borderColor: colors.brand },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand },
  optionTitle: { fontSize: 15, fontWeight: '800', color: colors.muted },
  optionTitleActive: { color: colors.ink },
  optionDesc: { fontSize: 12, color: colors.muted, marginTop: 2, lineHeight: 16 },
  optionDuration: { fontSize: 11, fontWeight: '700', color: colors.brand, marginTop: 4 },
  optionPrice: { fontSize: 15, fontWeight: '900', color: colors.ink },

  petsRow: { flexDirection: 'row', gap: space.sm },
  petPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.line,
  },
  petPillActive: { borderColor: colors.brand, backgroundColor: colors.softBrand },
  petEmoji: { fontSize: 16 },
  petPillName: { fontSize: 14, fontWeight: '800', color: colors.muted },
  petPillNameActive: { color: colors.ink },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    width: '31%',
    justifyContent: 'center',
  },
  timeSlotActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  timeSlotText: { fontSize: 12, fontWeight: '700', color: colors.ink },
  timeSlotTextActive: { color: '#FFF' },

  notesInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    fontSize: 14,
    color: colors.ink,
    minHeight: 70,
    textAlignVertical: 'top',
  },

  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    marginTop: space.xl,
    borderWidth: 1,
    borderColor: colors.line,
    gap: space.xs,
  },
  summaryTitle: { fontSize: 15, fontWeight: '800', color: colors.ink, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  summaryLabel: { fontSize: 13, color: colors.muted },
  summaryValue: { fontSize: 13, fontWeight: '700', color: colors.ink },
  totalRow: {
    marginTop: space.sm,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  totalLabel: { fontSize: 15, fontWeight: '900', color: colors.ink },
  totalValue: { fontSize: 18, fontWeight: '900', color: colors.brand },
});
