import { GalleryItem } from '../types';
import { INITIAL_GALLERY } from '../data/initialData';

const STORAGE_KEY = 'lusentic_gallery';

export const galleryService = {
  getAll: async (): Promise<GalleryItem[]> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load gallery from storage', e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_GALLERY));
    return INITIAL_GALLERY;
  },

  addPhoto: async (photo: Omit<GalleryItem, 'id'>): Promise<GalleryItem> => {
    const all = await galleryService.getAll();
    const newPhoto: GalleryItem = {
      ...photo,
      id: Date.now(),
    };
    const updated = [newPhoto, ...all];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newPhoto;
  },

  deletePhoto: async (id: number): Promise<void> => {
    const all = await galleryService.getAll();
    const updated = all.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
};
