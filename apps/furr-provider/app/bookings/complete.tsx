import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@furr/ui';
import { useProviderBookings } from '../../src/context/bookings';

export default function CompleteBookingScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const { bookings, complete } = useProviderBookings();

  const booking = bookings.find((b) => b.id === bookingId) || bookings[0];

  const [notes, setNotes] = useState(
    'Coat deep cleaned and brushed thoroughly. Paw pads trimmed and soothing organic balm applied. Highly cooperative throughout the session.'
  );
  const [hasPhotos, setHasPhotos] = useState(true);
  const [temperament, setTemperament] = useState<'friendly' | 'anxious' | 'reactive' | 'calm'>('friendly');
  const [distanceKm, setDistanceKm] = useState('3.2');
  const [durationMins, setDurationMins] = useState('45');

  const handleSubmit = async () => {
    if (!booking) return;
    await complete(booking.id, {
      completionNotes: notes,
      completionPhotoUrls: hasPhotos
        ? ['https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=800']
        : [],
      walkStats:
        booking.serviceCategory === 'walking'
          ? {
              distanceMeters: Math.round(parseFloat(distanceKm) * 1000) || 3200,
              durationSeconds: (parseInt(durationMins, 10) || 45) * 60,
            }
          : undefined,
      petBehaviorRating: temperament,
    });

    router.replace('/(tabs)/bookings');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Service & Report Card</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.heroCard}>
          <Ionicons name="sparkles" size={28} color={colors.brand} />
          <Text style={styles.heroTitle}>Send Session Report Card</Text>
          <Text style={styles.heroSub}>
            Pet parents love seeing session updates, before/after photos, and behavioral insights.
          </Text>
        </View>

        {/* Photo Upload Section */}
        <Text style={styles.sectionHeader}>Session Photos</Text>
        <View style={styles.photoUploadBox}>
          <Ionicons name="camera" size={32} color={colors.brand} />
          <Text style={styles.photoUploadTitle}>
            {hasPhotos ? '1 Photo Attached ✓' : 'Add Session Photo'}
          </Text>
          <Text style={styles.photoUploadSub}>
            Showcase styling results or outdoor walk highlights.
          </Text>
          <TouchableOpacity
            style={styles.togglePhotoBtn}
            onPress={() => setHasPhotos(!hasPhotos)}
          >
            <Text style={styles.togglePhotoBtnText}>
              {hasPhotos ? 'Remove Photo' : 'Attach Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Walk Stats (if walking service) */}
        {booking?.serviceCategory === 'walking' && (
          <>
            <Text style={styles.sectionHeader}>Walk GPS & Exercise Stats</Text>
            <View style={styles.card}>
              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Distance Covered (km)</Text>
                  <TextInput
                    style={styles.input}
                    value={distanceKm}
                    onChangeText={setDistanceKm}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Duration (minutes)</Text>
                  <TextInput
                    style={styles.input}
                    value={durationMins}
                    onChangeText={setDurationMins}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </>
        )}

        {/* Pet Behavior Rating */}
        <Text style={styles.sectionHeader}>Pet Temperament Rating</Text>
        <View style={styles.temperamentRow}>
          {[
            { id: 'friendly', label: 'Friendly 😊' },
            { id: 'calm', label: 'Calm 😌' },
            { id: 'anxious', label: 'Anxious 🥺' },
            { id: 'reactive', label: 'High Energy ⚡' },
          ].map((item) => {
            const isSel = temperament === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.tempPill, isSel && styles.tempPillActive]}
                onPress={() => setTemperament(item.id as any)}
              >
                <Text style={[styles.tempPillText, isSel && { color: '#FFF' }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Provider Notes */}
        <Text style={styles.sectionHeader}>Specialist Session Notes</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.textArea}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            placeholder="Describe grooming condition, appetite, skin/coat observations, or training milestones..."
          />
        </View>
      </ScrollView>

      {/* Footer Submit */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Ionicons name="checkmark-done" size={20} color="#FFF" />
          <Text style={styles.submitBtnText}>Complete & Deliver Report Card</Text>
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
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: colors.ink },

  scrollContent: { padding: space.lg, paddingBottom: 110, gap: space.sm },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    textAlign: 'center',
  },
  heroTitle: { fontSize: 16, fontWeight: '900', color: colors.ink, marginTop: 6 },
  heroSub: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 2 },

  sectionHeader: { fontSize: 13, fontWeight: '900', color: colors.ink, marginTop: space.md },

  photoUploadBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.brand,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  photoUploadTitle: { fontSize: 14, fontWeight: '800', color: colors.ink, marginTop: 6 },
  photoUploadSub: { fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 2 },
  togglePhotoBtn: {
    backgroundColor: colors.softBrand,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: space.sm,
  },
  togglePhotoBtnText: { color: colors.brand, fontSize: 12, fontWeight: '800' },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
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

  temperamentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tempPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tempPillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  tempPillText: { fontSize: 12, fontWeight: '800', color: colors.ink },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
    fontSize: 13,
    color: colors.ink,
  },

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
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.success,
    paddingVertical: 14,
    borderRadius: radius.pill,
  },
  submitBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
});
