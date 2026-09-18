import React from 'react';
import { Star, Calendar } from 'lucide-react';
import { Therapist } from '../../types';
import { Button } from '../atoms/Button';

interface TeamCardProps {
  therapist: Therapist;
  onBookWithTherapist?: (therapist: Therapist) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ therapist, onBookWithTherapist }) => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-[var(--bg-card)] rounded-[20px] border border-[var(--border-light)] shadow-[var(--shadow)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1">
      {/* Avatar with 3px Dust Pink border */}
      <div className="relative mb-4">
        <img
          src={therapist.avatar}
          alt={therapist.name}
          className="w-[140px] h-[140px] sm:w-[150px] sm:h-[150px] rounded-full object-cover border-[3px] border-[#e8b4b8] shadow-md"
        />
        <div className="absolute bottom-1 right-2 bg-white dark:bg-[#1a1418] px-2.5 py-0.5 rounded-full border border-[#e8b4b8] flex items-center gap-1 text-xs font-bold text-[#b57377]">
          <Star className="w-3 h-3 fill-[#FFD700] text-[#FFD700]" />
          <span>{therapist.rating.toFixed(1)}</span>
        </div>
      </div>

      <h3 className="text-lg sm:text-[19.2px] font-semibold text-[var(--text-primary)] mb-1">
        {therapist.name}
      </h3>

      <p className="text-sm font-semibold text-[#d49a9e] mb-3">
        {therapist.role}
      </p>

      <p className="text-xs sm:text-[13.6px] text-[var(--text-muted)] line-clamp-3 mb-4 leading-relaxed">
        {therapist.bio}
      </p>

      {/* Specialties */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-5">
        {therapist.specialties.map((spec) => (
          <span
            key={spec}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#f5edea] dark:bg-[#2d2228] text-[#8c5a5e] dark:text-[#f5dadd]"
          >
            {spec}
          </span>
        ))}
      </div>

      {onBookWithTherapist && (
        <Button
          variant="outline"
          size="sm"
          className="w-full border-[#e8b4b8] text-[#b57377] hover:bg-[#e8b4b8] hover:text-[#1a1418]"
          icon={<Calendar className="w-3.5 h-3.5" />}
          onClick={() => onBookWithTherapist(therapist)}
        >
          Book With {therapist.name.split(' ')[0]}
        </Button>
      )}
    </div>
  );
};
