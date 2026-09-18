import React, { useState } from 'react';
import { Sparkles, Check, Heart, Shield } from 'lucide-react';
import { Button } from '../atoms/Button';

interface MonthlySpecialProps {
  onJoinMembership?: () => void;
}

export const MonthlySpecial: React.FC<MonthlySpecialProps> = ({ onJoinMembership }) => {
  const [subscribed, setSubscribed] = useState(false);

  const perks = [
    'One 60-Minute Aromatherapy or Swedish Massage every month',
    '20% Member Discount on all additional spa services & packages',
    'Free Hot Stone or Foot Reflexology add-on with every visit',
    'Priority weekend scheduling & VIP quiet suite access',
    'Flexible rollovers: Unused credits never expire while active',
    'Complimentary herbal tea bar & aromatherapy take-home kit',
  ];

  const handleSubscribe = () => {
    setSubscribed(true);
    if (onJoinMembership) onJoinMembership();
  };

  return (
    <section id="about" className="py-16 sm:py-20 bg-gradient-to-b from-transparent via-[var(--bg-light)]/40 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Card */}
        <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#1a1418] via-[#2a1e26] to-[#1a1418] text-white p-8 sm:p-12 lg:p-16 border border-[#e8b4b8]/20 shadow-2xl">
          
          {/* Background Ambient Lights */}
          <div className="absolute top-0 right-10 w-96 h-96 bg-[#e8b4b8]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#d49a9e]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left Column: Membership Offer Box (Photo 1 Style Card) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-[28px] bg-white text-[#1a1418] p-8 shadow-2xl border-4 border-[#e8b4b8]/40 flex flex-col items-center text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#b57377] mb-2">
                  Subscribe &amp; Save
                </span>
                
                <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold leading-tight mb-4">
                  Join Our Monthly <br />
                  Membership
                </h3>

                {/* Price Pill */}
                <div className="w-full py-2.5 px-6 rounded-full bg-[#f5edea] text-[#1a1418] mb-5 border border-[#e8b4b8]/50">
                  <span className="text-2xl sm:text-3xl font-extrabold font-serif-luxury text-[#b57377]">
                    R499
                  </span>
                  <span className="text-xs font-semibold text-gray-600"> / Month</span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  Invest in your continuous physical and mental wellness. Cancel anytime with zero lock-in contracts.
                </p>

                {subscribed ? (
                  <div className="w-full py-3 rounded-full bg-[#28a745]/15 border border-[#28a745] text-[#155724] text-xs font-bold flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4 text-[#28a745]" />
                    <span>Membership Activated!</span>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={handleSubscribe}
                    className="shadow-md hover:scale-[1.02]"
                  >
                    Subscribe &amp; Save Now
                  </Button>
                )}

                <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1 justify-center">
                  <Shield className="w-3 h-3 text-[#28a745]" /> Secure auto-billing • Easy 1-click pause
                </p>
              </div>
            </div>

            {/* Right Column: Perks and Description */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#FFD700] text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Lusentic Wellness Club</span>
              </div>

              <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-white mb-6">
                Prioritize Your Health with <br />
                <span className="italic text-[#e8b4b8]">Consistent Monthly Care</span>
              </h2>

              <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-8 max-w-xl">
                True rejuvenation isn't an occasional luxury—it's a sustained discipline. 
                Our membership guarantees you dedicated time every month to decompress, reset muscles, 
                and receive therapist care at our lowest exclusive rates.
              </p>

              {/* Perks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {perks.map((perk, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#e8b4b8] text-[#1a1418] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-sm text-white/90 leading-tight">
                      {perk}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-4 text-xs text-white/60">
                <span className="flex items-center gap-1.5 text-white/90 font-medium">
                  <Heart className="w-4 h-4 text-[#e8b4b8] fill-[#e8b4b8]" /> 420+ Active Club Members
                </span>
                <span>•</span>
                <span>Exclusive invitation to quarterly seasonal retreats</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
