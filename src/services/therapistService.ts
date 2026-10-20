import { Therapist } from '../types';
import { INITIAL_THERAPISTS } from '../data/initialData';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const STORAGE_KEY = 'lusentic_spa_therapists';
const COLLECTION_NAME = 'therapists';

function getStoredTherapists(): Therapist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_THERAPISTS));
      return INITIAL_THERAPISTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_THERAPISTS;
  }
}

function saveTherapists(therapists: Therapist[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(therapists));
  } catch (e) {
    console.warn('Failed to save therapists locally:', e);
  }
}

export const therapistService = {
  async getAll(): Promise<Therapist[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      if (!snap.empty) {
        const cloudList: Therapist[] = [];
        snap.forEach((d) => {
          cloudList.push(d.data() as Therapist);
        });
        cloudList.sort((a, b) => a.id - b.id);
        saveTherapists(cloudList);
        return cloudList;
      } else {
        // Seed initial therapists to Firestore so cloud database is populated
        const initial = getStoredTherapists();
        for (const th of initial) {
          try {
            await setDoc(doc(db, COLLECTION_NAME, String(th.id)), th);
          } catch {
            // ignore non-blocking seed
          }
        }
        return initial;
      }
    } catch (error) {
      console.warn('Firestore getAll therapists error, falling back to local cache:', error);
    }
    return getStoredTherapists();
  },

  async getById(id: number): Promise<Therapist | undefined> {
    const list = await this.getAll();
    return list.find((t) => t.id === id);
  },

  async addTherapist(data: Omit<Therapist, 'id'>): Promise<Therapist> {
    const list = await this.getAll();
    const newId = Math.max(0, ...list.map((t) => t.id)) + 1;
    const newTherapist: Therapist = {
      ...data,
      id: newId,
    };
    const updated = [...list, newTherapist];
    saveTherapists(updated);

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(newId)), newTherapist);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${newId}`);
      } catch {
        console.warn('Saved therapist locally, cloud sync pending.');
      }
    }

    return newTherapist;
  },

  async updateTherapist(id: number, updates: Partial<Therapist>): Promise<Therapist | null> {
    const list = await this.getAll();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const merged = { ...list[index], ...updates };
    list[index] = merged;
    saveTherapists(list);

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(id)), merged, { merge: true });
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
      } catch {
        console.warn('Updated therapist locally, cloud sync pending.');
      }
    }

    return merged;
  },

  async deleteTherapist(id: number): Promise<boolean> {
    const list = await this.getAll();
    const filtered = list.filter((t) => t.id !== id);
    saveTherapists(filtered);

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, String(id)));
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
      } catch {
        console.warn('Deleted therapist locally, cloud sync pending.');
      }
    }

    return true;
  },
};
