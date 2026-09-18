export type UserRole = 'client' | 'receptionist' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  profilePhoto?: string;
  loyaltyPoints: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type TreatmentCategory =
  | 'massage'
  | 'couples'
  | 'facial'
  | 'pedicure'
  | 'manicure'
  | 'waxing'
  | 'bodyscrub'
  | 'addons';

export interface Treatment {
  id: number;
  name: string;
  price: number; // in South African Rand (R) as in spec
  duration: number; // minutes
  category: TreatmentCategory;
  image?: string;
  imageUrl?: string;
  isMonthlySpecial: boolean;
  description?: string;
  rating?: number;
}

export interface CategoryInfo {
  slug: TreatmentCategory;
  label: string;
  iconName: string;
  description?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: number;
  bookingId: string; // e.g. "26AP-0823-1700-PL-4829"
  clientName: string;
  clientId: number;
  treatmentName: string;
  treatmentId: number;
  therapistName: string;
  therapistId: number;
  date: string; // ISO date YYYY-MM-DD
  time: string; // HH:MM
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  price: number;
  clientPhone?: string;
  clientEmail?: string;
  notes?: string;
}

export interface BookingFormData {
  treatmentId: number;
  therapistId: number;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  notes?: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  duration: number;
  image?: string;
}

export interface CartData {
  items: CartItem[];
  total: number;
  count: number;
}

export interface Therapist {
  id: number;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  rating: number;
  specialties: string[];
  availableDays: string[];
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar?: string;
  stars: number;
  content: string;
  treatment: string;
  date: string;
}

export interface ArticleItem {
  id: number;
  title: string;
  category: 'Article' | 'Health Corner';
  date: string;
  readTime: string;
  summary: string;
  content: string;
  author: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  category: string;
  image: string;
  caption: string;
}

export interface GiftVoucher {
  id: string;
  code: string;
  amount: number;
  senderName: string;
  recipientName: string;
  recipientEmail: string;
  message: string;
  createdAt: string;
  status: 'active' | 'redeemed';
}
