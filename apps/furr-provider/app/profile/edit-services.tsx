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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@furr/ui';
import { SERVICE_CATEGORIES, type ServiceCategory, type ServiceItem } from '@furr/core';
import { useProviderProfile } from '../../src/context/provider';

export default function EditServicesScreen() {
  const router = useRouter();
  const { profile, addService, deleteService } = useProviderProfile();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('60');
  const [category, setCategory] = useState<ServiceCategory>('grooming');
  const [description, setDescription] = useState('');

  const handleAdd = async () => {
    if (!name || !price) return;
    await addService({
      name,
      price: parseInt(price, 10) || 3500,
      durationMinutes: parseInt(duration, 10) || 60,
      category,
      description,
    });
    setName('');
    setPrice('');
    setDescription('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Menu & Pricing</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Existing Services */}
        <Text style={styles.sectionHeader}>Active Services ({profile?.services.length || 0})</Text>
        <View style={styles.servicesList}>
          {profile?.services.map((s) => (
            <View key={s.id} style={styles.serviceCard}>
              <View style={{ flex: 1 }}>
                <View style={styles.serviceTop}>
                  <Text style={styles.serviceName}>{s.name}</Text>
                  <Text style={styles.servicePrice}>LKR {s.price.toLocaleString()}</Text>
                </View>
                <Text style={styles.serviceMeta}>
                  {s.category.toUpperCase()} • {s.durationMinutes} mins
                </Text>
                {s.description && (
                  <Text style={styles.serviceDesc}>{s.description}</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteService(s.id)}
              >
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add New Service Box */}
        <Text style={[styles.sectionHeader, { marginTop: space.lg }]}>+ Add New Service</Text>
        <View style={styles.addCard}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Service Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. De-shedding Hydrobath & Blowout"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {SERVICE_CATEGORIES.map((cat) => {
                const isSel = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catPill, isSel && styles.catPillActive]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Text style={[styles.catPillText, isSel && { color: '#FFF' }]}>
                      {cat.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Price (LKR)</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="4000"
              />
            </View>
            <View style={{ width: 100 }}>
              <Text style={styles.label}>Mins</Text>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                placeholder="60"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholder="What is included in this session..."
            />
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Ionicons name="add-circle" size={18} color="#FFF" />
            <Text style={styles.addBtnText}>Save Service to Menu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: colors.ink },

  scrollContent: { padding: space.lg, paddingBottom: 110 },
  sectionHeader: { fontSize: 13, fontWeight: '900', color: colors.ink, marginBottom: space.sm },

  servicesList: { gap: space.sm },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  serviceTop: { flexDirection: 'row', justifyContent: 'space-between' },
  serviceName: { fontSize: 14, fontWeight: '800', color: colors.ink },
  servicePrice: { fontSize: 14, fontWeight: '900', color: colors.brand },
  serviceMeta: { fontSize: 11, color: colors.muted, fontWeight: '700', marginTop: 2 },
  serviceDesc: { fontSize: 12, color: colors.muted, marginTop: 4 },
  deleteBtn: { padding: 8 },

  addCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  formGroup: { marginBottom: space.sm },
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
  rowInputs: { flexDirection: 'row', gap: space.sm, marginBottom: space.sm },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.line,
  },
  catPillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  catPillText: { fontSize: 11, fontWeight: '700', color: colors.ink },

  addBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand,
    paddingVertical: 12,
    borderRadius: radius.pill,
    marginTop: space.sm,
  },
  addBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
});
