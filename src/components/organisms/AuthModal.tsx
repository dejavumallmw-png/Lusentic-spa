import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRole?: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccessRole }) => {
  const { user, login, register, switchRole, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'switch'>('login');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const loggedUser = await login(email, selectedRole);
      if (onSuccessRole) onSuccessRole(loggedUser.role);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email) return;
    setLoading(true);
    try {
      const regUser = await register({ firstName, lastName, email, phone });
      if (onSuccessRole) onSuccessRole(regUser.role);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSwitch = async (role: UserRole) => {
    setLoading(true);
    try {
      const switched = await switchRole(role);
      if (onSuccessRole) onSuccessRole(switched.role);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#1e181c] text-white rounded-[30px] border border-white/10 shadow-2xl p-6 sm:p-8 z-10 overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#e8b4b8]/20 text-[#e8b4b8] flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold">
            {mode === 'login' ? 'Account Login' : mode === 'register' ? 'Client Registration' : 'Switch Portal'}
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Access your personalized Lusentic Spa portal
          </p>
        </div>

        {/* Current status if already logged in */}
        {user && (
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#e8b4b8] text-[#1a1418] font-bold text-xs flex items-center justify-center">
                {user.firstName[0]}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{user.firstName} {user.lastName}</p>
                <p className="text-[10px] text-[#e8b4b8] uppercase tracking-wider font-semibold">{user.role}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="text-xs text-red-400 hover:text-red-300 font-medium underline cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Quick Portal Switch Pills */}
        <div className="mb-5 p-1 bg-white/5 rounded-2xl flex items-center gap-1 border border-white/10">
          {(['client', 'receptionist', 'admin'] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleQuickSwitch(r)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                user?.role === r
                  ? 'bg-[#e8b4b8] text-[#1a1418] shadow-sm font-bold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Tabs for Login vs Register */}
        <div className="flex border-b border-white/10 mb-5">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 pb-2 text-xs font-bold transition-all border-b-2 ${
              mode === 'login' ? 'border-[#e8b4b8] text-[#e8b4b8]' : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Direct Login
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 pb-2 text-xs font-bold transition-all border-b-2 ${
              mode === 'register' ? 'border-[#e8b4b8] text-[#e8b4b8]' : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address or Username *"
              placeholder="e.g. amanda.guest@lusenticspa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder-white/40"
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                Sign In As:
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full h-11 px-3.5 rounded-2xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#e8b4b8]"
              >
                <option value="client" className="bg-[#1e181c] text-white">Client / Guest</option>
                <option value="receptionist" className="bg-[#1e181c] text-white">Receptionist / Staff</option>
                <option value="admin" className="bg-[#1e181c] text-white">Spa Administrator</option>
              </select>
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              fullWidth
              disabled={loading}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="text-xs sm:text-sm font-bold shadow-md"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              <Input
                label="First Name *"
                placeholder="Amanda"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder-white/40"
              />
              <Input
                label="Last Name"
                placeholder="Khumalo"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-white/40"
              />
            </div>

            <Input
              label="Email Address *"
              type="email"
              placeholder="amanda@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder-white/40"
            />

            <Input
              label="Phone Number (for faster booking)"
              placeholder="+27 82 555 0192"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-white/40"
            />

            <Button
              variant="primary"
              size="md"
              type="submit"
              fullWidth
              disabled={loading}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="text-xs sm:text-sm font-bold shadow-md"
            >
              {loading ? 'Creating...' : 'Register & Join'}
            </Button>
          </form>
        )}

      </div>
    </div>
  );
};
