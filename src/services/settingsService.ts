import { SiteSettings } from '../types';
import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const COLLECTION_NAME = 'settings';
const DOC_ID = 'general';

export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: 'Lusentic',
  brandSuffix: 'Spa',
  businessName: 'Lusentic Spa & Wellness',
  tagline: 'Where Nature Meets Serenity',
  phone: '+27 83 815 4513',
  whatsappNumber: '+27 83 815 4513',
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
    whatsapp: 'https://wa.me/27838154513',
  },
  // Special Welcome section
  welcomePhotoUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1400&q=80',
  welcomeBadgeTitle: 'Special Welcome',
  welcomeTitle: 'Complimentary Herbal Tea & Foot Soak with Every Session',
  welcomeBadgePill: 'All Guests',
  // Save & Subscribe section
  membershipBadge: 'Subscribe & Save',
  membershipTitle: 'Join Our Monthly Membership',
  membershipPrice: 'R499',
  membershipPeriod: '/ Month',
  membershipDescription: 'Invest in your continuous physical and mental wellness. Cancel anytime with zero lock-in contracts.',
  membershipButtonText: 'Subscribe & Save Now',
  membershipClubTitle: 'Lusentic Wellness Club',
  membershipHeading: 'Prioritize Your Health with Consistent Monthly Care',
  membershipSubtext:
    "True rejuvenation isn't an occasional luxury—it's a sustained discipline. Our membership guarantees you dedicated time every month to decompress, reset muscles, and receive therapist care at our lowest exclusive rates.",
  membershipPerks: [
    'One 60-Minute Aromatherapy or Swedish Massage every month',
    '20% Member Discount on all additional spa services & packages',
    'Free Hot Stone or Foot Reflexology add-on with every visit',
    'Priority weekend scheduling & VIP quiet suite access',
    'Flexible rollovers: Unused credits never expire while active',
    'Complimentary herbal tea bar & aromatherapy take-home kit',
  ],
  membershipMembersCount: '420+ Active Club Members',
  membershipFooterNote: 'Exclusive invitation to quarterly seasonal retreats',
  membershipGuarantee: 'Secure auto-billing • Easy 1-click pause',
  // Sanctuary Location Coordinates for Google Maps Directions
  coordinatesString: '26.170776, 26.166044',
  coordinates: {
    lat: 26.170776,
    lng: 26.166044,
  },
};

// In-memory runtime state synced directly with Firebase Firestore (zero localStorage)
let memorySettings: SiteSettings = { ...DEFAULT_SETTINGS };
let isSeedingSettings = false;

/**
 * Sanitizes phone number digits and returns a valid wa.me link
 */
export function getCleanWhatsAppUrl(phoneOrUrl?: string, customMessage?: string): string {
  if (!phoneOrUrl) return 'https://wa.me/27838154513';
  if (phoneOrUrl.startsWith('http://') || phoneOrUrl.startsWith('https://')) {
    if (customMessage) {
      const sep = phoneOrUrl.includes('?') ? '&' : '?';
      return `${phoneOrUrl}${sep}text=${encodeURIComponent(customMessage)}`;
    }
    return phoneOrUrl;
  }
  const digits = phoneOrUrl.replace(/[^0-9]/g, '');
  const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/27838154513';
  return customMessage ? `${base}?text=${encodeURIComponent(customMessage)}` : base;
}

function updateMemorySettings(settings: SiteSettings): void {
  memorySettings = settings;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lusentic_settings_updated', { detail: settings }));
  }
}

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

function mergeSettingsWithDefaults(cloud: Partial<SiteSettings>): SiteSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...cloud,
    socials: {
      ...DEFAULT_SETTINGS.socials,
      ...(cloud.socials || {}),
    },
    membershipPerks:
      Array.isArray(cloud.membershipPerks) && cloud.membershipPerks.length > 0
        ? cloud.membershipPerks
        : DEFAULT_SETTINGS.membershipPerks,
  };
}

export const settingsService = {
  getSettings(): SiteSettings {
    this.syncFromCloud().catch(() => {});
    return memorySettings;
  },

  async syncFromCloud(): Promise<SiteSettings> {
    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, DOC_ID));
      if (snap.exists()) {
        const cloud = snap.data() as SiteSettings;
        const merged = mergeSettingsWithDefaults(cloud);
        updateMemorySettings(merged);
        return merged;
      } else if (!isSeedingSettings) {
        isSeedingSettings = true;
        try {
          await setDoc(doc(db, COLLECTION_NAME, DOC_ID), sanitizeForFirestore(DEFAULT_SETTINGS));
        } catch (seedErr) {
          console.warn('Could not auto-seed default settings to Firestore:', seedErr);
        }
      }
    } catch (e) {
      console.warn('Could not sync settings from Firestore:', e);
    }
    return memorySettings;
  },

  async updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = memorySettings;
    const updated: SiteSettings = {
      ...current,
      ...updates,
      socials: {
        ...current.socials,
        ...updates.socials,
      },
      membershipPerks:
        updates.membershipPerks !== undefined ? updates.membershipPerks : current.membershipPerks,
    };

    updateMemorySettings(updated);

    try {
      const sanitized = sanitizeForFirestore(updated);
      await setDoc(doc(db, COLLECTION_NAME, DOC_ID), sanitized, { merge: true });
    } catch (err) {
      console.error('Failed to write settings to Firebase Firestore:', err);
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION_NAME}/${DOC_ID}`);
    }

    return updated;
  },

  /**
   * Subscribe to real-time settings updates directly from Firebase Firestore.
   */
  subscribe(callback: (settings: SiteSettings) => void): () => void {
    callback(memorySettings);

    const memoryHandler = (e: Event) => {
      const custom = e as CustomEvent<SiteSettings>;
      if (custom.detail) {
        callback(custom.detail);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('lusentic_settings_updated', memoryHandler);
    }

    let unsubFirestore = () => {};
    try {
      const docRef = doc(db, COLLECTION_NAME, DOC_ID);
      unsubFirestore = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const cloud = snap.data() as SiteSettings;
            const merged = mergeSettingsWithDefaults(cloud);
            updateMemorySettings(merged);
            callback(merged);
          } else {
            this.syncFromCloud().then((seeded) => callback(seeded));
          }
        },
        (error) => {
          console.warn('Firestore settings snapshot listener warning:', error);
        }
      );
    } catch (err) {
      console.warn('Failed to attach Firestore settings snapshot listener:', err);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('lusentic_settings_updated', memoryHandler);
      }
      unsubFirestore();
    };
  },
};
