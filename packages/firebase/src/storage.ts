// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Firebase Storage document upload
//
//  Storage paths follow: pets/{ownerUid}/{petId}/docs/{docId}.{ext}
//  All operations are wrapped here; the app never imports from
//  'firebase/storage' directly.
//
//  Dev bypass: stores a fake URL, no actual upload.
// ─────────────────────────────────────────────────────────────

import type { PetDocument } from '@furr/core';
import { IS_DEV_BYPASS } from './env';

// ── Dev in-memory store ───────────────────────────────────────

let devDocs: PetDocument[] = [];

function devId(): string {
  return `dev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Firestore path ────────────────────────────────────────────

const docColPath = (uid: string, petId: string) => `users/${uid}/pets/${petId}/documents`;

// ── Storage path builder ──────────────────────────────────────

function storagePath(ownerUid: string, petId: string, docId: string, ext: string): string {
  return `pets/${ownerUid}/${petId}/docs/${docId}.${ext}`;
}

// ─────────────────────────────────────────────────────────────
//  Upload
// ─────────────────────────────────────────────────────────────

export type UploadInput = {
  /** Local file URI from expo-image-picker or expo-document-picker */
  uri: string;
  /** MIME type — used to determine extension and validate type */
  mimeType: string;
  /** Original filename (for display only — not trusted for type) */
  fileName?: string;
  /** Document category */
  docType: PetDocument['docType'];
  /** Optional notes */
  notes?: string;
};

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'] as const;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function extFromMime(mime: string): string {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'application/pdf') return 'pdf';
  return 'bin';
}

/**
 * Upload a file to Firebase Storage and write a Firestore document record.
 * Returns the created PetDocument.
 */
export async function uploadDocument(
  ownerUid: string,
  petId: string,
  input: UploadInput,
): Promise<PetDocument> {
  // ── Validate MIME type ────────────────────────────────────────
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(input.mimeType)) {
    throw new Error(`Unsupported file type: ${input.mimeType}. Use JPEG, PNG, or PDF.`);
  }

  const now = new Date().toISOString();
  const id = devId();
  const ext = extFromMime(input.mimeType);

  if (IS_DEV_BYPASS) {
    const doc: PetDocument = {
      id,
      petId,
      ownerUid,
      docType: input.docType,
      mimeType: input.mimeType,
      originalFileName: input.fileName ?? `document.${ext}`,
      storagePath: `pets/${ownerUid}/${petId}/docs/${id}.${ext}`,
      // In dev mode, use the local URI as the "download URL"
      downloadUrl: input.uri,
      fileSizeBytes: 0,
      notes: input.notes,
      uploadedByUid: ownerUid,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    devDocs = [doc, ...devDocs];
    return doc;
  }

  // ── Real upload ────────────────────────────────────────────────
  const path = storagePath(ownerUid, petId, id, ext);

  // Validate URI scheme — only allow local file/content URIs from camera/picker
  const allowedSchemes = ['file://', 'content://', 'ph://', 'asset-library://'];
  const uriLower = input.uri.toLowerCase();
  if (!allowedSchemes.some((s) => uriLower.startsWith(s))) {
    throw new Error(`Invalid file URI scheme. Only local file URIs from camera or image picker are allowed.`);
  }

  // Get file blob from local URI
  const blob = await fetch(input.uri).then((r) => r.blob());

  // Validate size
  if (blob.size > MAX_BYTES) {
    throw new Error(`File is too large. Maximum size is 10 MB (got ${(blob.size / 1024 / 1024).toFixed(1)} MB).`);
  }

  const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
  const { getFirestore, collection, doc, setDoc, serverTimestamp } = await import('firebase/firestore');

  const storageRef = ref(getStorage(), path);
  await uploadBytes(storageRef, blob, { contentType: input.mimeType });
  const downloadUrl = await getDownloadURL(storageRef);

  const petDoc: PetDocument = {
    id,
    petId,
    ownerUid,
    docType: input.docType,
    mimeType: input.mimeType,
    originalFileName: input.fileName ?? `document.${ext}`,
    storagePath: path,
    downloadUrl,
    fileSizeBytes: blob.size,
    notes: input.notes,
    uploadedByUid: ownerUid,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };

  const db = getFirestore();
  const docRef = doc(collection(db, docColPath(ownerUid, petId)), id);
  await setDoc(docRef, { ...petDoc, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

  return petDoc;
}

// ─────────────────────────────────────────────────────────────
//  Subscribe / list
// ─────────────────────────────────────────────────────────────

export function subscribeToDocuments(
  ownerUid: string,
  petId: string,
  onUpdate: (docs: PetDocument[]) => void,
): () => void {
  if (IS_DEV_BYPASS) {
    onUpdate(devDocs.filter((d) => d.petId === petId && !d.isArchived));
    return () => {};
  }

  // Capture the real unsubscribe so it can be called on cleanup.
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, where, orderBy, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(
        collection(db, docColPath(ownerUid, petId)),
        where('isArchived', '==', false),
        orderBy('createdAt', 'desc'),
      );
      unsubscribe = onSnapshot(q, (snap) => {
        onUpdate(snap.docs.map((d) => d.data() as PetDocument));
      });
    } catch (err) {
      console.error('[furr/firebase] subscribeToDocuments error', err);
      if (active) onUpdate([]);
    }
  })();

  return () => {
    active = false;
    unsubscribe?.();
  };
}

// ─────────────────────────────────────────────────────────────
//  Archive
// ─────────────────────────────────────────────────────────────

export async function archiveDocument(ownerUid: string, petId: string, docId: string): Promise<void> {
  const now = new Date().toISOString();
  if (IS_DEV_BYPASS) {
    devDocs = devDocs.map((d) => d.id === docId ? { ...d, isArchived: true, updatedAt: now } : d);
    return;
  }
  const { getFirestore, doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  await updateDoc(doc(getFirestore(), docColPath(ownerUid, petId), docId), {
    isArchived: true,
    updatedAt: serverTimestamp(),
  });
}
