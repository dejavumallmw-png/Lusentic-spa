import React, { useState, useEffect } from 'react';
import { Search, X, Clock, Plus, Calendar, Sparkles } from 'lucide-react';
import { Treatment } from '../../types';
import { treatmentService } from '../../services/treatmentService';
import { Button } from '../atoms/Button';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTreatment: (treatment: Treatment) => void;
  onAddToCart: (treatment: Treatment) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTreatment,
  onAddToCart,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await treatmentService.search(query);
        setResults(data);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Search Container (Robust responsiveness across all zoom levels) */}
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-[#1e171c] rounded-[28px] border border-[#e5d5d8] dark:border-white/10 shadow-2xl overflow-hidden z-10 text-gray-900 dark:text-white my-auto">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-white/10 flex items-center gap-3 bg-stone-50 dark:bg-[#251d22]">
          <Search className="w-5 h-5 text-[#b57377] dark:text-[#e8b4b8] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search massage, facials, hot stones, prices, duration..."
            className="w-full bg-transparent text-base sm:text-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white px-2 py-1 cursor-pointer font-medium"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {loading ? (
            <p className="text-center text-sm text-gray-500 dark:text-white/60 py-8">Searching sanctuary therapies...</p>
          ) : results.length === 0 ? (
            <div className="text-center py-10">
              <Sparkles className="w-8 h-8 text-[#b57377] dark:text-[#e8b4b8] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-gray-800 dark:text-white">No therapies found matching "{query}"</p>
              <p className="text-xs text-gray-500 dark:text-white/60 mt-1">Try searching "massage", "facial", "couples", or "scrub"</p>
            </div>
          ) : (
            results.map((treatment) => (
              <div
                key={treatment.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-stone-50 dark:bg-white/5 hover:bg-stone-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {treatment.imageUrl && (
                    <img
                      src={treatment.imageUrl}
                      alt={treatment.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-200 dark:border-white/10"
                    />
                  )}
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {treatment.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-white/70 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-[#b57377] dark:text-[#e8b4b8]" />
                      <span>{treatment.duration} min</span>
                      <span>•</span>
                      <span className="capitalize font-medium">{treatment.category}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-[#b57377] dark:text-[#e8b4b8] mr-1">
                    R{treatment.price}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 dark:border-white/20 p-2"
                    onClick={() => {
                      onAddToCart(treatment);
                    }}
                    title="Add to Cart"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onSelectTreatment(treatment);
                    }}
                    icon={<Calendar className="w-3.5 h-3.5" />}
                  >
                    Book
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-stone-100 dark:bg-[#1a1418] border-t border-gray-200 dark:border-white/10 text-[11px] text-center text-gray-500 dark:text-white/60">
          Showing {results.length} therapies • Press ESC or click outside to close
        </div>
      </div>
    </div>
  );
};
