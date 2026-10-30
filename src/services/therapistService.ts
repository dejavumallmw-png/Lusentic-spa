import { Therapist } from '../types';
import { INITIAL_THERAPISTS } from '../data/initialData';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';

const COLLECTION_NAME = 'therapists';

// In-memory runtime state synced directly with Firebase Firestore (zero localStorage)
let memoryTherapists: Therapist[] = [...INITIAL_THERAPISTS];
let isSeedingTherapists = false;

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
        memoryTherapists = cloudList;
        return cloudList;
      } else if (!isSeedingTherapists) {
        isSeedingTherapists = true;
        for (const th of INITIAL_THERAPISTS) {
          try {
            await setDoc(doc(db, COLLECTION_NAME, String(th.id)), sanitizeForFirestore(th));
          } catch (err) {
            console.warn('Could not seed therapist to Firestore:', th.name, err);
          }
        }
        memoryTherapists = [...INITIAL_THERAPISTS];
        return memoryTherapists;
      }
    } catch (error) {
      console.error('Firestore getAll therapists error:', error);
    }
    return memoryTherapists;
  },

  async getById(id: number): Promise<Therapist | undefined> {
    const list = await this.getAll();
    return list.find((t) => t.id === id);
  },

  async addTherapist(data: Omit<Therapist, 'id'>): Promise<Therapist> {
    const list = await this.getAll();
    const newId = Math.max(0, ...list.map((t) => t.id)) + 1;
    const newTherapist: Therapist = sanitizeForFirestore({
      ...data,
      id: newId,
    });
    memoryTherapists = [...list, newTherapist];

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(newId)), newTherapist);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${newId}`);
    }

    return newTherapist;
  },

  async updateTherapist(id: number, updates: Partial<Therapist>): Promise<Therapist | null> {
    const list = await this.getAll();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const merged = sanitizeForFirestore({ ...list[index], ...updates });
    const nextList = [...list];
    nextList[index] = merged;
    memoryTherapists = nextList;

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(id)), merged, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }

    return merged;
  },

  async deleteTherapist(id: number): Promise<boolean> {
    const list = await this.getAll();
    memoryTherapists = list.filter((t) => t.id !== id);

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, String(id)));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }

    return true;
  },

  subscribe(callback: (therapists: Therapist[]) => void): () => void {
    callback(memoryTherapists);
    let unsub: Unsubscribe | null = null;
    try {
      unsub = onSnapshot(
        collection(db, COLLECTION_NAME),
        (snap) => {
          if (!snap.empty) {
            const list: Therapist[] = [];
            snap.forEach((d) => {
              list.push(d.data() as Therapist);
            });
            list.sort((a, b) => a.id - b.id);
            memoryTherapists = list;
            callback(list);
          } else {
            this.getAll().then((seeded) => callback(seeded));
          }
        },
        (err) => {
          console.warn('Therapists onSnapshot warning:', err);
        }
      );
    } catch (e) {
      console.warn('Unable to attach Firestore therapists listener:', e);
    }

    return () => {
      if (unsub) unsub();
    };
  },
};
