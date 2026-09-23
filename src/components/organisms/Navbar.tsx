import React, { useState, useEffect } from 'react';
import {
  Search,
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  LayoutDashboard,
  ChevronDown,
  LogIn,
  LogOut,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { useTheme } from '../../app/providers/ThemeProvider';
import { SiteSettings } from '../../types';
import { settingsService } from '../../services/settingsService';
import { SparkleEmblem } from '../atoms/SparkleEmblem';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenSearch: () => void;
  onOpenVoucher: () => void;
  onOpenAuth?: () => void;
  activeView: 'home' | 'client-dashboard' | 'admin-dashboard';
  setActiveView: (view: 'home' | 'client-dashboard' | 'admin-dashboard') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenSearch,
  onOpenVoucher,
  onOpenAuth,
  activeView,
  setActiveView,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(settingsService.getSettings());

  useEffect(() => {
    const unsub = settingsService.subscribe((updated) => {
      setSiteSettings(updated);
    });
    return () => unsub();
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

  const handleLogoClick = () => {
    setActiveView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-3 sm:top-4 z-50 px-3 sm:px-6 w-full">
      {/* Floating Luxury Pill Navbar - Fixed on initial load and stays consistent throughout */}
      <div
        className={`mx-auto w-full max-w-7xl rounded-full h-[58px] px-4 sm:px-6 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.24)] flex items-center justify-between border backdrop-blur-xl transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-[#1a1418]/95 text-white border-white/15'
            : 'bg-[#2e292c] text-white border-[#484045]'
        }`}
      >
        {/* Left: Brand Logo & Title */}
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

        {/* Center: Desktop Navigation Links */}
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

        {/* Right: Actions Group */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Quick Book Button */}
          <button
            onClick={onOpenBooking}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#b57377] hover:bg-[#d49a9e] text-white transition-all shadow-sm cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Now</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Search Treatments"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#FFD700]" />
            ) : (
              <Moon className="w-4 h-4 text-[#e8b4b8]" />
            )}
          </button>

          {/* Mobile: Fancy Icon-Only Account Button (strictly client portal) */}
          <button
            onClick={() => {
              if (!user || user.role !== 'client') {
                if (onOpenAuth) onOpenAuth();
              } else {
                setActiveView('client-dashboard');
              }
            }}
            className="sm:hidden relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-[#d49a9e] via-[#e8b4b8] to-[#fce4e6] text-[#1a1418] shadow-[0_2px_10px_rgba(232,180,184,0.45)] border border-white/40 active:scale-95 transition-transform cursor-pointer shrink-0"
            title={user ? `${user.firstName || 'Client'} - Dashboard` : 'Client Login'}
            aria-label="My Account"
          >
            <UserIcon className="w-4 h-4 stroke-[2.2]" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD700] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFD700]"></span>
            </span>
          </button>

          {/* Desktop: Clean Account Button & Dropdown Menu (Strictly Client) */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => {
                if (!user || user.role !== 'client') {
                  if (onOpenAuth) onOpenAuth();
                } else {
                  setRoleMenuOpen((prev) => !prev);
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/20 hover:border-[#e8b4b8] bg-white/10 text-white transition-colors cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#e8b4b8]" />
              <span>{user && user.role === 'client' ? user.firstName : 'Client Login'}</span>
              {user && user.role === 'client' && <ChevronDown className="w-3 h-3 text-white/70" />}
            </button>

            {roleMenuOpen && user && user.role === 'client' && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#241d22] border border-white/15 shadow-2xl p-2 z-50 text-xs text-white animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="font-bold text-white">{user.firstName} {user.lastName}</p>
                  <p className="text-white/60 truncate">{user.phone || user.email || 'Client'}</p>
                  {user.loyaltyPoints !== undefined && (
                    <p className="text-[#FFD700] font-semibold mt-1">★ {user.loyaltyPoints} Loyalty Pts</p>
                  )}
                </div>

                <div className="py-1 space-y-1">
                  <button
                    onClick={() => {
                      setActiveView('client-dashboard');
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 text-white cursor-pointer transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#e8b4b8]" />
                    <span>My Client Dashboard</span>
                  </button>

                  <button
                    onClick={async () => {
                      await logout();
                      setRoleMenuOpen(false);
                      setActiveView('home');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-300 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>Sign Out</span>
                  </button>
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

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-w-7xl mx-auto mt-2 p-5 rounded-3xl bg-[#2e292c] text-white border border-white/10 shadow-2xl animate-in slide-in-from-top-3 duration-200">
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
                  onOpenBooking();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#b57377] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>

              {user && user.role === 'client' ? (
                <>
                  <button
                    onClick={() => {
                      setActiveView('client-dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-white/10 text-white text-xs font-semibold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-[#e8b4b8]" />
                      <span>{user.firstName}'s Dashboard</span>
                    </span>
                    <span className="text-[#FFD700] text-xs">★ {user.loyaltyPoints || 0} pts</span>
                  </button>
                  <button
                    onClick={async () => {
                      await logout();
                      setMobileMenuOpen(false);
                      setActiveView('home');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-red-500/20 text-red-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    if (onOpenAuth) onOpenAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#b57377] to-[#d49a9e] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Client Login / Register</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
