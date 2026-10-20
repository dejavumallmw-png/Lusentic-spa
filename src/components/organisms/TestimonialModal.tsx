import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Camera,
  FolderOpen,
  UploadCloud,
  Check,
  User,
  Sparkles
} from 'lucide-react';
import { Testimonial, Treatment } from '../../types';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { SPA_MEDIA_STORAGE_ASSETS } from '../../data/spaMediaStorage';

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Testimonial, 'id' | 'date'>) => Promise<void>;
  editingTestimonial?: Testimonial | null;
  onUpdate?: (id: number, updates: Partial<Testimonial>) => Promise<void>;
  treatments?: Treatment[];
}

export const TestimonialModal: React.FC<TestimonialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTestimonial,
  onUpdate,
  treatments = [],
}) => {
  const [name, setName] = useState('');
  const [stars, setStars] = useState(5);
  const [treatment, setTreatment] = useState('');
  const [role, setRole] = useState('Verified Guest');
  const [content, setContent] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarMode, setAvatarMode] = useState<'initials' | 'upload' | 'storage' | 'url'>('initials');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compressionNotice, setCompressionNotice] = useState<string | null>(null);

  useEffect(() => {
    if (editingTestimonial) {
      setName(editingTestimonial.name);
      setStars(editingTestimonial.stars);
      setTreatment(editingTestimonial.treatment);
      setRole(editingTestimonial.role || 'Verified Guest');
      setContent(editingTestimonial.content);
      setAvatar(editingTestimonial.avatar || '');
      setAvatarMode(editingTestimonial.avatar ? (editingTestimonial.avatar.startsWith('data:') ? 'upload' : 'url') : 'initials');
    } else {
      setName('');
      setStars(5);
      setTreatment(treatments.length > 0 ? treatments[0].name : 'Aromatherapy Massage');
      setRole('Verified Guest');
      setContent('');
      setAvatar('');
      setAvatarMode('initials');
    }
    setCompressionNotice(null);
  }, [editingTestimonial, isOpen, treatments]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(compressed);
          const kb = Math.round(compressed.length / 1024);
          setCompressionNotice(`Avatar compressed (~${kb} KB) ready for database sync`);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter guest name');
      return;
    }
    if (!content.trim()) {
      alert('Please enter review content');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalAvatar = avatarMode === 'initials' ? '' : avatar.trim();
      if (editingTestimonial && onUpdate) {
        await onUpdate(editingTestimonial.id, {
          name: name.trim(),
          stars,
          treatment: treatment.trim() || 'Custom Treatment',
          role: role.trim() || 'Verified Guest',
          content: content.trim(),
          avatar: finalAvatar,
        });
      } else {
        await onSave({
          name: name.trim(),
          stars,
          treatment: treatment.trim() || 'Custom Treatment',
          role: role.trim() || 'Verified Guest',
          content: content.trim(),
          avatar: finalAvatar,
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed to save testimonial:', err);
      alert('Could not save testimonial. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] rounded-[28px] border border-[var(--border-light)] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)] mb-5">
          <div>
            <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              {editingTestimonial ? 'Edit Guest Testimonial' : 'Add Guest Testimonial'}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Displayed in the public "Words of Serenity" section
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Guest Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Guest Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sophia Vance"
              required
            />
            <Input
              label="Guest Role / Status"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Verified Guest or Club Member"
            />
          </div>

          {/* Treatment & Star Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Treatment Experienced *
              </label>
              {treatments.length > 0 ? (
                <select
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--border-light)] bg-[var(--bg-light)] text-[var(--text-primary)] focus:outline-none focus:border-[#d49a9e]"
                >
                  {treatments.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} (R{t.price})
                    </option>
                  ))}
                  <option value="Custom Treatment">Other / Custom Treatment</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="e.g. Aromatherapy Massage"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--border-light)] bg-[var(--bg-light)] text-[var(--text-primary)] focus:outline-none focus:border-[#d49a9e]"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Star Rating ({stars}.0)
              </label>
              <div className="flex items-center gap-1.5 pt-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStars(s)}
                    className="p-1 text-[#FFD700] hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star className={`w-6 h-6 ${s <= stars ? 'fill-[#FFD700]' : 'text-stone-300 dark:text-stone-600'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Review Content */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              Review Testimonial Text *
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe the peaceful ambiance, therapist technique, aroma and restorative wellness experience..."
              className="w-full p-3 text-xs rounded-xl border border-[var(--border-light)] bg-[var(--bg-light)] text-[var(--text-primary)] focus:outline-none focus:border-[#d49a9e]"
              required
            />
          </div>

          {/* Guest Photo / Avatar Options */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Guest Avatar / Profile Photo
            </label>

            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setAvatarMode('initials');
                  setAvatar('');
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  avatarMode === 'initials'
                    ? 'bg-[#e8b4b8] text-[#1a1418] border-[#e8b4b8]'
                    : 'bg-[var(--bg-light)] text-[var(--text-muted)] border-[var(--border-light)]'
                }`}
              >
                Initials Badge
              </button>
              <button
                type="button"
                onClick={() => setAvatarMode('upload')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  avatarMode === 'upload'
                    ? 'bg-[#e8b4b8] text-[#1a1418] border-[#e8b4b8]'
                    : 'bg-[var(--bg-light)] text-[var(--text-muted)] border-[var(--border-light)]'
                }`}
              >
                Upload Photo
              </button>
              <button
                type="button"
                onClick={() => setAvatarMode('storage')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  avatarMode === 'storage'
                    ? 'bg-[#e8b4b8] text-[#1a1418] border-[#e8b4b8]'
                    : 'bg-[var(--bg-light)] text-[var(--text-muted)] border-[var(--border-light)]'
                }`}
              >
                From Storage
              </button>
              <button
                type="button"
                onClick={() => setAvatarMode('url')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  avatarMode === 'url'
                    ? 'bg-[#e8b4b8] text-[#1a1418] border-[#e8b4b8]'
                    : 'bg-[var(--bg-light)] text-[var(--text-muted)] border-[var(--border-light)]'
                }`}
              >
                Web URL
              </button>
            </div>

            {avatarMode === 'upload' && (
              <div className="p-4 rounded-xl border border-dashed border-[var(--border-light)] bg-stone-50 dark:bg-white/5 text-center space-y-2">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="testimonial-avatar-file" />
                <label
                  htmlFor="testimonial-avatar-file"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e8b4b8] text-[#1a1418] text-xs font-bold cursor-pointer hover:bg-[#d49a9e] transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Choose Photo File</span>
                </label>
                {compressionNotice && (
                  <p className="text-[11px] text-emerald-600 font-medium">{compressionNotice}</p>
                )}
              </div>
            )}

            {avatarMode === 'storage' && (
              <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1 border border-[var(--border-light)] rounded-xl">
                {SPA_MEDIA_STORAGE_ASSETS.slice(0, 8).map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => setAvatar(asset.image)}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${
                      avatar === asset.image ? 'border-[#b57377]' : 'border-transparent'
                    }`}
                  >
                    <img src={asset.image} alt={asset.title} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {avatarMode === 'url' && (
              <Input
                label="Direct Photo URL"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            )}

            {/* Live Avatar Preview */}
            <div className="flex items-center gap-3 mt-3 p-2 rounded-xl bg-stone-50 dark:bg-white/5 border border-[var(--border-light)]">
              {avatar && avatarMode !== 'initials' ? (
                <img src={avatar} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-[#e8b4b8]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#f5edea] dark:bg-[#2d2228] text-[#d49a9e] font-bold flex items-center justify-center text-sm">
                  {name ? name.charAt(0).toUpperCase() : 'G'}
                </div>
              )}
              <div className="text-xs">
                <p className="font-bold text-[var(--text-primary)]">{name || 'Guest Name'}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{role} • {treatment || 'Treatment'}</p>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-light)]">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingTestimonial ? 'Update Testimonial' : 'Save & Publish Testimonial'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
