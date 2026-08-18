import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@furr/ui';

const MOCK_PORTFOLIO = [
  {
    id: 'port-1',
    title: 'Full Golden Retriever Hydrobath & Styling',
    date: '14 Aug 2026',
    category: 'Grooming',
  },
  {
    id: 'port-2',
    title: 'Beach Pack Walk & Socialization (Mount Lavinia)',
    date: '10 Aug 2026',
    category: 'Dog Walking',
  },
  {
    id: 'port-3',
    title: 'Puppy Crate & Leash Training Graduate',
    date: '02 Aug 2026',
    category: 'Training',
  },
];

export default function PortfolioScreen() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState(MOCK_PORTFOLIO);

  const handleAddPhoto = () => {
    const newEntry = {
      id: 'port-' + Date.now(),
      title: 'Luxury Groom & De-shedding Session #' + (portfolio.length + 1),
      date: new Date().toLocaleDateString(),
      category: 'Grooming',
    };
    setPortfolio([newEntry, ...portfolio]);
  };

  const handleRemove = (id: string) => {
    setPortfolio(portfolio.filter((p) => p.id !== id));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Work Portfolio & Gallery</Text>
        <TouchableOpacity style={styles.addHeaderBtn} onPress={handleAddPhoto}>
          <Ionicons name="add" size={20} color={colors.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introCard}>
          <Ionicons name="images" size={28} color={colors.brand} />
          <Text style={styles.introTitle}>Showcase Your Craft</Text>
          <Text style={styles.introSub}>
            Portfolio photos appear prominently on your public profile in the pet owner app.
          </Text>
        </View>

        {/* Gallery Grid */}
        <View style={styles.galleryList}>
          {portfolio.map((item) => (
            <View key={item.id} style={styles.portfolioCard}>
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={32} color={colors.brand} />
                <Text style={styles.imgLabel}>{item.category.toUpperCase()}</Text>
              </View>

              <View style={styles.metaRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDate}>Added {item.date}</Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleRemove(item.id)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer Add */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.uploadBtn} onPress={handleAddPhoto}>
          <Ionicons name="camera" size={18} color="#FFF" />
          <Text style={styles.uploadBtnText}>Upload New Portfolio Photo</Text>
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
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: colors.ink },
  addHeaderBtn: { padding: 4 },

  scrollContent: { padding: space.lg, paddingBottom: 110, gap: space.md },
  introCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  introTitle: { fontSize: 15, fontWeight: '800', color: colors.ink, marginTop: 4 },
  introSub: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 2 },

  galleryList: { gap: space.md },
  portfolioCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
  },
  imagePlaceholder: {
    height: 140,
    backgroundColor: colors.softBrand,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  imgLabel: { fontSize: 11, fontWeight: '800', color: colors.brand },
  metaRow: { flexDirection: 'row', alignItems: 'center', padding: space.md },
  itemTitle: { fontSize: 13, fontWeight: '800', color: colors.ink },
  itemDate: { fontSize: 11, color: colors.muted, marginTop: 2 },
  deleteBtn: { padding: 6 },

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
  uploadBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.brand,
    paddingVertical: 14,
    borderRadius: radius.pill,
  },
  uploadBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
});
