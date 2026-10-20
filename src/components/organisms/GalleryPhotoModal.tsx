import React, { useState } from 'react';
import {
  X,
  Camera,
  HardDrive,
  FolderOpen,
  Sparkles,
  Check,
  Search,
  UploadCloud,
  Image as ImageIcon
} from 'lucide-react';
import { GalleryItem } from '../../types';
import { SPA_MEDIA_STORAGE_ASSETS, StoragePhotoAsset } from '../../data/spaMediaStorage';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

interface GalleryPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (photo: Omit<GalleryItem, 'id'>) => Promise<void>;
  editingPhoto?: GalleryItem | null;
  onUpdate?: (id: number, updates: Partial<GalleryItem>) => Promise<void>;
}

export const GalleryPhotoModal: React.FC<GalleryPhotoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPhoto,
  onUpdate,
}) => {
  const [sourceMode, setSourceMode] = useState<'device' | 'storage' | 'url'>('storage');
  const [title, setTitle] = useState(editingPhoto?.title || '');
  const [category, setCategory] = useState(editingPhoto?.category || 'Suites');
  const [caption, setCaption] = useState(editingPhoto?.caption || '');
  const [image, setImage] = useState(editingPhoto?.image || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storageSearch, setStorageSearch] = useState('');
  const [storageCategory, setStorageCategory] = useState<string>('All');
  const [dragActive, setDragActive] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  // Sync when editing photo changes
  React.useEffect(() => {
    if (editingPhoto) {
      setTitle(editingPhoto.title);
      setCategory(editingPhoto.category);
      setCaption(editingPhoto.caption || '');
      setImage(editingPhoto.image);
      setSourceMode(editingPhoto.image.startsWith('data:') ? 'device' : 'storage');
    } else {
      setTitle('');
      setCategory('Suites');
      setCaption('');
      setImage('');
      setSourceMode('storage');
    }
  }, [editingPhoto, isOpen]);

  if (!isOpen) return null;

  // Compress & downscale image from device file storage to keep size light and crisp
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200; // Optimal retina resolution
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            setImage(compressed);
            const kbSize = Math.round((compressed.length * 3) / 4 / 1024);
            setCompressionInfo(`Processed ${width}×${height}px • ~${kbSize} KB`);
          } else {
            setImage(reader.result as string);
          }
        };
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectFromStorage = (asset: StoragePhotoAsset) => {
    setImage(asset.image);
    if (!title || title.trim() === '') {
      setTitle(asset.title);
    }
    setCategory(asset.category);
    if (!caption || caption.trim() === '') {
      setCaption(asset.caption);
    }
    setCompressionInfo(`Selected from Spa Media Library: ${asset.title}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a photo title.');
      return;
    }
    if (!image) {
      alert('Please select or upload a photo image.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPhoto && onUpdate) {
        await onUpdate(editingPhoto.id, {
          title: title.trim(),
          category,
          caption: caption.trim() || 'Lusentic Spa tranquility experience',
          image,
        });
      } else {
        await onSave({
          title: title.trim(),
          category,
          caption: caption.trim() || 'Lusentic Spa tranquility experience',
          image,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter storage assets
  const filteredAssets = SPA_MEDIA_STORAGE_ASSETS.filter((asset) => {
    const matchesCat = storageCategory === 'All' || asset.category === storageCategory;
    const matchesSearch =
      storageSearch.trim() === '' ||
      asset.title.toLowerCase().includes(storageSearch.toLowerCase()) ||
      asset.caption.toLowerCase().includes(storageSearch.toLowerCase()) ||
      asset.tags.some((t) => t.toLowerCase().includes(storageSearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-[var(--bg-card)] rounded-[28px] border border-[#e8b4b8] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--border-light)] flex items-center justify-between bg-stone-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f5edea] dark:bg-[#2d2228] text-[#d49a9e] flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                {editingPhoto ? 'Edit Gallery Photo' : 'Add Photo to Our Spa Gallery'}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Select from internal storage or upload directly from your device
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-stone-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Mode Tabs */}
        <div className="px-5 sm:px-6 pt-4 border-b border-[var(--border-light)] flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSourceMode('storage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              sourceMode === 'storage'
                ? 'bg-[#e8b4b8] text-[#1a1418] shadow-xs'
                : 'bg-stone-100 dark:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-[#d49a9e]" />
            <span>Select from Spa Media Storage ({SPA_MEDIA_STORAGE_ASSETS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSourceMode('device')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              sourceMode === 'device'
                ? 'bg-[#e8b4b8] text-[#1a1418] shadow-xs'
                : 'bg-stone-100 dark:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <HardDrive className="w-4 h-4 text-[#d49a9e]" />
            <span>Upload from Device Storage (Phone / PC)</span>
          </button>

          <button
            type="button"
            onClick={() => setSourceMode('url')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              sourceMode === 'url'
                ? 'bg-[#e8b4b8] text-[#1a1418] shadow-xs'
                : 'bg-stone-100 dark:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#d49a9e]" />
            <span>Web Image URL</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: SPA MEDIA STORAGE ASSETS */}
          {sourceMode === 'storage' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#d49a9e]" />
                  Curated Sanctuary Storage Photos: Click any photo to select
                </span>
                
                {/* Category filters */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {['All', 'Suites', 'Therapies', 'Products', 'Facilities'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setStorageCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                        storageCategory === cat
                          ? 'bg-[#d49a9e] text-white font-bold'
                          : 'bg-stone-100 dark:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search storage library by name, treatment, candles, bath..."
                  value={storageSearch}
                  onChange={(e) => setStorageSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border-light)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d49a9e]"
                />
              </div>

              {/* Assets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-56 sm:max-h-64 overflow-y-auto p-1 border border-[var(--border-light)] rounded-2xl bg-stone-50/50 dark:bg-white/5">
                {filteredAssets.map((asset) => {
                  const isSelected = image === asset.image;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleSelectFromStorage(asset)}
                      className={`group relative rounded-xl overflow-hidden aspect-square cursor-pointer transition-all border ${
                        isSelected
                          ? 'border-[#d49a9e] ring-3 ring-[#e8b4b8] scale-[0.98]'
                          : 'border-transparent hover:border-[#d49a9e]/60'
                      }`}
                    >
                      <img
                        src={asset.image}
                        alt={asset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2 flex flex-col justify-end text-white">
                        <span className="text-[9px] uppercase font-bold text-[#e8b4b8]">{asset.category}</span>
                        <p className="text-[11px] font-bold line-clamp-1">{asset.title}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#d49a9e] text-white flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: DEVICE STORAGE FILE UPLOADER */}
          {sourceMode === 'device' && (
            <div className="space-y-3">
              <label
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                  dragActive
                    ? 'border-[#d49a9e] bg-[#f5edea]/50 dark:bg-[#2d2228]/50'
                    : 'border-[var(--border-light)] bg-stone-50/60 dark:bg-white/5 hover:border-[#d49a9e]'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-[#e8b4b8]/30 text-[#d49a9e] flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-[var(--text-primary)] text-center">
                  Click to Browse Device Storage or Drag &amp; Drop Photo Here
                </p>
                <p className="text-[11px] text-[var(--text-muted)] text-center mt-1">
                  Supports JPG, PNG, WebP from your computer hard drive, mobile gallery, or camera
                </p>
                <span className="mt-3 px-3.5 py-1.5 rounded-xl bg-stone-200 dark:bg-white/10 text-xs font-bold text-[var(--text-primary)]">
                  Choose Photo File
                </span>
              </label>
            </div>
          )}

          {/* TAB 3: WEB URL */}
          {sourceMode === 'url' && (
            <div className="space-y-2">
              <Input
                label="Direct Photo Web URL"
                placeholder="https://images.unsplash.com/photo-..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
              <p className="text-[11px] text-[var(--text-muted)]">
                Paste any high-resolution public image URL from Unsplash, Pexels, or your hosted spa assets.
              </p>
            </div>
          )}

          {/* ACTIVE PHOTO PREVIEW CARD */}
          {image && (
            <div className="p-3.5 rounded-2xl bg-stone-100/70 dark:bg-white/5 border border-[var(--border-light)] flex items-center gap-4">
              <img
                src={image}
                alt="Selected"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#e8b4b8] shadow-sm shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d49a9e]">Selected Photo</span>
                <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                  {title || 'Sanctuary Photo Preview'}
                </p>
                {compressionInfo && (
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{compressionInfo}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setImage('');
                  setCompressionInfo(null);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}

          {/* METADATA FORM */}
          <form onSubmit={handleSubmit} id="gallery-form" className="space-y-4 pt-2 border-t border-[var(--border-light)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Photo Title *"
                placeholder="e.g. Zen Hydrotherapy Garden Suite"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Spa Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-light)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d49a9e]"
                >
                  <option value="Suites" className="bg-[var(--bg-card)]">Suites</option>
                  <option value="Therapies" className="bg-[var(--bg-card)]">Therapies</option>
                  <option value="Products" className="bg-[var(--bg-card)]">Products</option>
                  <option value="Facilities" className="bg-[var(--bg-card)]">Facilities</option>
                </select>
              </div>
            </div>

            <Input
              label="Short Caption / Description"
              placeholder="e.g. Calming private suite with botanical herbal foot soak and ambient aromatics..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </form>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-6 border-t border-[var(--border-light)] flex items-center justify-between bg-stone-50/50 dark:bg-white/5">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="md"
            type="submit"
            form="gallery-form"
            disabled={isSubmitting || !image || !title.trim()}
            className="font-bold text-xs sm:text-sm shadow-md"
          >
            {isSubmitting
              ? 'Saving to Sanctuary...'
              : editingPhoto
              ? 'Save Changes'
              : 'Add to Our Spa Gallery'}
          </Button>
        </div>
      </div>
    </div>
  );
};
