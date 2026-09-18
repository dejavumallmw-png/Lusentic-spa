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
  UserCheck
} from 'lucide-react';
import { Booking } from '../../types';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../app/providers/AuthProvider';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { StatCard } from '../molecules/StatCard';

interface ClientDashboardProps {
  onBackToHome: () => void;
  onBookNewSession: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  onBackToHome,
  onBookNewSession,
}) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getBookings();
      setBookings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = async (id: number) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      await bookingService.cancelBooking(id);
      loadBookings();
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
            Client Portal • Lusentic Spa
          </span>
        </div>

        {/* Welcome Section (PDF Spec: H1 "My Bookings" 32px / 300, Loyalty Badge: Gold pill "120 pts", "My Account" / "Book New" button Dust Pink) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-light)] shadow-[var(--shadow)]">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-serif-luxury text-3xl sm:text-[32px] font-light text-[var(--text-primary)]">
                My <span className="font-normal text-[#d49a9e] italic">Bookings</span>
              </h1>
              
              {/* Loyalty Badge: Gold pill */}
              <Badge variant="gold" className="px-3 py-1 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{user?.loyaltyPoints || 120} pts</span>
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Welcome back, <strong className="text-[var(--text-primary)]">{user ? user.firstName : 'Amanda'}</strong>. Manage your scheduled therapies, history, and rewards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={onBookNewSession}
              className="text-xs sm:text-sm font-bold shadow-md"
            >
              Book New Session
            </Button>
          </div>
        </div>

        {/* Stats Grid (4 cols from PDF spec: Total Bookings, Pending, Confirmed, Completed) */}
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

        {/* Bookings Table (PDF Spec: BG White, radius 20, padding 25; Headers: Booking ID | Treatment | Therapist | Date | Time | Status) */}
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
    </div>
  );
};
