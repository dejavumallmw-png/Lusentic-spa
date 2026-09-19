import { ArticleItem } from '../types';
import { INITIAL_ARTICLES } from '../data/initialData';

export type Article = ArticleItem;

const STORAGE_KEY = 'lusentic_spa_articles';

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

export const articleService = {
  async getAll(): Promise<ArticleItem[]> {
    return getStoredArticles();
  },

  async addArticle(data: Omit<ArticleItem, 'id' | 'date'>): Promise<ArticleItem> {
    const list = getStoredArticles();
    const newId = Math.max(0, ...list.map((a) => a.id)) + 1;
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newArticle: ArticleItem = {
      ...data,
      id: newId,
      date: today,
    };
    const updated = [newArticle, ...list];
    saveArticles(updated);
    return newArticle;
  },

  async updateArticle(id: number, updates: Partial<ArticleItem>): Promise<ArticleItem | null> {
    const list = getStoredArticles();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates };
    saveArticles(list);
    return list[index];
  },

  async deleteArticle(id: number): Promise<boolean> {
    const list = getStoredArticles();
    const filtered = list.filter((a) => a.id !== id);
    saveArticles(filtered);
    return true;
  },
};
