import React, { useState } from 'react';
import { Star, ChevronDown, CheckCircle } from 'lucide-react';
import { Testimonial } from '../../types';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = testimonial.content.length > 120;
  const displayedContent = expanded || !isLong
    ? testimonial.content
    : testimonial.content.slice(0, 120) + '...';

  return (
    <div
      onClick={() => isLong && setExpanded((prev) => !prev)}
      className={`p-6 bg-white dark:bg-[#241c21] rounded-[24px] border border-[#e5d5d8] dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-300 hover:shadow-lg ${
        isLong ? 'cursor-pointer hover:border-[#d49a9e]' : ''
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        {testimonial.avatar ? (
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-11 h-11 rounded-full object-cover border-2 border-[#d49a9e] shadow-xs"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#d49a9e] to-[#e8b4b8] text-[#1a1418] font-bold flex items-center justify-center text-sm shadow-xs">
            {testimonial.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
              {testimonial.name}
            </h4>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
              <CheckCircle className="w-2.5 h-2.5" />
              Verified Guest
            </span>
          </div>
          <p className="text-xs font-medium text-gray-600 dark:text-white/70 truncate mt-0.5">
            <span className="text-[#b57377] dark:text-[#e8b4b8] font-semibold">{testimonial.treatment}</span> • {testimonial.date}
          </p>
        </div>
      </div>

      {/* Gold Stars */}
      <div className="flex items-center gap-1 mb-3 text-[#FFD700]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < testimonial.stars ? 'fill-[#FFD700] text-[#FFD700]' : 'text-gray-300 dark:text-gray-600'}`}
          />
        ))}
        <span className="text-xs font-bold text-gray-700 dark:text-white/80 ml-1">
          {testimonial.stars}.0
        </span>
      </div>

      <p className="text-sm text-stone-900 dark:text-stone-100 leading-relaxed italic font-medium">
        "{displayedContent}"
      </p>

      {isLong && (
        <button
          type="button"
          className="mt-3 text-xs font-bold text-[#b57377] dark:text-[#e8b4b8] inline-flex items-center gap-1 hover:underline cursor-pointer"
        >
          {expanded ? 'Show Less' : 'Read Full Review'}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
};
