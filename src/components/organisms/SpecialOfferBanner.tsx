import React from 'react';
import { ArrowRight, Star, Sparkles, HeartHandshake, ShieldCheck } from 'lucide-react';
import { Button } from '../atoms/Button';

interface SpecialOfferBannerProps {
  onBookNow?: () => void;
  onClaimOffer?: () => void;
}

export const SpecialOfferBanner: React.FC<SpecialOfferBannerProps> = ({ onBookNow, onClaimOffer }) => {
  const handleAction = () => {
    if (onClaimOffer) onClaimOffer();
    else if (onBookNow) onBookNow();
  };
  return (
    <section id="special-offer" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Block: Dark Luxury "Self Care Isn't Selfish" 20% OFF card (Photo 2) */}
          <div className="lg:col-span-5 relative rounded-[28px] overflow-hidden bg-gradient-to-br from-[#1a1418] via-[#241a20] to-[#120e10] text-white p-7 sm:p-9 flex flex-col justify-between shadow-xl border border-white/10 group">
            {/* Ambient gold glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#e8b4b8]/15 rounded-full blur-2xl pointer-events-none" />

            {/* Circular 20% OFF Badge */}
            <div className="absolute top-6 right-6 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#d49a9e] text-[#1a1418] font-bold flex flex-col items-center justify-center shadow-lg border-2 border-white/40 transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
              <span className="text-base sm:text-xl font-extrabold leading-none">20%</span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold">OFF</span>
            </div>

            <div>
              <p className="text-xs uppercase font-bold tracking-widest text-[#e8b4b8] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Special Introductory Offer</span>
              </p>
              <h3 className="font-serif-luxury text-3xl sm:text-4xl font-normal leading-tight mb-4">
                Self Care <br />
                <span className="italic text-[#e8b4b8]">Isn't Selfish</span>
              </h3>
              <p className="text-sm text-white/80 max-w-xs leading-relaxed mb-6">
                Receive 20% discount on your first spa journey. Treat yourself to our signature essential oil massages and hydro facials.
              </p>
            </div>

            {/* Visual spa products peek */}
            <div className="relative mb-6 rounded-2xl overflow-hidden h-36 border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80"
                alt="Organic Spa Oils and Towels"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-3 text-xs text-white/90 font-medium">
                Botanical Aromatics &amp; Warm Stones
              </div>
            </div>

            <div>
              <Button
                variant="primary"
                size="md"
                onClick={handleAction}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="w-full sm:w-auto text-sm font-bold"
              >
                Book Now &amp; Save 20%
              </Button>
            </div>
          </div>

          {/* Center Block: Why Choose Us (Photo 2) */}
          <div className="lg:col-span-4 rounded-[28px] bg-[var(--bg-card)] p-7 sm:p-9 border border-[var(--border-light)] shadow-[var(--shadow)] flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#d49a9e] mb-2">
                Why Choose Us
              </p>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl font-normal text-[var(--text-primary)] mb-6">
                A Haven Designed For True Restoration
              </h3>

              <div className="space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#f5edea] dark:bg-[#2d2228] text-[#d49a9e] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-black dark:text-white">Luxury &amp; Comfort</h4>
                    <p className="text-xs text-black dark:text-stone-300 font-bold dark:font-medium leading-relaxed">
                      Experience 5-star comfort, heated organic treatment tables, and soundproof private suites.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#f5edea] dark:bg-[#2d2228] text-[#d49a9e] flex items-center justify-center shrink-0 mt-0.5">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-black dark:text-white">Personalized Care</h4>
                    <p className="text-xs text-black dark:text-stone-300 font-bold dark:font-medium leading-relaxed">
                      Every pressure, essential oil blend, and temperature is adjusted specifically for you.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#f5edea] dark:bg-[#2d2228] text-[#d49a9e] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-black dark:text-white">Certified Natural</h4>
                    <p className="text-xs text-black dark:text-stone-300 font-bold dark:font-medium leading-relaxed">
                      Cruelty-free, vegan organic formulas free of artificial preservatives, parabens, and perfumes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border-light)] mt-6 flex items-center justify-between text-xs text-stone-600 dark:text-stone-300 font-medium">
              <span>Open 7 Days a Week</span>
              <span className="font-semibold text-[#28a745]">● Now Accepting Bookings</span>
            </div>
          </div>

          {/* Right Block: Featured Guest Review Card (Photo 2) */}
          <div className="lg:col-span-3 rounded-[28px] bg-white dark:bg-[#241a20] p-7 sm:p-8 border-2 border-[#e8b4b8] shadow-lg flex flex-col justify-between">
            <div>
              <span className="text-4xl text-[#d49a9e] font-serif leading-none block mb-2">“</span>
              <p className="text-sm sm:text-base text-stone-900 dark:text-stone-100 font-medium italic leading-relaxed mb-6">
                The best spa experience I've ever had. The therapists are remarkably intuitive, the ambience is peaceful, and I left feeling completely recharged.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1 text-[#FFD700] mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#FFD700]" />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
                  alt="Priya S."
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#e8b4b8]"
                />
                <div>
                  <h5 className="text-sm font-bold text-stone-900 dark:text-white">Priya S.</h5>
                  <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">Verified Regular Guest</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
