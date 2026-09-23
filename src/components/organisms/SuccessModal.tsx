import React from 'react';
import { CheckCircle2, MessageSquare, ArrowRight, Calendar, UserCheck } from 'lucide-react';
import { Booking } from '../../types';
import { Button } from '../atoms/Button';
import { settingsService } from '../../services/settingsService';

interface SuccessModalProps {
  booking: Booking | null;
  onClose: () => void;
  onViewDashboard: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  booking,
  onClose,
  onViewDashboard,
}) => {
  if (!booking) return null;

  const settings = settingsService.getSettings();
  const brandName = `${settings.brandName || 'Lusentic'} ${settings.brandSuffix || 'Spa'}`.trim();
  const rawPhone = settings.socials?.whatsapp || settings.phone || '27825550192';
  const cleanPhone = rawPhone.replace(/\D/g, '') || '27825550192';

  const whatsappMessage = encodeURIComponent(
    `Hello ${brandName}! I just booked an appointment.\nBooking ID: ${booking.bookingId}\nTreatment: ${booking.treatmentName}\nDate: ${booking.date} at ${booking.time}\nName: ${booking.clientName}`
  );

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
      />

      {/* Success Dialog (PDF Spec: Frame 500px, Background #1e181c, Radius 30px, Padding 50px 40px, Text Align Center) */}
      <div className="relative w-full max-w-[500px] bg-[#1e181c] text-white rounded-[30px] border border-white/10 shadow-2xl p-8 sm:p-10 text-center flex flex-col items-center z-10">
        
        {/* Check Icon: 64px / #4ade80 */}
        <div className="w-16 h-16 rounded-full bg-[#4ade80]/15 flex items-center justify-center text-[#4ade80] mb-4">
          <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
        </div>

        {/* H2: "Booking Confirmed!" 32px */}
        <h2 className="font-serif-luxury text-3xl sm:text-[32px] font-normal text-white mb-2">
          Booking <span className="text-[#e8b4b8] italic">Confirmed!</span>
        </h2>

        <p className="text-sm text-white/70 max-w-sm mb-6 leading-relaxed">
          Your luxury sanctuary session has been registered. We have sent an email and SMS confirmation to your details.
        </p>

        {/* Booking Code Box (PDF Spec: Padding 12px 20px, Radius 16px, Border 1px dashed Dust Pink, Font: monospace / 24px / letter-spacing 2, Color: Dust Pink) */}
        <div className="w-full py-3.5 px-5 rounded-[16px] border border-dashed border-[#e8b4b8] bg-[#e8b4b8]/10 mb-6">
          <span className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
            Official Booking Reference Code
          </span>
          <span className="font-mono text-xl sm:text-2xl font-bold tracking-[2px] text-[#e8b4b8] select-all">
            {booking.bookingId}
          </span>
        </div>

        {/* Details Summary (15.2px / rgba(255,255,255,0.7)) */}
        <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs sm:text-[14px] text-white/70 space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <span>Therapy:</span>
            <span className="text-white font-semibold">{booking.treatmentName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Date &amp; Time:</span>
            <span className="text-white font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#e8b4b8]" />
              {booking.date} at {booking.time}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Therapist:</span>
            <span className="text-white font-semibold flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-[#e8b4b8]" />
              {booking.therapistName}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            <span>Amount Due on Arrival:</span>
            <span className="text-[#e8b4b8] font-bold text-base">R{booking.price}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <a
            href={`https://wa.me/${cleanPhone}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-white hover:bg-gray-100 text-[#1a1418] font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-[#25D366]" />
            <span>Send Details to Spa via WhatsApp</span>
          </a>

          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={onViewDashboard}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            View in My Bookings Dashboard
          </Button>

          <button
            onClick={onClose}
            className="text-xs text-white/50 hover:text-white pt-2 cursor-pointer transition-colors"
          >
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
};
