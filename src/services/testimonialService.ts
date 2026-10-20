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

const STORAGE_KEY = 'lusentic_spa_dynamic_testimonials_v2';
const COLLECTION_NAME = 'testimonials';

function getStoredTestimonials(): Testimonial[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveTestimonials(testimonials: Testimonial[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testimonials));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lusentic_testimonials_updated', { detail: testimonials }));
    }
  } catch (e) {
    console.warn('Failed to save testimonials locally:', e);
  }
}

export const testimonialService = {
  async getAll(): Promise<Testimonial[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      if (!snap.empty) {
        const cloudList: Testimonial[] = [];
        snap.forEach((d) => {
          cloudList.push(d.data() as Testimonial);
        });
        cloudList.sort((a, b) => b.id - a.id);
        saveTestimonials(cloudList);
        return cloudList;
      }
    } catch (error) {
      console.warn('Firestore getAll testimonials error, falling back to local cache:', error);
    }
    return getStoredTestimonials();
  },

  async addTestimonial(data: Omit<Testimonial, 'id' | 'date'>): Promise<Testimonial> {
    const list = await this.getAll();
    const newId = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const newTestimonial: Testimonial = {
      ...data,
      id: newId,
      date: today,
      role: data.role || 'Verified Guest',
    };
    const updated = [newTestimonial, ...list];
    saveTestimonials(updated);

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(newId)), newTestimonial);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${newId}`);
      } catch {
        console.warn('Saved testimonial locally, cloud sync pending.');
      }
    }

    return newTestimonial;
  },

  async updateTestimonial(id: number, updates: Partial<Testimonial>): Promise<Testimonial | null> {
    const list = await this.getAll();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const merged = { ...list[index], ...updates };
    list[index] = merged;
    saveTestimonials(list);

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(id)), merged, { merge: true });
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
      } catch {
        console.warn('Updated testimonial locally, cloud sync pending.');
      }
    }

    return merged;
  },

  async deleteTestimonial(id: number): Promise<boolean> {
    const list = await this.getAll();
    const filtered = list.filter((t) => t.id !== id);
    saveTestimonials(filtered);

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, String(id)));
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
      } catch {
        console.warn('Deleted testimonial locally, cloud sync pending.');
      }
    }

    return true;
  },

  subscribe(callback: (testimonials: Testimonial[]) => void): () => void {
    callback(getStoredTestimonials());

    const localHandler = (e: Event) => {
      const custom = e as CustomEvent<Testimonial[]>;
      if (custom.detail) {
        callback(custom.detail);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('lusentic_testimonials_updated', localHandler);
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
          saveTestimonials(list);
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
        window.removeEventListener('lusentic_testimonials_updated', localHandler);
      }
      if (unsub) unsub();
    };
  },
};
