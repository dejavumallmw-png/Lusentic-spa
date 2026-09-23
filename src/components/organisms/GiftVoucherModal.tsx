import React, { useState, useEffect } from 'react';
import { X, Gift, Sparkles, MessageCircle, Phone, Heart } from 'lucide-react';
import { Treatment } from '../../types';
import { treatmentService } from '../../services/treatmentService';
import { settingsService } from '../../services/settingsService';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { useAuth } from '../../app/providers/AuthProvider';

interface GiftVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVoucherToCart?: (amount: number, name: string) => void;
}

export const GiftVoucherModal: React.FC<GiftVoucherModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [businessPhone, setBusinessPhone] = useState<string>('27825550192');

  const [selectedTreatment, setSelectedTreatment] = useState<string>('Swedish Full Body Massage (60 min)');
  const [treatmentPrice, setTreatmentPrice] = useState<number>(650);
  const [gifterName, setGifterName] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [specialMessage, setSpecialMessage] = useState<string>(
    'Wishing you moments of pure tranquility, restorative peace, and wellness.'
  );

  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      const [tList, settings] = await Promise.all([
        treatmentService.getAll(),
        settingsService.getSettings(),
      ]);
      setTreatments(tList);
      if (tList.length > 0) {
        setSelectedTreatment(tList[0].name);
        setTreatmentPrice(tList[0].price);
      }
      if (settings?.phone) {
        // clean phone digits for WhatsApp
        const digits = settings.phone.replace(/[^0-9]/g, '');
        if (digits) setBusinessPhone(digits);
      }
    };
    load();

    if (user) {
      setGifterName(user.username || `${user.firstName} ${user.lastName}`);
    } else {
      setGifterName('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleTreatmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedTreatment(val);
    const found = treatments.find((t) => t.name === val);
    if (found) setTreatmentPrice(found.price);
  };

  const handleWhatsAppInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const textMsg = `Hello Lusentic Spa Sanctuary,

I would like to inquire about purchasing a Gift Voucher:
• Therapy / Treatment: ${selectedTreatment} (R${treatmentPrice})
• Gifter (My Name): ${gifterName || 'A Valued Guest'}
• Recipient: ${recipientName || 'Special Someone'}
• Special Message: "${specialMessage}"

Please guide me through the payment and voucher delivery process. Thank you!`;

    const encoded = encodeURIComponent(textMsg);
    const waUrl = `https://wa.me/${businessPhone}?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#1e181c] text-gray-900 dark:text-white rounded-[32px] border border-[#e5d5d8] dark:border-white/10 shadow-2xl p-6 sm:p-8 z-10 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#FFD700]/20 flex items-center justify-center text-[#996500] dark:text-[#FFD700]">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold leading-tight text-gray-900 dark:text-white">
                Gift a <span className="italic text-[#b57377] dark:text-[#e8b4b8]">Voucher</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-white/60">
                Inquire and order a personalized luxury spa gift voucher directly on WhatsApp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Interactive Luxury Voucher Card Preview */}
          <div className="relative rounded-[24px] p-5 sm:p-6 bg-gradient-to-tr from-[#1a1418] via-[#2d2228] to-[#120e10] text-white shadow-xl border border-[#FFD700]/40 overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#FFD700]/15 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFD700]">
                  Sanctuary Gift Certificate
                </span>
                <h3 className="font-serif-luxury text-lg sm:text-xl font-bold tracking-wide">
                  Lusentic Spa &amp; Wellness
                </h3>
              </div>
              <Sparkles className="w-5 h-5 text-[#FFD700]" />
            </div>

            <div className="mb-4 bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-white/60 uppercase tracking-wider font-semibold">Chosen Experience:</span>
              <div className="text-base sm:text-lg font-bold text-[#e8b4b8] truncate">
                {selectedTreatment}
              </div>
              <div className="text-sm font-bold text-[#FFD700] mt-0.5">
                Approx. R{treatmentPrice.toLocaleString()}
              </div>
            </div>

            <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-white/80">
              <div>
                <p className="text-[10px] text-white/50">For (Recipient):</p>
                <p className="font-semibold text-white truncate max-w-[150px]">
                  {recipientName || 'Special Someone'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/50">From (Gifter):</p>
                <p className="font-semibold text-white truncate max-w-[150px]">
                  {gifterName || 'You'}
                </p>
              </div>
            </div>

            {specialMessage && (
              <div className="mt-3 pt-2 border-t border-white/10 text-[11px] italic text-white/70">
                "{specialMessage}"
              </div>
            )}
          </div>

          <form onSubmit={handleWhatsAppInquiry} className="space-y-3.5">
            {/* Treatment Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                What Treatment Would You Like to Gift? *
              </label>
              <select
                value={selectedTreatment}
                onChange={handleTreatmentChange}
                required
                className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-white/20 bg-stone-50 dark:bg-white/10 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8] focus:bg-white dark:focus:bg-[#1a1418] transition-all"
              >
                {treatments.map((t) => (
                  <option key={t.id} value={t.name} className="bg-white dark:bg-[#1a1418] text-stone-900 dark:text-white">
                    {t.name} (R{t.price} • {t.duration} min)
                  </option>
                ))}
                <option value="Custom Sanctuary Pamper Package" className="bg-white dark:bg-[#1a1418] text-stone-900 dark:text-white">
                  Custom Sanctuary Pamper Package (Value of your choice)
                </option>
              </select>
            </div>

            {/* Gifter Name and Recipient Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Your Name (Gifter) *"
                placeholder="e.g. Lerato Ndlovu"
                value={gifterName}
                onChange={(e) => setGifterName(e.target.value)}
                required
                className="bg-stone-50 dark:bg-white/10 border-stone-300 dark:border-white/20 text-stone-900 dark:text-white placeholder:text-stone-400"
              />
              <Input
                label="Recipient's Name *"
                placeholder="e.g. Thabo Molefe"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required
                className="bg-stone-50 dark:bg-white/10 border-stone-300 dark:border-white/20 text-stone-900 dark:text-white placeholder:text-stone-400"
              />
            </div>

            {/* Special Message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1">
                Special Message for the Recipient
              </label>
              <textarea
                rows={2}
                value={specialMessage}
                onChange={(e) => setSpecialMessage(e.target.value)}
                placeholder="Write a sweet birthday, anniversary, or self-care note..."
                className="w-full p-3 rounded-xl border border-stone-300 dark:border-white/20 bg-stone-50 dark:bg-white/10 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8] focus:bg-white dark:focus:bg-[#1a1418] transition-all resize-none placeholder:text-stone-400"
              />
            </div>

            {/* WhatsApp Inquiry Button */}
            <div className="pt-2">
              <Button
                variant="whatsapp"
                size="md"
                type="submit"
                fullWidth
                icon={<MessageCircle className="w-5 h-5" />}
                className="font-bold text-xs sm:text-sm shadow-md py-3"
              >
                Inquire on WhatsApp with Business
              </Button>
              <p className="text-[11px] text-center text-gray-500 dark:text-white/50 mt-1.5 flex items-center justify-center gap-1">
                <Phone className="w-3 h-3 text-[#25D366]" />
                Direct inquiry to Lusentic Spa WhatsApp concierge
              </p>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
