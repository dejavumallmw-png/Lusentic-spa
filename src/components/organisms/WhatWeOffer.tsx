import React, { useState, useMemo } from 'react';
import { Sparkles, Heart, Smile, Footprints, Hand, Feather, Droplets, Gem, Layers } from 'lucide-react';
import { Treatment, TreatmentCategory } from '../../types';
import { TreatmentCard } from '../molecules/TreatmentCard';
import { INITIAL_CATEGORIES, INITIAL_TREATMENTS } from '../../data/initialData';

interface WhatWeOfferProps {
  treatments?: Treatment[];
  onAddToCart: (treatment: Treatment) => void;
  onBookNow: (treatment: Treatment) => void;
}

export const WhatWeOffer: React.FC<WhatWeOfferProps> = ({
  treatments = INITIAL_TREATMENTS,
  onAddToCart,
  onBookNow,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TreatmentCategory | 'all'>('all');

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'massage':
        return <Sparkles className="w-4 h-4" />;
      case 'couples':
        return <Heart className="w-4 h-4" />;
      case 'facial':
        return <Smile className="w-4 h-4" />;
      case 'pedicure':
        return <Footprints className="w-4 h-4" />;
      case 'manicure':
        return <Hand className="w-4 h-4" />;
      case 'waxing':
        return <Feather className="w-4 h-4" />;
      case 'bodyscrub':
        return <Droplets className="w-4 h-4" />;
      case 'addons':
        return <Gem className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const filteredTreatments = useMemo(() => {
    if (selectedCategory === 'all') return treatments;
    return treatments.filter((t) => t.category === selectedCategory);
  }, [treatments, selectedCategory]);

  return (
    <section id="services" className="py-16 sm:py-24 bg-[var(--bg-light)]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Photo 2 "Our Premium Spa Therapies") */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#d49a9e] mb-2">
            Our Services &amp; Therapies
          </p>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-[var(--text-primary)] mb-4">
            Our Premium <span className="italic text-[#d49a9e]">Spa Therapies</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-[1px] bg-[#e8b4b8]" />
            <span className="text-[#d49a9e] text-xs">❀</span>
            <div className="w-8 h-[1px] bg-[#e8b4b8]" />
          </div>
          <p className="text-sm sm:text-base text-[var(--text-muted)]">
            Rejuvenate your senses with our curated range of luxury holistic spa and wellness therapies.
          </p>
        </div>

        {/* Category Filter Pills (Photo 2 style + PDF 8 categories) */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-[#1a1418] text-white dark:bg-[#e8b4b8] dark:text-[#1a1418] shadow-md scale-105'
                : 'bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)] hover:border-[#e8b4b8]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Therapies ({treatments.length})</span>
          </button>

          {INITIAL_CATEGORIES.map((cat) => {
            const count = treatments.filter((t) => t.category === cat.slug).length;
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#e8b4b8] text-[#1a1418] shadow-md scale-105 font-bold'
                    : 'bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)] hover:border-[#e8b4b8]'
                }`}
              >
                {getCategoryIcon(cat.slug)}
                <span>{cat.label}</span>
                <span className="opacity-60 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Grid of Treatment Cards */}
        {filteredTreatments.length === 0 ? (
          <div className="text-center py-16 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-light)]">
            <p className="text-[var(--text-muted)] text-base">No treatments found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTreatments.map((treatment) => (
              <TreatmentCard
                key={treatment.id}
                treatment={treatment}
                onAddToCart={onAddToCart}
                onBookNow={onBookNow}
                featured={treatment.isMonthlySpecial}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
