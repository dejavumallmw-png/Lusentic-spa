import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Heart,
  Smile,
  Footprints,
  Hand,
  Feather,
  Droplets,
  Gem,
  Layers,
  ArrowLeft,
  ArrowRight,
  Clock,
  Sparkle
} from 'lucide-react';
import { Treatment, CategoryInfo } from '../../types';
import { TreatmentCard } from '../molecules/TreatmentCard';
import { Button } from '../atoms/Button';
import { treatmentService } from '../../services/treatmentService';
import { categoryService } from '../../services/categoryService';

interface WhatWeOfferProps {
  treatments?: Treatment[];
  onAddToCart: (treatment: Treatment) => void;
  onBookNow: (treatment: Treatment) => void;
}

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  massage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
  couples: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80',
  facial: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
  pedicure: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80',
  manicure: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
  waxing: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80',
  bodyscrub: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
  addons: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=800&q=80',
};

export const WhatWeOffer: React.FC<WhatWeOfferProps> = ({
  treatments: propTreatments,
  onAddToCart,
  onBookNow,
}) => {
  const [dbTreatments, setDbTreatments] = useState<Treatment[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryInfo[]>([]);
  // null = category boxes grid view (default requested by user); string = viewing treatments for that category
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    // 1. Subscribe to realtime treatment changes across all devices
    const unsubTreatments = treatmentService.subscribe((list) => {
      setDbTreatments(list);
    });

    // 2. Subscribe to realtime category changes
    const unsubCategories = categoryService.subscribe((cats) => {
      setCategoriesList(cats);
    });

    return () => {
      unsubTreatments();
      unsubCategories();
    };
  }, []);

  const allTreatments = propTreatments || dbTreatments;

  const getCategoryIcon = (name: string, className = 'w-4 h-4') => {
    const lower = name.toLowerCase();
    if (lower.includes('massage')) return <Sparkles className={className} />;
    if (lower.includes('couples')) return <Heart className={className} />;
    if (lower.includes('facial')) return <Smile className={className} />;
    if (lower.includes('pedicure')) return <Footprints className={className} />;
    if (lower.includes('manicure')) return <Hand className={className} />;
    if (lower.includes('wax')) return <Feather className={className} />;
    if (lower.includes('scrub') || lower.includes('wrap')) return <Droplets className={className} />;
    if (lower.includes('addon')) return <Gem className={className} />;
    return <Layers className={className} />;
  };

  /**
   * Group all treatments by category label or slug
   */
  const categoryGroups = useMemo(() => {
    const categoryMap = new Map<string, { info?: CategoryInfo; treatments: Treatment[] }>();

    // Seed from known categories
    categoriesList.forEach((cat) => {
      categoryMap.set(cat.label.toLowerCase(), {
        info: cat,
        treatments: [],
      });
    });

    // Bucket treatments into categories
    allTreatments.forEach((treatment) => {
      const catKey = (treatment.category || 'Other Therapies').toLowerCase();
      if (!categoryMap.has(catKey)) {
        categoryMap.set(catKey, {
          info: {
            slug: catKey.replace(/\s+/g, '-'),
            label: treatment.category || 'Other Therapies',
            iconName: 'Sparkles',
            description: 'Specialized holistic wellness and restorative therapies',
          },
          treatments: [],
        });
      }
      categoryMap.get(catKey)!.treatments.push(treatment);
    });

    // Convert map to array with cover images
    const list: {
      key: string;
      label: string;
      slug: string;
      description?: string;
      coverImage: string;
      treatments: Treatment[];
    }[] = [];

    categoryMap.forEach((val, key) => {
      let cover = '';
      for (const pattern of Object.keys(CATEGORY_DEFAULT_IMAGES)) {
        if (key.includes(pattern)) {
          cover = CATEGORY_DEFAULT_IMAGES[pattern];
          break;
        }
      }
      if (!cover && val.treatments.length > 0) {
        cover = val.treatments[0].imageUrl || val.treatments[0].image || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80';
      }
      if (!cover) {
        cover = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80';
      }

      list.push({
        key,
        label: val.info?.label || key,
        slug: val.info?.slug || key.replace(/\s+/g, '-'),
        description: val.info?.description || 'Custom therapeutic care and luxury wellness rituals',
        coverImage: cover,
        treatments: val.treatments,
      });
    });

    return list;
  }, [allTreatments, categoriesList]);

  // Current selected group when viewing category treatments
  const currentGroup = useMemo(() => {
    if (!activeCategory) return null;
    const lower = activeCategory.toLowerCase();
    return categoryGroups.find((g) => g.key === lower || g.label.toLowerCase() === lower || g.slug === lower) || null;
  }, [categoryGroups, activeCategory]);

  const handleSelectCategory = (catLabel: string) => {
    setActiveCategory(catLabel);
    const el = document.getElementById('services');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBackToCategories = () => {
    setActiveCategory(null);
    const el = document.getElementById('services');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="services" className="py-16 sm:py-24 bg-[var(--bg-light)]/60 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* VIEW 1: CATEGORY BOXES GRID (When activeCategory is null) */}
        {/* ========================================================================= */}
        {!activeCategory && (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-xs font-bold uppercase tracking-widest text-[#d49a9e] mb-2">
                Our Services &amp; Therapies
              </p>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-[var(--text-primary)] mb-4">
                Explore Therapies by <span className="italic text-[#d49a9e]">Category</span>
              </h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-[1px] bg-[#e8b4b8]" />
                <span className="text-[#d49a9e] text-xs">❀</span>
                <div className="w-8 h-[1px] bg-[#e8b4b8]" />
              </div>
              <p className="text-sm sm:text-base text-[var(--text-muted)]">
                Select a specialized wellness category below to view our curated treatments, durations, and pricing.
              </p>
            </div>

            {/* Clickable Boxes for Categories */}
            {categoryGroups.length === 0 ? (
              <div className="text-center py-20 bg-[var(--bg-card)] rounded-[32px] border border-[var(--border-light)] p-8 max-w-2xl mx-auto shadow-sm">
                <div className="w-14 h-14 rounded-full bg-[#fcebee] dark:bg-white/10 text-[#b57377] dark:text-[#e8b4b8] flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
                  Curating Treatment Categories
                </h3>
                <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
                  Our wellness sanctuary categories are syncing. Any category or treatment published in the admin dashboard will dynamically appear here in real time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryGroups.map((group) => {
                  const count = group.treatments.length;
                  return (
                    <div
                      key={group.key}
                      onClick={() => handleSelectCategory(group.label)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectCategory(group.label);
                        }
                      }}
                      className="group relative rounded-[28px] overflow-hidden border border-[var(--border-light)] hover:border-[#e8b4b8] bg-[var(--bg-card)] shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[320px] text-left transform hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-[#e8b4b8]"
                    >
                      {/* Background Visual with Luxury Vignette */}
                      <div className="absolute inset-0 z-0 overflow-hidden">
                        <img
                          src={group.coverImage}
                          alt={group.label}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                        />
                        {/* Gradient Shadow Overlay for High Contrast Text */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30 group-hover:from-black/95 group-hover:via-black/60 transition-colors" />
                      </div>

                      {/* Top Badges */}
                      <div className="relative z-10 p-5 flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-sm">
                          {getCategoryIcon(group.label, 'w-5 h-5 text-[#e8b4b8]')}
                        </div>

                        <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#e8b4b8] border border-white/15 shadow-xs">
                          {count} {count === 1 ? 'Therapy' : 'Therapies'}
                        </span>
                      </div>

                      {/* Bottom Info & Action prompt */}
                      <div className="relative z-10 p-5 space-y-2">
                        <h3 className="font-serif-luxury text-2xl font-bold text-white tracking-wide group-hover:text-[#e8b4b8] transition-colors">
                          {group.label}
                        </h3>

                        {group.description && (
                          <p className="text-xs text-white/80 line-clamp-2 leading-relaxed font-normal">
                            {group.description}
                          </p>
                        )}

                        <div className="pt-3 flex items-center justify-between border-t border-white/20 text-xs font-bold text-[#e8b4b8]">
                          <span className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                            View Treatments
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-[10px] uppercase tracking-widest text-white/60">
                            Click to Open
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CATEGORY TREATMENTS VIEW (When a category box was clicked) */}
        {/* ========================================================================= */}
        {activeCategory && currentGroup && (
          <div className="space-y-10 animate-in fade-in duration-300">
            
            {/* Top Navigation Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-light)]">
              <button
                type="button"
                onClick={handleBackToCategories}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-light)] hover:border-[#e8b4b8] text-[var(--text-primary)] hover:text-[#b57377] dark:hover:text-[#e8b4b8] text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer w-fit"
              >
                <ArrowLeft className="w-4 h-4 text-[#d49a9e]" />
                <span>← Back to All Categories</span>
              </button>

              {/* Quick Category Switcher Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar max-w-full">
                <span className="text-xs text-[var(--text-muted)] font-semibold shrink-0 hidden md:inline">
                  Switch Category:
                </span>
                {categoryGroups.map((g) => {
                  const isCurrent = g.key === currentGroup.key;
                  return (
                    <button
                      key={g.key}
                      onClick={() => handleSelectCategory(g.label)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-[#1a1418] text-white dark:bg-[#e8b4b8] dark:text-[#1a1418] shadow-xs'
                          : 'bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)] hover:border-[#e8b4b8]'
                      }`}
                    >
                      {getCategoryIcon(g.label, 'w-3.5 h-3.5')}
                      <span>{g.label}</span>
                      <span className="opacity-60 text-[10px]">({g.treatments.length})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Hero / Header Banner */}
            <div className="relative rounded-[32px] overflow-hidden border border-[var(--border-light)] shadow-lg bg-stone-900 text-white min-h-[160px] sm:min-h-[200px] flex flex-col justify-end p-6 sm:p-10">
              <div className="absolute inset-0 z-0">
                <img
                  src={currentGroup.coverImage}
                  alt={currentGroup.label}
                  className="w-full h-full object-cover opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
              </div>

              <div className="relative z-10 space-y-2 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[#e8b4b8] text-xs font-bold border border-white/20">
                  {getCategoryIcon(currentGroup.label, 'w-3.5 h-3.5 text-[#e8b4b8]')}
                  <span>Selected Treatment Category</span>
                </div>

                <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-wide">
                  {currentGroup.label}
                </h2>

                {currentGroup.description && (
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                    {currentGroup.description}
                  </p>
                )}

                <div className="pt-2 flex items-center gap-3 text-xs text-[#e8b4b8] font-semibold">
                  <span>{currentGroup.treatments.length} Available Therapies</span>
                  <span>•</span>
                  <span>Book with instant therapist concierge</span>
                </div>
              </div>
            </div>

            {/* Treatments Grid for this Category */}
            {currentGroup.treatments.length === 0 ? (
              <div className="text-center py-16 bg-[var(--bg-card)] rounded-[28px] border border-[var(--border-light)] p-8 max-w-md mx-auto space-y-4">
                <Sparkles className="w-8 h-8 text-[#d49a9e] mx-auto" />
                <h4 className="font-serif-luxury text-xl font-bold text-[var(--text-primary)]">
                  Therapies Coming Soon
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  There are no treatments published under "{currentGroup.label}" yet. You can add them in the admin dashboard.
                </p>
                <Button variant="outline" size="sm" onClick={handleBackToCategories}>
                  Browse Other Categories
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentGroup.treatments.map((treatment) => (
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

            {/* Bottom Return Button */}
            <div className="pt-8 text-center border-t border-[var(--border-light)]">
              <Button
                variant="outline"
                size="md"
                onClick={handleBackToCategories}
                icon={<ArrowLeft className="w-4 h-4 text-[#d49a9e]" />}
                className="font-bold text-xs sm:text-sm"
              >
                Return to All Categories Boxes
              </Button>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
