import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space, shadows, Button } from '@furr/ui';
import { useAuth } from '../../src/context/auth';
import { submitAdoptionApplication } from '@furr/firebase';
import { validateAdoptionApplication } from '@furr/core';

export default function AdoptionApplyScreen() {
  const { listingId, petName, shelterName } = useLocalSearchParams<{
    listingId: string;
    petName: string;
    shelterName: string;
  }>();
  const router = useRouter();
  const { profile, firebaseUser } = useAuth();

  // Form state
  const [applicantName, setApplicantName] = useState(profile?.displayName || '');
  const [applicantPhone, setApplicantPhone] = useState(profile?.phoneE164 || '');
  const [applicantEmail, setApplicantEmail] = useState(profile?.email || '');
  const [applicantDistrict, setApplicantDistrict] = useState(profile?.district || 'Colombo');
  const [applicantAddress, setApplicantAddress] = useState('');
  const [housingType, setHousingType] = useState<'own_house' | 'rent_house' | 'apartment' | 'other'>('own_house');
  const [hasFencedGarden, setHasFencedGarden] = useState(true);
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [otherPetsDetails, setOtherPetsDetails] = useState('');
  const [hasChildren, setHasChildren] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState<'first_time' | 'experienced' | 'lifelong_owner'>('experienced');
  const [dailyHoursAlone, setDailyHoursAlone] = useState('4');
  const [clinicName, setClinicName] = useState('');
  const [reasonForAdopting, setReasonForAdopting] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const hoursNum = parseInt(dailyHoursAlone, 10);

    const appData = {
      listingId: listingId || 'adopt-1',
      petName: petName || 'Pet',
      applicantUid: firebaseUser?.uid || profile?.uid || 'demo-uid',
      applicantName,
      applicantPhone,
      applicantEmail,
      applicantDistrict,
      applicantAddress,
      housingType,
      hasFencedGarden,
      hasOtherPets,
      otherPetsDetails: hasOtherPets ? otherPetsDetails : undefined,
      hasChildren,
      experienceLevel,
      dailyHoursAlone: isNaN(hoursNum) ? 0 : hoursNum,
      veterinarianReference: clinicName
        ? { clinicName, phone: '+94 11 234 5678' }
        : undefined,
      reasonForAdopting,
    };

    const val = validateAdoptionApplication(appData);
    if (!val.valid) {
      Alert.alert('Incomplete Application', val.errors[0]);
      return;
    }

    setSubmitting(true);
    try {
      await submitAdoptionApplication(appData);
      Alert.alert(
        'Application Submitted! 🎉',
        `Your application to adopt ${petName || 'this pet'} has been sent to ${shelterName || 'the shelter'}. They will review your profile and reach out via phone.`,
        [
          {
            text: 'Back to Adoption Hub',
            onPress: () => router.replace('/adoption' as any),
          },
        ]
      );
    } catch (e) {
      Alert.alert('Error', 'Could not submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adoption Application</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Applying for {petName || 'Pet'}</Text>
          <Text style={styles.bannerSubtitle}>
            Shelter: {shelterName || 'Colombo Animal Protection Trust'}
          </Text>
        </View>

        {/* Section 1: Contact Information */}
        <Text style={styles.sectionHeading}>1. Your Contact Details</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Full Name *</Text>
          <TextInput
            style={styles.textInput}
            value={applicantName}
            onChangeText={setApplicantName}
            placeholder="e.g. Kasun Perera"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.fieldLabel}>Phone Number *</Text>
          <TextInput
            style={styles.textInput}
            value={applicantPhone}
            onChangeText={setApplicantPhone}
            placeholder="+94 77 123 4567"
            placeholderTextColor={colors.muted}
            keyboardType="phone-pad"
          />

          <Text style={styles.fieldLabel}>District *</Text>
          <TextInput
            style={styles.textInput}
            value={applicantDistrict}
            onChangeText={setApplicantDistrict}
            placeholder="e.g. Colombo, Kandy, Gampaha"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.fieldLabel}>Street Address</Text>
          <TextInput
            style={styles.textInput}
            value={applicantAddress}
            onChangeText={setApplicantAddress}
            placeholder="No. 12/B, Flower Road..."
            placeholderTextColor={colors.muted}
          />
        </View>

        {/* Section 2: Home Environment */}
        <Text style={styles.sectionHeading}>2. Home Environment</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Housing Type</Text>
          <View style={styles.radioRow}>
            {(['own_house', 'rent_house', 'apartment'] as const).map((h) => (
              <TouchableOpacity
                key={h}
                onPress={() => setHousingType(h)}
                style={[styles.radioChip, housingType === h && styles.radioChipActive]}
              >
                <Text style={[styles.radioChipText, housingType === h && styles.radioChipTextActive]}>
                  {h === 'own_house' ? '🏡 Own House' : h === 'rent_house' ? '🏠 Rented' : '🏢 Apartment'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Fenced Garden / Secure Yard</Text>
              <Text style={styles.switchDesc}>Safe outdoor area for exercise</Text>
            </View>
            <Switch
              value={hasFencedGarden}
              onValueChange={setHasFencedGarden}
              trackColor={{ true: colors.brand, false: colors.pearl }}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Other Pets at Home</Text>
              <Text style={styles.switchDesc}>Dogs, cats, or other animals</Text>
            </View>
            <Switch
              value={hasOtherPets}
              onValueChange={setHasOtherPets}
              trackColor={{ true: colors.brand, false: colors.pearl }}
            />
          </View>

          {hasOtherPets ? (
            <TextInput
              style={[styles.textInput, { marginTop: space.sm }]}
              value={otherPetsDetails}
              onChangeText={setOtherPetsDetails}
              placeholder="e.g. 1 vaccinated senior dog, 1 cat"
              placeholderTextColor={colors.muted}
            />
          ) : null}
        </View>

        {/* Section 3: Pet Experience & Care Plan */}
        <Text style={styles.sectionHeading}>3. Experience & Care</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Experience Level</Text>
          <View style={styles.radioRow}>
            {(['first_time', 'experienced', 'lifelong_owner'] as const).map((lvl) => (
              <TouchableOpacity
                key={lvl}
                onPress={() => setExperienceLevel(lvl)}
                style={[styles.radioChip, experienceLevel === lvl && styles.radioChipActive]}
              >
                <Text style={[styles.radioChipText, experienceLevel === lvl && styles.radioChipTextActive]}>
                  {lvl === 'first_time' ? '🌱 First Timer' : lvl === 'experienced' ? '🐕 Experienced' : '⭐ Lifelong'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Hours Pet Will Be Alone Daily (0-24)</Text>
          <TextInput
            style={styles.textInput}
            value={dailyHoursAlone}
            onChangeText={setDailyHoursAlone}
            placeholder="e.g. 4"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
          />

          <Text style={styles.fieldLabel}>Regular Vet Clinic (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={clinicName}
            onChangeText={setClinicName}
            placeholder="e.g. PetVet Clinic Colombo 05"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.fieldLabel}>Why would you like to adopt {petName || 'this pet'}? *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={reasonForAdopting}
            onChangeText={setReasonForAdopting}
            placeholder="Tell the shelter about your family, lifestyle, and why you are excited to adopt..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Submit Button */}
        <View style={{ marginTop: space.lg, marginBottom: space.xl }}>
          <Button
            label={submitting ? 'Submitting Application...' : 'Send Application to Shelter 🐾'}
            onPress={handleSubmit}
            variant="primary"
            loading={submitting}
          />

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: 54,
    paddingBottom: space.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  scrollContent: {
    padding: space.lg,
    paddingBottom: 50,
  },
  banner: {
    backgroundColor: colors.softBrand,
    padding: space.md,
    borderRadius: radius.md,
    marginBottom: space.lg,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.brand,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: space.sm,
    marginTop: space.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: space.md,
    ...shadows.sm,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 6,
    marginTop: space.sm,
  },
  textInput: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  radioRow: {
    flexDirection: 'row',
    gap: space.xs,
    marginBottom: space.sm,
  },
  radioChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
  },
  radioChipActive: {
    backgroundColor: colors.softBrand,
    borderColor: colors.brand,
  },
  radioChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
  radioChipTextActive: {
    color: colors.brand,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginTop: space.xs,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  switchDesc: {
    fontSize: 12,
    color: colors.muted,
  },
});
