import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './app/providers/ThemeProvider';
import { AuthProvider, useAuth } from './app/providers/AuthProvider';
import { CartProvider, useCart } from './app/providers/CartProvider';

// Layout & Organisms
import { Navbar } from './components/organisms/Navbar';
import { SpecialOfferBanner } from './components/organisms/SpecialOfferBanner';
import { Hero } from './components/organisms/Hero';
import { WhatWeOffer } from './components/organisms/WhatWeOffer';
import { MonthlySpecial } from './components/organisms/MonthlySpecial';
import { CallToActionBanner } from './components/organisms/CallToActionBanner';
import { GallerySection } from './components/organisms/GallerySection';
import { TeamSection } from './components/organisms/TeamSection';
import { TestimonialsSection } from './components/organisms/TestimonialsSection';
import { ArticlesSection } from './components/organisms/ArticlesSection';
import { LocationDirectionsSection } from './components/organisms/LocationDirectionsSection';
import { Footer } from './components/organisms/Footer';
import { settingsService } from './services/settingsService';
import { SiteSettings } from './types';

// Dashboard Views
import { ClientDashboard } from './components/organisms/ClientDashboard';
import { AdminDashboard } from './components/organisms/AdminDashboard';
import { AdminLogin } from './components/organisms/AdminLogin';

// Floating & Modals
import { FloatingCart } from './components/organisms/FloatingCart';
import { CartPanel } from './components/organisms/CartPanel';
import { BookingModal } from './components/organisms/BookingModal';
import { SuccessModal } from './components/organisms/SuccessModal';
import { SearchModal } from './components/organisms/SearchModal';
import { GiftVoucherModal } from './components/organisms/GiftVoucherModal';
import { testConnection } from './services/firebase';
import { AuthModal } from './components/organisms/AuthModal';

import { Treatment, Therapist, Booking, BookingFormData } from './types';
import { bookingService } from './services/bookingService';
import { treatmentService } from './services/treatmentService';

const MainAppContent: React.FC = () => {
  const { role, switchRole } = useAuth();
  const { cart, addItem, clearCart, openCart } = useCart();

  // Primary view state
  const [activeView, setActiveView] = useState<'home' | 'client-dashboard' | 'admin-dashboard'>('home');

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Live Site Branding & Settings (including coordinates & logo)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(settingsService.getSettings());
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  useEffect(() => {
    const unsub = settingsService.subscribe((updated) => {
      setSiteSettings(updated);
    });
    return () => unsub();
  }, []);

  // Google Maps Platform Quota Exceeded event listener (Case A Quota Defense)
  useEffect(() => {
    const handleQuotaExceeded = () => {
      setIsQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Dynamically ensure OpenGraph image and favicon absolute URLs match the active origin for WhatsApp sharing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) ogImage.setAttribute('content', `${origin}/og-image.jpg`);
      const ogSecure = document.querySelector('meta[property="og:image:secure_url"]');
      if (ogSecure) ogSecure.setAttribute('content', `${origin}/og-image.jpg`);
      const twImage = document.querySelector('meta[name="twitter:image"]');
      if (twImage) twImage.setAttribute('content', `${origin}/og-image.jpg`);
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', origin);
    }
  }, []);

  // Test Firebase Firestore connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Pre-selected for booking
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Listen and sync with URL routes (/admin, /staff, ?admin=true, ?staff=true, #admin, etc.)
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      const isAdmin =
        path === '/admin' ||
        path.startsWith('/admin/') ||
        search.includes('admin=true') ||
        search.includes('admin') ||
        hash === '#admin' ||
        hash === '#/admin';

      const isStaff =
        path === '/staff' ||
        path.startsWith('/staff/') ||
        search.includes('staff=true') ||
        search.includes('staff') ||
        hash === '#staff' ||
        hash === '#/staff';

      if (isAdmin || isStaff) {
        setActiveView('admin-dashboard');
      }
    };

    handleUrlRoute();

    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);

    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, []);

  const handleBackToHome = () => {
    setActiveView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('admin');
      url.searchParams.delete('staff');
      let newPath = url.pathname.replace(/\/admin|\/staff/gi, '') || '/';
      if (!newPath.startsWith('/')) newPath = '/' + newPath;
      window.history.pushState(null, '', newPath + (url.search ? url.search : ''));
    } catch {
      // ignore
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenBooking = (treatment?: Treatment, therapist?: Therapist) => {
    setSelectedTreatment(treatment || null);
    setSelectedTherapist(therapist || null);
    setIsBookingOpen(true);
  };

  const handleAddToCart = (treatment: Treatment) => {
    addItem({
      id: treatment.id,
      name: treatment.name,
      price: treatment.price,
      duration: treatment.duration,
      image: treatment.imageUrl,
    });
    showToast(`Added "${treatment.name}" to cart`);
  };

  const handleBookingSubmit = async (formData: BookingFormData) => {
    const newBooking = await bookingService.createBooking(formData);
    setIsBookingOpen(false);
    setConfirmedBooking(newBooking);
    clearCart();
    showToast('Your booking was successfully placed!');
  };

  const handleCheckoutFromCart = async () => {
    if (cart.items.length > 0) {
      const firstItem = cart.items[0];
      const allTreatments = await treatmentService.getAll();
      const match = allTreatments.find((t) => t.id === firstItem.id);
      handleOpenBooking(match || undefined);
    } else {
      handleOpenBooking(selectedTreatment || undefined);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative selection:bg-[#e8b4b8] selection:text-[#1a1418]">
      
      {/* Google Maps Platform Quota Defense Banner (Case A) */}
      {isQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[10002] bg-[#1a1418] text-white px-5 py-2.5 rounded-full shadow-2xl border border-[#e8b4b8] text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <span className="w-2 h-2 rounded-full bg-[#28a745]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Primary Views */}
      {activeView === 'client-dashboard' ? (
        <ClientDashboard
          onBackToHome={handleBackToHome}
          onBookNewSession={() => handleOpenBooking()}
        />
      ) : activeView === 'admin-dashboard' ? (
        role === 'admin' || role === 'receptionist' ? (
          <AdminDashboard
            onBackToHome={handleBackToHome}
          />
        ) : (
          <AdminLogin
            onSuccess={() => {
              showToast('Signed in to Sanctuary Management Portal');
            }}
            onBackToHome={handleBackToHome}
          />
        )
      ) : (
        /* Home View */
        <>
          {/* Floating Navbar (Photo 1 design with active view indicator & controls) */}
          <Navbar
            onOpenBooking={() => handleOpenBooking()}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenVoucher={() => setIsVoucherOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            activeView={activeView}
            setActiveView={(view) => setActiveView(view)}
          />

          <main>
            {/* Hero Section (Photo 2 Bento-grid layout & typography) */}
            <Hero
              onOpenBooking={() => handleOpenBooking()}
              onExploreServices={() => {
                const el = document.getElementById('services');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenVoucher={() => setIsVoucherOpen(true)}
            />

            {/* Special Offer Banner (Photo 1 Top Banner: 30% Off + Countdown) */}
            <SpecialOfferBanner
              onClaimOffer={() => {
                handleOpenBooking();
                showToast('Spring Special code "LUXURY30" applied to booking');
              }}
            />

            {/* What We Offer (Photo 2 treatments grid with Categories & Prices) */}
            <WhatWeOffer
              onBookNow={(treatment: Treatment) => handleOpenBooking(treatment)}
              onAddToCart={handleAddToCart}
            />

            {/* Monthly Special Membership (Photo 1 Card + PDF spec) */}
            <MonthlySpecial
              onJoinMembership={() => {
                showToast('Welcome to Lusentic Wellness Club! Priority credits added.');
              }}
              onOpenAdminSettings={() => setActiveView('admin-dashboard')}
            />

            {/* Call to Action Banner (Photo 2 Bottom Banner) */}
            <CallToActionBanner
              onOpenBooking={() => handleOpenBooking()}
            />

            {/* Sanctuary Gallery with Interactive Lightbox Modal */}
            <GallerySection />

            {/* Meet Our Master Therapists */}
            <TeamSection
              onBookWithTherapist={(therapist) => handleOpenBooking(undefined, therapist)}
            />

            {/* Guest Testimonials */}
            <TestimonialsSection
              onOpenAdminTestimonials={() => setActiveView('admin-dashboard')}
            />

            {/* Sanctuary Location & Google Maps Directions (Coordinates: 26.170776, 26.166044) */}
            <LocationDirectionsSection settings={siteSettings} />

            {/* Articles & Health Corner */}
            <ArticlesSection />
          </main>

          {/* Footer */}
          <Footer
            onOpenBooking={() => handleOpenBooking()}
            onOpenVoucher={() => setIsVoucherOpen(true)}
          />

          {/* Floating Cart Button (PDF spec: bottom-right circular button) */}
          <FloatingCart />
        </>
      )}

      {/* Slide-out Cart Drawer */}
      <CartPanel
        onCheckout={handleCheckoutFromCart}
        onBrowseTreatments={() => {
          const el = document.getElementById('services');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 4-Step Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        preSelectedTreatment={selectedTreatment}
        preSelectedTherapist={selectedTherapist}
        onSubmitBooking={handleBookingSubmit}
      />

      {/* Success Modal with Monospace Code & WhatsApp trigger */}
      <SuccessModal
        booking={confirmedBooking}
        onClose={() => setConfirmedBooking(null)}
        onViewDashboard={() => {
          setConfirmedBooking(null);
          setActiveView('client-dashboard');
        }}
      />

      {/* Live Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTreatment={(treatment) => handleOpenBooking(treatment)}
        onAddToCart={handleAddToCart}
      />

      {/* Luxury Digital Gift Voucher Generator Modal */}
      <GiftVoucherModal
        isOpen={isVoucherOpen}
        onClose={() => setIsVoucherOpen(false)}
        onAddVoucherToCart={(amount: number, name: string) => {
          addItem({
            id: 9999 + Math.floor(Math.random() * 1000),
            name: `Gift Voucher for ${name}`,
            price: amount,
            duration: 0,
            image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80',
          });
          showToast(`Digital Voucher of R${amount} added to cart`);
        }}
      />

      {/* User Login & Role Switching Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccessRole={(userRole) => {
          if (userRole === 'admin' || userRole === 'receptionist') {
            setActiveView('admin-dashboard');
          } else {
            setActiveView('client-dashboard');
          }
        }}
      />

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <MainAppContent />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
