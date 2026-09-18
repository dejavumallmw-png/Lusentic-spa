import React, { useState } from 'react';
import { BookOpen, Sparkles, HeartPulse } from 'lucide-react';
import { INITIAL_ARTICLES } from '../../data/initialData';
import { ArticleCard } from '../molecules/ArticleCard';

export const ArticlesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'Article' | 'Health Corner'>('all');

  const filtered = activeTab === 'all'
    ? INITIAL_ARTICLES
    : INITIAL_ARTICLES.filter((a) => a.category === activeTab);

  return (
    <section id="articles" className="py-16 sm:py-24 bg-[var(--bg-light)]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#d49a9e] mb-2 flex items-center justify-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-[#28a745]" />
            <span>Wellness Wisdom &amp; Insights</span>
          </p>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-[var(--text-primary)] mb-4">
            Articles &amp; <span className="italic text-[#28a745]">Health Corner</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)]">
            Explore therapeutic advice, botanical sciences, and holistic self-care habits curated by our practitioners.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#1a1418] text-white dark:bg-[#e8b4b8] dark:text-[#1a1418] font-bold shadow-xs'
                : 'bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-muted)]'
            }`}
          >
            All Insights ({INITIAL_ARTICLES.length})
          </button>
          <button
            onClick={() => setActiveTab('Article')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'Article'
                ? 'bg-[#e8b4b8] text-[#1a1418] font-bold shadow-xs'
                : 'bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-muted)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#d49a9e]" />
            <span>Spa Articles</span>
          </button>
          <button
            onClick={() => setActiveTab('Health Corner')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'Health Corner'
                ? 'bg-[#28a745] text-white font-bold shadow-xs'
                : 'bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-muted)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#28a745]" />
            <span>Health Corner (Green)</span>
          </button>
        </div>

        {/* Grid of Articles (PDF spec: 3-4 cols, 4px border-left) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

      </div>
    </section>
  );
};
