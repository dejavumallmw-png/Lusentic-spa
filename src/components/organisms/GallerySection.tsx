import React, { useState, useEffect } from 'react';
import { Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GalleryItem } from '../../types';
import { galleryService } from '../../services/galleryService';

export const GallerySection: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  useEffect(() => {
    const load = async () => {
      const data = await galleryService.getAll();
      setGalleryItems(data);
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const categories = ['All', 'Suites', 'Therapies', 'Products', 'Facilities'];

  const filtered = filterCategory === 'All'
    ? galleryItems
    : galleryItems.filter((item) => item.category.toLowerCase() === filterCategory.toLowerCase());

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedItem) return;
    const currentIndex = filtered.findIndex((i) => i.id === selectedItem.id);
    const nextIndex = (currentIndex + 1) % filtered.length;
    setSelectedItem(filtered[nextIndex]);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedItem) return;
    const currentIndex = filtered.findIndex((i) => i.id === selectedItem.id);
    const prevIndex = (currentIndex - 1 + filtered.length) % filtered.length;
    setSelectedItem(filtered[prevIndex]);
  };

  return (
    <section id="gallery" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#d49a9e] mb-2">
            Sanctuary Atmosphere
          </p>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-[var(--text-primary)] mb-4">
            Our Spa <span className="italic text-[#d49a9e]">Gallery</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)]">
            Take a visual tour inside our calming private suites, hydrotherapy tubs, and botanical gardens.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#e8b4b8] text-[#1a1418] font-bold shadow-xs'
                  : 'bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative aspect-square rounded-[20px] overflow-hidden bg-black/10 cursor-pointer shadow-[var(--shadow)] border border-[var(--border-light)]"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#e8b4b8] mb-1">
                  {item.category}
                </span>
                <h4 className="text-sm sm:text-base font-bold mb-1">{item.title}</h4>
                <p className="text-xs text-white/80 line-clamp-2">{item.caption}</p>
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedItem && (
          <div
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-[var(--bg-card)] rounded-[28px] overflow-hidden shadow-2xl border border-white/10"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Prev / Next controls */}
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Lightbox Image */}
              <div className="w-full max-h-[65vh] bg-black/5 overflow-hidden flex items-center justify-center">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-full object-contain max-h-[65vh]"
                />
              </div>

              {/* Lightbox Details */}
              <div className="p-6 bg-[var(--bg-card)] text-[var(--text-primary)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-[#d49a9e]">
                    {selectedItem.category}
                  </span>
                  <h3 className="font-serif-luxury text-2xl font-semibold mt-0.5">
                    {selectedItem.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {selectedItem.caption}
                  </p>
                </div>
                <span className="text-xs text-[var(--text-muted)] bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full shrink-0">
                  Lusentic Spa &amp; Wellness Gallery
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
