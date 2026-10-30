import { Booking, BookingFormData, BookingStatus } from '../types';
import { treatmentService } from './treatmentService';
import { therapistService } from './therapistService';
import { authService } from './authService';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const COLLECTION_NAME = 'bookings';

// In-memory runtime state synced directly with Firebase Firestore (zero localStorage)
let memoryBookings: Booking[] = [];

export function generateBookingId(dateStr?: string, timeStr?: string): string {
  const randLetters = () => Math.random().toString(36).substring(2, 4).toUpperCase();
  const randDigits = () => Math.floor(1000 + Math.random() * 9000);

  const d = dateStr ? dateStr.replace(/-/g, '').slice(2, 6) : '2609';
  const t = timeStr ? timeStr.replace(':', '') : '1400';

  return `26AP-${d}-${t}-${randLetters()}-${randDigits()}`;
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

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      const cloudBookings: Booking[] = [];
      snap.forEach((d) => {
        cloudBookings.push(d.data() as Booking);
      });
      cloudBookings.sort((a, b) => b.id - a.id);
      memoryBookings = cloudBookings;
      return cloudBookings;
    } catch (error) {
      console.error('Firestore getAll bookings error:', error);
    }
    return memoryBookings;
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

    const newBooking: Booking = sanitizeForFirestore({
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
    });

    memoryBookings = [newBooking, ...all];

    try {
      await setDoc(doc(db, COLLECTION_NAME, bookingCode), newBooking);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${bookingCode}`);
    }

    // Update loyalty points in Firestore for current user if applicable
    const activeUserId = clientUserId || authService.getCurrentUser()?.id;
    if (activeUserId) {
      authService.addLoyaltyPoints(activeUserId, 20).catch(() => {});
    }

    return newBooking;
  },

  async updateStatus(id: number, status: BookingStatus): Promise<Booking | null> {
    const all = await this.getBookings();
    const index = all.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const updatedBooking: Booking = {
      ...all[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    const nextList = [...all];
    nextList[index] = updatedBooking;
    memoryBookings = nextList;

    const bookingCode = updatedBooking.bookingId;
    try {
      await setDoc(
        doc(db, COLLECTION_NAME, bookingCode),
        { status, updatedAt: updatedBooking.updatedAt },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${bookingCode}`);
    }

    return updatedBooking;
  },

  async cancelBooking(id: number): Promise<Booking | null> {
    return this.updateStatus(id, 'cancelled');
  },

  async deleteBooking(id: number): Promise<boolean> {
    const all = await this.getBookings();
    const booking = all.find((b) => b.id === id);
    memoryBookings = all.filter((b) => b.id !== id);

    if (booking) {
      try {
        await deleteDoc(doc(db, COLLECTION_NAME, booking.bookingId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${booking.bookingId}`);
      }
    }

    return true;
  },

  subscribe(callback: (bookings: Booking[]) => void): () => void {
    callback(memoryBookings);
    try {
      const unsub = onSnapshot(
        collection(db, COLLECTION_NAME),
        (snap) => {
          const cloud: Booking[] = [];
          snap.forEach((d) => {
            cloud.push(d.data() as Booking);
          });
          cloud.sort((a, b) => b.id - a.id);
          memoryBookings = cloud;
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
