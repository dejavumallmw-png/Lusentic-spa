import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  ShoppingCart,
  Sun,
  Moon,
  Menu,
  X,
  Phone,
  User as UserIcon,
  Calendar,
  Gift,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { useCart } from '../../app/providers/CartProvider';
import { useTheme } from '../../app/providers/ThemeProvider';
import { Button } from '../atoms/Button';
import { UserRole } from '../../types';

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
  const { user, role, switchRole, logout } = useAuth();
  const { cart, toggleCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#hero', onClick: () => setActiveView('home') },
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

  return (
    <>
      {/* Top Announcement Bar (Style from Photo 2: NIRVANA SPA top banner) */}
      <div className="w-full bg-[#1a1418] text-[#e8b4b8] text-xs py-2 px-4 transition-colors border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block font-semibold tracking-wider uppercase text-[11px] text-[#FFD700]">
              Relax. Renew. Revive.
            </span>
            <span className="hidden sm:inline text-white/40">•</span>
            <span className="text-white/80">Experience luxury holistic spa treatments &amp; wellness</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenVoucher}
              className="inline-flex items-center gap-1.5 text-xs text-[#FFD700] hover:underline font-medium cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Gift Vouchers</span>
            </button>
            <a
              href="https://wa.me/27825550192"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#25D366] hover:underline text-xs font-semibold"
            >
              <Phone className="w-3 h-3" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* Floating Pill Navbar (from Photo 1 floating nav specification) */}
      <header
        className={`sticky top-3 z-50 px-3 sm:px-6 transition-all duration-300 ${
          scrolled ? 'py-1' : 'py-2'
        }`}
      >
        <div
          className={`max-w-7xl mx-auto rounded-full transition-all duration-300 px-4 sm:px-6 py-2.5 flex items-center justify-between ${
            scrolled
              ? 'bg-white/95 dark:bg-[#1a1418]/95 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-[#e8b4b8]/30 dark:border-white/10'
              : 'bg-white/90 dark:bg-[#1a1418]/90 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[var(--border-light)]'
          }`}
        >
          {/* Logo Group */}
          <div
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#d49a9e] to-[#e8b4b8] flex items-center justify-center text-[#1a1418] shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Lusentic
              </span>
              <span className="text-xl sm:text-2xl font-light text-[#d49a9e] font-serif-luxury italic">
                Spa
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
                className="px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium text-[var(--text-primary)] hover:text-[#d49a9e] hover:bg-[#e8b4b8]/10 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions Group */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Search Treatments"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#FFD700]" />
              ) : (
                <Moon className="w-4 h-4 text-gray-700" />
              )}
            </button>

            {/* Cart Trigger with Badge */}
            <button
              onClick={toggleCart}
              className="relative p-2 rounded-full text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="View Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cart.count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#dc3545] border-2 border-white dark:border-[#1a1418] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {cart.count}
                </span>
              )}
            </button>

            {/* Role & Dashboard Selector */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen((prev) => !prev)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-[var(--border-light)] hover:border-[#e8b4b8] bg-[var(--bg-card)] transition-colors cursor-pointer"
              >
                {role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d49a9e]" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-[#d49a9e]" />
                )}
                <span className="capitalize">{user ? user.firstName : 'Account'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#f5edea] dark:bg-[#2d2228] text-[#d49a9e] uppercase font-bold">
                  {role}
                </span>
                <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xl p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-[var(--border-light)] mb-1">
                    <p className="font-bold text-[var(--text-primary)]">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[var(--text-muted)] truncate">{user?.email}</p>
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
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2 text-[var(--text-primary)]"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#d49a9e]" />
                      <span>My Bookings Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveView('admin-dashboard');
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2 text-[var(--text-primary)]"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#d49a9e]" />
                      <span>Admin Control Panel</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-[var(--border-light)]">
                    <p className="px-3 py-1 text-[10px] font-bold uppercase text-[var(--text-muted)]">
                      Switch Demo Role:
                    </p>
                    <div className="grid grid-cols-3 gap-1 px-1">
                      {(['client', 'receptionist', 'admin'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => handleRoleSwitch(r)}
                          className={`py-1 rounded text-[11px] font-medium capitalize text-center ${
                            role === r
                              ? 'bg-[#e8b4b8] text-[#1a1418] font-bold'
                              : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
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

            {/* Book Now Primary Pill Button */}
            <Button
              variant="primary"
              size="sm"
              icon={<Calendar className="w-3.5 h-3.5" />}
              onClick={onOpenBooking}
              className="hidden sm:inline-flex text-xs font-bold"
            >
              Book Now
            </Button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-full text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Screen 2 from PDF) */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl animate-in slide-in-from-top-3 duration-200">
            <nav className="flex flex-col gap-2">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    item.onClick();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-primary)] hover:bg-[#e8b4b8]/15"
                >
                  {item.label}
                </a>
              ))}

              <div className="pt-3 border-t border-[var(--border-light)] flex flex-col gap-2">
                <button
                  onClick={() => {
                    setActiveView('client-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-left flex items-center justify-between bg-black/5 dark:bg-white/5"
                >
                  <span>My Bookings Dashboard</span>
                  <span className="text-[#FFD700] text-xs">★ {user?.loyaltyPoints || 0} pts</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('admin-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-left flex items-center justify-between bg-black/5 dark:bg-white/5"
                >
                  <span>Admin / Staff Panel</span>
                  <span className="text-xs uppercase text-[#d49a9e]">{role}</span>
                </button>

                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  icon={<Calendar className="w-4 h-4" />}
                  onClick={() => {
                    onOpenBooking();
                    setMobileMenuOpen(false);
                  }}
                >
                  Book Appointment Now
                </Button>

                <Button
                  variant="whatsapp"
                  size="md"
                  fullWidth
                  icon={<Phone className="w-4 h-4" />}
                  onClick={() => window.open('https://wa.me/27825550192', '_blank')}
                >
                  WhatsApp Booking
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
