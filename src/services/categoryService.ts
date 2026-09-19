import { CategoryInfo } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialData';

const STORAGE_KEY = 'lusentic_spa_categories';

function getStoredCategories(): CategoryInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CATEGORIES;
  }
}

function saveCategories(categories: CategoryInfo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

export const categoryService = {
  async getAll(): Promise<CategoryInfo[]> {
    return getStoredCategories();
  },

  async addCategory(data: { label: string; description?: string; iconName?: string }): Promise<CategoryInfo> {
    const list = getStoredCategories();
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

    const updated = [...list, newCat];
    saveCategories(updated);
    return newCat;
  },

  async deleteCategory(slugOrLabel: string): Promise<boolean> {
    const list = getStoredCategories();
    const filtered = list.filter(
      (c) => c.slug !== slugOrLabel && c.label.toLowerCase() !== slugOrLabel.toLowerCase()
    );
    saveCategories(filtered);
    return true;
  },
};
