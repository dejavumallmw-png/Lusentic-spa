import React from 'react';
import { Calendar, Clock, Award, ArrowRight } from 'lucide-react';
import { Button } from '../atoms/Button';

interface CallToActionBannerProps {
  onOpenBooking: () => void;
}

export const CallToActionBanner: React.FC<CallToActionBannerProps> = ({ onOpenBooking }) => {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-[#17241e] via-[#1c2d25] to-[#121c17] text-white p-8 sm:p-10 lg:p-12 shadow-2xl border border-emerald-900/40">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Visual thumb */}
            <div className="lg:col-span-3 flex justify-center lg:justify-start">
              <div className="w-40 h-28 sm:w-48 sm:h-32 rounded-2xl overflow-hidden border border-white/20 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80"
                  alt="Spa Towel and Oils"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Headline and text */}
            <div className="lg:col-span-5 text-center lg:text-left">
              <h3 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-white mb-2 leading-tight">
                Ready to Relax <br />
                <span className="italic text-[#e8b4b8]">Your Body &amp; Mind?</span>
              </h3>
              <p className="text-xs sm:text-sm text-white/70 max-w-md">
                Book your appointment today and embark on an unforgettable restorative journey.
              </p>
            </div>

            {/* Value perks and CTA button */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 items-center lg:items-end justify-center">
              <div className="flex items-center gap-6 text-xs text-white/80">
                <div className="flex flex-col items-center gap-1 text-center">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#e8b4b8]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span>Easy Booking</span>
                </div>

                <div className="flex flex-col items-center gap-1 text-center">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#e8b4b8]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>Flexible Hours</span>
                </div>

                <div className="flex flex-col items-center gap-1 text-center">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#e8b4b8]">
                    <Award className="w-4 h-4" />
                  </div>
                  <span>Best Luxury</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={onOpenBooking}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="w-full sm:w-auto shadow-lg hover:scale-105"
              >
                Book Appointment
              </Button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
