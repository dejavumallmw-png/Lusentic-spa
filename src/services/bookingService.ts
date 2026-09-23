import { Booking, BookingFormData, BookingStatus } from '../types';
import { INITIAL_BOOKINGS } from '../data/initialData';
import { treatmentService } from './treatmentService';
import { therapistService } from './therapistService';

const BOOKINGS_KEY = 'lusentic_spa_bookings';

export function generateBookingId(dateStr?: string, timeStr?: string): string {
  const randLetters = () => Math.random().toString(36).substring(2, 4).toUpperCase();
  const randDigits = () => Math.floor(1000 + Math.random() * 9000);
  
  const d = dateStr ? dateStr.replace(/-/g, '').slice(2, 6) : '2609';
  const t = timeStr ? timeStr.replace(':', '') : '1400';
  
  return `26AP-${d}-${t}-${randLetters()}-${randDigits()}`;
}

function getStoredBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify([]));
      return [];
    }
    const list = JSON.parse(raw);
    // Remove obsolete initial seed bookings if present
    const cleaned = Array.isArray(list)
      ? list.filter((b: any) => !b.bookingId?.includes('4829') && !b.bookingId?.includes('1044') && !b.bookingId?.includes('9182') && !b.bookingId?.includes('3392') && !b.bookingId?.includes('7721'))
      : [];
    if (cleaned.length !== list.length) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

function saveBookings(bookings: Booking[]): void {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    return getStoredBookings();
  },

  async getClientBookings(clientId?: number, clientEmail?: string): Promise<Booking[]> {
    const all = getStoredBookings();
    if (!clientId && !clientEmail) return all;
    return all.filter(
      (b) => (clientId && b.clientId === clientId) || (clientEmail && b.clientEmail === clientEmail)
    );
  },

  async createBooking(formData: BookingFormData, clientUserId?: number): Promise<Booking> {
    const all = getStoredBookings();
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

    // Also update loyalty points in current user if available
    try {
      const userRaw = localStorage.getItem('lusentic_spa_user');
      if (userRaw) {
        const u = JSON.parse(userRaw);
        u.loyaltyPoints = (u.loyaltyPoints || 0) + 20; // 20 bonus points per booking
        localStorage.setItem('lusentic_spa_user', JSON.stringify(u));
      }
    } catch {}

    return newBooking;
  },

  async updateStatus(id: number, status: BookingStatus): Promise<Booking | null> {
    const all = getStoredBookings();
    const index = all.findIndex((b) => b.id === id);
    if (index === -1) return null;
    all[index].status = status;
    all[index].updatedAt = new Date().toISOString();
    saveBookings(all);
    return all[index];
  },

  async cancelBooking(id: number): Promise<Booking | null> {
    return this.updateStatus(id, 'cancelled');
  }
};
