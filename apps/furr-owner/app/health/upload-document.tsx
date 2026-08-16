import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { DOC_TYPES, DOC_TYPE_LABELS, type DocType } from '@furr/core';
import { uploadDocument } from '@furr/firebase';
import { Button, colors, radius, space } from '@furr/ui';
import { useAuth } from '@/src/context/auth';
import { usePets } from '@/src/context/pets';
import { useHealth } from '@/src/context/health';

const MAX_MB = 10;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'application/pdf'];

type PickedFile = {
  uri: string;
  mimeType: string;
  name: string;
  isImage: boolean;
};

function mimeIcon(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'document-text';
  return 'image';
}

export default function UploadDocumentScreen() {
  const { firebaseUser } = useAuth();
  const { selectedPet } = usePets();
  const { addDocument } = useHealth();

  const [picked, setPicked] = useState<PickedFile | null>(null);
  const [docType, setDocType] = useState<DocType>('other');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera access needed', 'Please enable camera access in Settings to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const mimeType = asset.mimeType ?? 'image/jpeg';
      setPicked({ uri: asset.uri, mimeType, name: `photo_${Date.now()}.jpg`, isImage: true });
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Library access needed', 'Please enable photo library access in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const mimeType = asset.mimeType ?? 'image/jpeg';
      setPicked({ uri: asset.uri, mimeType, name: asset.fileName ?? `image_${Date.now()}.jpg`, isImage: true });
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'application/pdf'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const mimeType = asset.mimeType ?? 'application/pdf';
      if (!ALLOWED_MIME.includes(mimeType)) {
        Alert.alert('Unsupported file', 'Please choose a JPEG, PNG, or PDF file.');
        return;
      }
      if (asset.size && asset.size > MAX_MB * 1024 * 1024) {
        Alert.alert('File too large', `Maximum file size is ${MAX_MB} MB.`);
        return;
      }
      setPicked({ uri: asset.uri, mimeType, name: asset.name, isImage: mimeType !== 'application/pdf' });
    }
  };

  const handleUpload = async () => {
    if (!picked || !firebaseUser || !selectedPet) return;
    setUploading(true);
    try {
      const doc = await uploadDocument(firebaseUser.uid, selectedPet.id, {
        uri: picked.uri,
        mimeType: picked.mimeType,
        fileName: picked.name,
        docType,
        notes: notes.trim() || undefined,
      });
      addDocument(doc);
      router.back();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      Alert.alert('Upload failed', msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>DOCUMENTS</Text>
        <Text style={styles.title}>Upload File</Text>
      </View>

      {selectedPet && (
        <View style={styles.petBadge}>
          <Ionicons name="paw" size={16} color={colors.brand} />
          <Text style={styles.petBadgeText}>For {selectedPet.name}</Text>
        </View>
      )}

      {/* Privacy notice */}
      <View style={styles.notice}>
        <Ionicons name="lock-closed" size={20} color={colors.brand} />
        <Text style={styles.noticeText}>
          Stored privately. Supported formats: JPEG, PNG, PDF · Max {MAX_MB} MB.
        </Text>
      </View>

      <View style={styles.sectionContainer}>
        {/* File picker buttons */}
        {!picked && (
          <View style={styles.pickerRow}>
            <Pressable accessibilityRole="button" style={styles.pickerBtn} onPress={pickFromCamera}>
              <View style={styles.pickerIcon}>
                <Ionicons name="camera" size={28} color={colors.brand} />
              </View>
              <Text style={styles.pickerLabel}>Camera</Text>
              <Text style={styles.pickerSub}>Take a photo</Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.pickerBtn} onPress={pickFromGallery}>
              <View style={styles.pickerIcon}>
                <Ionicons name="images" size={28} color={colors.brand} />
              </View>
              <Text style={styles.pickerLabel}>Gallery</Text>
              <Text style={styles.pickerSub}>Choose image</Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.pickerBtn} onPress={pickDocument}>
              <View style={styles.pickerIcon}>
                <Ionicons name="document-text" size={28} color={colors.brand} />
              </View>
              <Text style={styles.pickerLabel}>Files</Text>
              <Text style={styles.pickerSub}>PDF or image</Text>
            </Pressable>
          </View>
        )}

        {/* Selected file preview */}
        {picked && (
          <View style={styles.preview}>
            {picked.isImage ? (
              <Image
                source={{ uri: picked.uri }}
                style={styles.previewImage}
                resizeMode="cover"
                accessibilityLabel="Selected image preview"
              />
            ) : (
              <View style={styles.previewPdf}>
                <Ionicons name={mimeIcon(picked.mimeType) as never} size={64} color={colors.brand} />
                <Text style={styles.previewFileName} numberOfLines={2}>{picked.name}</Text>
              </View>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove selected file"
              style={styles.removePicked}
              onPress={() => setPicked(null)}
            >
              <Ionicons name="close" size={24} color={colors.ink} />
            </Pressable>
            <Text style={styles.previewName} numberOfLines={1}>{picked.name}</Text>
          </View>
        )}

        {/* Document type */}
        <View style={styles.section}>
          <Text style={styles.label}>Document type</Text>
          <View style={styles.typeGrid}>
            {DOC_TYPES.map((t) => (
              <Pressable
                key={t}
                accessibilityRole="radio"
                accessibilityState={{ selected: docType === t }}
                style={[styles.typePill, docType === t && styles.typePillSelected]}
                onPress={() => setDocType(t)}
              >
                <Text style={[styles.typePillText, docType === t && styles.typePillTextSelected]}>
                  {DOC_TYPE_LABELS[t]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="e.g. Rabies certificate from March 2026 visit"
            placeholderTextColor={colors.muted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            maxLength={300}
            accessibilityLabel="Document notes"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button label={uploading ? 'Uploading…' : 'Upload document'} loading={uploading} disabled={!picked} onPress={handleUpload} />
      </View>
      
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: 40 },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },

  header: { marginBottom: space.md },
  eyebrow: { color: colors.brand, fontWeight: '900', fontSize: 11, letterSpacing: 1.5 },
  title: { color: colors.ink, fontSize: 34, fontWeight: '900', letterSpacing: -1, marginTop: 6 },
  
  petBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: colors.mist, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, marginBottom: space.md },
  petBadgeText: { color: colors.brand, fontSize: 14, fontWeight: '800' },

  notice: { flexDirection: 'row', gap: 12, backgroundColor: colors.surface, padding: 16, borderRadius: radius.xl, alignItems: 'flex-start', borderWidth: 1, borderColor: colors.line, shadowColor: colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, marginBottom: space.md },
  noticeText: { color: colors.ink, fontSize: 14, lineHeight: 20, flex: 1, fontWeight: '600' },

  sectionContainer: { gap: space.xl, marginTop: space.sm },
  section: { gap: 10 },
  label: { color: colors.ink, fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },

  pickerRow: { flexDirection: 'row', gap: 12 },
  pickerBtn: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.line, shadowColor: colors.ink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  pickerIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: colors.mist, alignItems: 'center', justifyContent: 'center' },
  pickerLabel: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  pickerSub: { color: colors.muted, fontSize: 12, textAlign: 'center' },

  preview: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1.5, borderColor: colors.line, position: 'relative', shadowColor: colors.ink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  previewImage: { width: '100%', height: 260 },
  previewPdf: { height: 200, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: colors.pearl },
  previewFileName: { color: colors.ink, fontSize: 15, fontWeight: '700', textAlign: 'center', paddingHorizontal: 20 },
  removePicked: { position: 'absolute', top: 12, right: 12, backgroundColor: colors.surface, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  previewName: { color: colors.muted, fontSize: 13, padding: 14, paddingTop: 10, fontWeight: '600' },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typePill: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface },
  typePillSelected: { borderColor: colors.brand, backgroundColor: colors.mist },
  typePillText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  typePillTextSelected: { color: colors.brand },

  input: { minHeight: 52, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, fontSize: 16, color: colors.ink, fontWeight: '600' },
  textarea: { minHeight: 120, paddingTop: 14, textAlignVertical: 'top' },

  footer: { marginTop: space.xxl },
});
