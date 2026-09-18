import React, { useState } from 'react';
import { ChevronDown, Clock, UserCheck } from 'lucide-react';
import { ArticleItem } from '../../types';

interface ArticleCardProps {
  article: ArticleItem;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const [expanded, setExpanded] = useState(false);
  const isHealthCorner = article.category === 'Health Corner';

  return (
    <div
      onClick={() => setExpanded((prev) => !prev)}
      className={`p-5 rounded-[20px] bg-[var(--bg-card)] border border-[var(--border-light)] shadow-[var(--shadow)] transition-all duration-300 cursor-pointer ${
        isHealthCorner
          ? 'border-l-[4px] border-l-[#28a745]'
          : 'border-l-[4px] border-l-[#e8b4b8]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isHealthCorner
                  ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300'
                  : 'bg-[#f5edea] dark:bg-[#2d2228] text-[#b57377] dark:text-[#f5dadd]'
              }`}
            >
              {article.category}
            </span>
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Clock className="w-3 h-3" /> {article.readTime}
            </span>
          </div>

          <h3 className="text-base sm:text-[17.6px] font-semibold text-[var(--text-primary)] leading-snug">
            {article.title}
          </h3>
        </div>

        <div className="p-1 rounded-full bg-black/5 dark:bg-white/10 shrink-0 text-[var(--text-muted)]">
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      <p className="mt-2.5 text-xs sm:text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed">
        {article.summary}
      </p>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-4 pt-3 border-t border-[var(--border-light)] text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line animate-in fade-in duration-200">
          <p className="mb-3">{article.content}</p>
          <div className="flex items-center gap-1.5 text-xs text-[#d49a9e] font-medium pt-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Authored by {article.author}</span>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[12px] text-[var(--text-muted)]">
        <span>{article.date}</span>
        <span className="text-xs font-medium text-[#d49a9e]">
          {expanded ? 'Collapse' : 'Tap to Read'}
        </span>
      </div>
    </div>
  );
};
