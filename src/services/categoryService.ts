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

const COLLECTION_NAME = 'categories';

// In-memory runtime state synced directly with Firebase Firestore (zero localStorage)
let memoryCategories: CategoryInfo[] = [...INITIAL_CATEGORIES];
let isSeedingCategories = false;

export const categoryService = {
  async getAll(): Promise<CategoryInfo[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      if (!snap.empty) {
        const list: CategoryInfo[] = [];
        snap.forEach((d) => {
          list.push(d.data() as CategoryInfo);
        });
        memoryCategories = list;
        return list;
      } else if (!isSeedingCategories) {
        isSeedingCategories = true;
        for (const cat of INITIAL_CATEGORIES) {
          try {
            await setDoc(doc(db, COLLECTION_NAME, cat.slug), cat);
          } catch (err) {
            console.warn('Could not seed category to Firestore:', cat.slug, err);
          }
        }
        memoryCategories = [...INITIAL_CATEGORIES];
        return memoryCategories;
      }
    } catch (error) {
      console.error('Firestore getAll categories error:', error);
    }
    return memoryCategories;
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

    memoryCategories = [...list, newCat];

    try {
      await setDoc(doc(db, COLLECTION_NAME, slug), newCat);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${slug}`);
    }

    return newCat;
  },

  async deleteCategory(slugOrLabel: string): Promise<boolean> {
    const list = await this.getAll();
    const catToDelete = list.find(
      (c) => c.slug === slugOrLabel || c.label.toLowerCase() === slugOrLabel.toLowerCase()
    );
    const targetSlug = catToDelete ? catToDelete.slug : slugOrLabel;

    memoryCategories = list.filter(
      (c) => c.slug !== targetSlug && c.label.toLowerCase() !== slugOrLabel.toLowerCase()
    );

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, targetSlug));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${targetSlug}`);
    }

    return true;
  },

  subscribe(callback: (categories: CategoryInfo[]) => void): () => void {
    callback(memoryCategories);
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
            memoryCategories = list;
            callback(list);
          } else {
            this.getAll().then((seeded) => callback(seeded));
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
