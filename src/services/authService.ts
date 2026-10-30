import { User, UserRole } from '../types';
import { signInWithGoogle, logoutFirebase, db, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const USERS_COLLECTION = 'users';

export const DEFAULT_ADMIN_CREDENTIALS = {
  username: 'admin@lusentic.com',
  password: 'Lusentic1112=',
  defaultFirstName: 'Prince',
  defaultLastName: 'Bonya',
};

const DEFAULT_ADMIN_USER: User = {
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

// In-memory runtime state synced directly with Firebase Firestore (zero localStorage)
let currentSessionUser: User | null = null;
let memoryAdminProfile: User = { ...DEFAULT_ADMIN_USER };
let memoryStaffList: User[] = [{ ...DEFAULT_ADMIN_USER }];
let memoryClients: User[] = [];
let isInitializedListener = false;

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

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

function initUsersRealtimeSync() {
  if (isInitializedListener) return;
  isInitializedListener = true;
  try {
    onSnapshot(
      collection(db, USERS_COLLECTION),
      (snap) => {
        if (!snap.empty) {
          const allUsers: User[] = [];
          snap.forEach((d) => {
            allUsers.push(d.data() as User);
          });

          const adminDoc = allUsers.find(
            (u) => u.id === 1 || u.username === DEFAULT_ADMIN_CREDENTIALS.username
          );
          if (adminDoc) {
            memoryAdminProfile = adminDoc;
          }

          const staff = allUsers.filter((u) => u.role === 'admin' || u.role === 'receptionist');
          if (!staff.some((s) => s.id === 1 || s.username === DEFAULT_ADMIN_CREDENTIALS.username)) {
            staff.unshift(memoryAdminProfile);
          }
          memoryStaffList = staff;

          memoryClients = allUsers.filter((u) => u.role === 'client');

          if (currentSessionUser) {
            const refreshed = allUsers.find((u) => u.id === currentSessionUser?.id);
            if (refreshed) {
              currentSessionUser = refreshed;
            }
          }
        } else {
          // Seed default admin into Firestore users collection
          setDoc(
            doc(db, USERS_COLLECTION, String(DEFAULT_ADMIN_USER.id)),
            sanitizeForFirestore(DEFAULT_ADMIN_USER)
          ).catch(() => {});
        }
      },
      (err) => {
        console.warn('Firestore users listener warning:', err);
      }
    );
  } catch (err) {
    console.warn('Unable to attach Firestore users listener:', err);
  }
}

initUsersRealtimeSync();

async function fetchAllUsersFromFirestore(): Promise<User[]> {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    const list: User[] = [];
    snap.forEach((d) => {
      list.push(d.data() as User);
    });
    return list;
  } catch (e) {
    console.error('Failed to fetch users from Firestore:', e);
    return [...memoryStaffList, ...memoryClients];
  }
}

export const authService = {
  getCurrentUser(): User | null {
    return currentSessionUser;
  },

  /**
   * Client login using Phone Number and 4-Digit PIN directly against Firebase Firestore
   */
  async loginClient(phone: string, pin: string): Promise<User> {
    const cleanInputPhone = normalizePhone(phone);
    if (!cleanInputPhone) {
      throw new Error('Please enter your phone number.');
    }
    if (!pin || pin.length !== 4) {
      throw new Error('Security PIN must be exactly 4 digits.');
    }

    const allUsers = await fetchAllUsersFromFirestore();
    const clients = allUsers.filter((u) => u.role === 'client');
    memoryClients = clients;

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

    currentSessionUser = client;
    return client;
  },

  /**
   * Client registration using Phone Number, 4-digit PIN, Full Name, and Optional Email in Firebase Firestore
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

    const allUsers = await fetchAllUsersFromFirestore();
    const clients = allUsers.filter((u) => u.role === 'client');
    const existing = clients.find((c) => normalizePhone(c.phone || '') === cleanPhone);

    const nameParts = data.name.trim().split(' ');
    const firstName = nameParts[0] || 'Guest';
    const lastName = nameParts.slice(1).join(' ') || '';

    if (existing) {
      const updatedExisting: User = sanitizeForFirestore({
        ...existing,
        pin: data.pin.trim(),
        firstName,
        lastName,
        email: data.email ? data.email.trim() : existing.email,
        profilePhoto: data.photo || existing.profilePhoto || '',
        avatar: data.photo || existing.avatar || '',
      });

      try {
        await setDoc(doc(db, USERS_COLLECTION, String(updatedExisting.id)), updatedExisting, {
          merge: true,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `${USERS_COLLECTION}/${updatedExisting.id}`);
      }

      currentSessionUser = updatedExisting;
      return updatedExisting;
    }

    const newId = Math.floor(Math.random() * 90000 + 10000);
    const newClient: User = sanitizeForFirestore({
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
    });

    try {
      await setDoc(doc(db, USERS_COLLECTION, String(newId)), newClient);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${USERS_COLLECTION}/${newId}`);
    }

    memoryClients = [...clients, newClient];
    currentSessionUser = newClient;
    return newClient;
  },

  /**
   * Admin and Staff Login via URL Link (/admin, #admin, etc.)
   */
  async loginStaff(usernameOrEmail: string, passwordAttempt: string): Promise<User> {
    const cleanUser = usernameOrEmail.trim().toLowerCase();
    const cleanPass = passwordAttempt.trim();

    // 1. Check Default Super Admin
    if (
      (cleanUser === DEFAULT_ADMIN_CREDENTIALS.username.toLowerCase() || cleanUser === 'admin') &&
      cleanPass === DEFAULT_ADMIN_CREDENTIALS.password
    ) {
      try {
        const adminSnap = await getDoc(doc(db, USERS_COLLECTION, String(DEFAULT_ADMIN_USER.id)));
        if (adminSnap.exists()) {
          memoryAdminProfile = adminSnap.data() as User;
        } else {
          await setDoc(
            doc(db, USERS_COLLECTION, String(DEFAULT_ADMIN_USER.id)),
            sanitizeForFirestore(memoryAdminProfile)
          );
        }
      } catch {
        // fallback to in-memory admin profile if needed
      }
      currentSessionUser = memoryAdminProfile;
      return memoryAdminProfile;
    }

    // 2. Check Additional Staff / Admin accounts in Firestore
    const staffList = await this.getAllStaff();
    const matchedStaff = staffList.find(
      (s) =>
        (s.username.toLowerCase() === cleanUser ||
          (s.email && s.email.toLowerCase() === cleanUser)) &&
        s.password === cleanPass
    );

    if (matchedStaff) {
      currentSessionUser = matchedStaff;
      return matchedStaff;
    }

    throw new Error('Invalid credentials. Please verify your username and password.');
  },

  getAdminProfile(): User {
    return memoryAdminProfile;
  },

  async updateAdminProfile(updates: Partial<User>): Promise<User> {
    const updated: User = sanitizeForFirestore({
      ...memoryAdminProfile,
      ...updates,
      id: 1,
      role: 'admin',
    });
    memoryAdminProfile = updated;

    if (currentSessionUser && currentSessionUser.role === 'admin') {
      currentSessionUser = updated;
    }

    try {
      await setDoc(doc(db, USERS_COLLECTION, String(updated.id)), updated, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${USERS_COLLECTION}/${updated.id}`);
    }

    return updated;
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    if (!currentSessionUser) throw new Error('Not logged in');

    const updated: User = sanitizeForFirestore({
      ...currentSessionUser,
      ...updates,
    });
    currentSessionUser = updated;

    if (updated.role === 'admin' && updated.id === 1) {
      memoryAdminProfile = updated;
    }

    try {
      await setDoc(doc(db, USERS_COLLECTION, String(updated.id)), updated, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${USERS_COLLECTION}/${updated.id}`);
    }

    return updated;
  },

  async addLoyaltyPoints(userId: number, pointsToAdd: number): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, String(userId));
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const userData = snap.data() as User;
        const nextPoints = (userData.loyaltyPoints || 0) + pointsToAdd;
        await setDoc(userRef, { loyaltyPoints: nextPoints }, { merge: true });
        if (currentSessionUser && currentSessionUser.id === userId) {
          currentSessionUser = { ...currentSessionUser, loyaltyPoints: nextPoints };
        }
      }
    } catch (e) {
      console.warn('Could not update loyalty points in Firestore:', e);
    }
  },

  async getAllStaff(): Promise<User[]> {
    const allUsers = await fetchAllUsersFromFirestore();
    const staff = allUsers.filter((u) => u.role === 'admin' || u.role === 'receptionist');
    if (!staff.some((s) => s.id === 1 || s.username === DEFAULT_ADMIN_CREDENTIALS.username)) {
      staff.unshift(memoryAdminProfile);
    }
    memoryStaffList = staff;
    return staff;
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
    const newId = Math.floor(Math.random() * 9000 + 1000);
    const newStaff: User = sanitizeForFirestore({
      id: newId,
      username: data.username || data.email.split('@')[0],
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      phone: data.phone || '',
      password: data.password || 'Lusentic1112=',
      loyaltyPoints: 0,
      profilePhoto: data.avatar || '',
      avatar: data.avatar || '',
    });

    memoryStaffList = [...memoryStaffList, newStaff];

    try {
      await setDoc(doc(db, USERS_COLLECTION, String(newId)), newStaff);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${USERS_COLLECTION}/${newId}`);
    }

    return newStaff;
  },

  async removeStaff(id: number): Promise<boolean> {
    if (id === 1) return false;
    memoryStaffList = memoryStaffList.filter(
      (s) => s.id !== id || s.username === DEFAULT_ADMIN_CREDENTIALS.username
    );

    try {
      await deleteDoc(doc(db, USERS_COLLECTION, String(id)));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${USERS_COLLECTION}/${id}`);
    }

    return true;
  },

  async updateStaff(id: number, updates: Partial<User>): Promise<User | null> {
    const list = await this.getAllStaff();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    const merged = sanitizeForFirestore({ ...list[idx], ...updates });
    const nextList = [...list];
    nextList[idx] = merged;
    memoryStaffList = nextList;

    if (merged.id === 1 || merged.username === DEFAULT_ADMIN_CREDENTIALS.username) {
      memoryAdminProfile = merged;
    }

    try {
      await setDoc(doc(db, USERS_COLLECTION, String(id)), merged, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${USERS_COLLECTION}/${id}`);
    }

    return merged;
  },

  async switchRole(role: UserRole): Promise<User> {
    if (role === 'admin') {
      currentSessionUser = memoryAdminProfile;
      return memoryAdminProfile;
    }
    const staffList = await this.getAllStaff();
    const target = staffList.find((s) => s.role === role);
    if (target) {
      currentSessionUser = target;
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
    currentSessionUser = newUser;
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

    const user: User = sanitizeForFirestore({
      id: Math.floor(Math.random() * 90000 + 10000),
      username: email || firebaseUser.uid,
      email,
      firstName,
      lastName,
      role: isAdminEmail ? 'admin' : 'client',
      loyaltyPoints: 50,
      avatar: firebaseUser.photoURL || '',
      profilePhoto: firebaseUser.photoURL || '',
    });

    currentSessionUser = user;

    try {
      await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), user, { merge: true });
    } catch (e) {
      console.warn('Could not sync Google profile to Firestore:', e);
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
    currentSessionUser = null;
    await logoutFirebase();
  },
};
