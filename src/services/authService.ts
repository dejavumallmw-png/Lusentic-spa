import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';

const USER_KEY = 'lusentic_spa_user';

export const authService = {
  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) {
        // Default to client Amanda Khumalo for immediate demoing of client dashboard
        localStorage.setItem(USER_KEY, JSON.stringify(INITIAL_USERS[0]));
        return INITIAL_USERS[0];
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS[0];
    }
  },

  async login(emailOrUsername: string, role: UserRole = 'client'): Promise<User> {
    const existing = INITIAL_USERS.find(
      (u) =>
        u.email.toLowerCase() === emailOrUsername.toLowerCase() ||
        u.username.toLowerCase() === emailOrUsername.toLowerCase()
    );

    if (existing) {
      localStorage.setItem(USER_KEY, JSON.stringify(existing));
      return existing;
    }

    // Create demo profile for this login
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
    const newUser: User = {
      id: Math.floor(Math.random() * 9000 + 1000),
      username: data.email.split('@')[0],
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'client',
      phone: data.phone,
      loyaltyPoints: 100, // Welcome bonus loyalty points
      profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    };

    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return newUser;
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
