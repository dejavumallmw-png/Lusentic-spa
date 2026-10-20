import React, { useState, useEffect } from 'react';
import {
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  Camera,
  Sparkles,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { GalleryItem } from '../../types';
import { galleryService } from '../../services/galleryService';
import { useAuth } from '../../app/providers/AuthProvider';
import { GalleryPhotoModal } from './GalleryPhotoModal';

export const GallerySection: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryItem | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Subscribe to real-time updates from Firestore / local storage
  useEffect(() => {
    const unsubscribe = galleryService.subscribe((items) => {
      setGalleryItems(items);
    });
    return () => unsubscribe();
  }, []);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const categories = ['All', 'Suites', 'Therapies', 'Products', 'Facilities'];

  const filtered = filterCategory === 'All'
    ? galleryItems
    : galleryItems.filter((item) => item.category.toLowerCase() === filterCategory.toLowerCase());

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedItem || filtered.length === 0) return;
    const currentIndex = filtered.findIndex((i) => i.id === selectedItem.id);
    const nextIndex = (currentIndex + 1) % filtered.length;
    setSelectedItem(filtered[nextIndex]);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedItem || filtered.length === 0) return;
    const currentIndex = filtered.findIndex((i) => i.id === selectedItem.id);
    const prevIndex = (currentIndex - 1 + filtered.length) % filtered.length;
    setSelectedItem(filtered[prevIndex]);
  };

  const handleAddPhoto = async (photo: Omit<GalleryItem, 'id'>) => {
    await galleryService.addPhoto(photo);
    showNotification(`Photo "${photo.title}" added to sanctuary gallery!`);
  };

  const handleUpdatePhoto = async (id: number, updates: Partial<GalleryItem>) => {
    await galleryService.updatePhoto(id, updates);
    showNotification(`Gallery photo updated successfully!`);
  };

  const handleDeletePhoto = async (e: React.MouseEvent, item: GalleryItem) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Are you sure you want to remove "${item.title}" from the spa gallery?`);
    if (!confirmed) return;

    await galleryService.deletePhoto(item.id);
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    }
    showNotification(`Photo "${item.title}" removed from gallery.`);
  };

  const handleOpenEdit = (e: React.MouseEvent, item: GalleryItem) => {
    e.stopPropagation();
    setEditingPhoto(item);
    setIsModalOpen(true);
  };

  const handleResetDefaults = async () => {
    const confirmed = window.confirm('Restore initial showcase gallery photos?');
    if (!confirmed) return;
    await galleryService.resetToDefault();
    showNotification('Restored initial sanctuary gallery collection.');
  };

  const handleClearAll = async () => {
    const confirmed = window.confirm('Are you sure you want to remove ALL photos from the gallery? This will allow you to start completely fresh with your own uploads.');
    if (!confirmed) return;
    await galleryService.clearAllPhotos();
    setSelectedItem(null);
    showNotification('All gallery photos removed. Gallery is now clear.');
  };

  return (
    <section id="gallery" className="py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Toast feedback */}
        {actionNotice && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#1a1418] text-[#e8b4b8] border border-[#e8b4b8]/40 shadow-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200">
            <Sparkles className="w-4 h-4 text-[#e8b4b8]" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#d49a9e] mb-2 flex items-center justify-center gap-2">
            <span>Sanctuary Atmosphere</span>
            {isAdmin && (
              <span className="px-2 py-0.5 rounded-full bg-[#d49a9e]/15 text-[#d49a9e] text-[10px] font-bold border border-[#d49a9e]/30">
                Admin Dynamic Mode
              </span>
            )}
          </p>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-[var(--text-primary)] mb-4">
            Our Spa <span className="italic text-[#d49a9e]">Gallery</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)]">
            Take a visual tour inside our calming private suites, hydrotherapy tubs, and botanical gardens.
          </p>
        </div>

        {/* ADMIN DYNAMIC CONTROLS BAR (Visible when logged in as admin) */}
        {isAdmin && (
          <div className="mb-8 p-4 rounded-2xl bg-stone-100/80 dark:bg-white/5 border border-[#e8b4b8] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-xs text-[var(--text-primary)]">
              <ShieldCheck className="w-4 h-4 text-[#d49a9e]" />
              <div>
                <span className="font-bold">Administrator Dynamic Controls:</span>{' '}
                <span className="text-[var(--text-muted)]">
                  Add photos directly from device or spa storage, or remove photos instantly.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors cursor-pointer border border-red-500/20"
                title="Remove all photos to start completely fresh"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Photos</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-transparent hover:bg-stone-200 dark:hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-semibold transition-colors cursor-pointer"
                title="Reset to default photos"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingPhoto(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e8b4b8] hover:bg-[#d49a9e] text-[#1a1418] text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Photo from Storage</span>
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs & Counter */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => {
              const count = cat === 'All'
                ? galleryItems.length
                : galleryItems.filter((i) => i.category.toLowerCase() === cat.toLowerCase()).length;

              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterCategory === cat
                      ? 'bg-[#e8b4b8] text-[#1a1418] font-bold shadow-xs'
                      : 'bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    filterCategory === cat ? 'bg-black/15 text-black' : 'bg-black/5 dark:bg-white/10 text-[var(--text-muted)]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
            <span>Showing <strong>{filtered.length}</strong> photo{filtered.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        {/* Grid of Dynamic Gallery Photos */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-[24px] border border-dashed border-[var(--border-light)] bg-stone-50/50 dark:bg-white/5 space-y-3">
            <Camera className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-50" />
            <h3 className="font-serif-luxury text-lg font-bold text-[var(--text-primary)]">
              No photos found in this category
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              {isAdmin
                ? 'Click "Add Photo from Storage" above to upload photos from device storage or choose from our sanctuary media library.'
                : 'Check back soon as new atmosphere photos are added regularly.'}
            </p>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setEditingPhoto(null);
                  setIsModalOpen(true);
                }}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e8b4b8] text-[#1a1418] text-xs font-bold shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Photo</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative aspect-square rounded-[20px] overflow-hidden bg-black/10 cursor-pointer shadow-[var(--shadow)] border border-[var(--border-light)] transition-all hover:shadow-lg"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Persistent Admin Quick Controls (Visible on mobile & desktop without hover) */}
                {isAdmin && (
                  <div
                    className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 shadow-md"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(e, item)}
                      className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                      title="Edit Photo Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeletePhoto(e, item)}
                      className="w-7 h-7 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                      title="Delete Photo from Gallery"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 sm:p-5 flex flex-col justify-between text-white">
                  {/* Top action row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[#e8b4b8]">
                      {item.category}
                    </span>

                    {/* Admin quick controls */}
                    {isAdmin ? (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(e, item)}
                          className="w-8 h-8 rounded-full bg-amber-500/90 hover:bg-amber-500 text-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
                          title="Edit Photo Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeletePhoto(e, item)}
                          className="w-8 h-8 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
                          title="Remove Photo from Gallery"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                        <Eye className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Bottom caption details */}
                  <div>
                    <h4 className="text-sm sm:text-base font-bold mb-1 leading-snug line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-white/80 line-clamp-2">{item.caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
              {filtered.length > 1 && (
                <>
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
                </>
              )}

              {/* Lightbox Image */}
              <div className="w-full max-h-[65vh] bg-black/10 overflow-hidden flex items-center justify-center">
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

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        handleDeletePhoto(e, selectedItem);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Photo</span>
                    </button>
                  )}
                  <span className="text-xs text-[var(--text-muted)] bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full shrink-0">
                    Lusentic Spa &amp; Wellness Gallery
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for adding/editing photos and picking from storage */}
        <GalleryPhotoModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPhoto(null);
          }}
          onSave={handleAddPhoto}
          editingPhoto={editingPhoto}
          onUpdate={handleUpdatePhoto}
        />

      </div>
    </section>
  );
};
