import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowLeft,
  UserCheck,
  Camera,
  Phone,
  User,
  Star,
  MessageSquarePlus,
  Save,
  Check
} from 'lucide-react';
import { Booking, Treatment } from '../../types';
import { bookingService } from '../../services/bookingService';
import { treatmentService } from '../../services/treatmentService';
import { testimonialService } from '../../services/testimonialService';
import { useAuth } from '../../app/providers/AuthProvider';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { StatCard } from '../molecules/StatCard';

interface ClientDashboardProps {
  onBackToHome: () => void;
  onBookNewSession: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  onBackToHome,
  onBookNewSession,
}) => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'review'>('bookings');

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Profile Form state
  const [phone, setPhone] = useState(user?.phone || '');
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Review Form state
  const [reviewTreatment, setReviewTreatment] = useState('');
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allBookings, allTreatments] = await Promise.all([
        bookingService.getBookings(),
        treatmentService.getAll(),
      ]);
      setBookings(allBookings);
      setTreatments(allTreatments);
      if (allTreatments.length > 0 && !reviewTreatment) {
        setReviewTreatment(allTreatments[0].name);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      setUsername(user.username || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleCancelBooking = async (id: number) => {
    await bookingService.cancelBooking(id);
    loadData();
  };

  // Handle Photo selection from internal device storage
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ phone, username, avatar });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) return;

    setReviewSubmitting(true);
    try {
      const clientFullName = user ? (user.username || `${user.firstName} ${user.lastName}`) : 'Verified Guest';
      await testimonialService.addTestimonial({
        name: clientFullName,
        role: 'Verified Sanctuary Guest',
        treatment: reviewTreatment,
        stars: reviewStars,
        content: reviewContent,
        avatar: avatar || user?.avatar || user?.profilePhoto,
      });

      setReviewSuccess(true);
      setReviewContent('');
      setTimeout(() => {
        setReviewSuccess(false);
        setActiveTab('bookings');
      }, 2500);
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Stats calculation
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === statusFilter);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back and Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sanctuary Home</span>
          </button>

          <span className="text-xs text-[var(--text-muted)] font-medium">
            Client Sanctuary Portal • Lusentic Spa
          </span>
        </div>

        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-light)] shadow-[var(--shadow)]">
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatar || user?.avatar ? (
                <img
                  src={avatar || user?.avatar}
                  alt={user?.firstName || 'Client'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#e8b4b8] shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#d49a9e] to-[#e8b4b8] text-[#1a1418] text-xl font-bold flex items-center justify-center shadow-md">
                  {user ? user.firstName.charAt(0) : 'A'}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-serif-luxury text-2xl sm:text-3xl font-light text-[var(--text-primary)]">
                  Welcome, <span className="font-normal text-[#d49a9e] italic">{user ? (user.username || user.firstName) : 'Amanda'}</span>
                </h1>
                
                {/* Loyalty Badge */}
                <Badge variant="gold" className="px-3 py-1 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{user?.loyaltyPoints || 140} pts</span>
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                Logged in as <strong className="text-[var(--text-primary)]">{user?.email || 'amanda.guest@lusenticspa.com'}</strong> • Phone: {user?.phone || 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={onBookNewSession}
              className="text-xs sm:text-sm font-bold shadow-md"
            >
              Book Session
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--border-light)] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'bg-[#e8b4b8] text-[#1a1418] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Bookings &amp; History ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-[#e8b4b8] text-[#1a1418] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Profile Photo &amp; Phone</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'review'
                ? 'bg-[#e8b4b8] text-[#1a1418] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Post Verified Experience</span>
          </button>
        </div>

        {/* TAB 1: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard
                title="Total Bookings"
                value={totalBookings}
                subtitle="All recorded sessions"
                icon={<Calendar className="w-5 h-5" />}
              />
              <StatCard
                title="Pending Approval"
                value={pendingCount}
                subtitle="Awaiting spa staff review"
                variant="pink"
                icon={<AlertCircle className="w-5 h-5 text-[#d49a9e]" />}
              />
              <StatCard
                title="Confirmed"
                value={confirmedCount}
                subtitle="Scheduled &amp; ready"
                variant="green"
                icon={<CheckCircle2 className="w-5 h-5 text-[#28a745]" />}
              />
              <StatCard
                title="Completed"
                value={completedCount}
                subtitle="Past restorative visits"
                variant="gold"
                icon={<Award className="w-5 h-5 text-[#FFD700]" />}
              />
            </div>

            {/* Bookings Table */}
            <div className="rounded-[20px] bg-[var(--bg-card)] border border-[var(--border-light)] shadow-[var(--shadow)] p-5 sm:p-[25px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border-light)]">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    Appointments History &amp; Upcoming
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Real-time booking status managed by Lusentic Spa reception
                  </p>
                </div>

                {/* Filter buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                        statusFilter === status
                          ? 'bg-[#e8b4b8] text-[#1a1418] font-bold shadow-xs'
                          : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-sm text-[var(--text-muted)]">
                  Loading your appointments...
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="py-16 text-center text-[var(--text-muted)]">
                  <Calendar className="w-10 h-10 mx-auto text-[#d49a9e] opacity-40 mb-3" />
                  <p className="text-base font-medium text-[var(--text-primary)]">No appointments found</p>
                  <p className="text-xs mt-1 mb-4">You have no bookings matching this status.</p>
                  <Button variant="primary" size="sm" onClick={onBookNewSession}>
                    Book a Session Now
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-light)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-3">Booking ID</th>
                        <th className="py-3 px-3">Treatment</th>
                        <th className="py-3 px-3">Therapist</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Time</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-light)]">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                          <td className="py-3.5 px-3 font-mono font-medium text-[11px] sm:text-xs text-[#b57377] whitespace-nowrap">
                            {b.bookingId}
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-[var(--text-primary)]">
                            {b.treatmentName}
                            <span className="block text-[11px] font-normal text-[var(--text-muted)]">
                              R{b.price}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-[var(--text-muted)] whitespace-nowrap">
                            <span className="flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-[#d49a9e]" />
                              {b.therapistName}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-[var(--text-primary)] whitespace-nowrap">
                            {b.date}
                          </td>
                          <td className="py-3.5 px-3 text-[var(--text-primary)] whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#d49a9e]" />
                              {b.time}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <Badge status={b.status} />
                          </td>
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            {b.status === 'pending' || b.status === 'confirmed' ? (
                              <button
                                onClick={() => handleCancelBooking(b.id)}
                                className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                                title="Cancel Appointment"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                            ) : (
                              <span className="text-xs text-[var(--text-muted)] italic">
                                Archived
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE & PHOTO FROM INTERNAL STORAGE */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-light)] shadow-[var(--shadow)] p-6 sm:p-8 animate-in fade-in duration-200">
            <h2 className="font-serif-luxury text-2xl font-bold text-[var(--text-primary)] mb-2">
              Profile &amp; Contact Details
            </h2>
            <p className="text-xs text-[var(--text-muted)] mb-6">
              Add your photo to preview on guest testimonials, and set your phone number to automatically prefill and speed up your session bookings.
            </p>

            {profileSaved && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                Profile updated successfully! Your photo and phone number are saved.
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Photo Select from Internal Storage */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Profile Photo (Select from Device / Internal Storage)
                </label>
                
                <div className="flex items-center gap-5">
                  <div className="relative">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-[#e8b4b8] shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-white/10 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 dark:border-white/20">
                        <User className="w-8 h-8 opacity-40" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 border border-gray-300 dark:border-white/20 text-xs font-bold text-[var(--text-primary)] cursor-pointer transition-colors">
                      <Camera className="w-4 h-4 text-[#d49a9e]" />
                      <span>Choose Photo from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      JPEG, PNG, WebP supported. Photo will show on your testimonials and account badge.
                    </p>
                  </div>
                </div>
              </div>

              {/* Username Input */}
              <Input
                label="Client Username (Used on Bookings & Reviews)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. AmandaKhumalo"
                required
              />

              {/* Phone Input */}
              <div className="space-y-1">
                <Input
                  label="Contact Phone / WhatsApp Number *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +27 82 555 0192"
                  required
                />
                <p className="text-[11px] text-[var(--text-muted)]">
                  * Saved to your profile so it automatically populates the booking form to save you time.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                icon={<Save className="w-4 h-4" />}
                className="font-bold text-xs sm:text-sm mt-4 shadow-md"
              >
                Save Profile &amp; Contact Information
              </Button>
            </form>
          </div>
        )}

        {/* TAB 3: POST TESTIMONIAL (Only posted by clients) */}
        {activeTab === 'review' && (
          <div className="max-w-2xl mx-auto rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-light)] shadow-[var(--shadow)] p-6 sm:p-8 animate-in fade-in duration-200">
            <h2 className="font-serif-luxury text-2xl font-bold text-[var(--text-primary)] mb-2">
              Share Your Guest Experience
            </h2>
            <p className="text-xs text-[var(--text-muted)] mb-6">
              As a verified sanctuary guest, your authentic feedback helps others discover tranquility. Your review will immediately display in the Words of Serenity section!
            </p>

            {reviewSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4" />
                Thank you! Your verified testimonial has been published to the sanctuary home page.
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-5">
              {/* Star Rating */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Your Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewStars(star)}
                      className="p-1 text-2xl transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewStars
                            ? 'fill-[#FFD700] text-[#FFD700]'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-[#FFD700] ml-2">
                    {reviewStars}.0 / 5.0 Stars
                  </span>
                </div>
              </div>

              {/* Treatment Experienced */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Treatment Experienced *
                </label>
                <select
                  value={reviewTreatment}
                  onChange={(e) => setReviewTreatment(e.target.value)}
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-light)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d49a9e]"
                >
                  {treatments.map((t) => (
                    <option key={t.id} value={t.name} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                      {t.name} ({t.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Review Content */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Your Review / Testimony *
                </label>
                <textarea
                  rows={4}
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Describe how you felt during and after your session with our therapists..."
                  required
                  className="w-full p-3.5 rounded-xl border border-[var(--border-light)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d49a9e] resize-none"
                />
              </div>

              {/* Preview of author info */}
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-white/5 border border-[var(--border-light)] flex items-center gap-3">
                {avatar || user?.avatar ? (
                  <img
                    src={avatar || user?.avatar}
                    alt="Author"
                    className="w-10 h-10 rounded-full object-cover border border-[#e8b4b8]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#e8b4b8] text-[#1a1418] font-bold flex items-center justify-center text-sm">
                    {user ? user.firstName.charAt(0) : 'A'}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    Publishing as: {user ? (user.username || `${user.firstName} ${user.lastName}`) : 'Amanda Khumalo'}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ Verified Guest Badge will be attached
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={reviewSubmitting}
                icon={<MessageSquarePlus className="w-4 h-4" />}
                className="font-bold text-xs sm:text-sm mt-2 shadow-md"
              >
                {reviewSubmitting ? 'Submitting Testimony...' : 'Publish Guest Review'}
              </Button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
