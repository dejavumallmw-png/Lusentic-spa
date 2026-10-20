import { User, UserRole } from '../types';
import { signInWithGoogle, logoutFirebase, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

const USER_KEY = 'lusentic_spa_user_v2';
const CLIENTS_KEY = 'lusentic_spa_clients_v2';
const ADMIN_PROFILE_KEY = 'lusentic_spa_admin_profile_v1';
const STAFF_LIST_KEY = 'lusentic_spa_staff_list_v2';

export const DEFAULT_ADMIN_CREDENTIALS = {
  username: 'admin@lusentic.com',
  password: 'Lusentic1112=',
  defaultFirstName: 'Prince',
  defaultLastName: 'Bonya',
};

function getStoredAdminProfile(): User {
  try {
    const raw = localStorage.getItem(ADMIN_PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  const defaultAdmin: User = {
    id: 1,
    username: DEFAULT_ADMIN_CREDENTIALS.username,
    email: DEFAULT_ADMIN_CREDENTIALS.username,
    firstName: DEFAULT_ADMIN_CREDENTIALS.defaultFirstName,
    lastName: DEFAULT_ADMIN_CREDENTIALS.defaultLastName,
    role: 'admin',
    phone: '+27 11 888 9000',
    loyaltyPoints: 0,
    profilePhoto: '',
    avatar: '',
  };
  localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(defaultAdmin));
  return defaultAdmin;
}

function saveAdminProfile(admin: User): void {
  localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(admin));
}

function getStoredClients(): User[] {
  try {
    const raw = localStorage.getItem(CLIENTS_KEY);
    if (!raw) {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveClients(clients: User[]): void {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export const authService = {
  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Client login using Phone Number and 4-Digit PIN
   */
  async loginClient(phone: string, pin: string): Promise<User> {
    const cleanInputPhone = normalizePhone(phone);
    if (!cleanInputPhone) {
      throw new Error('Please enter your phone number.');
    }
    if (!pin || pin.length !== 4) {
      throw new Error('Security PIN must be exactly 4 digits.');
    }

    const clients = getStoredClients();
    // Match phone by either exact match or suffix (last 9 digits)
    const client = clients.find((c) => {
      const storedClean = normalizePhone(c.phone || '');
      return (
        storedClean === cleanInputPhone ||
        (cleanInputPhone.length >= 9 && storedClean.endsWith(cleanInputPhone.slice(-9))) ||
        (storedClean.length >= 9 && cleanInputPhone.endsWith(storedClean.slice(-9)))
      );
    });

    if (!client) {
      throw new Error('No account found with this phone number. Please click "Create Account" below.');
    }

    if (client.pin && client.pin !== pin.trim()) {
      throw new Error('Incorrect 4-digit PIN. Please verify and try again.');
    }

    localStorage.setItem(USER_KEY, JSON.stringify(client));
    return client;
  },

  /**
   * Client registration using Phone Number, 4-digit PIN, Full Name, and Optional Email
   */
  async registerClient(data: {
    name: string;
    phone: string;
    pin: string;
    email?: string;
    photo?: string;
  }): Promise<User> {
    const cleanPhone = normalizePhone(data.phone);
    if (!cleanPhone || cleanPhone.length < 7) {
      throw new Error('Please enter a valid phone number.');
    }
    if (!data.pin || data.pin.length !== 4 || !/^\d{4}$/.test(data.pin)) {
      throw new Error('PIN must be exactly 4 numeric digits.');
    }
    if (!data.name.trim()) {
      throw new Error('Please enter your full name.');
    }

    const clients = getStoredClients();
    const existing = clients.find((c) => normalizePhone(c.phone || '') === cleanPhone);

    const nameParts = data.name.trim().split(' ');
    const firstName = nameParts[0] || 'Guest';
    const lastName = nameParts.slice(1).join(' ') || '';

    if (existing) {
      existing.pin = data.pin.trim();
      existing.firstName = firstName;
      existing.lastName = lastName;
      if (data.email) existing.email = data.email.trim();
      if (data.photo) {
        existing.profilePhoto = data.photo;
        existing.avatar = data.photo;
      }
      saveClients(clients);
      localStorage.setItem(USER_KEY, JSON.stringify(existing));
      return existing;
    }

    const newId = Math.floor(Math.random() * 90000 + 10000);
    const newClient: User = {
      id: newId,
      username: data.name.trim().replace(/\s+/g, '_').toLowerCase(),
      firstName,
      lastName,
      role: 'client',
      phone: data.phone.trim(),
      pin: data.pin.trim(),
      email: data.email?.trim() || undefined,
      loyaltyPoints: 50,
      profilePhoto: data.photo || '',
      avatar: data.photo || '',
    };

    clients.push(newClient);
    saveClients(clients);
    localStorage.setItem(USER_KEY, JSON.stringify(newClient));
    return newClient;
  },

  /**
   * Admin and Staff Login via URL Link (/admin, #admin, etc.)
   * Authenticates against:
   * 1. Default Admin: admin@lusentic.com / Lusentic1112= (Dynamic Admin: Prince Bonya)
   * 2. Any additional staff / admin accounts added by Prince Bonya
   */
  async loginStaff(usernameOrEmail: string, passwordAttempt: string): Promise<User> {
    const cleanUser = usernameOrEmail.trim().toLowerCase();
    const cleanPass = passwordAttempt.trim();

    // 1. Check Default Super Admin
    if (
      (cleanUser === DEFAULT_ADMIN_CREDENTIALS.username.toLowerCase() ||
        cleanUser === 'admin') &&
      cleanPass === DEFAULT_ADMIN_CREDENTIALS.password
    ) {
      const admin = getStoredAdminProfile();
      localStorage.setItem(USER_KEY, JSON.stringify(admin));
      return admin;
    }

    // 2. Check Additional Staff / Admin accounts added in the system
    const staffList = await this.getAllStaff();
    const matchedStaff = staffList.find(
      (s) =>
        (s.username.toLowerCase() === cleanUser ||
          (s.email && s.email.toLowerCase() === cleanUser)) &&
        s.password === cleanPass
    );

    if (matchedStaff) {
      localStorage.setItem(USER_KEY, JSON.stringify(matchedStaff));
      return matchedStaff;
    }

    throw new Error('Invalid credentials. Please verify your username and password.');
  },

  getAdminProfile(): User {
    return getStoredAdminProfile();
  },

  async updateAdminProfile(updates: Partial<User>): Promise<User> {
    const current = getStoredAdminProfile();
    const updated: User = { ...current, ...updates };
    saveAdminProfile(updated);

    // If currently logged in as admin, update current session as well
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.role === 'admin') {
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    }
    return updated;
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const current = this.getCurrentUser();
    if (!current) throw new Error('Not logged in');

    const updated = { ...current, ...updates };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));

    if (current.role === 'admin') {
      saveAdminProfile(updated);
    } else {
      const clients = getStoredClients();
      const idx = clients.findIndex((c) => c.id === current.id || (current.phone && c.phone === current.phone));
      if (idx !== -1) {
        clients[idx] = { ...clients[idx], ...updates };
        saveClients(clients);
      }
    }

    return updated;
  },

  async getAllStaff(): Promise<User[]> {
    try {
      const raw = localStorage.getItem(STAFF_LIST_KEY);
      if (!raw) {
        const defaultAdmin = getStoredAdminProfile();
        const initial = [defaultAdmin];
        localStorage.setItem(STAFF_LIST_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw);
    } catch {
      return [getStoredAdminProfile()];
    }
  },

  async addStaff(data: {
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'receptionist';
    phone?: string;
    username?: string;
    password?: string;
    avatar?: string;
  }): Promise<User> {
    const list = await this.getAllStaff();
    const newStaff: User = {
      id: Math.floor(Math.random() * 9000 + 1000),
      username: data.username || data.email.split('@')[0],
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      phone: data.phone,
      password: data.password || 'Lusentic1112=',
      loyaltyPoints: 0,
      profilePhoto: data.avatar || '',
      avatar: data.avatar || '',
    };
    const updated = [...list, newStaff];
    localStorage.setItem(STAFF_LIST_KEY, JSON.stringify(updated));
    return newStaff;
  },

  async removeStaff(id: number): Promise<boolean> {
    const list = await this.getAllStaff();
    // Prevent removing the default super admin
    const filtered = list.filter((s) => s.id !== id || s.username === DEFAULT_ADMIN_CREDENTIALS.username);
    localStorage.setItem(STAFF_LIST_KEY, JSON.stringify(filtered));
    return true;
  },

  async updateStaff(id: number, updates: Partial<User>): Promise<User | null> {
    const list = await this.getAllStaff();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    localStorage.setItem(STAFF_LIST_KEY, JSON.stringify(list));

    if (list[idx].username === DEFAULT_ADMIN_CREDENTIALS.username) {
      saveAdminProfile(list[idx]);
    }
    return list[idx];
  },

  async switchRole(role: UserRole): Promise<User> {
    if (role === 'admin') {
      const admin = getStoredAdminProfile();
      localStorage.setItem(USER_KEY, JSON.stringify(admin));
      return admin;
    }
    const staffList = await this.getAllStaff();
    const target = staffList.find((s) => s.role === role);
    if (target) {
      localStorage.setItem(USER_KEY, JSON.stringify(target));
      return target;
    }
    const newUser: User = {
      id: 999,
      username: `${role}_user`,
      email: `${role}@lusenticspa.com`,
      firstName: role.charAt(0).toUpperCase() + role.slice(1),
      lastName: 'Staff',
      role,
      loyaltyPoints: 0,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  async login(emailOrUser: string, role: UserRole = 'client'): Promise<User> {
    if (role === 'admin' || role === 'receptionist') {
      return this.switchRole(role);
    }
    return this.loginClient(emailOrUser, '1234').catch(() => this.switchRole(role));
  },

  async loginWithGoogle(): Promise<User> {
    const firebaseUser = await signInWithGoogle();
    if (!firebaseUser) throw new Error('Google sign in was not completed.');

    const email = (firebaseUser.email || '').toLowerCase();
    const isAdminEmail =
      email === 'dejavumallmw@gmail.com' || email === DEFAULT_ADMIN_CREDENTIALS.username;

    const nameParts = (firebaseUser.displayName || 'Google User').trim().split(' ');
    const firstName = nameParts[0] || 'Client';
    const lastName = nameParts.slice(1).join(' ') || '';

    const user: User = {
      id: Math.floor(Math.random() * 90000 + 10000),
      username: email || firebaseUser.uid,
      email,
      firstName,
      lastName,
      role: isAdminEmail ? 'admin' : 'client',
      loyaltyPoints: 50,
      avatar: firebaseUser.photoURL || '',
      profilePhoto: firebaseUser.photoURL || '',
    };

    localStorage.setItem(USER_KEY, JSON.stringify(user));

    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), user, { merge: true });
    } catch (e) {
      console.warn('Profile synced locally, cloud sync pending:', e);
    }

    return user;
  },

  async register(data: { firstName: string; lastName: string; email: string; phone?: string }): Promise<User> {
    return this.registerClient({
      name: `${data.firstName} ${data.lastName}`,
      phone: data.phone || '+27 82 555 0192',
      pin: '1234',
      email: data.email,
    });
  },

  async logout(): Promise<void> {
    localStorage.removeItem(USER_KEY);
    await logoutFirebase();
  },
};
