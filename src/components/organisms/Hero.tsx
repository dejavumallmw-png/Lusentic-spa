import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Leaf, Award, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Button } from '../atoms/Button';
import { SparkleEmblem } from '../atoms/SparkleEmblem';
import { SiteSettings } from '../../types';
import { settingsService } from '../../services/settingsService';

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
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(settingsService.getSettings());

  useEffect(() => {
    const unsub = settingsService.subscribe((updated) => {
      setSiteSettings(updated);
    });
    return () => unsub();
  }, []);

  return (
    <section id="hero" className="relative pt-6 pb-16 md:pt-10 md:pb-24 overflow-hidden">
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#e8b4b8]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#d49a9e]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Sample Presentation Section (Directly from sampl.png) */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto pb-10 sm:pb-12">
          {/* Logo Emblem & Brand Title */}
          <div className="flex flex-col items-center justify-center mb-6 select-none">
            <SparkleEmblem size="lg" customLogo={siteSettings.logoUrl} className="mb-3" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-stone-900 dark:text-white flex items-baseline justify-center gap-2 font-serif-luxury">
              <span>{siteSettings.brandName || 'Lusentic'}</span>
              <span className="font-light italic text-[#b57377] dark:text-[#e8b4b8]">
                {siteSettings.brandSuffix || 'Spa'}
              </span>
            </h1>
          </div>

          {/* 1. Pill container from sampl.png */}
          <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full border-2 border-black dark:border-[#e8b4b8] bg-[var(--bg-card)] text-black dark:text-white text-sm sm:text-base font-extrabold tracking-wide uppercase shadow-sm mb-5">
            <Sparkles className="w-4 h-4 text-[#d49a9e]" />
            <span className="text-black dark:text-white text-contrast-mode">Relax. Renew. Revive.</span>
          </div>

          {/* 2. Divider with Star from sampl.png */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 w-full max-w-xs">
            <div className="flex-1 h-[3px] bg-black dark:bg-[#e8b4b8]" />
            <span className="text-xl sm:text-2xl text-black dark:text-[#e8b4b8] text-contrast-mode leading-none">★</span>
            <div className="flex-1 h-[3px] bg-black dark:bg-[#e8b4b8]" />
          </div>

          {/* 3. Description text from sampl.png (Pure crisp black in light mode, white in dark mode) */}
          <p className="text-base sm:text-lg md:text-xl font-bold text-black dark:text-white text-contrast-mode leading-relaxed max-w-2xl mx-auto mb-8 px-2">
            Experience the perfect blend of luxury and relaxation with our premium
            spa &amp; wellness therapies designed to restore balance to your body, mind, and soul.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 w-full">
            <Button
              variant="primary"
              size="lg"
              onClick={onOpenBooking}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="shadow-lg hover:shadow-xl px-8 py-3.5 font-bold text-sm sm:text-base"
            >
              Book Appointment
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onExploreServices}
              className="border-stone-800 dark:border-white/30 text-stone-900 dark:text-white hover:border-[#e8b4b8] px-7 py-3.5 font-bold text-sm sm:text-base"
            >
              Explore Services
            </Button>
          </div>
        </div>

        {/* Hero Visual Composition */}
        <div className="relative mx-auto max-w-4xl">
          <div className="relative h-[320px] sm:h-[420px] md:h-[480px] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white/60 dark:border-white/10 group">
            <img
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1400&q=80"
              alt="Luxury Spa Massage and Frangipani Ambiance"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
            
            {/* Floating Glass Pill on the image */}
            <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-black/80 dark:bg-[#1a1418]/90 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase font-extrabold tracking-wider text-[#e8b4b8] dark:text-[#d49a9e]">Special Welcome</p>
                <p className="text-sm font-extrabold text-white">Complimentary Herbal Tea &amp; Foot Soak with Every Session</p>
              </div>
              <span className="px-3.5 py-1 rounded-full bg-[#e8b4b8] text-[#1a1418] text-xs font-bold whitespace-nowrap">
                All Guests
              </span>
            </div>
          </div>

          {/* Decorative Secondary Glass Badge */}
          <div className="absolute -top-4 -right-2 sm:-right-4 p-4 rounded-2xl bg-black/85 dark:bg-[#1e1e1e]/95 backdrop-blur-md shadow-xl border border-white/15 hidden sm:flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#e8b4b8]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-white">Rated 4.9 / 5.0</p>
              <p className="text-[11px] font-bold text-white/90">Over 1,200+ relaxed guests</p>
            </div>
          </div>
        </div>

        {/* 4 Feature Badges (Natural Products, Expert Therapists, Hygiene & Care, Pure Environment) */}
        <div className="mt-14 sm:mt-16 pt-8 border-t border-[var(--border-light)] grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs">
            <div className="w-11 h-11 rounded-full bg-[#f5edea] dark:bg-[#2d2228] flex items-center justify-center text-[#d49a9e] shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-black dark:text-white">Natural Products</h4>
              <p className="text-[11px] sm:text-xs text-black dark:text-stone-300 font-bold dark:font-medium">100% Organic &amp; Pure</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs">
            <div className="w-11 h-11 rounded-full bg-[#f5edea] dark:bg-[#2d2228] flex items-center justify-center text-[#d49a9e] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-black dark:text-white">Expert Therapists</h4>
              <p className="text-[11px] sm:text-xs text-black dark:text-stone-300 font-bold dark:font-medium">Well Trained &amp; Certified</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs">
            <div className="w-11 h-11 rounded-full bg-[#f5edea] dark:bg-[#2d2228] flex items-center justify-center text-[#d49a9e] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-black dark:text-white">Hygiene &amp; Care</h4>
              <p className="text-[11px] sm:text-xs text-black dark:text-stone-300 font-bold dark:font-medium">Hospital-Grade Clean</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs">
            <div className="w-11 h-11 rounded-full bg-[#f5edea] dark:bg-[#2d2228] flex items-center justify-center text-[#d49a9e] shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-black dark:text-white">Pure Environment</h4>
              <p className="text-[11px] sm:text-xs text-black dark:text-stone-300 font-bold dark:font-medium">Peaceful, Calm Sanctuary</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
