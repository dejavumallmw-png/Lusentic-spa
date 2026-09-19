import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { useTheme } from '../../app/providers/ThemeProvider';
import { UserRole, SiteSettings } from '../../types';
import { settingsService } from '../../services/settingsService';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenSearch: () => void;
  onOpenVoucher: () => void;
  onOpenAuth?: () => void;
  activeView: 'home' | 'client-dashboard' | 'admin-dashboard';
  setActiveView: (view: 'home' | 'client-dashboard' | 'admin-dashboard') => void;
}

/**
 * Custom Sparkle Emblem accurately matching the user's sketch in sampl.png:
 * - If a custom logo image was uploaded in admin settings, displays the custom logo
 * - Otherwise, renders the custom sketch icon
 */
const SparkleEmblem: React.FC<{ size?: 'sm' | 'lg'; customLogo?: string }> = ({ size = 'lg', customLogo }) => {
  if (customLogo) {
    if (size === 'sm') {
      return (
        <div className="w-9 h-9 rounded-full overflow-hidden border border-[#e8b4b8]/70 shadow-sm shrink-0 bg-white/10 flex items-center justify-center">
          <img src={customLogo} alt="Lusentic Spa Logo" className="w-full h-full object-cover" />
        </div>
      );
    }
    return (
      <div className="relative flex items-center justify-center select-none">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#d49a9e]/20 via-[#e8b4b8]/30 to-transparent flex items-center justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#e8b4b8] shadow-xl shadow-[#d49a9e]/25 bg-white/10 flex items-center justify-center">
            <img src={customLogo} alt="Lusentic Spa Logo" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#d49a9e] to-[#e8b4b8] flex items-center justify-center shadow-sm shrink-0">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#1a1418]">
          <path
            d="M50 8 C50 32 32 50 8 50 C32 50 50 68 50 92 C50 68 68 50 92 50 C68 50 50 32 50 8 Z"
            fill="currentColor"
          />
          <path
            d="M78 18 C78 24 74 28 68 28 C74 28 78 32 78 38 C78 32 82 28 88 28 C82 28 78 24 78 18 Z"
            fill="#FFD700"
          />
          <circle cx="26" cy="74" r="5" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center select-none">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#d49a9e]/20 via-[#e8b4b8]/30 to-transparent flex items-center justify-center animate-pulse">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#d49a9e] to-[#e8b4b8] flex items-center justify-center shadow-xl shadow-[#d49a9e]/25">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 sm:w-12 sm:h-12 text-[#1a1418]">
            <path
              d="M50 8 C50 32 32 50 8 50 C32 50 50 68 50 92 C50 68 68 50 92 50 C68 50 50 32 50 8 Z"
              fill="currentColor"
            />
            <path
              d="M78 18 C78 24 74 28 68 28 C74 28 78 32 78 38 C78 32 82 28 88 28 C82 28 78 24 78 18 Z"
              fill="#FFD700"
            />
            <circle cx="26" cy="74" r="5" fill="none" stroke="currentColor" strokeWidth="3.5" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenSearch,
  onOpenVoucher,
  onOpenAuth,
  activeView,
  setActiveView,
}) => {
  const { user, role, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(settingsService.getSettings());

  useEffect(() => {
    const unsub = settingsService.subscribe((updated) => {
      setSiteSettings(updated);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#hero', onClick: () => { setActiveView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { label: 'About', href: '#about', onClick: () => setActiveView('home') },
    { label: 'Services', href: '#services', onClick: () => setActiveView('home') },
    { label: 'Special Offer', href: '#special-offer', onClick: () => setActiveView('home') },
    { label: 'Gallery', href: '#gallery', onClick: () => setActiveView('home') },
    { label: 'Therapists', href: '#team', onClick: () => setActiveView('home') },
    { label: 'Health Corner', href: '#articles', onClick: () => setActiveView('home') },
    { label: 'Contact', href: '#contact', onClick: () => setActiveView('home') },
  ];

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRole(newRole);
    setRoleMenuOpen(false);
    if (newRole === 'admin' || newRole === 'receptionist') {
      setActiveView('admin-dashboard');
    } else {
      setActiveView('client-dashboard');
    }
  };

  const handleGoToAdmin = async () => {
    await switchRole('admin');
    setActiveView('admin-dashboard');
    try {
      window.history.pushState(null, '', '?admin=true');
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
    setRoleMenuOpen(false);
  };

  const handleLogoClick = () => {
    setActiveView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-3 sm:top-4 z-50 px-3 sm:px-6 w-full pointer-events-none">
      {/* Morphing Container:
          - At top of page (!isScrolled): Centered container with logo & Lusentic Spa from sampl.png
          - When scrolling down (isScrolled): Slowly and smoothly expands & flattens into the floating pill navbar
      */}
      <div
        className={`mx-auto pointer-events-auto relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_16px_40px_rgba(0,0,0,0.24)] ${
          theme === 'dark'
            ? 'bg-[#1a1418]/95 text-white border border-white/15 backdrop-blur-xl'
            : 'bg-[#2e292c] text-white border border-[#484045] backdrop-blur-xl'
        } ${
          isScrolled
            ? 'w-full max-w-7xl rounded-full h-[58px] px-4 sm:px-6 py-2'
            : 'w-[320px] sm:w-[400px] max-w-[92vw] rounded-[32px] sm:rounded-[38px] h-[210px] sm:h-[230px] p-6'
        }`}
      >
        {/* STATE A: Initial Centered Card (from sampl.png) */}
        <div
          onClick={handleLogoClick}
          className={`absolute inset-0 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all duration-500 ${
            isScrolled
              ? 'opacity-0 scale-90 pointer-events-none'
              : 'opacity-100 scale-100 pointer-events-auto'
          }`}
        >
          <SparkleEmblem size="lg" customLogo={siteSettings.logoUrl} />
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-baseline justify-center gap-1.5">
            <span>{siteSettings.brandName || 'Lusentic'}</span>
            <span className="font-light italic font-serif-luxury text-[#e8b4b8]">{siteSettings.brandSuffix || 'Spa'}</span>
          </h1>
        </div>

        {/* STATE B: Floating Navbar (shown when scrolled down) */}
        <div
          className={`w-full h-full flex items-center justify-between transition-all duration-500 ${
            isScrolled
              ? 'opacity-100 scale-100 pointer-events-auto delay-100'
              : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          {/* Logo Group */}
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <SparkleEmblem size="sm" customLogo={siteSettings.logoUrl} />
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-2xl font-bold tracking-tight text-white group-hover:text-[#e8b4b8] transition-colors">
                {siteSettings.brandName || 'Lusentic'}
              </span>
              <span className="text-lg sm:text-2xl font-light text-[#e8b4b8] font-serif-luxury italic">
                {siteSettings.brandSuffix || 'Spa'}
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={item.onClick}
                className="px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium text-white/90 hover:text-[#e8b4b8] hover:bg-white/10 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions Group */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Search Treatments"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#FFD700]" />
              ) : (
                <Moon className="w-4 h-4 text-[#e8b4b8]" />
              )}
            </button>

            {/* Mobile: Fancy Icon-Only Account Button (strictly no words) */}
            <button
              onClick={() => {
                if (onOpenAuth) onOpenAuth();
                else setRoleMenuOpen((prev) => !prev);
              }}
              className="sm:hidden relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-[#d49a9e] via-[#e8b4b8] to-[#fce4e6] text-[#1a1418] shadow-[0_2px_10px_rgba(232,180,184,0.45)] border border-white/40 active:scale-95 transition-transform cursor-pointer shrink-0"
              title={user ? `${user.firstName || 'Guest'} - Account` : 'My Account'}
              aria-label="My Account"
            >
              <UserIcon className="w-4 h-4 stroke-[2.2]" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD700] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFD700]"></span>
              </span>
            </button>

            {/* Desktop: Clean Account Button & Dropdown Menu */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setRoleMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/20 hover:border-[#e8b4b8] bg-white/10 text-white transition-colors cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#e8b4b8]" />
                <span>{user ? user.firstName : 'Account'}</span>
                <ChevronDown className="w-3 h-3 text-white/70" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#241d22] border border-white/15 shadow-2xl p-2 z-50 text-xs text-white">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="font-bold text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-white/60 truncate">{user?.email}</p>
                    {user?.loyaltyPoints !== undefined && (
                      <p className="text-[#FFD700] font-semibold mt-1">★ {user.loyaltyPoints} Loyalty Pts</p>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveView('client-dashboard');
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 text-white cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#e8b4b8]" />
                      <span>My Client Dashboard</span>
                    </button>

                    <button
                      onClick={handleGoToAdmin}
                      className="w-full text-left px-3 py-1.5 rounded-lg bg-[#e8b4b8]/20 hover:bg-[#e8b4b8] text-white hover:text-[#1a1418] flex items-center gap-2 font-bold cursor-pointer transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#e8b4b8] group-hover:text-[#1a1418]" />
                      <span>Super Admin Panel</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-white/10">
                    <p className="px-3 py-1 text-[10px] font-bold uppercase text-white/50">
                      Switch Role:
                    </p>
                    <div className="grid grid-cols-3 gap-1 px-1">
                      {(['client', 'receptionist', 'admin'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => handleRoleSwitch(r)}
                          className={`py-1 rounded text-[11px] font-medium capitalize text-center cursor-pointer ${
                            role === r
                              ? 'bg-[#e8b4b8] text-[#1a1418] font-bold'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-full text-white hover:bg-white/10 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu (Screen 2 from PDF) */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto lg:hidden max-w-7xl mx-auto mt-2 p-5 rounded-3xl bg-[#2e292c] text-white border border-white/10 shadow-2xl animate-in slide-in-from-top-3 duration-200">
          <nav className="flex flex-col gap-2">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => {
                  item.onClick();
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                {item.label}
              </a>
            ))}

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={() => {
                  setActiveView('client-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 rounded-xl bg-white/10 text-white text-xs font-semibold flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-[#e8b4b8]" />
                  <span>Client Dashboard</span>
                </span>
                <span className="text-[#FFD700] text-xs">★ {user?.loyaltyPoints || 0} pts</span>
              </button>
              <button
                onClick={() => {
                  if (onOpenAuth) onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#e8b4b8] text-[#1a1418] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>{user ? 'My Account' : 'Login'}</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
