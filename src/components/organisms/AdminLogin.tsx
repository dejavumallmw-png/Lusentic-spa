import React, { useState } from 'react';
import { Lock, ArrowRight, ArrowLeft, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { Button } from '../atoms/Button';
import { SparkleEmblem } from '../atoms/SparkleEmblem';
import { settingsService } from '../../services/settingsService';
import { authService } from '../../services/authService';

interface AdminLoginProps {
  onSuccess: () => void;
  onBackToHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToHome }) => {
  const { loginStaff } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [settings, setSettings] = useState(settingsService.getSettings());

  React.useEffect(() => {
    const unsub = settingsService.subscribe((updated) => {
      setSettings(updated);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Please enter your staff username or email.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await loginStaff(username.trim(), password);
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials. Please verify your login details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const u = await authService.loginWithGoogle();
      if (u.role === 'admin' || u.role === 'receptionist') {
        onSuccess();
      } else {
        setErrorMessage(`Signed in as ${u.email}, but this account has client privileges rather than staff/admin privileges.`);
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Google sign in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#140f12] text-white flex flex-col justify-center items-center p-4 relative selection:bg-[#e8b4b8] selection:text-[#1a1418]">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e8b4b8]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#d49a9e]/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Back Link */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#e8b4b8]" />
            <span>Back to Public Website</span>
          </button>
          <span className="text-[11px] text-[#e8b4b8] font-bold uppercase tracking-widest flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Access</span>
          </span>
        </div>

        {/* Card */}
        <div className="rounded-[32px] bg-[#1e171c]/90 backdrop-blur-md border border-white/10 p-7 sm:p-9 shadow-2xl">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-7">
            <SparkleEmblem size="md" customLogo={settings.logoUrl} className="mb-3" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif-luxury flex items-baseline gap-1.5">
              <span>{settings.brandName || 'Lusentic'}</span>
              <span className="font-light italic text-[#e8b4b8]">{settings.brandSuffix || 'Spa'}</span>
            </h1>
            <p className="text-xs uppercase font-extrabold tracking-widest text-[#e8b4b8] mt-1.5">
              Sanctuary Administration Portal
            </p>
            <p className="text-xs text-white/60 mt-2 max-w-xs">
              Restricted management access for verified spa administrators and reception personnel.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-medium flex items-center gap-2.5 animate-in shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google Sign In Option */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full mb-4 py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer"
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
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#1e171c] px-2 text-[10px] uppercase font-bold text-white/40 tracking-wider shrink-0">
              Or with Password
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-200 mb-1.5">
                Staff / Admin Username or Email *
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="e.g. admin@lusentic.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  className="w-full h-12 px-4 rounded-xl border border-white/15 bg-white/5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#e8b4b8] focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-200 mb-1.5">
                Password *
              </label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl border border-white/15 bg-white/5 text-white placeholder-white/40 text-sm tracking-wide focus:outline-none focus:border-[#e8b4b8] focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              fullWidth
              disabled={loading}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="font-bold text-sm mt-3 shadow-lg hover:shadow-xl py-3.5"
            >
              {loading ? 'Authenticating...' : 'Sign In to Management Portal'}
            </Button>
          </form>

          {/* Default Credentials Reference Box for Seamless Deployment */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/70 space-y-1">
              <p className="font-semibold text-[#e8b4b8]">Default Administrator Account</p>
              <p className="font-mono text-[10px] text-white/90 select-all">Username: admin@lusentic.com</p>
              <p className="font-mono text-[10px] text-white/90 select-all">Password: Lusentic1112=</p>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-white/40 mt-6">
          Lusentic Spa &amp; Wellness Sanctuary • Strict Staff Credentials Protected
        </p>
      </div>
    </div>
  );
};
