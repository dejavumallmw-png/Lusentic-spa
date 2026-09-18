import React, { useState } from 'react';
import { X, Gift, Sparkles, Check, Copy } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

interface GiftVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVoucherToCart?: (amount: number, recipientName: string) => void;
}

export const GiftVoucherModal: React.FC<GiftVoucherModalProps> = ({
  isOpen,
  onClose,
  onAddVoucherToCart,
}) => {
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [message, setMessage] = useState<string>('Wishing you restorative peace, self-care, and pure relaxation.');
  const [purchased, setPurchased] = useState<boolean>(false);
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const presetAmounts = [500, 850, 1000, 1500, 2500];

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `LUS-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setVoucherCode(code);
    setPurchased(true);

    if (onAddVoucherToCart) {
      onAddVoucherToCart(amount, recipientName || 'Valued Guest');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-[var(--bg-card)] text-[var(--text-primary)] rounded-[32px] border border-[var(--border-light)] shadow-2xl p-6 sm:p-9 z-10 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#FFD700]/20 flex items-center justify-center text-[#996500] dark:text-[#FFD700]">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold leading-tight">
                Digital <span className="italic text-[#d49a9e]">Gift Voucher</span>
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Gift someone an exquisite day of peace and pampering
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-5">
          {/* Interactive Luxury Voucher Card Preview */}
          <div className="relative rounded-[24px] p-6 bg-gradient-to-tr from-[#1a1418] via-[#2d2228] to-[#120e10] text-white shadow-xl border border-[#FFD700]/40 overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#FFD700]/15 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFD700]">
                  Sanctuary Certificate
                </span>
                <h3 className="font-serif-luxury text-xl font-bold tracking-wide">
                  Lusentic Spa &amp; Wellness
                </h3>
              </div>
              <Sparkles className="w-6 h-6 text-[#FFD700]" />
            </div>

            <div className="mb-4">
              <span className="text-[11px] text-white/60">Voucher Value</span>
              <div className="text-3xl sm:text-4xl font-bold font-serif-luxury text-[#e8b4b8]">
                R{amount.toLocaleString()}
              </div>
            </div>

            <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/80">
              <div>
                <p className="text-[10px] text-white/50">For:</p>
                <p className="font-semibold text-white truncate max-w-[150px]">
                  {recipientName || 'Special Someone'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/50">From:</p>
                <p className="font-semibold text-white truncate max-w-[150px]">
                  {senderName || 'You'}
                </p>
              </div>
            </div>

            {voucherCode && (
              <div className="mt-3 p-2 rounded-xl bg-white/10 border border-[#FFD700]/50 flex items-center justify-between text-xs font-mono">
                <span className="text-[#FFD700] tracking-widest">{voucherCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="text-[11px] text-white/80 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>

          {purchased ? (
            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-center space-y-2">
              <p className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" /> Digital Voucher Created!
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                The voucher code <span className="font-mono font-bold text-[var(--text-primary)]">{voucherCode}</span> is active and redeemable online or at spa reception.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPurchased(false)}
                className="mt-2 text-xs"
              >
                Create Another Voucher
              </Button>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Select Preset Amount */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Select Amount (R)
                </label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {presetAmounts.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        amount === p && !customAmount
                          ? 'bg-[#e8b4b8] text-[#1a1418] shadow-sm'
                          : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                      }`}
                    >
                      R{p}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Or enter custom amount in R..."
                  value={customAmount}
                  onChange={handleCustomChange}
                  className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-light)] bg-transparent text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Recipient Name"
                  placeholder="Recipient's Name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                />
                <Input
                  label="Recipient Email"
                  type="email"
                  placeholder="recipient@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>

              <Input
                label="Sender Name (From)"
                placeholder="Your Name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Personal Gift Message
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[var(--border-light)] bg-transparent text-xs focus:outline-none focus:border-[#e8b4b8] resize-none"
                />
              </div>

              <Button
                variant="gold"
                size="md"
                type="submit"
                fullWidth
                icon={<Gift className="w-4 h-4" />}
                className="font-bold text-sm shadow-md"
              >
                Generate &amp; Activate Voucher (R{amount.toLocaleString()})
              </Button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
