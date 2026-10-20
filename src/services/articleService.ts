import { ArticleItem } from '../types';
import { INITIAL_ARTICLES } from '../data/initialData';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

export type Article = ArticleItem;

const STORAGE_KEY = 'lusentic_spa_articles';
const COLLECTION_NAME = 'articles';

function getStoredArticles(): ArticleItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ARTICLES));
      return INITIAL_ARTICLES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ARTICLES;
  }
}

function saveArticles(articles: ArticleItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  } catch (e) {
    console.warn('Failed to save articles locally:', e);
  }
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
        saveArticles(cloudList);
        return cloudList;
      } else {
        const initial = getStoredArticles();
        for (const art of initial) {
          try {
            await setDoc(doc(db, COLLECTION_NAME, String(art.id)), art);
          } catch {
            // ignore non-blocking seed
          }
        }
        return initial;
      }
    } catch (error) {
      console.warn('Firestore getAll articles error, falling back to local cache:', error);
    }
    return getStoredArticles();
  },

  async addArticle(data: Omit<ArticleItem, 'id' | 'date'>): Promise<ArticleItem> {
    const list = await this.getAll();
    const newId = Math.max(0, ...list.map((a) => a.id)) + 1;
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newArticle: ArticleItem = {
      ...data,
      id: newId,
      date: today,
    };
    const updated = [newArticle, ...list];
    saveArticles(updated);

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(newId)), newArticle);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${newId}`);
      } catch {
        console.warn('Saved article locally, cloud sync pending.');
      }
    }

    return newArticle;
  },

  async updateArticle(id: number, updates: Partial<ArticleItem>): Promise<ArticleItem | null> {
    const list = await this.getAll();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const merged = { ...list[index], ...updates };
    list[index] = merged;
    saveArticles(list);

    try {
      await setDoc(doc(db, COLLECTION_NAME, String(id)), merged, { merge: true });
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
      } catch {
        console.warn('Updated article locally, cloud sync pending.');
      }
    }

    return merged;
  },

  async deleteArticle(id: number): Promise<boolean> {
    const list = await this.getAll();
    const filtered = list.filter((a) => a.id !== id);
    saveArticles(filtered);

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, String(id)));
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
      } catch {
        console.warn('Deleted article locally, cloud sync pending.');
      }
    }

    return true;
  },
};
