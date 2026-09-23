import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  UserCheck,
  Camera,
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
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.profilePhoto || user?.avatar || '');
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
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setAvatar(user.profilePhoto || user.avatar || '');
    }
  }, [user]);

  const handleCancelBooking = async (id: number) => {
    await bookingService.cancelBooking(id);
    loadData();
  };

  // Handle Photo selection from device storage
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const photoUrl = reader.result;
          setAvatar(photoUrl);
          updateProfile({ profilePhoto: photoUrl, avatar: photoUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      phone,
      firstName,
      lastName,
      email: email.trim() || undefined,
      profilePhoto: avatar,
      avatar,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) return;

    setReviewSubmitting(true);
    try {
      const clientFullName = user
        ? `${user.firstName} ${user.lastName || ''}`.trim() || user.username
        : 'Verified Guest';
      
      const photoToUse = avatar || user?.profilePhoto || user?.avatar;

      await testimonialService.addTestimonial({
        name: clientFullName,
        role: 'Verified Sanctuary Guest',
        treatment: reviewTreatment,
        stars: reviewStars,
        content: reviewContent.trim(),
        avatar: photoToUse || undefined,
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

  // Filter bookings for this client
  const clientBookings = bookings.filter((b) => {
    if (!user) return true;
    const userDigits = (user.phone || '').replace(/\D/g, '');
    const bookDigits = (b.clientPhone || '').replace(/\D/g, '');
    return (
      b.clientId === user.id ||
      (userDigits && bookDigits && userDigits.endsWith(bookDigits.slice(-9))) ||
      b.clientName.toLowerCase() === `${user.firstName} ${user.lastName || ''}`.trim().toLowerCase()
    );
  });

  // Dynamic stats calculation (only active/posted bookings appear)
  const totalBookings = clientBookings.length;
  const pendingCount = clientBookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = clientBookings.filter((b) => b.status === 'confirmed').length;
  const completedCount = clientBookings.filter((b) => b.status === 'completed').length;

  const filteredBookings =
    statusFilter === 'all'
      ? clientBookings
      : clientBookings.filter((b) => b.status === statusFilter);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back and Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sanctuary Home</span>
          </button>

          <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">
            Client Sanctuary Portal • Lusentic Spa
          </span>
        </div>

        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-[24px] bg-[var(--bg-card)] border border-stone-200 dark:border-white/10 shadow-[var(--shadow)]">
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatar || user?.profilePhoto || user?.avatar ? (
                <img
                  src={avatar || user?.profilePhoto || user?.avatar}
                  alt={user?.firstName || 'Client'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#b57377] dark:border-[#e8b4b8] shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#d49a9e] to-[#e8b4b8] text-[#1a1418] text-xl font-bold flex items-center justify-center shadow-md">
                  {user ? user.firstName.charAt(0) : 'C'}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-serif-luxury text-2xl sm:text-3xl font-light text-stone-900 dark:text-white">
                  Welcome, <span className="font-bold text-[#b57377] dark:text-[#d49a9e] italic">{user ? user.firstName : 'Guest'}</span>
                </h1>
                
                {/* Loyalty Badge */}
                <Badge variant="gold" className="px-3 py-1 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{user?.loyaltyPoints || 50} pts</span>
                </Badge>
              </div>
              <p className="text-xs text-stone-600 dark:text-white/60">
                {user?.phone ? `Account Contact: ${user.phone}` : 'Sanctuary Member'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={onBookNewSession}
              icon={<Sparkles className="w-4 h-4" />}
              className="font-bold text-xs shadow-md"
            >
              Book New Session
            </Button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-stone-200 dark:border-white/10 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'bg-[#b57377] text-white dark:bg-[#e8b4b8] dark:text-[#1a1418] shadow-sm'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Bookings ({totalBookings})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-[#b57377] text-white dark:bg-[#e8b4b8] dark:text-[#1a1418] shadow-sm'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile &amp; Photo</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'review'
                ? 'bg-[#b57377] text-white dark:bg-[#e8b4b8] dark:text-[#1a1418] shadow-sm'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Post Verified Experience</span>
          </button>
        </div>

        {/* TAB 1: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Dynamic Stats Grid */}
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
            <div className="rounded-[24px] bg-[var(--bg-card)] border border-stone-200 dark:border-white/10 shadow-[var(--shadow)] p-5 sm:p-[25px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200 dark:border-white/10">
                <div>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                    Appointments History &amp; Upcoming
                  </h2>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
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
                          ? 'bg-[#b57377] text-white dark:bg-[#e8b4b8] dark:text-[#1a1418] font-bold shadow-xs'
                          : 'bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-sm text-stone-600 dark:text-stone-400">
                  Loading your appointments...
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="py-16 text-center text-stone-600 dark:text-stone-400">
                  <Calendar className="w-10 h-10 mx-auto text-[#b57377] opacity-50 mb-3" />
                  <p className="text-base font-bold text-stone-900 dark:text-white">No appointments found</p>
                  <p className="text-xs mt-1 mb-5">
                    {totalBookings === 0
                      ? 'You have not booked any appointments yet. Once you place a reservation, it will appear here in real time.'
                      : 'You have no bookings matching this status filter.'}
                  </p>
                  <Button variant="primary" size="sm" onClick={onBookNewSession}>
                    Book a Session Now
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-400 text-[11px] uppercase tracking-wider font-bold">
                        <th className="py-3 px-3">Booking ID</th>
                        <th className="py-3 px-3">Treatment</th>
                        <th className="py-3 px-3">Therapist</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Time</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 dark:border-white/10">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-stone-50/75 dark:hover:bg-white/2 transition-colors">
                          <td className="py-3.5 px-3 font-mono font-bold text-[11px] sm:text-xs text-[#b57377] whitespace-nowrap">
                            {b.bookingId}
                          </td>
                          <td className="py-3.5 px-3 font-bold text-stone-900 dark:text-white">
                            {b.treatmentName}
                            <span className="block text-[11px] font-normal text-stone-600 dark:text-stone-400">
                              R{b.price}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-stone-700 dark:text-stone-300 whitespace-nowrap">
                            <span className="flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-[#b57377]" />
                              {b.therapistName}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-stone-900 dark:text-white whitespace-nowrap font-medium">
                            {b.date}
                          </td>
                          <td className="py-3.5 px-3 text-stone-900 dark:text-white whitespace-nowrap">
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="w-3.5 h-3.5 text-[#b57377]" />
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
                                className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:text-red-700 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                                title="Cancel Appointment"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                            ) : (
                              <span className="text-xs text-stone-500 dark:text-stone-400 italic">
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

        {/* TAB 2: PROFILE & PHOTO FROM DEVICE STORAGE */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto rounded-[24px] bg-[var(--bg-card)] border border-stone-200 dark:border-white/10 shadow-[var(--shadow)] p-6 sm:p-8 animate-in fade-in duration-200">
            <h2 className="font-serif-luxury text-2xl font-bold text-stone-900 dark:text-white mb-2">
              Profile &amp; Contact Details
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 mb-6">
              Upload your photo so it appears on your verified reviews and testimonials.
            </p>

            {profileSaved && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                Profile updated successfully! Your photo and details are saved.
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Photo Select from Device Storage */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-2">
                  Profile Photo (Displays on your reviews &amp; testimonies)
                </label>
                
                <div className="flex items-center gap-5">
                  <div className="relative">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-[#b57377] dark:border-[#e8b4b8] shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-white/10 flex items-center justify-center text-stone-400 border border-dashed border-stone-300 dark:border-white/20">
                        <User className="w-8 h-8 opacity-40" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 border border-stone-300 dark:border-white/20 text-xs font-bold text-stone-900 dark:text-white cursor-pointer transition-colors shadow-sm">
                      <Camera className="w-4 h-4 text-[#b57377] dark:text-[#d49a9e]" />
                      <span>Choose Photo from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      JPEG, PNG, WebP supported. This photo will be shown on any reviews or testimonies you post!
                    </p>
                  </div>
                </div>
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Amanda"
                    required
                    className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-white/20 bg-stone-50 dark:bg-white/10 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder-white/40 text-xs focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8] focus:bg-white dark:focus:bg-[#1a1418] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Khumalo"
                    className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-white/20 bg-stone-50 dark:bg-white/10 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder-white/40 text-xs focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8] focus:bg-white dark:focus:bg-[#1a1418] transition-all"
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                  Contact Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +27 82 555 0192"
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-white/20 bg-stone-50 dark:bg-white/10 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder-white/40 text-xs focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8] focus:bg-white dark:focus:bg-[#1a1418] transition-all"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                  Email Address <span className="font-normal text-stone-500 lowercase">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. amanda@example.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-white/20 bg-stone-50 dark:bg-white/10 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder-white/40 text-xs focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8] focus:bg-white dark:focus:bg-[#1a1418] transition-all"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                icon={<Save className="w-4 h-4" />}
                className="font-bold text-xs sm:text-sm mt-4 shadow-md"
              >
                Save Profile &amp; Contact Details
              </Button>
            </form>
          </div>
        )}

        {/* TAB 3: POST TESTIMONIAL (Displays photo on website) */}
        {activeTab === 'review' && (
          <div className="max-w-2xl mx-auto rounded-[24px] bg-[var(--bg-card)] border border-stone-200 dark:border-white/10 shadow-[var(--shadow)] p-6 sm:p-8 animate-in fade-in duration-200">
            <h2 className="font-serif-luxury text-2xl font-bold text-stone-900 dark:text-white mb-2">
              Share Your Guest Experience
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 mb-6">
              Your authentic feedback and uploaded photo will immediately appear in the Words of Serenity section on the public website!
            </p>

            {reviewSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4" />
                Thank you! Your testimonial and photo have been published to the sanctuary home page.
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-5">
              {/* Star Rating */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-2">
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
                            : 'text-stone-300 dark:text-stone-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-[#b57377] dark:text-[#FFD700] ml-2">
                    {reviewStars}.0 / 5.0 Stars
                  </span>
                </div>
              </div>

              {/* Treatment Experienced */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                  Treatment Experienced *
                </label>
                <select
                  value={reviewTreatment}
                  onChange={(e) => setReviewTreatment(e.target.value)}
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-white/20 bg-stone-50 dark:bg-white/10 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8] focus:bg-white dark:focus:bg-[#1a1418] transition-all"
                >
                  {treatments.map((t) => (
                    <option key={t.id} value={t.name} className="bg-white dark:bg-[#1a1418] text-stone-900 dark:text-white">
                      {t.name} ({t.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Review Content */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                  Your Review / Testimony *
                </label>
                <textarea
                  rows={4}
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Describe how you felt during and after your session with our therapists..."
                  required
                  className="w-full p-3.5 rounded-xl border border-stone-300 dark:border-white/20 bg-stone-50 dark:bg-white/10 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder-white/40 focus:outline-none focus:border-[#b57377] dark:focus:border-[#e8b4b8] focus:bg-white dark:focus:bg-[#1a1418] transition-all resize-none"
                />
              </div>

              {/* Preview of author info with photo */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 flex items-center gap-3.5">
                {avatar || user?.profilePhoto || user?.avatar ? (
                  <img
                    src={avatar || user?.profilePhoto || user?.avatar}
                    alt="Author"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#b57377] dark:border-[#e8b4b8] shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#b57377] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {user ? user.firstName.charAt(0) : 'C'}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-stone-900 dark:text-white">
                    Publishing as: {user ? `${user.firstName} ${user.lastName || ''}`.trim() || user.username : 'Guest'}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ Your photo and Verified Guest Badge will appear on the homepage
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
                {reviewSubmitting ? 'Publishing Review...' : 'Publish Guest Review'}
              </Button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
