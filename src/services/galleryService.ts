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

const STORAGE_KEY = 'lusentic_gallery';
const INIT_KEY = 'lusentic_gallery_has_initialized';
const COLLECTION_NAME = 'gallery';

// In-memory subscribers for real-time reactivity across components
type GalleryListener = (items: GalleryItem[]) => void;
const listeners = new Set<GalleryListener>();

function notifyListeners(items: GalleryItem[]): void {
  listeners.forEach((listener) => {
    try {
      listener(items);
    } catch (e) {
      console.warn('Gallery listener error:', e);
    }
  });
}

function getStoredGallery(): GalleryItem[] {
  try {
    const hasInit = localStorage.getItem(INIT_KEY);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null && hasInit) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load gallery from storage', e);
  }

  // First time only: initialize with defaults
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_GALLERY));
    localStorage.setItem(INIT_KEY, 'true');
  } catch {
    // ignore
  }
  return INITIAL_GALLERY;
}

function saveGallery(items: GalleryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    localStorage.setItem(INIT_KEY, 'true');
  } catch (e) {
    console.warn('Failed to save gallery locally:', e);
  }
  notifyListeners(items);
}

export const galleryService = {
  /**
   * Subscribe to real-time changes from Firestore and local mutations
   */
  subscribe: (callback: GalleryListener): (() => void) => {
    listeners.add(callback);
    // Provide current state immediately
    callback(getStoredGallery());

    let firestoreUnsub: Unsubscribe | null = null;
    try {
      firestoreUnsub = onSnapshot(
        collection(db, COLLECTION_NAME),
        (snapshot) => {
          const cloudList: GalleryItem[] = [];
          snapshot.forEach((d) => {
            cloudList.push(d.data() as GalleryItem);
          });
          cloudList.sort((a, b) => b.id - a.id);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudList));
            localStorage.setItem(INIT_KEY, 'true');
          } catch {
            // ignore
          }
          callback(cloudList);
        },
        (error) => {
          console.warn('Firestore gallery snapshot listener warning (using local fallback):', error.message);
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
        saveGallery(cloudList);
        return cloudList;
      } else {
        const hasInit = localStorage.getItem(INIT_KEY);
        // If it was explicitly cleared, return empty
        if (hasInit) {
          return getStoredGallery();
        }
        // First time initialization in Firestore
        const initial = getStoredGallery();
        for (const item of initial) {
          try {
            await setDoc(doc(db, COLLECTION_NAME, String(item.id)), item);
          } catch {
            // non-blocking seed
          }
        }
        return initial;
      }
    } catch (error) {
      console.warn('Firestore getAll gallery error, falling back to local cache:', error);
    }
    return getStoredGallery();
  },

  addPhoto: async (photo: Omit<GalleryItem, 'id'>): Promise<GalleryItem> => {
    const all = await galleryService.getAll();
    const newId = Date.now();
    const newPhoto: GalleryItem = {
      ...photo,
      id: newId,
    };
    const updated = [newPhoto, ...all];
    saveGallery(updated);

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(newId)), newPhoto);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${newId}`);
      } catch {
        console.warn('Saved photo locally, cloud sync pending.');
      }
    }

    return newPhoto;
  },

  updatePhoto: async (id: number, updates: Partial<GalleryItem>): Promise<GalleryItem | null> => {
    const all = await galleryService.getAll();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const merged = { ...all[idx], ...updates };
    all[idx] = merged;
    saveGallery(all);

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(id)), merged, { merge: true });
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
      } catch {
        console.warn('Updated photo locally, cloud sync pending.');
      }
    }

    return merged;
  },

  deletePhoto: async (id: number): Promise<void> => {
    const all = await galleryService.getAll();
    const updated = all.filter((p) => p.id !== id);
    saveGallery(updated);

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, String(id)));
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
      } catch {
        console.warn('Deleted photo locally, cloud sync pending.');
      }
    }
  },

  clearAllPhotos: async (): Promise<void> => {
    const all = await galleryService.getAll();
    saveGallery([]);

    for (const item of all) {
      try {
        await deleteDoc(doc(db, COLLECTION_NAME, String(item.id)));
      } catch {
        // ignore
      }
    }
  },

  /**
   * Reset gallery to default initial sanctuary collection
   */
  resetToDefault: async (): Promise<GalleryItem[]> => {
    saveGallery(INITIAL_GALLERY);
    for (const item of INITIAL_GALLERY) {
      try {
        await setDoc(doc(db, COLLECTION_NAME, String(item.id)), item);
      } catch {
        // ignore
      }
    }
    return INITIAL_GALLERY;
  },
};
