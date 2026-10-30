import { ArticleItem } from '../types';
import { INITIAL_ARTICLES } from '../data/initialData';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';

export type Article = ArticleItem;

const COLLECTION_NAME = 'articles';

// In-memory runtime state synced directly with Firebase Firestore (zero localStorage)
let memoryArticles: ArticleItem[] = [...INITIAL_ARTICLES];
let isSeedingArticles = false;

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

export const articleService = {
  async getAll(): Promise<ArticleItem[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      if (!snap.empty) {
        const cloudList: ArticleItem[] = [];
        snap.forEach((d) => {
          cloudList.push(d.data() as ArticleItem);
        });
        cloudList.sort((a, b) => b.id - a.id);
        memoryArticles = cloudList;
        return cloudList;
      } else if (!isSeedingArticles) {
        isSeedingArticles = true;
        for (const art of INITIAL_ARTICLES) {
          try {
            await setDoc(doc(db, COLLECTION_NAME, String(art.id)), sanitizeForFirestore(art));
          } catch (err) {
            console.warn('Could not seed article to Firestore:', art.title, err);
          }
        }
        memoryArticles = [...INITIAL_ARTICLES];
        return memoryArticles;
      }
    } catch (error) {
      console.error('Firestore getAll articles error:', error);
    }
    return memoryArticles;
  },

  async addArticle(data: Omit<ArticleItem, 'id' | 'date'>): Promise<ArticleItem> {
    const list = await this.getAll();
    const newId = Math.max(0, ...list.map((a) => a.id)) + 1;
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newArticle: ArticleItem = sanitizeForFirestore({
      ...data,
      id: newId,
      date: today,
    });
    memoryArticles = [newArticle, ...list];

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(newId)), newArticle);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${newId}`);
    }

    return newArticle;
  },

  async updateArticle(id: number, updates: Partial<ArticleItem>): Promise<ArticleItem | null> {
    const list = await this.getAll();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const merged = sanitizeForFirestore({ ...list[index], ...updates });
    const nextList = [...list];
    nextList[index] = merged;
    memoryArticles = nextList;

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(id)), merged, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }

    return merged;
  },

  async deleteArticle(id: number): Promise<boolean> {
    const list = await this.getAll();
    memoryArticles = list.filter((a) => a.id !== id);

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, String(id)));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }

    return true;
  },

  subscribe(callback: (articles: ArticleItem[]) => void): () => void {
    callback(memoryArticles);
    let unsub: Unsubscribe | null = null;
    try {
      unsub = onSnapshot(
        collection(db, COLLECTION_NAME),
        (snap) => {
          if (!snap.empty) {
            const list: ArticleItem[] = [];
            snap.forEach((d) => {
              list.push(d.data() as ArticleItem);
            });
            list.sort((a, b) => b.id - a.id);
            memoryArticles = list;
            callback(list);
          } else {
            this.getAll().then((seeded) => callback(seeded));
          }
        },
        (err) => {
          console.warn('Articles onSnapshot warning:', err);
        }
      );
    } catch (e) {
      console.warn('Unable to attach Firestore articles listener:', e);
    }

    return () => {
      if (unsub) unsub();
    };
  },
};
