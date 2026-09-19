import React, { useState, useEffect } from 'react';
import { X, Check, Calendar as CalendarIcon, Clock, User, ArrowRight, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { Treatment, Therapist, BookingFormData, Booking } from '../../types';
import { treatmentService } from '../../services/treatmentService';
import { therapistService } from '../../services/therapistService';
import { bookingService } from '../../services/bookingService';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { useAuth } from '../../app/providers/AuthProvider';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedTreatment?: Treatment | null;
  preSelectedTherapist?: Therapist | null;
  onSubmitBooking: (formData: BookingFormData) => Promise<void>;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preSelectedTreatment,
  preSelectedTherapist,
  onSubmitBooking,
}) => {
  const { user } = useAuth();

  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [slotErrorMessage, setSlotErrorMessage] = useState<string | null>(null);

  const [step, setStep] = useState<number>(1);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<number>(1);
  
  // Default to tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(defaultDateStr);
  const [selectedTherapistId, setSelectedTherapistId] = useState<number>(1);
  const [selectedTime, setSelectedTime] = useState<string>('14:00');

  // Client form data imported from user
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load dynamic treatments, therapists, bookings and initialize form
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      const [tList, thList, bList] = await Promise.all([
        treatmentService.getAll(),
        therapistService.getAll(),
        bookingService.getBookings(),
      ]);
      setTreatments(tList);
      setTherapists(thList);
      setExistingBookings(bList);

      if (preSelectedTreatment) {
        setSelectedTreatmentId(preSelectedTreatment.id);
      } else if (tList.length > 0) {
        setSelectedTreatmentId(tList[0].id);
      }

      if (preSelectedTherapist) {
        setSelectedTherapistId(preSelectedTherapist.id);
      } else if (thList.length > 0) {
        setSelectedTherapistId(thList[0].id);
      }
    };

    loadData();

    // Import client name from user's username or full name
    if (user) {
      setClientName(user.username || `${user.firstName} ${user.lastName}`);
      setClientPhone(user.phone || '');
      setClientEmail(user.email || '');
    } else {
      setClientName('Guest');
      setClientPhone('');
      setClientEmail('');
    }

    setSlotErrorMessage(null);
    setStep(1);
  }, [isOpen, user, preSelectedTreatment, preSelectedTherapist]);

  if (!isOpen) return null;

  const timeSlots = [
    '09:00',
    '10:30',
    '12:00',
    '13:30',
    '14:00',
    '15:30',
    '17:00',
    '18:30',
  ];

  const currentTreatment = treatments.find((t) => t.id === selectedTreatmentId) || treatments[0];
  const currentTherapist = therapists.find((th) => th.id === selectedTherapistId) || therapists[0];

  // Helper to test if a slot is already booked
  const checkIsSlotBooked = (slot: string) => {
    return existingBookings.some(
      (b) =>
        b.status !== 'cancelled' &&
        b.date === selectedDate &&
        Number(b.therapistId) === Number(selectedTherapistId) &&
        b.time === slot
    );
  };

  const handleSlotClick = (slot: string) => {
    if (checkIsSlotBooked(slot)) {
      setSlotErrorMessage("Slot booked, please choose the available slots");
      setTimeout(() => setSlotErrorMessage(null), 4000);
      return;
    }
    setSlotErrorMessage(null);
    setSelectedTime(slot);
  };

  const handleNext = () => {
    if (step === 3 && checkIsSlotBooked(selectedTime)) {
      setSlotErrorMessage("Slot booked, please choose the available slots");
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    if (checkIsSlotBooked(selectedTime)) {
      setStep(3);
      setSlotErrorMessage("Slot booked, please choose the available slots");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitBooking({
        treatmentId: selectedTreatmentId,
        therapistId: selectedTherapistId,
        date: selectedDate,
        time: selectedTime,
        clientName,
        clientPhone,
        clientEmail,
        notes,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-[560px] max-h-[90vh] bg-[#1e181c] text-white rounded-[30px] border border-white/10 shadow-2xl p-6 sm:p-9 flex flex-col z-10 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-normal font-serif-luxury text-white">
              Book a <span className="text-[#e8b4b8] italic">Session</span>
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              Fill in your details to secure your sanctuary appointment
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xl"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Step Indicator Dots */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-[#e8b4b8]' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Form Body with Scroll */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* STEP 1: Treatment Options */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-white/70 mb-2">
                <span>Select a Treatment:</span>
                <span className="text-[#e8b4b8]">{treatments.length} Available</span>
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {treatments.map((treatment) => {
                  const isSelected = selectedTreatmentId === treatment.id;
                  return (
                    <div
                      key={treatment.id}
                      onClick={() => setSelectedTreatmentId(treatment.id)}
                      className={`p-3.5 rounded-[20px] border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[#e8b4b8] bg-[#e8b4b8]/15 shadow-sm'
                          : 'border-white/10 bg-white/5 hover:border-[#e8b4b8]/50 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#e8b4b8] bg-[#e8b4b8] text-[#1e181c]'
                              : 'border-white/40'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white leading-tight">
                            {treatment.name}
                          </h4>
                          <span className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-[#e8b4b8]" />
                            <span>{treatment.duration} min</span>
                            <span>•</span>
                            <span className="capitalize">{treatment.category}</span>
                          </span>
                        </div>
                      </div>

                      <span className="text-sm font-bold text-[#e8b4b8] whitespace-nowrap">
                        R{treatment.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Date Picker */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#e8b4b8] shrink-0" />
                <div>
                  <p className="font-semibold text-white">Selected Therapy:</p>
                  <p className="text-white/70">{currentTreatment?.name} (R{currentTreatment?.price})</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                  Choose Preferred Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full h-12 px-4 rounded-[16px] bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#e8b4b8]"
                  />
                  <CalendarIcon className="w-4 h-4 text-white/50 absolute right-4 top-4 pointer-events-none" />
                </div>
              </div>

              {/* Quick dates buttons */}
              <div className="space-y-2">
                <span className="text-xs text-white/60">Quick Select:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((offset) => {
                    const d = new Date();
                    d.setDate(d.getDate() + offset);
                    const iso = d.toISOString().split('T')[0];
                    const label = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    const isSelected = selectedDate === iso;

                    return (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => setSelectedDate(iso)}
                        className={`p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#e8b4b8] bg-[#e8b4b8]/20 text-[#e8b4b8] font-bold'
                            : 'border-white/10 bg-white/5 hover:border-white/30 text-white/80'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Therapist + Time Slot */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Slot Clash Warning Banner */}
              {slotErrorMessage && (
                <div className="p-3 rounded-xl bg-red-900/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5 animate-in shake duration-200">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="font-semibold">{slotErrorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                  Select Therapist
                </label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[190px] overflow-y-auto pr-1">
                  {therapists.map((th) => {
                    const isSelected = selectedTherapistId === th.id;
                    return (
                      <div
                        key={th.id}
                        onClick={() => {
                          setSelectedTherapistId(th.id);
                          setSlotErrorMessage(null);
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'border-[#e8b4b8] bg-[#e8b4b8]/20 shadow-xs'
                            : 'border-white/10 bg-white/5 hover:border-white/30'
                        }`}
                      >
                        <img
                          src={th.avatar}
                          alt={th.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#e8b4b8] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{th.name}</p>
                          <p className="text-[10px] text-[#e8b4b8] truncate">{th.role.split('&')[0]}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                    Select Available Time Slot
                  </label>
                  <span className="text-[11px] text-white/50">
                    {selectedDate}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => {
                    const isBooked = checkIsSlotBooked(slot);
                    const isSelected = selectedTime === slot && !isBooked;

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleSlotClick(slot)}
                        className={`py-2 px-1 rounded-xl text-xs font-medium transition-all text-center relative cursor-pointer ${
                          isBooked
                            ? 'opacity-35 line-through bg-white/5 border border-dashed border-red-500/40 text-red-300 hover:opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#e8b4b8] text-[#1a1418] font-bold shadow-md'
                            : 'bg-white/5 border border-white/10 hover:border-[#e8b4b8] text-white/80'
                        }`}
                        title={isBooked ? 'Slot already booked with this therapist' : `Select ${slot}`}
                      >
                        {slot}
                        {isBooked && (
                          <span className="block text-[8px] no-underline font-normal text-red-400 leading-none mt-0.5">
                            Booked
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-white/50 mt-2 italic">
                  * Faded crossed-out slots are already reserved for this therapist on {selectedDate}.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Personal Info */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1">
                <div className="flex justify-between text-white/70">
                  <span>Therapy:</span>
                  <span className="text-white font-semibold">{currentTreatment?.name}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Date &amp; Time:</span>
                  <span className="text-[#e8b4b8] font-semibold">{selectedDate} at {selectedTime}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Therapist:</span>
                  <span className="text-white font-semibold">{currentTherapist?.name}</span>
                </div>
                <div className="flex justify-between text-white/70 pt-1 border-t border-white/10">
                  <span>Session Fee:</span>
                  <span className="text-base font-bold text-[#e8b4b8]">R{currentTreatment?.price}</span>
                </div>
              </div>

              <div className="space-y-1">
                <Input
                  label="Client Name (Imported from account) *"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Amanda Khumalo"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder-white/40"
                />
                <p className="text-[10px] text-white/50">Auto-filled from your logged in profile</p>
              </div>

              <Input
                label="Contact Phone / WhatsApp *"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="e.g. +27 82 555 0192"
                required
                className="bg-white/10 border-white/20 text-white placeholder-white/40"
              />

              <Input
                label="Email Address"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="e.g. amanda.guest@lusenticspa.com"
                className="bg-white/10 border-white/20 text-white placeholder-white/40"
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Special Health / Pressure Preferences
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any focus areas, allergies, injuries, or essential oil preferences..."
                  rows={2}
                  className="w-full p-3 rounded-[16px] bg-white/10 border border-white/20 text-white text-xs placeholder-white/40 focus:outline-none focus:border-[#e8b4b8]"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                fullWidth
                disabled={isSubmitting}
                className="font-bold text-xs sm:text-sm mt-2 shadow-lg"
              >
                {isSubmitting ? 'Confirming Appointment...' : 'Complete Reservation'}
              </Button>
            </form>
          )}

        </div>

        {/* Footer Navigation Buttons for Steps 1-3 */}
        {step < 4 && (
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 mt-3">
            {step > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="border-white/20 text-white hover:bg-white/10 text-xs"
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="text-xs font-bold"
            >
              Continue ({step}/4)
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};
