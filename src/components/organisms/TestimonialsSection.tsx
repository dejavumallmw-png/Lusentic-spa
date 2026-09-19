import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus } from 'lucide-react';
import { TestimonialCard } from '../molecules/TestimonialCard';
import { testimonialService } from '../../services/testimonialService';
import { Testimonial } from '../../types';

interface TestimonialsSectionProps {
  onOpenClientReview?: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ onOpenClientReview }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await testimonialService.getAll();
      setTestimonials(data);
    };
    load();

    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-stone-50/50 dark:bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#b57377] dark:text-[#d49a9e] mb-2 flex items-center justify-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-[#FFD700] text-[#FFD700]" />
            <span>Verified Guest Experiences</span>
          </p>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-gray-900 dark:text-white mb-4">
            Words of <span className="italic text-[#b57377] dark:text-[#d49a9e]">Serenity</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-white/70">
            Real experiences and reviews shared by our guests after experiencing our restorative treatments.
          </p>
        </div>

        {/* Testimonials Grid (min 250px, gap 25px) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

      </div>
    </section>
  );
};
