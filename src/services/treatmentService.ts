import { Treatment, TreatmentCategory } from '../types';
import { INITIAL_TREATMENTS } from '../data/initialData';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const COLLECTION_NAME = 'treatments';

// In-memory runtime state synced directly with Firebase Firestore (zero localStorage)
let memoryTreatments: Treatment[] = [...INITIAL_TREATMENTS];
let isSeedingCloud = false;

function updateMemoryTreatments(treatments: Treatment[]): void {
  memoryTreatments = treatments;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lusentic_treatments_updated', { detail: treatments }));
  }
}

/**
 * Remove undefined values so Firestore setDoc never rejects the payload
 */
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

export const treatmentService = {
  async getAll(): Promise<Treatment[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      if (!snap.empty) {
        const cloudTreatments: Treatment[] = [];
        snap.forEach((d) => {
          cloudTreatments.push(d.data() as Treatment);
        });
        cloudTreatments.sort((a, b) => b.id - a.id);
        updateMemoryTreatments(cloudTreatments);
        return cloudTreatments;
      } else if (!isSeedingCloud) {
        // First-time seed directly into Firebase Firestore when collection is empty
        isSeedingCloud = true;
        for (const item of INITIAL_TREATMENTS) {
          try {
            await setDoc(doc(db, COLLECTION_NAME, String(item.id)), sanitizeForFirestore(item));
          } catch (seedErr) {
            console.warn('Could not auto-seed treatment to Firestore:', item.name, seedErr);
          }
        }
        updateMemoryTreatments(INITIAL_TREATMENTS);
        return INITIAL_TREATMENTS;
      }
    } catch (error) {
      console.error('Firestore getAll treatments error:', error);
    }
    return memoryTreatments;
  },

  async getByCategory(category: TreatmentCategory): Promise<Treatment[]> {
    const list = await this.getAll();
    return list.filter((t) => t.category.toLowerCase() === category.toLowerCase());
  },

  async getById(id: number): Promise<Treatment | undefined> {
    const list = await this.getAll();
    return list.find((t) => t.id === id);
  },

  async search(query: string): Promise<Treatment[]> {
    const q = query.toLowerCase().trim();
    const list = await this.getAll();
    if (!q) return list;
    return list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  },

  async addTreatment(treatment: Omit<Treatment, 'id'>): Promise<Treatment> {
    const list = await this.getAll();
    const newId = Math.max(0, ...list.map((t) => t.id)) + 1;
    const sanitizedTreatment: Treatment = sanitizeForFirestore({
      ...treatment,
      id: newId,
      name: String(treatment.name || 'Custom Therapy').trim(),
      price: Number(treatment.price) || 0,
      duration: Number(treatment.duration) || 60,
      category: String(treatment.category || 'Massage Therapy').trim(),
      image:
        treatment.imageUrl ||
        treatment.image ||
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
      imageUrl:
        treatment.imageUrl ||
        treatment.image ||
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
      description: String(treatment.description || '').trim(),
      rating: Number(treatment.rating) || 5.0,
      isMonthlySpecial: Boolean(treatment.isMonthlySpecial),
    });

    const updated = [sanitizedTreatment, ...list.filter((t) => t.id !== newId)];
    updateMemoryTreatments(updated);

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(newId)), sanitizedTreatment);
    } catch (error) {
      console.error('Failed to sync treatment to Firestore:', error);
      handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${newId}`);
    }

    return sanitizedTreatment;
  },

  async updateTreatment(id: number, updates: Partial<Treatment>): Promise<Treatment | null> {
    const list = await this.getAll();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const base = list[index];
    const merged = sanitizeForFirestore({
      ...base,
      ...updates,
      id,
      name: updates.name !== undefined ? String(updates.name).trim() : base.name,
      price: updates.price !== undefined ? Number(updates.price) || 0 : base.price,
      duration: updates.duration !== undefined ? Number(updates.duration) || 60 : base.duration,
      category: updates.category !== undefined ? String(updates.category).trim() : base.category,
      imageUrl: updates.imageUrl || updates.image || base.imageUrl,
      image: updates.imageUrl || updates.image || base.image,
      description:
        updates.description !== undefined ? String(updates.description).trim() : base.description || '',
    });

    const nextList = [...list];
    nextList[index] = merged;
    updateMemoryTreatments(nextList);

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(id)), merged, { merge: true });
    } catch (error) {
      console.error('Failed to update treatment in Firestore:', error);
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }

    return merged;
  },

  async deleteTreatment(id: number): Promise<boolean> {
    const list = await this.getAll();
    const filtered = list.filter((t) => t.id !== id);
    updateMemoryTreatments(filtered);

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, String(id)));
    } catch (error) {
      console.error('Failed to delete treatment from Firestore:', error);
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }

    return true;
  },

  subscribe(callback: (treatments: Treatment[]) => void): () => void {
    callback(memoryTreatments);

    const memoryListener = (e: Event) => {
      const custom = e as CustomEvent<Treatment[]>;
      if (Array.isArray(custom.detail)) {
        callback(custom.detail);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('lusentic_treatments_updated', memoryListener);
    }

    let unsubFirestore = () => {};
    try {
      unsubFirestore = onSnapshot(
        collection(db, COLLECTION_NAME),
        (snap) => {
          if (!snap.empty) {
            const list: Treatment[] = [];
            snap.forEach((d) => {
              list.push(d.data() as Treatment);
            });
            list.sort((a, b) => b.id - a.id);
            updateMemoryTreatments(list);
            callback(list);
          } else {
            this.getAll().then((seeded) => callback(seeded));
          }
        },
        (err) => {
          console.warn('Treatments onSnapshot warning:', err);
        }
      );
    } catch (e) {
      console.warn('Unable to attach Firestore treatments listener:', e);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('lusentic_treatments_updated', memoryListener);
      }
      unsubFirestore();
    };
  },
};
