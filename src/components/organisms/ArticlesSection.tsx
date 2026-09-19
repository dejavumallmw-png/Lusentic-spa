import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, HeartPulse } from 'lucide-react';
import { articleService, Article } from '../../services/articleService';
import { ArticleCard } from '../molecules/ArticleCard';

export const ArticlesSection: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      const data = await articleService.getAll();
      setArticles(data);
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = activeTab === 'all'
    ? articles
    : articles.filter((a) => a.category.toLowerCase().includes(activeTab.toLowerCase()));

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
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#1a1418] text-white dark:bg-[#e8b4b8] dark:text-[#1a1418] font-bold shadow-xs'
                : 'bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-muted)]'
            }`}
          >
            All Insights ({articles.length})
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
            onClick={() => setActiveTab('Health')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'Health'
                ? 'bg-[#28a745] text-white font-bold shadow-xs'
                : 'bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-muted)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#28a745]" />
            <span>Health Corner</span>
          </button>
        </div>

        {/* Grid of Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

      </div>
    </section>
  );
};
