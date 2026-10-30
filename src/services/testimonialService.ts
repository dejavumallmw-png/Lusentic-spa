import { Testimonial } from '../types';
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

const COLLECTION_NAME = 'testimonials';

// In-memory runtime state synced directly with Firebase Firestore (zero localStorage)
let memoryTestimonials: Testimonial[] = [];

function updateMemoryTestimonials(testimonials: Testimonial[]): void {
  memoryTestimonials = testimonials;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lusentic_testimonials_updated', { detail: testimonials }));
  }
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

export const testimonialService = {
  async getAll(): Promise<Testimonial[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      const cloudList: Testimonial[] = [];
      snap.forEach((d) => {
        cloudList.push(d.data() as Testimonial);
      });
      cloudList.sort((a, b) => b.id - a.id);
      updateMemoryTestimonials(cloudList);
      return cloudList;
    } catch (error) {
      console.error('Firestore getAll testimonials error:', error);
    }
    return memoryTestimonials;
  },

  async addTestimonial(data: Omit<Testimonial, 'id' | 'date'>): Promise<Testimonial> {
    const list = await this.getAll();
    const newId = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const newTestimonial: Testimonial = sanitizeForFirestore({
      ...data,
      id: newId,
      date: today,
      role: data.role || 'Verified Guest',
    });
    const updated = [newTestimonial, ...list];
    updateMemoryTestimonials(updated);

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(newId)), newTestimonial);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${newId}`);
    }

    return newTestimonial;
  },

  async updateTestimonial(id: number, updates: Partial<Testimonial>): Promise<Testimonial | null> {
    const list = await this.getAll();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const merged = sanitizeForFirestore({ ...list[index], ...updates });
    const nextList = [...list];
    nextList[index] = merged;
    updateMemoryTestimonials(nextList);

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(id)), merged, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }

    return merged;
  },

  async deleteTestimonial(id: number): Promise<boolean> {
    const list = await this.getAll();
    const filtered = list.filter((t) => t.id !== id);
    updateMemoryTestimonials(filtered);

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, String(id)));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }

    return true;
  },

  subscribe(callback: (testimonials: Testimonial[]) => void): () => void {
    callback(memoryTestimonials);

    const memoryHandler = (e: Event) => {
      const custom = e as CustomEvent<Testimonial[]>;
      if (custom.detail) {
        callback(custom.detail);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('lusentic_testimonials_updated', memoryHandler);
    }

    let unsub: Unsubscribe | null = null;
    try {
      unsub = onSnapshot(
        collection(db, COLLECTION_NAME),
        (snap) => {
          const list: Testimonial[] = [];
          snap.forEach((d) => {
            list.push(d.data() as Testimonial);
          });
          list.sort((a, b) => b.id - a.id);
          updateMemoryTestimonials(list);
          callback(list);
        },
        (err) => {
          console.warn('Testimonials onSnapshot warning:', err);
        }
      );
    } catch (e) {
      console.warn('Unable to attach Firestore testimonials listener:', e);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('lusentic_testimonials_updated', memoryHandler);
      }
      if (unsub) unsub();
    };
  },
};
