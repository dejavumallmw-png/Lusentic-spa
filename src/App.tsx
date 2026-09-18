import React, { useState } from 'react';
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
import { Footer } from './components/organisms/Footer';

// Dashboard Views
import { ClientDashboard } from './components/organisms/ClientDashboard';
import { AdminDashboard } from './components/organisms/AdminDashboard';

// Floating & Modals
import { FloatingCart } from './components/organisms/FloatingCart';
import { CartPanel } from './components/organisms/CartPanel';
import { BookingModal } from './components/organisms/BookingModal';
import { SuccessModal } from './components/organisms/SuccessModal';
import { SearchModal } from './components/organisms/SearchModal';
import { GiftVoucherModal } from './components/organisms/GiftVoucherModal';

import { Treatment, Therapist, Booking, BookingFormData } from './types';
import { bookingService } from './services/bookingService';

const MainAppContent: React.FC = () => {
  const { role } = useAuth();
  const { addItem, openCart } = useCart();

  // Primary view state
  const [activeView, setActiveView] = useState<'home' | 'client-dashboard' | 'admin-dashboard'>('home');

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Pre-selected for booking
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    showToast('Your booking was successfully placed!');
  };

  const handleCheckoutFromCart = () => {
    handleOpenBooking(selectedTreatment || undefined);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative selection:bg-[#e8b4b8] selection:text-[#1a1418]">
      
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
          onBackToHome={() => setActiveView('home')}
          onBookNewSession={() => handleOpenBooking()}
        />
      ) : activeView === 'admin-dashboard' ? (
        <AdminDashboard
          onBackToHome={() => setActiveView('home')}
        />
      ) : (
        /* Home View */
        <>
          {/* Floating Navbar (Photo 1 design with active view indicator & controls) */}
          <Navbar
            onOpenBooking={() => handleOpenBooking()}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenVoucher={() => setIsVoucherOpen(true)}
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
            <TestimonialsSection />

            {/* Articles & Health Corner */}
            <ArticlesSection />
          </main>

          {/* Footer (Photo 2 & PDF spec with Newsletter, 4 Columns, Inquiry Form) */}
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
        onAddVoucherToCart={(amount, name) => {
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
