import React from 'react';
import { Star } from 'lucide-react';
import { TestimonialCard } from '../molecules/TestimonialCard';
import { INITIAL_TESTIMONIALS } from '../../data/initialData';

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#d49a9e] mb-2 flex items-center justify-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-[#FFD700] text-[#FFD700]" />
            <span>Guest Experiences</span>
          </p>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-[var(--text-primary)] mb-4">
            Words of <span className="italic text-[#d49a9e]">Serenity</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)]">
            Read authentic stories from guests who discovered peace, renewed energy, and relief in our sanctuary.
          </p>
        </div>

        {/* Testimonials Grid (min 250px, gap 25px) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {INITIAL_TESTIMONIALS.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

      </div>
    </section>
  );
};
