import { Treatment, TreatmentCategory } from '../types';
import { INITIAL_TREATMENTS } from '../data/initialData';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';

const STORAGE_KEY = 'lusentic_spa_dynamic_treatments_v2';
const COLLECTION_NAME = 'treatments';
const INITIALIZED_FLAG = 'lusentic_treatments_cloud_seeded';

function getStoredTreatments(): Treatment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TREATMENTS));
      return INITIAL_TREATMENTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TREATMENTS));
      return INITIAL_TREATMENTS;
    }
    return parsed;
  } catch {
    return INITIAL_TREATMENTS;
  }
}

function saveTreatments(treatments: Treatment[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(treatments));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lusentic_treatments_updated', { detail: treatments }));
    }
  } catch (e) {
    console.warn('Failed to save treatments locally:', e);
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
        saveTreatments(cloudTreatments);
        return cloudTreatments;
      } else {
        // First-time seed into Firestore so all devices (mobile, PC, TV) have access
        if (!localStorage.getItem(INITIALIZED_FLAG)) {
          localStorage.setItem(INITIALIZED_FLAG, 'true');
          for (const item of INITIAL_TREATMENTS) {
            try {
              await setDoc(doc(db, COLLECTION_NAME, String(item.id)), sanitizeForFirestore(item));
            } catch (seedErr) {
              console.warn('Could not auto-seed treatment:', item.name, seedErr);
            }
          }
          saveTreatments(INITIAL_TREATMENTS);
          return INITIAL_TREATMENTS;
        }
      }
    } catch (error) {
      console.warn('Firestore getAll treatments error, falling back to local cache:', error);
    }
    return getStoredTreatments();
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
      image: treatment.imageUrl || treatment.image || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
      imageUrl: treatment.imageUrl || treatment.image || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
      description: String(treatment.description || '').trim(),
      rating: Number(treatment.rating) || 5.0,
      isMonthlySpecial: Boolean(treatment.isMonthlySpecial),
    });

    // Update local state immediately for snappy response
    const updated = [sanitizedTreatment, ...list.filter((t) => t.id !== newId)];
    saveTreatments(updated);

    // Persist to Firebase Firestore for cross-device sync
    try {
      await setDoc(doc(db, COLLECTION_NAME, String(newId)), sanitizedTreatment);
      console.log(`Treatment "${sanitizedTreatment.name}" successfully synced to Firestore id ${newId}.`);
    } catch (error) {
      console.error('Failed to sync treatment to Firestore:', error);
      try {
        handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${newId}`);
      } catch (err) {
        throw err;
      }
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
      description: updates.description !== undefined ? String(updates.description).trim() : (base.description || ''),
    });

    list[index] = merged;
    saveTreatments(list);

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(id)), merged, { merge: true });
      console.log(`Treatment id ${id} updated in Firestore.`);
    } catch (error) {
      console.error('Failed to update treatment in Firestore:', error);
      try {
        handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
      } catch (err) {
        throw err;
      }
    }

    return merged;
  },

  async deleteTreatment(id: number): Promise<boolean> {
    const list = await this.getAll();
    const filtered = list.filter((t) => t.id !== id);
    saveTreatments(filtered);

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, String(id)));
      console.log(`Treatment id ${id} deleted from Firestore.`);
    } catch (error) {
      console.error('Failed to delete treatment from Firestore:', error);
      try {
        handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
      } catch (err) {
        throw err;
      }
    }

    return true;
  },

  subscribe(callback: (treatments: Treatment[]) => void): () => void {
    // 1. Send current stored treatments immediately
    callback(getStoredTreatments());

    // 2. Intra-device listener
    const localListener = (e: Event) => {
      const custom = e as CustomEvent<Treatment[]>;
      if (Array.isArray(custom.detail)) {
        callback(custom.detail);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('lusentic_treatments_updated', localListener);
    }

    // 3. Real-time Firebase Firestore listener across all devices
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
            saveTreatments(list);
            callback(list);
          } else {
            // Auto seed if empty
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
        window.removeEventListener('lusentic_treatments_updated', localListener);
      }
      unsubFirestore();
    };
  },
};
