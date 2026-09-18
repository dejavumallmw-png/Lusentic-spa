import { Treatment, TreatmentCategory } from '../types';
import { INITIAL_TREATMENTS } from '../data/initialData';

const STORAGE_KEY = 'lusentic_spa_treatments';

function getStoredTreatments(): Treatment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TREATMENTS));
      return INITIAL_TREATMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TREATMENTS;
  }
}

function saveTreatments(treatments: Treatment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(treatments));
}

export const treatmentService = {
  async getAll(): Promise<Treatment[]> {
    return getStoredTreatments();
  },

  async getByCategory(category: TreatmentCategory): Promise<Treatment[]> {
    const list = getStoredTreatments();
    return list.filter((t) => t.category === category);
  },

  async getById(id: number): Promise<Treatment | undefined> {
    const list = getStoredTreatments();
    return list.find((t) => t.id === id);
  },

  async search(query: string): Promise<Treatment[]> {
    const q = query.toLowerCase().trim();
    if (!q) return getStoredTreatments();
    return getStoredTreatments().filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  },

  async addTreatment(treatment: Omit<Treatment, 'id'>): Promise<Treatment> {
    const list = getStoredTreatments();
    const newId = Math.max(0, ...list.map((t) => t.id)) + 1;
    const newTreatment: Treatment = { ...treatment, id: newId };
    const updated = [newTreatment, ...list];
    saveTreatments(updated);
    return newTreatment;
  },

  async updateTreatment(id: number, updates: Partial<Treatment>): Promise<Treatment | null> {
    const list = getStoredTreatments();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates };
    saveTreatments(list);
    return list[index];
  },

  async deleteTreatment(id: number): Promise<boolean> {
    const list = getStoredTreatments();
    const filtered = list.filter((t) => t.id !== id);
    saveTreatments(filtered);
    return true;
  }
};
