import { CategoryInfo } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialData';
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

const STORAGE_KEY = 'lusentic_spa_categories_v2';
const COLLECTION_NAME = 'categories';

function getStoredCategories(): CategoryInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CATEGORIES;
  } catch {
    return INITIAL_CATEGORIES;
  }
}

function saveCategories(categories: CategoryInfo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (e) {
    console.warn('Failed to save categories locally:', e);
  }
}

export const categoryService = {
  async getAll(): Promise<CategoryInfo[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      if (!snap.empty) {
        const list: CategoryInfo[] = [];
        snap.forEach((d) => {
          list.push(d.data() as CategoryInfo);
        });
        saveCategories(list);
        return list;
      } else {
        // Seed initial categories so they are in Firestore
        const defaults = getStoredCategories();
        for (const cat of defaults) {
          try {
            await setDoc(doc(db, COLLECTION_NAME, cat.slug), cat);
          } catch {
            // non-blocking
          }
        }
        return defaults;
      }
    } catch (error) {
      console.warn('Firestore getAll categories error, falling back to local cache:', error);
    }
    return getStoredCategories();
  },

  async addCategory(data: { label: string; description?: string; iconName?: string }): Promise<CategoryInfo> {
    const list = await this.getAll();
    const slug = data.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = list.find((c) => c.slug === slug);
    if (existing) {
      return existing;
    }

    const newCat: CategoryInfo = {
      slug,
      label: data.label,
      description: data.description || `${data.label} treatments & therapies`,
      iconName: data.iconName || 'Sparkles',
    };

    const updated = [...list, newCat];
    saveCategories(updated);

    try {
      await setDoc(doc(db, COLLECTION_NAME, slug), newCat);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${slug}`);
      } catch {
        console.warn('Saved category locally, cloud sync pending.');
      }
    }

    return newCat;
  },

  async deleteCategory(slugOrLabel: string): Promise<boolean> {
    const list = await this.getAll();
    const catToDelete = list.find(
      (c) => c.slug === slugOrLabel || c.label.toLowerCase() === slugOrLabel.toLowerCase()
    );
    const targetSlug = catToDelete ? catToDelete.slug : slugOrLabel;

    const filtered = list.filter(
      (c) => c.slug !== targetSlug && c.label.toLowerCase() !== slugOrLabel.toLowerCase()
    );
    saveCategories(filtered);

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, targetSlug));
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${targetSlug}`);
      } catch {
        console.warn('Deleted category locally, cloud sync pending.');
      }
    }

    return true;
  },

  subscribe(callback: (categories: CategoryInfo[]) => void): () => void {
    callback(getStoredCategories());
    let unsub: Unsubscribe | null = null;
    try {
      unsub = onSnapshot(
        collection(db, COLLECTION_NAME),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: CategoryInfo[] = [];
            snapshot.forEach((d) => {
              list.push(d.data() as CategoryInfo);
            });
            saveCategories(list);
            callback(list);
          }
        },
        (err) => {
          console.warn('Categories subscription snapshot warning:', err);
        }
      );
    } catch (e) {
      console.warn('Unable to attach Firestore categories listener:', e);
    }

    return () => {
      if (unsub) unsub();
    };
  },
};
