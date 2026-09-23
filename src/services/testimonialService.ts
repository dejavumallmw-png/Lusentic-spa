import { Testimonial } from '../types';
import { INITIAL_TESTIMONIALS } from '../data/initialData';

const STORAGE_KEY = 'lusentic_spa_testimonials';

function getStoredTestimonials(): Testimonial[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const list = JSON.parse(raw);
    const seedNames = ['Priya S.', 'Liam Botha', 'Claire Dupont', 'Marcus & Jessica Sterling'];
    const cleaned = Array.isArray(list)
      ? list.filter((t: any) => !seedNames.includes(t.name))
      : [];
    if (cleaned.length !== list.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

function saveTestimonials(testimonials: Testimonial[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(testimonials));
}

export const testimonialService = {
  async getAll(): Promise<Testimonial[]> {
    return getStoredTestimonials();
  },

  async addTestimonial(data: Omit<Testimonial, 'id' | 'date'>): Promise<Testimonial> {
    const list = getStoredTestimonials();
    const newId = Math.max(0, ...list.map((t) => t.id)) + 1;
    const today = new Date().toISOString().split('T')[0];
    const newTestimonial: Testimonial = {
      ...data,
      id: newId,
      date: today,
    };
    const updated = [newTestimonial, ...list];
    saveTestimonials(updated);
    return newTestimonial;
  },

  async deleteTestimonial(id: number): Promise<boolean> {
    const list = getStoredTestimonials();
    const filtered = list.filter((t) => t.id !== id);
    saveTestimonials(filtered);
    return true;
  },
};
