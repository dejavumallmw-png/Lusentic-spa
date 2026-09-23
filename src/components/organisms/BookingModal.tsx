import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle
} from 'lucide-react';
import { Treatment, Therapist, Booking, BookingFormData } from '../../types';
import { treatmentService } from '../../services/treatmentService';
import { therapistService } from '../../services/therapistService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../app/providers/AuthProvider';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedTreatment?: Treatment | null;
  preSelectedTherapist?: Therapist | null;
  onSubmitBooking?: (formData: BookingFormData) => Promise<void> | void;
  onSuccessBooking?: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preSelectedTreatment,
  preSelectedTherapist,
  onSubmitBooking,
  onSuccessBooking,
}) => {
  const { user } = useAuth();

  // Multi-step state: 1: Treatment, 2: Date, 3: Therapist + Time, 4: Personal Info
  const [step, setStep] = useState(1);

  // Form selections
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<number>(1);
  const [selectedTherapistId, setSelectedTherapistId] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // default tomorrow
  );
  const [selectedTime, setSelectedTime] = useState<string>('14:00');

  // Personal Info Form
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Data lists
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slotErrorMessage, setSlotErrorMessage] = useState<string | null>(null);

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
      setClientName(user.username || `${user.firstName} ${user.lastName || ''}`.trim());
      setClientPhone(user.phone || '');
      setClientEmail(user.email || '');
    } else {
      setClientName('');
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

  // Helper to check if a specific time slot is already booked for this therapist and date
  const checkIsSlotBooked = (timeToCheck: string) => {
    return existingBookings.some(
      (b) =>
        b.therapistId === selectedTherapistId &&
        b.date === selectedDate &&
        b.time === timeToCheck &&
        b.status !== 'cancelled'
    );
  };

  const handleNext = () => {
    setSlotErrorMessage(null);
    if (step === 2 && !selectedDate) {
      setSlotErrorMessage('Please select a preferred appointment date.');
      return;
    }
    if (step === 3) {
      if (checkIsSlotBooked(selectedTime)) {
        setSlotErrorMessage(
          `The ${selectedTime} slot on ${selectedDate} with ${currentTherapist?.name} is already reserved. Please select another slot or therapist.`
        );
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setSlotErrorMessage(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSlotClick = (slot: string) => {
    setSlotErrorMessage(null);
    if (checkIsSlotBooked(slot)) {
      setSlotErrorMessage(
        `The ${slot} slot is already booked for ${currentTherapist?.name} on this date. Please choose a different time.`
      );
      return;
    }
    setSelectedTime(slot);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlotErrorMessage(null);

    if (!clientName.trim() || !clientPhone.trim()) {
      setSlotErrorMessage('Please fill in your name and contact phone number.');
      return;
    }

    if (checkIsSlotBooked(selectedTime)) {
      setSlotErrorMessage(
        `This slot was just taken by another booking. Please choose another slot.`
      );
      setStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData: BookingFormData = {
        clientName: clientName.trim(),
        clientId: user ? user.id : Math.floor(Math.random() * 9000 + 1000),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim() || undefined,
        treatmentId: selectedTreatmentId,
        therapistId: selectedTherapistId,
        date: selectedDate,
        time: selectedTime,
        notes: notes.trim() || undefined,
      };

      if (onSubmitBooking) {
        await onSubmitBooking(formData);
      } else {
        const newBooking = await bookingService.createBooking(formData);
        if (onSuccessBooking) {
          onSuccessBooking(newBooking);
        }
        onClose();
      }
    } catch {
      setSlotErrorMessage('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-[560px] max-h-[90vh] bg-white dark:bg-[#1e181c] text-stone-900 dark:text-white rounded-[32px] border border-stone-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-normal font-serif-luxury text-stone-900 dark:text-white">
              Book a <span className="text-[#b57377] dark:text-[#e8b4b8] italic">Session</span>
            </h2>
            <p className="text-xs text-stone-600 dark:text-white/60 mt-0.5">
              Fill in your details to secure your sanctuary appointment
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 text-stone-600 hover:text-stone-900 dark:text-white/70 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Step Indicator Dots */}
        <div className="flex items-center gap-2 mb-5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step
                  ? 'bg-[#b57377] dark:bg-[#e8b4b8]'
                  : 'bg-stone-200 dark:bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Form Body with Scroll */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* STEP 1: Treatment Options */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-600 dark:text-white/70 mb-2">
                <span className="font-semibold uppercase tracking-wider">Select a Treatment:</span>
                <span className="text-[#b57377] dark:text-[#e8b4b8] font-bold">{treatments.length} Available</span>
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
                          ? 'border-[#b57377] dark:border-[#e8b4b8] bg-[#fcebee] dark:bg-[#e8b4b8]/15 shadow-sm'
                          : 'border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 hover:border-[#b57377]/50 hover:bg-stone-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#b57377] bg-[#b57377] text-white dark:border-[#e8b4b8] dark:bg-[#e8b4b8] dark:text-[#1e181c]'
                              : 'border-stone-400 dark:border-white/40'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-stone-900 dark:text-white leading-tight">
                            {treatment.name}
                          </h4>
                          <span className="text-xs text-stone-600 dark:text-white/50 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-[#b57377] dark:text-[#e8b4b8]" />
                            <span>{treatment.duration} min</span>
                            <span>•</span>
                            <span className="capitalize">{treatment.category}</span>
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[#b57377] dark:text-[#e8b4b8] shrink-0">
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
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-xs flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#b57377] dark:text-[#e8b4b8] shrink-0" />
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">Selected Therapy:</p>
                  <p className="text-stone-700 dark:text-white/70">{currentTreatment?.name} (R{currentTreatment?.price})</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-2">
                  Choose Preferred Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full h-12 px-4 rounded-[16px] bg-stone-50 dark:bg-white/10 border border-stone-300 dark:border-white/20 text-stone-900 dark:text-white text-sm focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8]"
                  />
                  <CalendarIcon className="w-4 h-4 text-stone-500 dark:text-white/50 absolute right-4 top-4 pointer-events-none" />
                </div>
              </div>

              {/* Quick dates buttons */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-stone-700 dark:text-white/60">Quick Select:</span>
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
                        className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#b57377] bg-[#fcebee] text-[#b57377] dark:border-[#e8b4b8] dark:bg-[#e8b4b8]/20 dark:text-[#e8b4b8]'
                            : 'border-stone-200 bg-stone-50 hover:border-stone-300 dark:border-white/10 dark:bg-white/5 text-stone-800 dark:text-white/80'
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
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-500/50 text-red-800 dark:text-red-200 text-xs flex items-center gap-2.5 animate-in shake duration-200">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span className="font-semibold">{slotErrorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-2">
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
                            ? 'border-[#b57377] bg-[#fcebee] dark:border-[#e8b4b8] dark:bg-[#e8b4b8]/20 shadow-xs'
                            : 'border-stone-200 bg-stone-50 hover:border-stone-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30'
                        }`}
                      >
                        <img
                          src={th.avatar}
                          alt={th.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#b57377] dark:border-[#e8b4b8] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-900 dark:text-white truncate">{th.name}</p>
                          <p className="text-[10px] text-[#b57377] dark:text-[#e8b4b8] truncate font-medium">{th.role.split('&')[0]}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                    Select Available Time Slot
                  </label>
                  <span className="text-[11px] text-stone-600 dark:text-white/50">
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
                            ? 'opacity-40 line-through bg-stone-100 dark:bg-white/5 border border-dashed border-red-300 dark:border-red-500/40 text-red-600 dark:text-red-300 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#b57377] text-white dark:bg-[#e8b4b8] dark:text-[#1a1418] font-bold shadow-md'
                            : 'bg-stone-50 border border-stone-200 hover:border-[#b57377] dark:bg-white/5 dark:border-white/10 dark:hover:border-[#e8b4b8] text-stone-800 dark:text-white/80'
                        }`}
                        title={isBooked ? 'Slot already booked with this therapist' : `Select ${slot}`}
                      >
                        {slot}
                        {isBooked && (
                          <span className="block text-[8px] no-underline font-normal text-red-500 dark:text-red-400 leading-none mt-0.5">
                            Booked
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-white/50 mt-2 italic">
                  * Faded crossed-out slots are already reserved for this therapist on {selectedDate}.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Personal Info */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-xs space-y-1">
                <div className="flex justify-between text-stone-700 dark:text-white/70">
                  <span>Therapy:</span>
                  <span className="text-stone-900 dark:text-white font-bold">{currentTreatment?.name}</span>
                </div>
                <div className="flex justify-between text-stone-700 dark:text-white/70">
                  <span>Date &amp; Time:</span>
                  <span className="text-[#b57377] dark:text-[#e8b4b8] font-bold">{selectedDate} at {selectedTime}</span>
                </div>
                <div className="flex justify-between text-stone-700 dark:text-white/70">
                  <span>Therapist:</span>
                  <span className="text-stone-900 dark:text-white font-bold">{currentTherapist?.name}</span>
                </div>
                <div className="flex justify-between text-stone-700 dark:text-white/70 pt-1 border-t border-stone-200 dark:border-white/10">
                  <span>Session Fee:</span>
                  <span className="text-base font-bold text-[#b57377] dark:text-[#e8b4b8]">R{currentTreatment?.price}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Amanda Khumalo"
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-white/20 bg-stone-50 dark:bg-white/10 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/40 text-xs focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8] focus:bg-white dark:focus:bg-[#1a1418] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  Contact Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="e.g. +27 82 555 0192"
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-white/20 bg-stone-50 dark:bg-white/10 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/40 text-xs focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8] focus:bg-white dark:focus:bg-[#1a1418] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  Email Address <span className="font-normal text-stone-500 dark:text-white/50 lowercase">(optional)</span>
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="e.g. amanda.guest@lusenticspa.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-white/20 bg-stone-50 dark:bg-white/10 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/40 text-xs focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8] focus:bg-white dark:focus:bg-[#1a1418] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                  Special Health / Pressure Preferences
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any focus areas, allergies, injuries, or essential oil preferences..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-stone-50 dark:bg-white/10 border border-stone-300 dark:border-white/20 text-stone-900 dark:text-white text-xs placeholder:text-stone-400 dark:placeholder:text-white/40 focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8] focus:bg-white dark:focus:bg-[#1a1418] transition-all"
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
          <div className="pt-4 border-t border-stone-200 dark:border-white/10 flex items-center justify-between gap-3 mt-3">
            {step > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="border-stone-300 dark:border-white/20 text-stone-700 dark:text-white hover:bg-stone-100 dark:hover:bg-white/10 text-xs"
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
