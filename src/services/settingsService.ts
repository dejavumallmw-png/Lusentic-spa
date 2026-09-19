import { SiteSettings } from '../types';

const STORAGE_KEY = 'lusentic_spa_settings';

export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: 'Lusentic',
  brandSuffix: 'Spa',
  businessName: 'Lusentic Spa & Wellness',
  tagline: 'Where Nature Meets Serenity',
  phone: '+27 (0) 11 888 9000',
  whatsappNumber: '+27825550192',
  email: 'concierge@lusenticspa.com',
  address: '128 Rosebank Boulevard, Sanctuary Quarter, Johannesburg, 2196',
  operatingHours: 'Mon – Sun: 08:00 AM – 20:00 PM',
  instagram: 'https://instagram.com/lusenticspa',
  tiktok: 'https://tiktok.com/@lusenticspa',
  logoUrl: '',
  socials: {
    instagram: 'https://instagram.com/lusenticspa',
    facebook: 'https://facebook.com/lusenticspa',
    tiktok: 'https://tiktok.com/@lusenticspa',
    whatsapp: 'https://wa.me/27825550192',
  },
};

function getStoredSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: SiteSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lusentic_settings_updated', { detail: settings }));
  }
}

export const settingsService = {
  getSettings(): SiteSettings {
    return getStoredSettings();
  },

  updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    const current = getStoredSettings();
    const updated: SiteSettings = {
      ...current,
      ...updates,
      socials: {
        ...current.socials,
        ...updates.socials,
      },
    };
    saveSettings(updated);
    return updated;
  },

  subscribe(callback: (settings: SiteSettings) => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<SiteSettings>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      } else {
        callback(getStoredSettings());
      }
    };
    window.addEventListener('lusentic_settings_updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('lusentic_settings_updated', handler);
      window.removeEventListener('storage', handler);
    };
  },
};
