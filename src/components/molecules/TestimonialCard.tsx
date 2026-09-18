import React, { useState } from 'react';
import { Star, ChevronDown } from 'lucide-react';
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
      className={`p-6 bg-[var(--bg-card)] rounded-[20px] border border-[var(--border-light)] shadow-[var(--shadow)] transition-all duration-300 ${
        isLong ? 'cursor-pointer hover:border-[#e8b4b8]' : ''
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        {testimonial.avatar ? (
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#e8b4b8]"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#e8b4b8] text-[#1a1418] font-bold flex items-center justify-center text-sm">
            {testimonial.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-[var(--text-primary)] truncate">
            {testimonial.name}
          </h4>
          <p className="text-xs text-[var(--text-muted)] truncate">
            {testimonial.treatment} • {testimonial.date}
          </p>
        </div>
      </div>

      {/* Gold Stars */}
      <div className="flex items-center gap-1 mb-3 text-[#FFD700]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < testimonial.stars ? 'fill-[#FFD700]' : 'text-gray-300'}`}
          />
        ))}
      </div>

      <p className="text-sm text-[var(--text-muted)] leading-relaxed italic">
        "{displayedContent}"
      </p>

      {isLong && (
        <button
          type="button"
          className="mt-2 text-xs font-semibold text-[#d49a9e] inline-flex items-center gap-1 hover:underline cursor-pointer"
        >
          {expanded ? 'Show Less' : 'Read Full Review'}
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
};
