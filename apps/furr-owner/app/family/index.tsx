import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Modal } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, Button } from '@furr/ui';
import { useFamily } from '@/src/context/family';
import { usePets } from '@/src/context/pets';

const ROLE_DESCRIPTIONS = {
  owner: { label: 'Primary Owner', desc: 'Full administrative access to all records, billing, and invites.', color: colors.brand },
  coparent: { label: 'Co-Parent / Family', desc: 'Can log care, book services, view records and expenses.', color: '#2563EB' },
  sitter: { label: 'Pet Sitter / Walker', desc: 'Can log daily meals, walk routes, and view emergency instructions.', color: '#059669' },
  vet: { label: 'Family Veterinarian', desc: 'Can view medical history and author verified clinical records.', color: '#7C3AED' },
};

export default function FamilySharingScreen() {
  const { familyMembers, inviteMember } = useFamily();
  const { selectedPet } = usePets();

  const [modalVisible, setModalVisible] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<'coparent' | 'sitter' | 'vet'>('coparent');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const petName = selectedPet?.name || 'your pet';

  const handleInvite = async () => {
    if (!inviteName.trim() || (!inviteEmail.trim() && !invitePhone.trim())) {
      Alert.alert('Missing Details', 'Please enter a name and at least an email or phone number.');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await inviteMember({
      memberName: inviteName,
      memberEmail: inviteEmail || undefined,
      memberPhone: invitePhone || undefined,
      role: inviteRole,
      permissions: {
        canEditHealth: inviteRole === 'coparent' || inviteRole === 'vet',
        canLogCare: true,
        canBookServices: inviteRole === 'coparent',
        canViewExpenses: inviteRole === 'coparent',
        canManageMembers: false,
      },
    });

    setIsSubmitting(false);
    setModalVisible(false);
    setInviteName('');
    setInviteEmail('');
    setInvitePhone('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Invite Sent! 💌', `${inviteName} has been invited to co-manage ${petName}.`);
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Family & Co-Parenting',
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
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="people" size={24} color={colors.brand} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Multi-User Pet Care</Text>
            <Text style={styles.heroCopy}>
              Share feeding schedules, vet records, and walk updates seamlessly with partners, sitters, and family.
            </Text>
          </View>
        </View>

        {/* Members List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shared Members ({familyMembers.length})</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setModalVisible(true);
              }}
              style={styles.addBtn}
            >
              <Ionicons name="person-add" size={14} color="#FFF" />
              <Text style={styles.addBtnText}>Invite</Text>
            </Pressable>
          </View>

          <View style={styles.membersList}>
            {familyMembers.map((member) => {
              const roleCfg = ROLE_DESCRIPTIONS[member.role] || ROLE_DESCRIPTIONS.coparent;

              return (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberHeader}>
                    <View style={styles.avatarWrap}>
                      <Text style={styles.avatarInitial}>{member.memberName.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{member.memberName}</Text>
                      <Text style={styles.memberContact}>
                        {member.memberPhone || member.memberEmail}
                      </Text>
                    </View>
                    <View style={[styles.roleBadge, { backgroundColor: roleCfg.color + '15' }]}>
                      <Text style={[styles.roleBadgeText, { color: roleCfg.color }]}>
                        {roleCfg.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.roleDesc}>{roleCfg.desc}</Text>

                  {/* Permissions pills */}
                  <View style={styles.permRow}>
                    {member.permissions.canEditHealth && (
                      <View style={styles.permPill}>
                        <Text style={styles.permPillText}>🩺 Medical Records</Text>
                      </View>
                    )}
                    {member.permissions.canLogCare && (
                      <View style={styles.permPill}>
                        <Text style={styles.permPillText}>🥣 Daily Care & Walks</Text>
                      </View>
                    )}
                    {member.permissions.canBookServices && (
                      <View style={styles.permPill}>
                        <Text style={styles.permPillText}>📅 Bookings</Text>
                      </View>
                    )}
                    {member.permissions.canViewExpenses && (
                      <View style={styles.permPill}>
                        <Text style={styles.permPillText}>💳 Expenses</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Invite Member Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite Pet Co-Parent</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.ink} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: space.md, paddingBottom: 20 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  placeholder="e.g. Maya Fernando"
                  placeholderTextColor={colors.muted}
                  value={inviteName}
                  onChangeText={setInviteName}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Phone Number</Text>
                <TextInput
                  placeholder="+94 77 123 4567"
                  placeholderTextColor={colors.muted}
                  value={invitePhone}
                  onChangeText={setInvitePhone}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email (Optional)</Text>
                <TextInput
                  placeholder="maya@example.com"
                  placeholderTextColor={colors.muted}
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Role & Permissions</Text>
                <View style={styles.roleOptions}>
                  {(['coparent', 'sitter', 'vet'] as const).map((r) => {
                    const isSelected = inviteRole === r;
                    const cfg = ROLE_DESCRIPTIONS[r];
                    return (
                      <Pressable
                        key={r}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setInviteRole(r);
                        }}
                        style={[styles.roleCard, isSelected && styles.roleCardActive]}
                      >
                        <View style={styles.roleCardHeader}>
                          <Text style={[styles.roleCardTitle, isSelected && styles.roleCardTitleActive]}>
                            {cfg.label}
                          </Text>
                          <Ionicons
                            name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                            size={18}
                            color={isSelected ? colors.brand : colors.muted}
                          />
                        </View>
                        <Text style={styles.roleCardDesc}>{cfg.desc}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={{ marginTop: space.sm }}>
                <Button
                  label={isSubmitting ? 'Sending Invite...' : 'Send Invitation'}
                  loading={isSubmitting}
                  onPress={handleInvite}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  headerBtn: { padding: 6 },
  content: { padding: space.lg, paddingBottom: space.xxl, gap: space.lg },

  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    padding: space.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.softBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
  heroCopy: { fontSize: 12, color: colors.muted, marginTop: 2, lineHeight: 16 },

  section: { gap: space.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  addBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  membersList: { gap: space.md },
  memberCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: space.xs,
  },
  memberHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.pearl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 16, fontWeight: '900', color: colors.brand },
  memberName: { fontSize: 15, fontWeight: '800', color: colors.ink },
  memberContact: { fontSize: 11, color: colors.muted },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
  roleBadgeText: { fontSize: 11, fontWeight: '800' },
  roleDesc: { fontSize: 12, color: colors.muted, lineHeight: 16, marginTop: 2 },

  permRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  permPill: { backgroundColor: colors.canvas, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  permPillText: { fontSize: 11, fontWeight: '600', color: colors.ink },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: space.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.md,
  },
  modalTitle: { fontSize: 18, fontWeight: '900', color: colors.ink },
  closeBtn: { padding: 4 },

  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '800', color: colors.ink },
  textInput: {
    backgroundColor: colors.canvas,
    borderRadius: radius.xl,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
  },

  roleOptions: { gap: space.sm },
  roleCard: {
    backgroundColor: colors.canvas,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 4,
  },
  roleCardActive: { borderColor: colors.brand, backgroundColor: colors.softBrand },
  roleCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roleCardTitle: { fontSize: 14, fontWeight: '800', color: colors.ink },
  roleCardTitleActive: { color: colors.brand },
  roleCardDesc: { fontSize: 12, color: colors.muted, lineHeight: 16 },
});
