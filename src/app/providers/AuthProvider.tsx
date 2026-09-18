import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { authService } from '../../services/authService';

interface AuthContextValue {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (emailOrUser: string, role?: UserRole) => Promise<User>;
  register: (data: { firstName: string; lastName: string; email: string; phone?: string }) => Promise<User>;
  switchRole: (role: UserRole) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());

  useEffect(() => {
    const current = authService.getCurrentUser();
    setUser(current);
  }, []);

  const login = async (emailOrUser: string, role: UserRole = 'client') => {
    const logged = await authService.login(emailOrUser, role);
    setUser(logged);
    return logged;
  };

  const register = async (data: { firstName: string; lastName: string; email: string; phone?: string }) => {
    const registered = await authService.register(data);
    setUser(registered);
    return registered;
  };

  const switchRole = async (targetRole: UserRole) => {
    const switched = await authService.switchRole(targetRole);
    setUser(switched);
    return switched;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('lusentic_spa_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'client',
        isAuthenticated: !!user,
        login,
        register,
        switchRole,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
