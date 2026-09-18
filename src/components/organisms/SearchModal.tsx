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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Search Container */}
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] rounded-[28px] border border-[var(--border-light)] shadow-2xl overflow-hidden z-10 text-[var(--text-primary)]">
        {/* Search Input Bar (PDF Spec: 240px or full width, fa-search) */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-light)] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#d49a9e] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search massage, facials, hot stones, prices, duration..."
            className="w-full bg-transparent text-base sm:text-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 py-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-3">
          {loading ? (
            <p className="text-center text-sm text-[var(--text-muted)] py-8">Searching sanctuary therapies...</p>
          ) : results.length === 0 ? (
            <div className="text-center py-10">
              <Sparkles className="w-8 h-8 text-[#d49a9e] mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No therapies found matching "{query}"</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Try searching "hot stone", "facial", or "couples"</p>
            </div>
          ) : (
            results.map((treatment) => (
              <div
                key={treatment.id}
                className="p-3.5 rounded-2xl bg-[var(--bg-light)]/40 hover:bg-[var(--bg-light)] border border-[var(--border-light)] flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {treatment.imageUrl && (
                    <img
                      src={treatment.imageUrl}
                      alt={treatment.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                      {treatment.name}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-[#d49a9e]" />
                      <span>{treatment.duration} min</span>
                      <span>•</span>
                      <span className="capitalize">{treatment.category}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-[#d49a9e] mr-1">
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
        <div className="p-3 bg-[var(--bg-light)] border-t border-[var(--border-light)] text-[11px] text-center text-[var(--text-muted)]">
          Press ESC or click outside to dismiss
        </div>
      </div>
    </div>
  );
};
