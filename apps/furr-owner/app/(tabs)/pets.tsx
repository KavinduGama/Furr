import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Pet } from '@furr/core';
import { colors, radius, space, Button } from '@furr/ui';
import { usePets } from '@/src/context/pets';

function petDetail(pet: Pet) {
  const kind = pet.species === 'cat' ? 'Cat' : 'Dog';
  return pet.breed ? `${pet.breed} · ${kind}` : kind;
}

export default function PetsScreen() {
  const { pets, selectedPet, selectPet, isLoading } = usePets();

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.brand} size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>YOUR COMPANIONS</Text>
            <Text style={styles.title}>Pets</Text>
            <Text style={styles.copy}>Manage your pets' health profiles.</Text>
          </View>
          <Pressable 
            accessibilityRole="button" 
            accessibilityLabel="Add a pet" 
            onPress={() => router.push('/pet/add' as never)} 
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
          >
            <Ionicons name="add" size={26} color="#fff" />
          </Pressable>
        </View>

        {/* Pet List */}
        <View style={styles.list}>
          {pets.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="paw" size={48} color={colors.brandSoft} />
              </View>
              <Text style={styles.emptyTitle}>Add your first pet</Text>
              <Text style={styles.emptyCopy}>Create a care space that grows with them.</Text>
              <View style={{ marginTop: 16 }}>
                <Button 
                  label="Add a pet" 
                  variant="secondary" 
                  onPress={() => router.push('/pet/add' as never)} 
                />
              </View>
            </View>
          ) : (
            pets.map((pet) => (
              <Pressable 
                key={pet.id} 
                accessibilityRole="button" 
                onPress={() => { selectPet(pet.id); router.push('/pet-detail' as never); }} 
                style={({ pressed }) => [styles.petCard, selectedPet?.id === pet.id && styles.petSelected, pressed && styles.pressed]}
              >
                <View style={[styles.petAvatar, pet.species === 'cat' && styles.petAvatarCat]}>
                  <Text style={styles.petEmoji}>{pet.species === 'cat' ? '🐈' : '🐕'}</Text>
                </View>
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petDetail}>{petDetail(pet)}</Text>
                  <View style={styles.recordState}>
                    <Ionicons name="shield-checkmark" size={14} color={colors.success} />
                    <Text style={styles.recordStateText}>Health profile active</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.muted} />
              </Pressable>
            ))
          )}
        </View>

        {pets.length > 0 && (
          <Pressable 
            accessibilityRole="button" 
            onPress={() => router.push('/pet/add' as never)} 
            style={({ pressed }) => [styles.addAnother, pressed && styles.pressed]}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.brand} />
            <Text style={styles.addAnotherText}>Add another companion</Text>
          </Pressable>
        )}
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingBottom: space.xxl, gap: space.md },
  loading: { flex: 1, minHeight: 240, justifyContent: 'center', alignItems: 'center' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: space.lg, paddingTop: space.md },
  eyebrow: { color: colors.brand, fontWeight: '900', fontSize: 10, letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 32, fontWeight: '900', letterSpacing: -1, marginTop: 4 },
  copy: { color: colors.muted, fontSize: 15, marginTop: 4 },
  
  addBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.brand, justifyContent: 'center', alignItems: 'center', shadowColor: colors.brandDark, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  
  list: { paddingHorizontal: space.lg, marginTop: space.xl, gap: space.md },
  
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.mist, marginBottom: space.md },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  emptyCopy: { color: colors.muted, fontSize: 14, marginTop: 4, marginBottom: space.md },
  
  petCard: { padding: space.md, flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.surface, borderRadius: radius.xl, shadowColor: colors.ink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  petSelected: { borderColor: colors.brandSoft, borderWidth: 1.5, backgroundColor: colors.mist },
  
  petAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.pearl, alignItems: 'center', justifyContent: 'center' },
  petAvatarCat: { backgroundColor: '#E3F2FD' },
  petEmoji: { fontSize: 32 },
  
  petInfo: { flex: 1, gap: 4, justifyContent: 'center' },
  petName: { color: colors.ink, fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  petDetail: { color: colors.muted, fontSize: 14 },
  
  recordState: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  recordStateText: { color: colors.success, fontSize: 12, fontWeight: '700' },
  
  addAnother: { marginHorizontal: space.lg, marginTop: space.lg, minHeight: 64, borderRadius: radius.xl, backgroundColor: colors.mist, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: colors.softBrand, borderStyle: 'dashed' },
  addAnotherText: { color: colors.brand, fontSize: 15, fontWeight: '800' },
});
