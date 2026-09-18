import React, { useState } from 'react';
import { X, Check, Calendar as CalendarIcon, Clock, User, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Treatment, Therapist, BookingFormData } from '../../types';
import { INITIAL_TREATMENTS, INITIAL_THERAPISTS } from '../../data/initialData';
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

  const [step, setStep] = useState<number>(1);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<number>(
    preSelectedTreatment?.id || INITIAL_TREATMENTS[0].id
  );
  
  // Default to tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(defaultDateStr);
  const [selectedTherapistId, setSelectedTherapistId] = useState<number>(
    preSelectedTherapist?.id || INITIAL_THERAPISTS[0].id
  );
  const [selectedTime, setSelectedTime] = useState<string>('14:00');

  const [clientName, setClientName] = useState<string>(
    user ? `${user.firstName} ${user.lastName}` : 'Amanda Khumalo'
  );
  const [clientPhone, setClientPhone] = useState<string>(user?.phone || '+27 82 555 0192');
  const [clientEmail, setClientEmail] = useState<string>(user?.email || 'amanda.guest@lusenticspa.com');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const currentTreatment = INITIAL_TREATMENTS.find((t) => t.id === selectedTreatmentId);
  const currentTherapist = INITIAL_THERAPISTS.find((th) => th.id === selectedTherapistId);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

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

      {/* Modal Dialog (PDF Spec: Frame 540 x auto, max 90vh, Background #1e181c, Radius 30px, Padding 40px 35px) */}
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

        {/* 4 Step Indicator Dots (PDF Spec: 40x4px rounded, active: Dust Pink, inactive: rgba(255,255,255,0.2)) */}
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
                <span className="text-[#e8b4b8]">{INITIAL_TREATMENTS.length} Available</span>
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {INITIAL_TREATMENTS.map((treatment) => {
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
                        className={`p-3 rounded-xl border text-xs font-medium transition-all ${
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
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                  Select Therapist
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {INITIAL_THERAPISTS.map((th) => {
                    const isSelected = selectedTherapistId === th.id;
                    return (
                      <div
                        key={th.id}
                        onClick={() => setSelectedTherapistId(th.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'border-[#e8b4b8] bg-[#e8b4b8]/20 shadow-xs'
                            : 'border-white/10 bg-white/5 hover:border-white/30'
                        }`}
                      >
                        <img
                          src={th.avatar}
                          alt={th.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#e8b4b8]"
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                  Select Available Time Slot
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 px-1 rounded-xl text-xs font-medium transition-all text-center ${
                          isSelected
                            ? 'bg-[#e8b4b8] text-[#1a1418] font-bold shadow-md'
                            : 'bg-white/5 border border-white/10 hover:border-[#e8b4b8] text-white/80'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
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

              <Input
                label="Full Name *"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Amanda Khumalo"
                required
                className="bg-white/10 border-white/20 text-white placeholder-white/40"
              />

              <Input
                label="Contact Phone / WhatsApp *"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+27 82 000 0000"
                required
                className="bg-white/10 border-white/20 text-white placeholder-white/40"
              />

              <Input
                label="Email Address"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="bg-white/10 border-white/20 text-white placeholder-white/40"
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                  Special Notes or Health Concerns
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any tension areas, pressure preferences, allergies, or injuries..."
                  className="w-full p-3 rounded-2xl bg-white/10 border border-white/20 text-white text-xs placeholder-white/40 focus:outline-none focus:border-[#e8b4b8] resize-none"
                />
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-3">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              icon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="text-xs sm:text-sm font-bold ml-auto"
            >
              Continue to Step {step + 1}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={isSubmitting || !clientName || !clientPhone}
              icon={<Check className="w-4 h-4" />}
              iconPosition="right"
              className="text-xs sm:text-sm font-bold ml-auto"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
};
