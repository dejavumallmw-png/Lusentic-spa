import React from 'react';
import { ArrowRight, Sparkles, Leaf, Award, ShieldCheck, HeartHandshake, Gift } from 'lucide-react';
import { Button } from '../atoms/Button';

interface HeroProps {
  onOpenBooking: () => void;
  onExploreServices: () => void;
  onOpenVoucher?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenBooking,
  onExploreServices,
  onOpenVoucher,
}) => {
  return (
    <section id="hero" className="relative pt-6 pb-16 md:pt-10 md:pb-24 overflow-hidden">
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#e8b4b8]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#d49a9e]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Bento Layout (Photo 2 Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline and Story */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f5edea] dark:bg-[#2d2228] text-[#8c5a5e] dark:text-[#f5dadd] text-xs font-semibold tracking-wider uppercase mb-5">
              <Sparkles className="w-3.5 h-3.5 text-[#d49a9e]" />
              <span>Relax. Renew. Revive.</span>
            </div>

            {/* Main Title (Photo 2 Serif style) */}
            <h1 className="font-serif-luxury text-5xl sm:text-6xl md:text-7xl font-normal text-[var(--text-primary)] tracking-tight leading-[1.05] mb-6">
              Find Your <br />
              <span className="italic font-light text-[#d49a9e]">Inner Peace</span>
            </h1>

            {/* Lotus Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-[1px] bg-[#e8b4b8]" />
              <span className="text-[#d49a9e] text-lg">❀</span>
              <div className="w-12 h-[1px] bg-[#e8b4b8]" />
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-xl leading-relaxed mb-8">
              Experience the perfect blend of luxury and relaxation with our premium
              spa &amp; wellness therapies designed to restore balance to your body, mind, and soul.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                onClick={onOpenBooking}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="shadow-lg hover:shadow-xl"
              >
                Book Appointment
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={onExploreServices}
                className="border-gray-300 dark:border-white/20 text-[var(--text-primary)] hover:border-[#e8b4b8]"
              >
                Explore Services
              </Button>

              <button
                onClick={onOpenVoucher}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full text-sm font-semibold text-[#8c5a5e] dark:text-[#f5dadd] hover:bg-[#e8b4b8]/15 transition-colors cursor-pointer"
              >
                <Gift className="w-4 h-4 text-[#FFD700]" />
                <span>Gift Voucher</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual composition (Photo 2 Style) */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Spa Visual */}
              <div className="relative h-[380px] sm:h-[460px] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white/60 dark:border-white/10 group">
                <img
                  src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80"
                  alt="Luxury Spa Massage and Frangipani Ambiance"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                
                {/* Floating Glass Pill on the image */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/85 dark:bg-[#1a1418]/85 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-lg flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-bold tracking-wider text-[#d49a9e]">Special Welcome</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Complimentary Herbal Tea &amp; Foot Soak</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#e8b4b8] text-[#1a1418] text-xs font-bold whitespace-nowrap">
                    All Sessions
                  </span>
                </div>
              </div>

              {/* Decorative Secondary Glass Badge */}
              <div className="absolute -top-4 -right-4 sm:-right-6 p-4 rounded-2xl bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-md shadow-xl border border-[var(--border-light)] hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f5edea] dark:bg-[#2d2228] flex items-center justify-center text-[#d49a9e]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">Rated 4.9 / 5.0</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Over 1,200+ relaxed guests</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Feature Badges (From Photo 2 NIRVANA SPA: Natural Products, Expert Therapists, Hygiene & Care, Relaxing Environment) */}
        <div className="mt-14 sm:mt-16 pt-8 border-t border-[var(--border-light)] grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs">
            <div className="w-11 h-11 rounded-full bg-[#f5edea] dark:bg-[#2d2228] flex items-center justify-center text-[#d49a9e] shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Natural Products</h4>
              <p className="text-[11px] sm:text-xs text-[var(--text-muted)]">100% Organic &amp; Pure</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs">
            <div className="w-11 h-11 rounded-full bg-[#f5edea] dark:bg-[#2d2228] flex items-center justify-center text-[#d49a9e] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Expert Therapists</h4>
              <p className="text-[11px] sm:text-xs text-[var(--text-muted)]">Well Trained &amp; Certified</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs">
            <div className="w-11 h-11 rounded-full bg-[#f5edea] dark:bg-[#2d2228] flex items-center justify-center text-[#d49a9e] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Hygiene &amp; Care</h4>
              <p className="text-[11px] sm:text-xs text-[var(--text-muted)]">Hospital-Grade Clean</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs">
            <div className="w-11 h-11 rounded-full bg-[#f5edea] dark:bg-[#2d2228] flex items-center justify-center text-[#d49a9e] shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Pure Environment</h4>
              <p className="text-[11px] sm:text-xs text-[var(--text-muted)]">Peaceful, Calm Sanctuary</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
