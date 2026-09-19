import { Therapist } from '../types';
import { INITIAL_THERAPISTS } from '../data/initialData';

const STORAGE_KEY = 'lusentic_spa_therapists';

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(therapists));
}

export const therapistService = {
  async getAll(): Promise<Therapist[]> {
    return getStoredTherapists();
  },

  async getById(id: number): Promise<Therapist | undefined> {
    const list = getStoredTherapists();
    return list.find((t) => t.id === id);
  },

  async addTherapist(data: Omit<Therapist, 'id'>): Promise<Therapist> {
    const list = getStoredTherapists();
    const newId = Math.max(0, ...list.map((t) => t.id)) + 1;
    const newTherapist: Therapist = {
      ...data,
      id: newId,
    };
    const updated = [...list, newTherapist];
    saveTherapists(updated);
    return newTherapist;
  },

  async updateTherapist(id: number, updates: Partial<Therapist>): Promise<Therapist | null> {
    const list = getStoredTherapists();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates };
    saveTherapists(list);
    return list[index];
  },

  async deleteTherapist(id: number): Promise<boolean> {
    const list = getStoredTherapists();
    const filtered = list.filter((t) => t.id !== id);
    saveTherapists(filtered);
    return true;
  },
};
