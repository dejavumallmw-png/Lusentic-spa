import { GalleryItem } from '../types';
import { INITIAL_GALLERY } from '../data/initialData';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';

const COLLECTION_NAME = 'gallery';

// In-memory runtime state and subscribers synced directly with Firebase Firestore (zero localStorage)
type GalleryListener = (items: GalleryItem[]) => void;
const listeners = new Set<GalleryListener>();
let memoryGallery: GalleryItem[] = [...INITIAL_GALLERY];
let isSeedingGallery = false;
let hasExplicitlyCleared = false;

function notifyListeners(items: GalleryItem[]): void {
  memoryGallery = items;
  listeners.forEach((listener) => {
    try {
      listener(items);
    } catch (e) {
      console.warn('Gallery listener error:', e);
    }
  });
}

function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        result[key] = sanitizeForFirestore(val);
      } else {
        result[key] = val;
      }
    }
  }
  return result;
}

export const galleryService = {
  /**
   * Subscribe to real-time changes from Firebase Firestore
   */
  subscribe: (callback: GalleryListener): (() => void) => {
    listeners.add(callback);
    callback(memoryGallery);

    let firestoreUnsub: Unsubscribe | null = null;
    try {
      firestoreUnsub = onSnapshot(
        collection(db, COLLECTION_NAME),
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudList: GalleryItem[] = [];
            snapshot.forEach((d) => {
              cloudList.push(d.data() as GalleryItem);
            });
            cloudList.sort((a, b) => b.id - a.id);
            memoryGallery = cloudList;
            callback(cloudList);
          } else if (hasExplicitlyCleared) {
            memoryGallery = [];
            callback([]);
          } else {
            galleryService.getAll().then((seeded) => callback(seeded));
          }
        },
        (error) => {
          console.warn('Firestore gallery snapshot listener warning:', error.message);
        }
      );
    } catch (e) {
      console.warn('Unable to attach Firestore snapshot listener:', e);
    }

    return () => {
      listeners.delete(callback);
      if (firestoreUnsub) {
        try {
          firestoreUnsub();
        } catch {
          // ignore
        }
      }
    };
  },

  getAll: async (): Promise<GalleryItem[]> => {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      if (!snap.empty) {
        const cloudList: GalleryItem[] = [];
        snap.forEach((d) => {
          cloudList.push(d.data() as GalleryItem);
        });
        cloudList.sort((a, b) => b.id - a.id);
        notifyListeners(cloudList);
        return cloudList;
      } else {
        if (hasExplicitlyCleared) {
          return [];
        }
        if (!isSeedingGallery) {
          isSeedingGallery = true;
          for (const item of INITIAL_GALLERY) {
            try {
              await setDoc(doc(db, COLLECTION_NAME, String(item.id)), sanitizeForFirestore(item));
            } catch (err) {
              console.warn('Could not seed gallery item to Firestore:', item.title, err);
            }
          }
          notifyListeners([...INITIAL_GALLERY]);
          return memoryGallery;
        }
      }
    } catch (error) {
      console.error('Firestore getAll gallery error:', error);
    }
    return memoryGallery;
  },

  addPhoto: async (photo: Omit<GalleryItem, 'id'>): Promise<GalleryItem> => {
    hasExplicitlyCleared = false;
    const all = await galleryService.getAll();
    const newId = Date.now();
    const newPhoto: GalleryItem = sanitizeForFirestore({
      ...photo,
      id: newId,
    });
    const updated = [newPhoto, ...all];
    notifyListeners(updated);

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(newId)), newPhoto);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${newId}`);
    }

    return newPhoto;
  },

  updatePhoto: async (id: number, updates: Partial<GalleryItem>): Promise<GalleryItem | null> => {
    const all = await galleryService.getAll();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const merged = sanitizeForFirestore({ ...all[idx], ...updates });
    const nextList = [...all];
    nextList[idx] = merged;
    notifyListeners(nextList);

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(id)), merged, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }

    return merged;
  },

  deletePhoto: async (id: number): Promise<void> => {
    const all = await galleryService.getAll();
    const updated = all.filter((p) => p.id !== id);
    if (updated.length === 0) {
      hasExplicitlyCleared = true;
    }
    notifyListeners(updated);

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, String(id)));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }
  },

  clearAllPhotos: async (): Promise<void> => {
    hasExplicitlyCleared = true;
    const all = await galleryService.getAll();
    notifyListeners([]);

    for (const item of all) {
      try {
        await deleteDoc(doc(db, COLLECTION_NAME, String(item.id)));
      } catch {
        // ignore
      }
    }
  },

  /**
   * Reset gallery to default initial sanctuary collection in Firestore
   */
  resetToDefault: async (): Promise<GalleryItem[]> => {
    hasExplicitlyCleared = false;
    notifyListeners([...INITIAL_GALLERY]);
    for (const item of INITIAL_GALLERY) {
      try {
        await setDoc(doc(db, COLLECTION_NAME, String(item.id)), sanitizeForFirestore(item));
      } catch {
        // ignore
      }
    }
    return INITIAL_GALLERY;
  },
};
