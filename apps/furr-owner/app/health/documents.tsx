import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import { DOC_TYPE_LABELS } from '@furr/core';
import { archiveDocument } from '@furr/firebase';
import { colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';
import { useHealth } from '@/src/context/health';

function fileSizeLabel(bytes: number): string {
  if (bytes === 0) return 'Dev mode';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsScreen() {
  const { firebaseUser } = useAuth();
  const { selectedPet } = usePets();
  const { documents, isLoading, removeDocument } = useHealth();

  const handleArchive = (docId: string, label: string) => {
    if (!firebaseUser || !selectedPet) return;
    Alert.alert(
      `Remove "${label}"?`,
      'The document will be archived. Your vaccination and other records linked to it will remain intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await archiveDocument(firebaseUser.uid, selectedPet.id, docId);
              removeDocument(docId);
            } catch {
              Alert.alert('Something went wrong', 'Couldn\'t archive the document. Please try again.');
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.loadingBox}>
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
            <Text style={styles.eyebrow}>PRIVATE STORAGE</Text>
            <Text style={styles.title}>Documents</Text>
            {selectedPet && (
              <Text style={styles.sub}>
                {selectedPet.name} · {documents.length} document{documents.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Upload document"
            style={styles.addBtn}
            onPress={() => router.push('/health/upload-document' as never)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Privacy notice */}
        <View style={styles.notice}>
          <Ionicons name="lock-closed" size={16} color={colors.brand} />
          <Text style={styles.noticeText}>
            Only you can access these. Documents are never shared unless you explicitly grant access.
          </Text>
        </View>

        {/* Empty state */}
        {documents.length === 0 && (
          <Pressable
            accessibilityRole="button"
            style={styles.emptyCard}
            onPress={() => router.push('/health/upload-document' as never)}
          >
            <View style={styles.emptyIcon}>
              <Ionicons name="cloud-upload" size={32} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.emptyTitle}>Upload a document</Text>
              <Text style={styles.emptyCopy}>
                Keep vaccination cards, prescriptions, and lab reports in one private place.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        )}

        {/* Document cards */}
        <View style={styles.docList}>
          {documents.map((doc) => {
            const isImage = doc.mimeType.startsWith('image/');
            const label = DOC_TYPE_LABELS[doc.docType];

            return (
              <View key={doc.id} style={styles.docCard}>
                {/* Thumbnail / icon */}
                {isImage ? (
                  <Image
                    source={{ uri: doc.downloadUrl }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                    accessibilityLabel={`Thumbnail for ${doc.originalFileName}`}
                  />
                ) : (
                  <View style={styles.pdfIcon}>
                    <Ionicons name="document-text" size={28} color={colors.brand} />
                  </View>
                )}

                {/* Info */}
                <View style={styles.docBody}>
                  <View style={styles.docTitleRow}>
                    <Text style={styles.docTitle} numberOfLines={1}>{doc.originalFileName}</Text>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{label}</Text>
                    </View>
                  </View>
                  <Text style={styles.docMeta}>
                    {doc.createdAt.slice(0, 10)} · {fileSizeLabel(doc.fileSizeBytes)}
                  </Text>
                  {doc.notes && <Text style={styles.docNotes} numberOfLines={2}>{doc.notes}</Text>}
                </View>

                {/* Archive button */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Archive ${doc.originalFileName}`}
                  onPress={() => handleArchive(doc.id, doc.originalFileName)}
                  style={styles.archiveBtn}
                >
                  <Ionicons name="archive-outline" size={20} color={colors.danger} />
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: 40 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: space.md },
  eyebrow: { color: colors.brand, fontWeight: '900', fontSize: 11, letterSpacing: 1.5 },
  title: { color: colors.ink, fontSize: 32, lineHeight: 36, fontWeight: '900', letterSpacing: -1, marginTop: 4 },
  sub: { color: colors.muted, fontSize: 14, marginTop: 4 },
  
  addBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center', shadowColor: colors.brandDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  
  notice: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.mist, padding: 16, borderRadius: radius.xl, marginBottom: space.lg },
  noticeText: { color: colors.brand, fontSize: 13, fontWeight: '700', flex: 1, lineHeight: 18 },
  
  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1.5, borderColor: colors.softBrand, borderStyle: 'dashed' },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.mist, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  emptyCopy: { color: colors.muted, fontSize: 14, marginTop: 4, lineHeight: 20 },
  
  docList: { gap: space.md },
  docCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: colors.ink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  thumbnail: { width: 64, height: 64, borderRadius: 16 },
  pdfIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.mist, alignItems: 'center', justifyContent: 'center' },
  
  docBody: { flex: 1, gap: 4 },
  docTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  docTitle: { color: colors.ink, fontSize: 15, fontWeight: '900', flex: 1 },
  typeBadge: { backgroundColor: colors.pearl, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  typeBadgeText: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  docMeta: { color: colors.muted, fontSize: 13 },
  docNotes: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  
  archiveBtn: { padding: 8, backgroundColor: '#FFF0F0', borderRadius: radius.pill },
});
