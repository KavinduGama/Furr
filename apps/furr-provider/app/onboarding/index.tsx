import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@furr/ui';
import {
  SERVICE_CATEGORIES,
  SRI_LANKA_LOCATIONS,
  type ServiceCategory,
  type ServiceItem,
  type SriLankaLocation,
} from '@furr/core';
import { useProviderProfile } from '../../src/context/provider';
import { useProviderAuth } from '../../src/context/auth';

const STEPS = [
  'Identity',
  'Services Offered',
  'Location',
  'Pricing Menu',
  'Schedule',
  'Payout Setup',
  'Verification',
  'Review & Submit',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateProfile } = useProviderProfile();
  const { user } = useProviderAuth();

  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [name, setName] = useState('Colombo Master Stylists');
  const [bio, setBio] = useState('Passionate, certified animal wellness specialist with over 6 years of experience.');
  const [experienceYears, setExperienceYears] = useState('6');
  const [selectedRoles, setSelectedRoles] = useState<ServiceCategory[]>(['grooming', 'walking']);
  const [isVendor, setIsVendor] = useState(true);

  const [selectedDistrict, setSelectedDistrict] = useState<SriLankaLocation>(SRI_LANKA_LOCATIONS[0]);
  const [address, setAddress] = useState('No. 45, Alfred House Gardens, Colombo 03');
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: 'srv-1',
      name: 'Full Luxury Groom & Hydrobath',
      category: 'grooming',
      durationMinutes: 60,
      price: 4500,
      description: 'Warm organic botanical bath, blow dry, ear cleaning & paw balm.',
    },
    {
      id: 'srv-2',
      name: '60-Min Neighborhood Pack Walk',
      category: 'walking',
      durationMinutes: 60,
      price: 2500,
      description: 'Energetic pack exercise with GPS route card and hydration breaks.',
    },
  ]);

  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('45');
  const [newServiceCategory, setNewServiceCategory] = useState<ServiceCategory>('grooming');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  const [availableDays, setAvailableDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [startHour, setStartHour] = useState('08:30');
  const [endHour, setEndHour] = useState('18:30');

  const [bankName, setBankName] = useState('Commercial Bank of Ceylon');
  const [accountNumber, setAccountNumber] = useState('8004921938');
  const [branch, setBranch] = useState('Kollupitiya Branch');
  const [holderName, setHolderName] = useState('Colombo Master Stylists');

  const [nicNumber, setNicNumber] = useState('199428102941');
  const [hasCertUploaded, setHasCertUploaded] = useState(true);

  const toggleRole = (cat: ServiceCategory) => {
    if (selectedRoles.includes(cat)) {
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter((r) => r !== cat));
      }
    } else {
      setSelectedRoles([...selectedRoles, cat]);
    }
  };

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      if (availableDays.length > 1) {
        setAvailableDays(availableDays.filter((d) => d !== day));
      }
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleAddService = () => {
    if (!newServiceName || !newServicePrice) return;
    const srv: ServiceItem = {
      id: 'srv-' + Date.now(),
      name: newServiceName,
      category: newServiceCategory,
      durationMinutes: parseInt(newServiceDuration, 10) || 45,
      price: parseInt(newServicePrice, 10) || 3000,
      description: newServiceDesc,
    };
    setServices([...services, srv]);
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDesc('');
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const handleCompleteOnboarding = async () => {
    await updateProfile({
      name,
      bio,
      experienceYears: parseInt(experienceYears, 10) || 5,
      category: selectedRoles[0] || 'grooming',
      providerRoles: selectedRoles,
      isMarketplaceVendor: isVendor,
      address,
      city: selectedDistrict.name,
      district: selectedDistrict.name,
      latitude: selectedDistrict.latitude,
      longitude: selectedDistrict.longitude,
      services,
      availableDays,
      availableHours: { start: startHour, end: endHour },
      isVerified: true,
      onlineStatus: 'online',
      bankDetails: {
        bankName,
        accountNumber,
        branch,
        holderName,
      },
      nicNumber,
      metrics: {
        totalBookings: 0,
        completionRate: 100,
        acceptanceRate: 100,
        avgResponseMinutes: 5,
        avgRating: 5.0,
      },
    });

    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.stepIndicatorRow}>
          <Text style={styles.stepIndicatorText}>
            Step {currentStep + 1} of {STEPS.length}
          </Text>
          <Text style={styles.stepTitleText}>{STEPS[currentStep]}</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${((currentStep + 1) / STEPS.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* STEP 0: Identity */}
        {currentStep === 0 && (
          <View style={styles.stepCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="storefront" size={32} color={colors.brand} />
            </View>
            <Text style={styles.cardTitle}>Your Provider Profile</Text>
            <Text style={styles.cardSubtitle}>
              Tell pet owners about your business, experience, and services.
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Business or Professional Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Happy Tails Grooming Studio"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Years of Experience</Text>
              <TextInput
                style={styles.input}
                value={experienceYears}
                onChangeText={setExperienceYears}
                keyboardType="numeric"
                placeholder="e.g. 5"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>About / Professional Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                placeholder="Describe your passion, techniques, and love for pets..."
              />
            </View>
          </View>
        )}

        {/* STEP 1: Services Offered & Multi-Role */}
        {currentStep === 1 && (
          <View style={styles.stepCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="apps" size={32} color={colors.brand} />
            </View>
            <Text style={styles.cardTitle}>What services do you provide?</Text>
            <Text style={styles.cardSubtitle}>
              Select all categories you offer. You can add specific price tiers next.
            </Text>

            <View style={styles.rolesGrid}>
              {SERVICE_CATEGORIES.map((cat) => {
                const isSelected = selectedRoles.includes(cat.id);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.roleCard, isSelected && styles.roleCardActive]}
                    onPress={() => toggleRole(cat.id)}
                  >
                    <View
                      style={[
                        styles.roleIconBox,
                        isSelected && { backgroundColor: colors.brand },
                      ]}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={22}
                        color={isSelected ? '#FFF' : colors.brand}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.roleTitle, isSelected && { color: colors.brand }]}>
                        {cat.title}
                      </Text>
                      <Text style={styles.roleSubtitle}>{cat.subtitle}</Text>
                    </View>
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={isSelected ? colors.brand : colors.muted}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Marketplace Vendor Add-on */}
            <TouchableOpacity
              style={[styles.vendorToggleCard, isVendor && styles.vendorToggleCardActive]}
              onPress={() => setIsVendor(!isVendor)}
            >
              <View style={styles.vendorIconBox}>
                <Ionicons name="cart" size={24} color={isVendor ? '#FFF' : colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.vendorToggleTitle}>Sell Pet Food & Products</Text>
                <Text style={styles.vendorToggleSub}>
                  Enable the Marketplace tab to list food, treats, toys, and supplies.
                </Text>
              </View>
              <Ionicons
                name={isVendor ? 'checkbox' : 'square-outline'}
                size={24}
                color={isVendor ? colors.brand : colors.muted}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: Location Setup */}
        {currentStep === 2 && (
          <View style={styles.stepCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="location" size={32} color={colors.brand} />
            </View>
            <Text style={styles.cardTitle}>Location & Service Area</Text>
            <Text style={styles.cardSubtitle}>
              Clients nearby will see your services based on your district and address.
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>District / Operating Hub</Text>
              <TouchableOpacity
                style={styles.locationSelector}
                onPress={() => setShowLocationModal(true)}
              >
                <Ionicons name="navigate" size={18} color={colors.brand} />
                <Text style={styles.locationSelectorText}>
                  {selectedDistrict.name} ({selectedDistrict.province} Province)
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Business Address / Base Studio</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Street address, studio, or residential hub"
              />
            </View>

            <View style={styles.infoBadge}>
              <Ionicons name="shield-checkmark" size={18} color={colors.success} />
              <Text style={styles.infoBadgeText}>
                No paid map tiles required. Furr uses zero-cost GPS proximity math to connect you with nearby pet parents.
              </Text>
            </View>
          </View>
        )}

        {/* STEP 3: Pricing Menu Builder */}
        {currentStep === 3 && (
          <View style={styles.stepCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="pricetag" size={32} color={colors.brand} />
            </View>
            <Text style={styles.cardTitle}>Build Your Service Menu</Text>
            <Text style={styles.cardSubtitle}>
              Set up individual services, durations, and transparent pricing in LKR.
            </Text>

            {/* Existing Services List */}
            <View style={styles.servicesList}>
              {services.map((s) => (
                <View key={s.id} style={styles.serviceItemCard}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.serviceItemHeader}>
                      <Text style={styles.serviceItemName}>{s.name}</Text>
                      <Text style={styles.serviceItemPrice}>LKR {s.price.toLocaleString()}</Text>
                    </View>
                    <Text style={styles.serviceItemMeta}>
                      {s.category.toUpperCase()} • {s.durationMinutes} mins
                    </Text>
                    {s.description && (
                      <Text style={styles.serviceItemDesc}>{s.description}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.trashBtn}
                    onPress={() => handleRemoveService(s.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Add New Service Box */}
            <View style={styles.addServiceBox}>
              <Text style={styles.addServiceTitle}>+ Add Another Service</Text>
              <TextInput
                style={[styles.input, { marginBottom: 8 }]}
                placeholder="Service Name (e.g. Nail Trim & Paw Wax)"
                value={newServiceName}
                onChangeText={setNewServiceName}
              />
              <View style={styles.rowInputs}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Price (LKR)"
                  keyboardType="numeric"
                  value={newServicePrice}
                  onChangeText={setNewServicePrice}
                />
                <TextInput
                  style={[styles.input, { width: 100 }]}
                  placeholder="Mins (30)"
                  keyboardType="numeric"
                  value={newServiceDuration}
                  onChangeText={setNewServiceDuration}
                />
              </View>
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                placeholder="Brief description of what is included..."
                value={newServiceDesc}
                onChangeText={setNewServiceDesc}
              />
              <TouchableOpacity
                style={styles.addServiceBtn}
                onPress={handleAddService}
              >
                <Text style={styles.addServiceBtnText}>Add to Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 4: Operating Schedule */}
        {currentStep === 4 && (
          <View style={styles.stepCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="time" size={32} color={colors.brand} />
            </View>
            <Text style={styles.cardTitle}>Operating Days & Hours</Text>
            <Text style={styles.cardSubtitle}>
              Clients can only book appointments during your active operating windows.
            </Text>

            <Text style={styles.label}>Available Days of the Week</Text>
            <View style={styles.daysRow}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
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

            <View style={{ marginTop: space.lg }}>
              <Text style={styles.label}>Working Hours</Text>
              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputSubLabel}>Opening Time</Text>
                  <TextInput
                    style={styles.input}
                    value={startHour}
                    onChangeText={setStartHour}
                    placeholder="08:30"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputSubLabel}>Closing Time</Text>
                  <TextInput
                    style={styles.input}
                    value={endHour}
                    onChangeText={setEndHour}
                    placeholder="18:30"
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* STEP 5: Payout Setup */}
        {currentStep === 5 && (
          <View style={styles.stepCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="card" size={32} color={colors.brand} />
            </View>
            <Text style={styles.cardTitle}>Direct Bank & Payout Setup</Text>
            <Text style={styles.cardSubtitle}>
              Your earnings from completed bookings and sales will be deposited directly here.
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Bank Name</Text>
              <TextInput
                style={styles.input}
                value={bankName}
                onChangeText={setBankName}
                placeholder="e.g. Commercial Bank / Sampath / HNB"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Account Number</Text>
              <TextInput
                style={styles.input}
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="numeric"
                placeholder="10-12 digit account number"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Branch Name</Text>
              <TextInput
                style={styles.input}
                value={branch}
                onChangeText={setBranch}
                placeholder="e.g. Kollupitiya Branch"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Account Holder Name</Text>
              <TextInput
                style={styles.input}
                value={holderName}
                onChangeText={setHolderName}
                placeholder="Matches bank passbook / BR"
              />
            </View>
          </View>
        )}

        {/* STEP 6: Verification */}
        {currentStep === 6 && (
          <View style={styles.stepCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={32} color={colors.brand} />
            </View>
            <Text style={styles.cardTitle}>Trust & Verification</Text>
            <Text style={styles.cardSubtitle}>
              Furr is a verified specialist community. Provide your National ID (NIC) and certifications.
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>National Identity Card (NIC) / BR Number</Text>
              <TextInput
                style={styles.input}
                value={nicNumber}
                onChangeText={setNicNumber}
                placeholder="e.g. 199428102941 or PV12345"
              />
            </View>

            <View style={styles.uploadDocBox}>
              <Ionicons name="document-attach" size={28} color={colors.brand} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.uploadDocTitle}>Certifications & Training Proof</Text>
                <Text style={styles.uploadDocSub}>
                  Grooming diplomas, canine CPR, trainer certifications
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.uploadBtn,
                  hasCertUploaded && { backgroundColor: colors.calm },
                ]}
                onPress={() => setHasCertUploaded(!hasCertUploaded)}
              >
                <Text
                  style={[
                    styles.uploadBtnText,
                    hasCertUploaded && { color: colors.success },
                  ]}
                >
                  {hasCertUploaded ? 'Attached ✓' : 'Upload Photo'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 7: Review & Submit */}
        {currentStep === 7 && (
          <View style={styles.stepCard}>
            <View style={[styles.iconCircle, { backgroundColor: colors.calm }]}>
              <Ionicons name="rocket" size={32} color={colors.success} />
            </View>
            <Text style={styles.cardTitle}>Ready to Launch Studio!</Text>
            <Text style={styles.cardSubtitle}>
              Review your details before launching your Furr Provider workspace.
            </Text>

            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Business Name:</Text>
                <Text style={styles.summaryVal}>{name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Operating Hub:</Text>
                <Text style={styles.summaryVal}>{selectedDistrict.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Services Active:</Text>
                <Text style={styles.summaryVal}>{services.length} services</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Marketplace Vendor:</Text>
                <Text style={styles.summaryVal}>{isVendor ? 'Enabled ✓' : 'Disabled'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Payout Method:</Text>
                <Text style={styles.summaryVal}>{bankName}</Text>
              </View>
            </View>

            <View style={styles.trustBanner}>
              <Ionicons name="star" size={20} color={colors.accent} />
              <Text style={styles.trustBannerText}>
                You will receive a 100% verified badge and instant notifications whenever a client books or orders.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation Buttons */}
      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setCurrentStep((prev) => prev - 1)}
          >
            <Ionicons name="arrow-back" size={18} color={colors.ink} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}

        {currentStep < STEPS.length - 1 ? (
          <TouchableOpacity
            style={[styles.nextBtn, currentStep === 0 && { flex: 1 }]}
            onPress={() => setCurrentStep((prev) => prev + 1)}
          >
            <Text style={styles.nextBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: colors.success, flex: 1 }]}
            onPress={handleCompleteOnboarding}
          >
            <Text style={styles.nextBtnText}>Launch Studio Workspace</Text>
            <Ionicons name="checkmark-done" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* District Location Modal */}
      <Modal visible={showLocationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Operating District</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Ionicons name="close" size={24} color={colors.ink} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 350 }}>
              {SRI_LANKA_LOCATIONS.map((loc) => {
                const isSel = loc.id === selectedDistrict.id;
                return (
                  <TouchableOpacity
                    key={loc.id}
                    style={[styles.locationItem, isSel && styles.locationItemActive]}
                    onPress={() => {
                      setSelectedDistrict(loc);
                      setShowLocationModal(false);
                    }}
                  >
                    <View>
                      <Text style={[styles.locationItemName, isSel && { color: colors.brand }]}>
                        {loc.name}
                      </Text>
                      <Text style={styles.locationItemProvince}>{loc.province} Province</Text>
                    </View>
                    {isSel && <Ionicons name="checkmark" size={20} color={colors.brand} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepIndicatorText: { fontSize: 12, fontWeight: '700', color: colors.brand, textTransform: 'uppercase' },
  stepTitleText: { fontSize: 13, fontWeight: '800', color: colors.ink },
  progressBarBg: { height: 6, backgroundColor: colors.mist, borderRadius: radius.pill, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.brand, borderRadius: radius.pill },

  scrollContent: { padding: space.lg, paddingBottom: 100 },
  stepCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: colors.line,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.softBrand,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space.md,
  },
  cardTitle: { fontSize: 20, fontWeight: '900', color: colors.ink, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: colors.muted, lineHeight: 18, marginBottom: space.lg },

  formGroup: { marginBottom: space.md },
  label: { fontSize: 12, fontWeight: '800', color: colors.ink, marginBottom: 6, textTransform: 'uppercase' },
  inputSubLabel: { fontSize: 11, color: colors.muted, marginBottom: 4 },
  input: {
    backgroundColor: colors.canvas,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  rowInputs: { flexDirection: 'row', gap: space.md },

  rolesGrid: { gap: space.sm, marginBottom: space.lg },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.canvas,
    gap: space.md,
  },
  roleCardActive: {
    borderColor: colors.brand,
    backgroundColor: colors.softBrand,
  },
  roleIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.mist,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleTitle: { fontSize: 14, fontWeight: '800', color: colors.ink },
  roleSubtitle: { fontSize: 11, color: colors.muted },

  vendorToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.warm,
    gap: space.md,
  },
  vendorToggleCardActive: { borderColor: colors.brand },
  vendorIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorToggleTitle: { fontSize: 14, fontWeight: '800', color: colors.ink },
  vendorToggleSub: { fontSize: 11, color: colors.muted },

  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.canvas,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  locationSelectorText: { fontSize: 14, fontWeight: '700', color: colors.ink, flex: 1, marginLeft: 8 },
  infoBadge: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.calm,
    padding: space.md,
    borderRadius: radius.lg,
    marginTop: space.sm,
  },
  infoBadgeText: { fontSize: 12, color: colors.ink, flex: 1, lineHeight: 16 },

  servicesList: { gap: space.sm, marginBottom: space.lg },
  serviceItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.canvas,
  },
  serviceItemHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  serviceItemName: { fontSize: 14, fontWeight: '800', color: colors.ink },
  serviceItemPrice: { fontSize: 14, fontWeight: '900', color: colors.brand },
  serviceItemMeta: { fontSize: 11, color: colors.muted, fontWeight: '700', marginTop: 2 },
  serviceItemDesc: { fontSize: 12, color: colors.muted, marginTop: 4 },
  trashBtn: { padding: 8 },

  addServiceBox: {
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.mist,
    borderWidth: 1,
    borderColor: colors.line,
  },
  addServiceTitle: { fontSize: 13, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  addServiceBtn: {
    backgroundColor: colors.brand,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: 'center',
    marginTop: space.sm,
  },
  addServiceBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  dayPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dayPillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  dayPillText: { fontSize: 12, fontWeight: '800', color: colors.ink },

  uploadDocBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.md,
    backgroundColor: colors.canvas,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: space.sm,
  },
  uploadDocTitle: { fontSize: 13, fontWeight: '800', color: colors.ink },
  uploadDocSub: { fontSize: 11, color: colors.muted },
  uploadBtn: {
    backgroundColor: colors.brand,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  uploadBtnText: { color: '#FFF', fontSize: 11, fontWeight: '800' },

  summaryBox: {
    backgroundColor: colors.canvas,
    borderRadius: radius.lg,
    padding: space.md,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  summaryVal: { fontSize: 12, fontWeight: '800', color: colors.ink },
  trustBanner: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.warm,
    padding: space.md,
    borderRadius: radius.lg,
    marginTop: space.md,
  },
  trustBannerText: { fontSize: 12, color: colors.ink, flex: 1, lineHeight: 16 },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: space.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : space.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: space.md,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
  },
  backBtnText: { fontSize: 14, fontWeight: '800', color: colors.ink },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
  },
  nextBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: space.xl,
    paddingBottom: space.xl,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.md },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  locationItemActive: { backgroundColor: colors.softBrand },
  locationItemName: { fontSize: 14, fontWeight: '800', color: colors.ink },
  locationItemProvince: { fontSize: 11, color: colors.muted },
});
