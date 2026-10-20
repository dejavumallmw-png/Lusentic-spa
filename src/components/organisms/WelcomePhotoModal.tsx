import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  FolderOpen,
  Sparkles,
  Check,
  Search,
  UploadCloud,
  Trash2,
  RotateCcw,
  Image as ImageIcon
} from 'lucide-react';
import { SPA_MEDIA_STORAGE_ASSETS } from '../../data/spaMediaStorage';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { settingsService, DEFAULT_SETTINGS } from '../../services/settingsService';
import { SiteSettings } from '../../types';

interface WelcomePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: SiteSettings;
  onSaved?: () => void;
}

export const WelcomePhotoModal: React.FC<WelcomePhotoModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSaved,
}) => {
  const [sourceMode, setSourceMode] = useState<'device' | 'storage' | 'url'>('storage');
  const [photoUrl, setPhotoUrl] = useState(currentSettings.welcomePhotoUrl || DEFAULT_SETTINGS.welcomePhotoUrl || '');
  const [badgeTitle, setBadgeTitle] = useState(currentSettings.welcomeBadgeTitle || 'Special Welcome');
  const [title, setTitle] = useState(currentSettings.welcomeTitle || 'Complimentary Herbal Tea & Foot Soak with Every Session');
  const [badgePill, setBadgePill] = useState(currentSettings.welcomeBadgePill || 'All Guests');
  const [storageSearch, setStorageSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPhotoUrl(currentSettings.welcomePhotoUrl || DEFAULT_SETTINGS.welcomePhotoUrl || '');
      setBadgeTitle(currentSettings.welcomeBadgeTitle || 'Special Welcome');
      setTitle(currentSettings.welcomeTitle || 'Complimentary Herbal Tea & Foot Soak with Every Session');
      setBadgePill(currentSettings.welcomeBadgePill || 'All Guests');
      setCompressionInfo(null);
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 960;
        const MAX_HEIGHT = 640;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.78);
          setPhotoUrl(compressed);
          const kb = Math.round(compressed.length / 1024);
          setCompressionInfo(`Optimized: ${Math.round(width)}×${Math.round(height)}px (~${kb} KB) ready for cloud sync`);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefault = () => {
    setPhotoUrl(DEFAULT_SETTINGS.welcomePhotoUrl || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1400&q=80');
    setCompressionInfo('Restored sanctuary default herbal tea photo.');
  };

  const handleDeletePhoto = () => {
    setPhotoUrl('');
    setCompressionInfo('Photo removed (will display default sanctuary welcome ambiance).');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await settingsService.updateSettings({
        welcomePhotoUrl: photoUrl.trim() || DEFAULT_SETTINGS.welcomePhotoUrl,
        welcomeBadgeTitle: badgeTitle.trim() || 'Special Welcome',
        welcomeTitle: title.trim() || 'Complimentary Herbal Tea & Foot Soak with Every Session',
        welcomeBadgePill: badgePill.trim() || 'All Guests',
      });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to update Special Welcome photo settings:', err);
      alert('Could not save to Firebase. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStorage = SPA_MEDIA_STORAGE_ASSETS.filter((item) => {
    if (!storageSearch.trim()) return true;
    const q = storageSearch.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] rounded-[28px] border border-[var(--border-light)] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e8b4b8]/20 text-[#b57377] dark:text-[#e8b4b8] flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                Edit Special Welcome Photo
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Dynamic Complimentary Herbal Tea photo &amp; banner under Hero
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Current Live Preview */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Live Banner Preview
            </label>
            <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border-2 border-[var(--border-light)] bg-black/10">
              <img
                src={photoUrl || DEFAULT_SETTINGS.welcomePhotoUrl}
                alt="Welcome Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-[#e8b4b8]">
                    {badgeTitle || 'Special Welcome'}
                  </p>
                  <p className="text-xs font-bold text-white line-clamp-1">
                    {title || 'Complimentary Herbal Tea & Foot Soak with Every Session'}
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#e8b4b8] text-[#1a1418] text-[10px] font-bold shrink-0">
                  {badgePill || 'All Guests'}
                </span>
              </div>
            </div>

            {/* Quick Actions (Reset / Delete) */}
            <div className="flex items-center justify-between mt-2 text-xs">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1.5 text-stone-600 dark:text-stone-300 hover:text-[var(--text-primary)] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to sanctuary default</span>
              </button>
              <button
                type="button"
                onClick={handleDeletePhoto}
                className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete current custom photo</span>
              </button>
            </div>
            {compressionInfo && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">
                {compressionInfo}
              </p>
            )}
          </div>

          {/* Photo Source Tabs */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setSourceMode('storage')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  sourceMode === 'storage'
                    ? 'bg-[#e8b4b8] text-[#1a1418] border-[#e8b4b8] shadow-xs'
                    : 'bg-[var(--bg-light)] text-[var(--text-muted)] border-[var(--border-light)] hover:text-[var(--text-primary)]'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                <span>Spa Media Storage Library</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('device')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  sourceMode === 'device'
                    ? 'bg-[#e8b4b8] text-[#1a1418] border-[#e8b4b8] shadow-xs'
                    : 'bg-[var(--bg-light)] text-[var(--text-muted)] border-[var(--border-light)] hover:text-[var(--text-primary)]'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload from Device</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('url')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  sourceMode === 'url'
                    ? 'bg-[#e8b4b8] text-[#1a1418] border-[#e8b4b8] shadow-xs'
                    : 'bg-[var(--bg-light)] text-[var(--text-muted)] border-[var(--border-light)] hover:text-[var(--text-primary)]'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Web URL</span>
              </button>
            </div>

            {/* TAB 1: Spa Storage Library */}
            {sourceMode === 'storage' && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={storageSearch}
                    onChange={(e) => setStorageSearch(e.target.value)}
                    placeholder="Search tea, elixirs, lounge, botanical..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-white/20 bg-white dark:bg-[#1a1418] text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder-white/40 focus:outline-none focus:border-[#d49a9e]"
                  />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
                  {filteredStorage.map((asset) => {
                    const isSelected = photoUrl === asset.image;
                    return (
                      <div
                        key={asset.id}
                        onClick={() => {
                          setPhotoUrl(asset.image);
                          setCompressionInfo(`Selected "${asset.title}" from media storage.`);
                        }}
                        className={`group relative aspect-video rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#b57377] ring-2 ring-[#e8b4b8]'
                            : 'border-[var(--border-light)] hover:border-[#e8b4b8]'
                        }`}
                      >
                        <img src={asset.image} alt={asset.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] text-white font-bold px-1.5 text-center">{asset.title}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#28a745] text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Upload from Device */}
            {sourceMode === 'device' && (
              <div className="p-6 rounded-2xl border-2 border-dashed border-[var(--border-light)] bg-stone-50/50 dark:bg-white/5 text-center space-y-3">
                <UploadCloud className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
                <p className="text-xs font-bold text-[var(--text-primary)]">
                  Select new photo from your phone or computer storage
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Supports JPG, PNG, WEBP. Automatically optimized for fast cloud storage and cross-device sync.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e8b4b8] hover:bg-[#d49a9e] text-[#1a1418] text-xs font-bold shadow-xs cursor-pointer transition-colors">
                  <Camera className="w-4 h-4" />
                  <span>Choose Photo File</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            )}

            {/* TAB 3: Web URL */}
            {sourceMode === 'url' && (
              <Input
                label="Direct Image Web URL"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            )}
          </div>

          {/* Banner Text Customization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--border-light)]">
            <Input
              label="Badge Tagline"
              value={badgeTitle}
              onChange={(e) => setBadgeTitle(e.target.value)}
              placeholder="Special Welcome"
            />
            <Input
              label="Audience Pill"
              value={badgePill}
              onChange={(e) => setBadgePill(e.target.value)}
              placeholder="All Guests"
            />
            <div className="sm:col-span-2">
              <Input
                label="Welcome Headline & Offer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Complimentary Herbal Tea & Foot Soak with Every Session"
              />
            </div>
          </div>

          {/* Footer Save Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-light)]">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving to Cloud...' : 'Save & Sync Across All Devices'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
