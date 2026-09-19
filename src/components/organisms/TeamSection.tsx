import React, { useState, useEffect } from 'react';
import { Therapist } from '../../types';
import { TeamCard } from '../molecules/TeamCard';
import { therapistService } from '../../services/therapistService';

interface TeamSectionProps {
  onBookWithTherapist: (therapist: Therapist) => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({ onBookWithTherapist }) => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await therapistService.getAll();
      setTherapists(data);
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="team" className="py-16 sm:py-24 bg-[var(--bg-light)]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[#d49a9e] mb-2">
            Certified Practitioners
          </p>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-[var(--text-primary)] mb-4">
            Meet Our <span className="italic text-[#d49a9e]">Master Therapists</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-[1px] bg-[#e8b4b8]" />
            <span className="text-[#d49a9e] text-xs">❀</span>
            <div className="w-8 h-[1px] bg-[#e8b4b8]" />
          </div>
          <p className="text-sm sm:text-base text-[var(--text-muted)]">
            Our licensed estheticians and bodywork therapists combine anatomical expertise with intuitive, deeply caring restorative touch.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {therapists.map((therapist) => (
            <TeamCard
              key={therapist.id}
              therapist={therapist}
              onBookWithTherapist={onBookWithTherapist}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
