import { Booking, BookingFormData, BookingStatus } from '../types';
import { treatmentService } from './treatmentService';
import { therapistService } from './therapistService';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const BOOKINGS_KEY = 'lusentic_spa_dynamic_bookings_v1';
const COLLECTION_NAME = 'bookings';

export function generateBookingId(dateStr?: string, timeStr?: string): string {
  const randLetters = () => Math.random().toString(36).substring(2, 4).toUpperCase();
  const randDigits = () => Math.floor(1000 + Math.random() * 9000);

  const d = dateStr ? dateStr.replace(/-/g, '').slice(2, 6) : '2609';
  const t = timeStr ? timeStr.replace(':', '') : '1400';

  return `26AP-${d}-${t}-${randLetters()}-${randDigits()}`;
}

function getStoredBookings(): Booking[] {
  try {
    localStorage.removeItem('lusentic_spa_bookings');
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify([]));
      return [];
    }
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveBookings(bookings: Booking[]): void {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.warn('Failed to save bookings locally:', e);
  }
}

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      if (!snap.empty) {
        const cloudBookings: Booking[] = [];
        snap.forEach((d) => {
          cloudBookings.push(d.data() as Booking);
        });
        cloudBookings.sort((a, b) => b.id - a.id);
        saveBookings(cloudBookings);
        return cloudBookings;
      }
    } catch (error) {
      console.warn('Firestore getAll bookings error, falling back to local cache:', error);
    }
    return getStoredBookings();
  },

  async getClientBookings(clientId?: number, clientEmail?: string): Promise<Booking[]> {
    const all = await this.getBookings();
    if (!clientId && !clientEmail) return all;
    return all.filter(
      (b) => (clientId && b.clientId === clientId) || (clientEmail && b.clientEmail === clientEmail)
    );
  },

  async createBooking(formData: BookingFormData, clientUserId?: number): Promise<Booking> {
    const all = await this.getBookings();
    const treatments = await treatmentService.getAll();
    const therapists = await therapistService.getAll();

    const treatment = treatments.find((t) => t.id === formData.treatmentId);
    const therapist = therapists.find((th) => th.id === formData.therapistId);

    const newId = Math.max(0, ...all.map((b) => b.id)) + 1;
    const bookingCode = generateBookingId(formData.date, formData.time);

    const newBooking: Booking = {
      id: newId,
      bookingId: bookingCode,
      clientName: formData.clientName,
      clientId: clientUserId || 101,
      treatmentName: treatment ? treatment.name : 'Custom Spa Therapy',
      treatmentId: formData.treatmentId,
      therapistName: therapist ? therapist.name : 'Assigned Senior Therapist',
      therapistId: formData.therapistId,
      date: formData.date,
      time: formData.time,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      price: treatment ? treatment.price : 750,
      clientPhone: formData.clientPhone,
      clientEmail: formData.clientEmail,
      notes: formData.notes,
    };

    const updated = [newBooking, ...all];
    saveBookings(updated);

    // Save to Firestore
    try {
      await setDoc(doc(db, COLLECTION_NAME, bookingCode), newBooking);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${bookingCode}`);
      } catch {
        console.warn('Saved booking locally, cloud sync pending.');
      }
    }

    // Also update loyalty points in current user if available
    try {
      const userRaw = localStorage.getItem('lusentic_spa_user_v2');
      if (userRaw) {
        const u = JSON.parse(userRaw);
        u.loyaltyPoints = (u.loyaltyPoints || 0) + 20; // 20 bonus points per booking
        localStorage.setItem('lusentic_spa_user_v2', JSON.stringify(u));
      }
    } catch {}

    return newBooking;
  },

  async updateStatus(id: number, status: BookingStatus): Promise<Booking | null> {
    const all = await this.getBookings();
    const index = all.findIndex((b) => b.id === id);
    if (index === -1) return null;

    all[index].status = status;
    all[index].updatedAt = new Date().toISOString();
    saveBookings(all);

    const bookingCode = all[index].bookingId;
    try {
      await setDoc(
        doc(db, COLLECTION_NAME, bookingCode),
        { status, updatedAt: all[index].updatedAt },
        { merge: true }
      );
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${bookingCode}`);
      } catch {
        console.warn('Updated booking status locally, cloud sync pending.');
      }
    }

    return all[index];
  },

  async cancelBooking(id: number): Promise<Booking | null> {
    return this.updateStatus(id, 'cancelled');
  },

  async deleteBooking(id: number): Promise<boolean> {
    const all = await this.getBookings();
    const booking = all.find((b) => b.id === id);
    const filtered = all.filter((b) => b.id !== id);
    saveBookings(filtered);

    if (booking) {
      try {
        await deleteDoc(doc(db, COLLECTION_NAME, booking.bookingId));
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${booking.bookingId}`);
        } catch {
          console.warn('Deleted booking locally, cloud sync pending.');
        }
      }
    }

    return true;
  },

  subscribe(callback: (bookings: Booking[]) => void): () => void {
    callback(getStoredBookings());
    try {
      const unsub = onSnapshot(
        collection(db, COLLECTION_NAME),
        (snap) => {
          const cloud: Booking[] = [];
          snap.forEach((d) => {
            cloud.push(d.data() as Booking);
          });
          cloud.sort((a, b) => b.id - a.id);
          saveBookings(cloud);
          callback(cloud);
        },
        (error) => {
          console.warn('Booking onSnapshot warning:', error);
        }
      );
      return unsub;
    } catch {
      return () => {};
    }
  },
};
