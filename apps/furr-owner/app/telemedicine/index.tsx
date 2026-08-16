import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { useTelemedicine } from '@/src/context/telemedicine';

export default function TelemedicineHomeScreen() {
  const { consultations, setActiveConsultation } = useTelemedicine();

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Vet Telehealth',
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
        {/* Telehealth Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="medical" size={28} color={colors.brand} />
          </View>
          <Text style={styles.heroTitle}>24/7 Vet Advice & Triage</Text>
          <Text style={styles.heroCopy}>
            Connect with licensed veterinary professionals for immediate advice, triage, and digital prescriptions.
          </Text>
          <View style={{ marginTop: space.md, width: '100%' }}>
            <Button
              label="Ask a Vet Now"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/telemedicine/new' as never);
              }}
            />
          </View>
        </View>

        {/* Consultations List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consultation History</Text>

          {consultations.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="chatbubbles-outline" size={36} color={colors.muted} />
              <Text style={styles.emptyTitle}>No past consultations</Text>
              <Text style={styles.emptyCopy}>
                Whenever you ask a vet for advice, your history and digital prescriptions will be saved here.
              </Text>
            </View>
          ) : (
            <View style={styles.consultList}>
              {consultations.map((consult) => (
                <Pressable
                  key={consult.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveConsultation(consult);
                    router.push(`/telemedicine/room/${consult.id}` as never);
                  }}
                  style={styles.consultCard}
                >
                  <View style={styles.consultHeader}>
                    <View style={styles.petTag}>
                      <Text style={styles.petTagText}>🐾 {consult.petName}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        consult.status === 'active' ? styles.statusActive : styles.statusDone,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          consult.status === 'active' ? styles.statusActiveText : styles.statusDoneText,
                        ]}
                      >
                        {consult.status === 'active' ? 'Active Case' : 'Closed'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.consultSymptoms} numberOfLines={2}>
                    {consult.symptoms}
                  </Text>

                  <View style={styles.consultFooter}>
                    <Text style={styles.vetName}>{consult.vetName || 'Duty Veterinarian'}</Text>
                    <Text style={styles.dateText}>
                      {new Date(consult.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>

                  {consult.prescriptions && consult.prescriptions.length > 0 && (
                    <View style={styles.rxBadge}>
                      <Ionicons name="document-text" size={12} color={colors.brand} />
                      <Text style={styles.rxText}>Digital Rx Issued</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  headerBtn: { padding: 6 },
  content: { padding: space.lg, paddingBottom: space.xxl },

  heroCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  heroTitle: { fontSize: 20, fontWeight: '900', color: '#166534', textAlign: 'center' },
  heroCopy: { fontSize: 13, color: '#15803D', textAlign: 'center', marginTop: 4, lineHeight: 18 },

  section: { marginTop: space.xl },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.ink, marginBottom: space.sm },

  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.xl,
    alignItems: 'center',
    gap: space.xs,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  emptyCopy: { fontSize: 13, color: colors.muted, textAlign: 'center' },

  consultList: { gap: space.sm },
  consultCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  consultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  petTag: { backgroundColor: colors.softBrand, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  petTagText: { fontSize: 12, fontWeight: '800', color: colors.brand },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  statusActive: { backgroundColor: '#FEF3C7' },
  statusDone: { backgroundColor: colors.mist },
  statusText: { fontSize: 10, fontWeight: '800' },
  statusActiveText: { color: '#B45309' },
  statusDoneText: { color: colors.muted },

  consultSymptoms: { fontSize: 14, fontWeight: '600', color: colors.ink, marginTop: space.sm, lineHeight: 20 },

  consultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.md,
    paddingTop: space.xs,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  vetName: { fontSize: 12, fontWeight: '700', color: colors.muted },
  dateText: { fontSize: 11, color: colors.muted },

  rxBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    marginTop: space.xs,
  },
  rxText: { fontSize: 11, fontWeight: '800', color: '#2D8EC8' },
});
