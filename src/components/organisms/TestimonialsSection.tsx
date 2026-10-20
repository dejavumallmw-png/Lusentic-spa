import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, Plus, ShieldCheck } from 'lucide-react';
import { TestimonialCard } from '../molecules/TestimonialCard';
import { testimonialService } from '../../services/testimonialService';
import { Testimonial } from '../../types';
import { useAuth } from '../../app/providers/AuthProvider';

interface TestimonialsSectionProps {
  onOpenClientReview?: () => void;
  onOpenAdminTestimonials?: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  onOpenClientReview,
  onOpenAdminTestimonials,
}) => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    // Subscribe to real-time testimonials updates from Firestore
    const unsub = testimonialService.subscribe((data) => {
      setTestimonials(data);
    });
    return () => unsub();
  }, []);

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-stone-50/50 dark:bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#b57377] dark:text-[#d49a9e] mb-2 flex items-center justify-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-[#FFD700] text-[#FFD700]" />
            <span>Verified Guest Experiences</span>
            {isAdmin && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-[#d49a9e]/15 text-[#d49a9e] text-[10px] font-bold border border-[#d49a9e]/30">
                Admin Dynamic Mode
              </span>
            )}
          </p>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-gray-900 dark:text-white mb-4">
            Words of <span className="italic text-[#b57377] dark:text-[#d49a9e]">Serenity</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-white/70">
            Real experiences and reviews shared by our guests after experiencing our restorative treatments.
          </p>
        </div>

        {/* Admin Quick Action Bar */}
        {isAdmin && onOpenAdminTestimonials && (
          <div className="mb-8 max-w-xl mx-auto p-3.5 rounded-2xl bg-stone-100/80 dark:bg-white/5 border border-[#e8b4b8] shadow-xs flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[var(--text-primary)]">
              <ShieldCheck className="w-4 h-4 text-[#d49a9e]" />
              <span><strong>Admin Controls:</strong> Add, edit, or delete any testimonials</span>
            </div>
            <button
              type="button"
              onClick={onOpenAdminTestimonials}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e8b4b8] hover:bg-[#d49a9e] text-[#1a1418] font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manage Testimonials</span>
            </button>
          </div>
        )}

        {/* Testimonials Grid or Dynamic Empty State */}
        {testimonials.length === 0 ? (
          <div className="max-w-xl mx-auto p-8 sm:p-10 rounded-[28px] bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#fcebee] dark:bg-white/10 text-[#b57377] dark:text-[#e8b4b8] flex items-center justify-center mx-auto mb-4">
              <MessageSquarePlus className="w-7 h-7" />
            </div>
            <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mb-2">
              Be the First to Share Your Journey
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-white/70 mb-6 leading-relaxed">
              Words of serenity will appear here once verified guests share their restorative visits. Completed a session recently? Sign in to your Client Dashboard to upload your photo and post your review!
            </p>
            <div className="flex items-center justify-center gap-3">
              {onOpenClientReview && (
                <button
                  onClick={onOpenClientReview}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#b57377] to-[#d49a9e] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-white text-white" />
                  <span>Share Your Experience</span>
                </button>
              )}
              {isAdmin && onOpenAdminTestimonials && (
                <button
                  onClick={onOpenAdminTestimonials}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1a1418] text-[#e8b4b8] border border-[#e8b4b8]/40 text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Testimonial</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
