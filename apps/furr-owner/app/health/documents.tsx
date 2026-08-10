import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import { DOC_TYPE_LABELS } from '@furr/core';
import { archiveDocument } from '@furr/firebase';
import { colors, radius, space } from '@furr/ui';
import { Screen } from '@/src/components/screen';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';
import { useHealth } from '@/src/context/health';

// ─────────────────────────────────────────────────────────────
//  Documents list screen  (DOC-002/003)
// ─────────────────────────────────────────────────────────────

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
      <Screen>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.brand} size="large" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
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
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* Privacy notice */}
      <View style={styles.notice}>
        <Ionicons name="lock-closed" size={13} color={colors.brand} />
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
            <Ionicons name="cloud-upload-outline" size={28} color={colors.brand} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.emptyTitle}>Upload a document</Text>
            <Text style={styles.emptyCopy}>
              Keep vaccination cards, prescriptions, and lab reports in one private place.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color={colors.brand} />
        </Pressable>
      )}

      {/* Document cards */}
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
                <Ionicons name="document-text" size={22} color={colors.brand} />
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
              <Ionicons name="archive-outline" size={18} color={colors.muted} />
            </Pressable>
          </View>
        );
      })}

      <View style={{ height: 24 }} />
    </Screen>
  );
}

// ── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { color: colors.brand, fontWeight: '900', fontSize: 10, letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 31, lineHeight: 35, fontWeight: '900', letterSpacing: -1.2, marginTop: 4 },
  sub: { color: colors.muted, fontSize: 12, marginTop: 4 },
  addBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.mist, padding: 10, borderRadius: radius.md },
  noticeText: { color: colors.brand, fontSize: 11, fontWeight: '700', flex: 1, lineHeight: 16 },
  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1.5, borderColor: colors.softBrand, borderStyle: 'dashed' },
  emptyIcon: { width: 56, height: 56, borderRadius: 20, backgroundColor: colors.mist, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  emptyCopy: { color: colors.muted, fontSize: 12, marginTop: 3, lineHeight: 17 },
  docCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderColor: colors.line },
  thumbnail: { width: 56, height: 56, borderRadius: 12 },
  pdfIcon: { width: 56, height: 56, borderRadius: 12, backgroundColor: colors.mist, alignItems: 'center', justifyContent: 'center' },
  docBody: { flex: 1, gap: 3 },
  docTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  docTitle: { color: colors.ink, fontSize: 13, fontWeight: '900', flex: 1 },
  typeBadge: { backgroundColor: colors.pearl, paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.pill },
  typeBadgeText: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },
  docMeta: { color: colors.muted, fontSize: 11 },
  docNotes: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  archiveBtn: { padding: 6 },
});
