import React from 'react';
import { Sparkles, Clock, Plus, Calendar } from 'lucide-react';
import { Treatment } from '../../types';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';

interface TreatmentCardProps {
  treatment: Treatment;
  onAddToCart?: (treatment: Treatment) => void;
  onBookNow?: (treatment: Treatment) => void;
  featured?: boolean;
}

export const TreatmentCard: React.FC<TreatmentCardProps> = ({
  treatment,
  onAddToCart,
  onBookNow,
  featured = false,
}) => {
  return (
    <div
      className={`group relative flex flex-col justify-between bg-[var(--bg-card)] rounded-[20px] p-4 sm:p-5 border border-[var(--border-light)] shadow-[var(--shadow)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1.5 ${
        featured ? 'ring-1 ring-[#e8b4b8]' : ''
      }`}
    >
      <div>
        {/* Treatment Image */}
        <div className="relative w-full h-[180px] sm:h-[200px] rounded-[16px] overflow-hidden bg-black/5 mb-4">
          {treatment.imageUrl ? (
            <img
              src={treatment.imageUrl}
              alt={treatment.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#f5edea] dark:bg-[#2d2228] text-[#d49a9e]">
              <Sparkles className="w-10 h-10" />
            </div>
          )}

          {/* Badges on image */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <Badge variant="category" className="bg-white/90 dark:bg-black/70 backdrop-blur-md">
              {treatment.category}
            </Badge>
            {treatment.isMonthlySpecial && (
              <Badge variant="gold" className="bg-[#fff8db]/95 backdrop-blur-md shadow-xs">
                ★ Special
              </Badge>
            )}
          </div>

          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#e8b4b8]" />
            <span>{treatment.duration} min</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-serif-luxury text-xl font-medium text-[var(--text-primary)] leading-snug line-clamp-2">
            {treatment.name}
          </h3>
          <span className="font-bold text-lg text-[#d49a9e] whitespace-nowrap">
            R{treatment.price}
          </span>
        </div>

        {treatment.description && (
          <p className="text-xs sm:text-sm text-black dark:text-stone-300 line-clamp-2 mb-4 leading-relaxed font-bold dark:font-medium">
            {treatment.description}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-[var(--border-light)] flex items-center gap-2 mt-auto">
        {onBookNow && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            icon={<Calendar className="w-3.5 h-3.5" />}
            onClick={() => onBookNow(treatment)}
          >
            Book Now
          </Button>
        )}
        {onAddToCart && (
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 dark:border-white/20 hover:border-[#e8b4b8] hover:text-[#d49a9e]"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => onAddToCart(treatment)}
            title="Add to Cart"
          >
            Add
          </Button>
        )}
      </div>
    </div>
  );
};
