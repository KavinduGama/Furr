import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { useServices } from '@/src/context/services';
import { usePets } from '@/src/context/pets';
import type { PaymentProvider } from '@furr/core';

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
  const [selectedPayment, setSelectedPayment] = useState<PaymentProvider>('cash_on_delivery');
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
      const booking = await bookService(
        {
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
        },
        selectedPayment
      );

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
          <Image source={{ uri: provider.avatarUrl }} style={styles.providerAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>{provider.name}</Text>
            <Text style={styles.bannerSubtitle}>{provider.address}</Text>
          </View>
        </View>

        {/* Step 1: Select Service Offering */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Select Service</Text>
          <View style={styles.optionsList}>
            {provider.services.map((svc) => {
              const isSelected = svc.id === selectedServiceId;
              return (
                <Pressable
                  key={svc.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedServiceId(svc.id);
                  }}
                  style={[styles.serviceOption, isSelected && styles.serviceOptionActive]}
                >
                  <View style={[styles.radio, isSelected && styles.radioActive]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionName, isSelected && styles.optionNameActive]}>
                      {svc.name}
                    </Text>
                    <Text style={styles.optionDuration}>{svc.durationMinutes} minutes session</Text>
                  </View>
                  <Text style={styles.optionPrice}>Rs {svc.price.toLocaleString()}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Step 2: Select Pet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Which Pet is this for?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petsScroll}>
            {pets.map((p) => {
              const isSelected = p.id === selectedPetId;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedPetId(p.id);
                  }}
                  style={[styles.petChip, isSelected && styles.petChipActive]}
                >
                  <View style={styles.petAvatar}>
                    <Text style={styles.petAvatarText}>{p.avatarLabel || p.name.charAt(0)}</Text>
                  </View>
                  <Text style={[styles.petName, isSelected && styles.petNameActive]}>{p.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Step 3: Date & Slot Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Preferred Time Slot</Text>
          <View style={styles.slotsGrid}>
            {AVAILABLE_TIME_SLOTS.map((slot) => {
              const isSelected = slot === selectedTime;
              return (
                <Pressable
                  key={slot}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedTime(slot);
                  }}
                  style={[styles.slotCard, isSelected && styles.slotCardActive]}
                >
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={isSelected ? colors.brand : colors.muted}
                  />
                  <Text style={[styles.slotText, isSelected && styles.slotTextActive]}>{slot}</Text>
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

        {/* Step 5: Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Payment Method</Text>
          <View style={styles.paymentMethods}>
            {[
              { id: 'card', label: 'Credit / Debit Card (Stripe)', icon: 'card-outline' },
              { id: 'payhere', label: 'PayHere / Mobile Wallets', icon: 'qr-code-outline' },
              { id: 'cash_on_delivery', label: 'Pay at Clinic / In Person', icon: 'cash-outline' },
            ].map((m) => (
              <Pressable
                key={m.id}
                onPress={() => setSelectedPayment(m.id as PaymentProvider)}
                style={[styles.paymentOption, selectedPayment === m.id && styles.paymentOptionActive]}
              >
                <Ionicons
                  name={m.icon as any}
                  size={18}
                  color={selectedPayment === m.id ? colors.brand : colors.muted}
                />
                <Text style={[styles.paymentText, selectedPayment === m.id && styles.paymentTextActive]}>
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>
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
            <Text style={styles.totalLabel}>
              {selectedPayment === 'cash_on_delivery' ? 'Pay In Person' : 'Amount to Pay'}
            </Text>
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
  providerAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.softBrand },
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
  optionName: { fontSize: 14, fontWeight: '800', color: colors.ink },
  optionNameActive: { color: colors.brand },
  optionDuration: { fontSize: 12, color: colors.muted, marginTop: 2 },
  optionPrice: { fontSize: 14, fontWeight: '900', color: colors.ink },

  petsScroll: { gap: space.sm },
  petChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  petChipActive: { borderColor: colors.brand, backgroundColor: '#FFFDF5' },
  petAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.softBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petAvatarText: { fontSize: 13, fontWeight: '900', color: colors.brand },
  petName: { fontSize: 13, fontWeight: '700', color: colors.ink },
  petNameActive: { color: colors.brand },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  slotCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  slotCardActive: { borderColor: colors.brand, backgroundColor: '#FFFDF5' },
  slotText: { fontSize: 13, fontWeight: '700', color: colors.muted },
  slotTextActive: { color: colors.brand },

  notesInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
    fontSize: 14,
    color: colors.ink,
    textAlignVertical: 'top',
    minHeight: 80,
  },

  paymentMethods: { gap: space.xs },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    padding: space.md,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  paymentOptionActive: { borderColor: colors.brand, backgroundColor: '#FFFDF5' },
  paymentText: { fontSize: 13, fontWeight: '700', color: colors.ink },
  paymentTextActive: { color: colors.brand },

  summaryCard: {
    marginTop: space.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: space.sm,
  },
  summaryTitle: { fontSize: 14, fontWeight: '800', color: colors.ink, marginBottom: 2 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: colors.muted },
  summaryValue: { fontSize: 13, fontWeight: '700', color: colors.ink },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: space.sm,
    marginTop: space.xs,
  },
  totalLabel: { fontSize: 14, fontWeight: '900', color: colors.ink },
  totalValue: { fontSize: 16, fontWeight: '900', color: colors.brand },
});
