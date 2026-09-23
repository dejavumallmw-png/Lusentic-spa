import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';

const USER_KEY = 'lusentic_spa_user';
const CLIENTS_KEY = 'lusentic_spa_clients';

const INITIAL_CLIENTS: User[] = [
  {
    id: 101,
    username: 'amanda_khumalo',
    firstName: 'Amanda',
    lastName: 'Khumalo',
    role: 'client',
    phone: '+27 82 555 0192',
    pin: '1234',
    email: 'amanda.guest@lusenticspa.com',
    loyaltyPoints: 120,
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
];

function getStoredClients(): User[] {
  try {
    const raw = localStorage.getItem(CLIENTS_KEY);
    if (!raw) {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(INITIAL_CLIENTS));
      return INITIAL_CLIENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CLIENTS;
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
      // Update PIN and info for this existing client
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
      loyaltyPoints: 50, // Welcome loyalty points bonus
      profilePhoto: data.photo || '',
      avatar: data.photo || '',
    };

    clients.push(newClient);
    saveClients(clients);
    localStorage.setItem(USER_KEY, JSON.stringify(newClient));
    return newClient;
  },

  /**
   * Legacy or Staff / Admin direct login via URL links (/admin, /staff)
   */
  async login(emailOrUsername: string, role: UserRole = 'client'): Promise<User> {
    const existing = INITIAL_USERS.find(
      (u) =>
        u.email?.toLowerCase() === emailOrUsername.toLowerCase() ||
        u.username.toLowerCase() === emailOrUsername.toLowerCase()
    );

    if (existing) {
      localStorage.setItem(USER_KEY, JSON.stringify(existing));
      return existing;
    }

    const newUser: User = {
      id: Math.floor(Math.random() * 9000 + 1000),
      username: emailOrUsername.split('@')[0],
      email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@lusenticspa.com`,
      firstName: emailOrUsername.split('@')[0],
      lastName: 'Member',
      role,
      loyaltyPoints: role === 'client' ? 50 : 0,
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    };

    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  async register(data: { firstName: string; lastName: string; email: string; phone?: string }): Promise<User> {
    return this.registerClient({
      name: `${data.firstName} ${data.lastName}`,
      phone: data.phone || '+27 82 555 0192',
      pin: '1234',
      email: data.email,
    });
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const current = this.getCurrentUser();
    if (!current) throw new Error('Not logged in');

    const updated = { ...current, ...updates };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));

    // Also update in registered clients list
    const clients = getStoredClients();
    const idx = clients.findIndex((c) => c.id === current.id || (current.phone && c.phone === current.phone));
    if (idx !== -1) {
      clients[idx] = { ...clients[idx], ...updates };
      saveClients(clients);
    }

    return updated;
  },

  async getAllStaff(): Promise<User[]> {
    const raw = localStorage.getItem('lusentic_spa_staff_list');
    if (!raw) {
      const initialStaff = INITIAL_USERS.filter((u) => u.role === 'admin' || u.role === 'receptionist');
      localStorage.setItem('lusentic_spa_staff_list', JSON.stringify(initialStaff));
      return initialStaff;
    }
    return JSON.parse(raw);
  },

  async addStaff(data: {
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'receptionist';
    phone?: string;
    username?: string;
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
      loyaltyPoints: 0,
      profilePhoto: data.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      avatar: data.avatar,
    };
    const updated = [...list, newStaff];
    localStorage.setItem('lusentic_spa_staff_list', JSON.stringify(updated));
    return newStaff;
  },

  async switchRole(role: UserRole): Promise<User> {
    const targetUser = INITIAL_USERS.find((u) => u.role === role) || {
      id: 999,
      username: `${role}_user`,
      email: `${role}@lusenticspa.com`,
      firstName: role.charAt(0).toUpperCase() + role.slice(1),
      lastName: 'Staff',
      role,
      loyaltyPoints: role === 'client' ? 120 : 0,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(targetUser));
    return targetUser;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(USER_KEY);
  },
};
