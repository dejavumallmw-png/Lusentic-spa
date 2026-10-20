import React, { useState } from 'react';
import { X, Lock, Phone, User as UserIcon, Mail, KeyRound, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { authService } from '../../services/authService';
import { Button } from '../atoms/Button';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRole?: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccessRole }) => {
  const { user, loginClient, registerClient, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPin, setLoginPin] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regEmail, setRegEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginPhone.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }
    if (!loginPin || loginPin.length !== 4) {
      setErrorMessage('Please enter your 4-digit security PIN.');
      return;
    }

    setLoading(true);
    try {
      const client = await loginClient(loginPhone.trim(), loginPin.trim());
      if (onSuccessRole) onSuccessRole(client.role);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your phone number and 4-digit PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regPhone.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }
    if (!regPin || regPin.length !== 4 || !/^\d{4}$/.test(regPin)) {
      setErrorMessage('Security PIN must be exactly 4 digits (0-9).');
      return;
    }

    setLoading(true);
    try {
      const client = await registerClient({
        name: regName.trim(),
        phone: regPhone.trim(),
        pin: regPin.trim(),
        email: regEmail.trim() || undefined,
      });
      if (onSuccessRole) onSuccessRole(client.role);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const u = await authService.loginWithGoogle();
      if (onSuccessRole) onSuccessRole(u.role);
      onClose();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Google sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#1e181c] text-stone-900 dark:text-white rounded-[32px] border border-stone-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 z-10 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 text-stone-600 hover:text-stone-900 dark:text-white/70 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#fcebee] dark:bg-white/10 text-[#b57377] dark:text-[#e8b4b8] flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
            Client Sanctuary Account
          </h2>
          <p className="text-xs text-stone-600 dark:text-white/60 mt-1">
            {mode === 'login'
              ? 'Sign in with your phone number and 4-digit PIN'
              : 'Create your guest account using phone number & 4-digit PIN'}
          </p>
        </div>

        {/* Current status if already logged in */}
        {user && (
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#b57377] text-white font-bold text-xs flex items-center justify-center">
                {user.firstName ? user.firstName[0] : 'C'}
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-white">{user.firstName} {user.lastName}</p>
                <p className="text-[10px] text-[#b57377] dark:text-[#e8b4b8] uppercase tracking-wider font-semibold">
                  {user.phone || user.email || 'Client'}
                </p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Error message banner */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Navigation Tabs (Login vs Register) */}
        <div className="flex border-b border-stone-200 dark:border-white/10 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 pb-2.5 text-xs font-bold tracking-wide uppercase transition-all border-b-2 cursor-pointer ${
              mode === 'login'
                ? 'border-[#b57377] text-[#b57377] dark:border-[#e8b4b8] dark:text-[#e8b4b8]'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-white/50 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 pb-2.5 text-xs font-bold tracking-wide uppercase transition-all border-b-2 cursor-pointer ${
              mode === 'register'
                ? 'border-[#b57377] text-[#b57377] dark:border-[#e8b4b8] dark:text-[#e8b4b8]'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-white/50 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mb-3.5 py-2.5 px-4 rounded-xl border border-stone-200 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-stone-50 dark:hover:bg-white/10 text-stone-800 dark:text-white text-xs font-semibold flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-stone-200 dark:border-white/10 w-full" />
          <span className="bg-white dark:bg-[#1e181c] px-2 text-[10px] uppercase font-bold text-stone-400 dark:text-white/40 tracking-wider shrink-0">
            Or with Phone &amp; PIN
          </span>
          <div className="border-t border-stone-200 dark:border-white/10 w-full" />
        </div>

        {/* MODE 1: LOGIN (Phone + 4-digit PIN) */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                Phone Number *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-stone-400 dark:text-white/40 pointer-events-none">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  placeholder="e.g. 082 555 0192 or +27 82 555 0192"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  required
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-stone-300 dark:border-white/20 bg-stone-50 dark:bg-white/10 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/40 text-xs focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8] focus:bg-white dark:focus:bg-[#1a1418] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                4-Digit Security PIN *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-stone-400 dark:text-white/40 pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="•••• (4 digits)"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  required
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-stone-300 dark:border-white/20 bg-stone-50 dark:bg-white/10 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/40 text-xs tracking-widest focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8] focus:bg-white dark:focus:bg-[#1a1418] transition-all"
                />
              </div>
              <p className="text-[11px] text-stone-500 dark:text-white/50 mt-1">
                Enter the 4-digit PIN you created with your account
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              fullWidth
              disabled={loading}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="text-xs sm:text-sm font-bold shadow-md mt-2"
            >
              {loading ? 'Verifying PIN...' : 'Sign In'}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className="text-xs text-[#b57377] dark:text-[#e8b4b8] hover:underline font-semibold cursor-pointer"
              >
                Don't have an account? Click to register in seconds
              </button>
            </div>
          </form>
        ) : (
          /* MODE 2: REGISTER (Phone + PIN + Full Name + Optional Email) */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                Full Name *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-stone-400 dark:text-white/40 pointer-events-none">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. Amanda Khumalo"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-stone-300 dark:border-white/20 bg-stone-50 dark:bg-white/10 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/40 text-xs focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8] focus:bg-white dark:focus:bg-[#1a1418] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                Phone Number *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-stone-400 dark:text-white/40 pointer-events-none">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  placeholder="e.g. +27 82 555 0192"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-stone-300 dark:border-white/20 bg-stone-50 dark:bg-white/10 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/40 text-xs focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8] focus:bg-white dark:focus:bg-[#1a1418] transition-all"
                />
              </div>
              <p className="text-[10px] text-stone-500 dark:text-white/50 mt-0.5">
                Used to verify bookings and sign into your account
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                Create 4-Digit Security PIN *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-stone-400 dark:text-white/40 pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="4 digits (e.g. 1234)"
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  required
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-stone-300 dark:border-white/20 bg-stone-50 dark:bg-white/10 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/40 text-xs tracking-widest focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8] focus:bg-white dark:focus:bg-[#1a1418] transition-all"
                />
              </div>
              <p className="text-[10px] text-stone-500 dark:text-white/50 mt-0.5">
                Easy to remember PIN for your next logins
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                Email Address <span className="font-normal text-stone-500 dark:text-white/50 lowercase">(optional)</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-stone-400 dark:text-white/40 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="amanda@example.com (optional)"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-stone-300 dark:border-white/20 bg-stone-50 dark:bg-white/10 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/40 text-xs focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8] focus:bg-white dark:focus:bg-[#1a1418] transition-all"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              fullWidth
              disabled={loading}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="text-xs sm:text-sm font-bold shadow-md mt-2"
            >
              {loading ? 'Creating Account...' : 'Register & Enter Sanctuary'}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className="text-xs text-[#b57377] dark:text-[#e8b4b8] hover:underline font-semibold cursor-pointer"
              >
                Already have an account? Sign in with phone &amp; PIN
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
