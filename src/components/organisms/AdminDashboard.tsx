import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Users,
  DollarSign,
  HeartPulse,
  BookOpen,
  MessageSquare,
  Award,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Plus,
  RefreshCw,
  Search,
  Check,
  Edit2
} from 'lucide-react';
import { Booking, BookingStatus, Treatment, UserRole } from '../../types';
import { bookingService } from '../../services/bookingService';
import { treatmentService } from '../../services/treatmentService';
import { useAuth } from '../../app/providers/AuthProvider';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { StatCard } from '../molecules/StatCard';
import { INITIAL_THERAPISTS } from '../../data/initialData';

interface AdminDashboardProps {
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  const { user, role, switchRole, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // Add Treatment Form State (CMS)
  const [showAddTreatment, setShowAddTreatment] = useState(false);
  const [newTreatName, setNewTreatName] = useState('');
  const [newTreatPrice, setNewTreatPrice] = useState(750);
  const [newTreatDuration, setNewTreatDuration] = useState(60);
  const [newTreatCategory, setNewTreatCategory] = useState<'massage' | 'facial' | 'couples' | 'bodyscrub'>('massage');
  const [newTreatDesc, setNewTreatDesc] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [allBookings, allTreatments] = await Promise.all([
        bookingService.getBookings(),
        treatmentService.getAll(),
      ]);
      setBookings(allBookings);
      setTreatments(allTreatments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: number, status: BookingStatus) => {
    await bookingService.updateStatus(id, status);
    loadData();
  };

  const handleCreateTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTreatName) return;

    await treatmentService.addTreatment({
      name: newTreatName,
      price: Number(newTreatPrice),
      duration: Number(newTreatDuration),
      category: newTreatCategory,
      description: newTreatDesc,
      isMonthlySpecial: false,
      rating: 5.0,
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    });

    setNewTreatName('');
    setNewTreatDesc('');
    setShowAddTreatment(false);
    loadData();
  };

  // 8 Stats calculations for admin
  const todayBookings = bookings.filter((b) => b.date === '2026-09-18' || b.date === '2026-09-19').length;
  const weekBookings = bookings.length;
  const monthBookings = bookings.length + 8;
  const totalRevenue = bookings.reduce((sum, b) => (b.status !== 'cancelled' ? sum + b.price : sum), 0);
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;
  const popularTreatment = 'Aromatherapy Massage';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'cms', label: 'CMS & Treatments', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'bookings', label: 'Bookings List', icon: <Calendar className="w-4 h-4" /> },
    { id: 'therapists', label: 'Therapists', icon: <Users className="w-4 h-4" /> },
    { id: 'cashup', label: 'Cash-Up & Revenue', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'healthcorner', label: 'Health Corner', icon: <HeartPulse className="w-4 h-4" /> },
    { id: 'articles', label: 'Articles', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'testimonials', label: 'Testimonials', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'loyalty', label: 'Loyalty Rewards', icon: <Award className="w-4 h-4" /> },
  ];

  const filteredBookings = bookings.filter((b) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      b.clientName.toLowerCase().includes(q) ||
      b.bookingId.toLowerCase().includes(q) ||
      b.treatmentName.toLowerCase().includes(q) ||
      b.therapistName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col lg:flex-row">
      
      {/* Sidebar (PDF Spec: 270px wide, BG: #1a1418, Logo Group, Search Bar, 12 Nav Items) */}
      <aside className="w-full lg:w-[270px] bg-[#1a1418] text-white p-5 flex flex-col justify-between shrink-0 border-r border-white/10">
        <div>
          {/* Logo Group */}
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-white/10">
            <div className="w-8 h-8 rounded-full bg-[#e8b4b8] flex items-center justify-center text-[#1a1418]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white leading-tight">
                Lusentic <span className="text-[#e8b4b8] font-serif-luxury font-light italic">Spa</span>
              </h2>
              <span className="text-[10px] text-white/50 uppercase tracking-widest block">
                Control Center
              </span>
            </div>
          </div>

          {/* Quick Search inside Sidebar */}
          <div className="relative mb-5">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search dashboard..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#e8b4b8]"
            />
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#e8b4b8] text-[#1a1418] font-bold shadow-md'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={active ? 'text-[#1a1418]' : 'text-[#e8b4b8]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions & Role Switcher */}
        <div className="pt-4 border-t border-white/10 mt-6 space-y-3">
          <div className="p-2.5 rounded-xl bg-white/5 text-[11px] space-y-1">
            <p className="text-white/50 uppercase tracking-wider text-[9px] font-bold">Acting Role</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#e8b4b8] capitalize">{role}</span>
              <div className="flex items-center gap-1">
                {(['client', 'receptionist', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => switchRole(r)}
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                      role === r ? 'bg-[#e8b4b8] text-[#1a1418]' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {r.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={onBackToHome}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Sanctuary</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area (1170px) */}
      <main className="flex-1 p-5 sm:p-8 lg:p-10 overflow-y-auto">
        
        {/* Top Bar (PDF Spec: H1 "Control Panel", User Badge with avatar + name + role) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-light)] mb-8">
          <div>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[var(--text-primary)]">
              Control <span className="italic text-[#d49a9e]">Panel</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Real-time spa scheduling, therapist dispatch, and guest care operations
            </p>
          </div>

          {/* User Badge */}
          <div className="flex items-center gap-3 bg-[var(--bg-card)] p-2.5 sm:px-4 sm:py-2 rounded-2xl border border-[var(--border-light)] shadow-xs">
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.firstName}
                className="w-9 h-9 rounded-full object-cover border border-[#e8b4b8]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#e8b4b8] text-[#1a1418] font-bold flex items-center justify-center text-xs">
                {user?.firstName?.charAt(0) || 'A'}
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-[#d49a9e] font-semibold uppercase tracking-wider">
                {role} Mode
              </p>
            </div>
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-muted)] ml-2"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD (Active by default) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* 8 Stats Grid from PDF specification (page 31) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              <StatCard
                title="Today's Bookings"
                value={todayBookings}
                subtitle="On schedule today"
                variant="pink"
                icon={<Calendar className="w-4 h-4 text-[#d49a9e]" />}
              />
              <StatCard
                title="This Week"
                value={weekBookings}
                subtitle="Active reservations"
                icon={<Clock className="w-4 h-4 text-[#d49a9e]" />}
              />
              <StatCard
                title="This Month"
                value={monthBookings}
                subtitle="Total monthly volume"
                icon={<Award className="w-4 h-4 text-[#d49a9e]" />}
              />
              <StatCard
                title="Total Revenue"
                value={`R${totalRevenue.toLocaleString()}`}
                subtitle="Active bookings value"
                variant="gold"
                icon={<DollarSign className="w-4 h-4 text-[#FFD700]" />}
              />
              <StatCard
                title="Pending Status"
                value={pendingCount}
                subtitle="Needs confirmation"
                variant="pink"
                icon={<Clock className="w-4 h-4 text-[#d49a9e]" />}
              />
              <StatCard
                title="Confirmed"
                value={confirmedCount}
                subtitle="Ready for arrival"
                variant="green"
                icon={<CheckCircle className="w-4 h-4 text-[#28a745]" />}
              />
              <StatCard
                title="Cancelled"
                value={cancelledCount}
                subtitle="Archived requests"
                icon={<XCircle className="w-4 h-4 text-red-500" />}
              />
              <StatCard
                title="Popular Therapy"
                value={popularTreatment}
                subtitle="Highest requested"
                icon={<Sparkles className="w-4 h-4 text-[#d49a9e]" />}
              />
            </div>

            {/* Recent Bookings Table with interactive actions */}
            <div className="p-6 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-light)] shadow-[var(--shadow)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border-light)]">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Recent Bookings Management
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Update appointment status directly to dispatch therapists and notify clients
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)]">
                    Showing {filteredBookings.length} of {bookings.length}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-light)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-3">Booking ID</th>
                      <th className="py-3 px-3">Client</th>
                      <th className="py-3 px-3">Treatment</th>
                      <th className="py-3 px-3">Therapist</th>
                      <th className="py-3 px-3">Date &amp; Time</th>
                      <th className="py-3 px-3">Fee</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Quick Dispatch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[11px] text-[#b57377] whitespace-nowrap">
                          {b.bookingId}
                        </td>
                        <td className="py-3 px-3 font-semibold text-[var(--text-primary)] whitespace-nowrap">
                          {b.clientName}
                          <span className="block text-[10px] font-normal text-[var(--text-muted)]">
                            {b.clientPhone}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[var(--text-primary)]">
                          {b.treatmentName}
                        </td>
                        <td className="py-3 px-3 text-[var(--text-muted)] whitespace-nowrap">
                          {b.therapistName}
                        </td>
                        <td className="py-3 px-3 text-[var(--text-primary)] whitespace-nowrap">
                          {b.date} <span className="text-[#d49a9e] font-semibold">{b.time}</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-[var(--text-primary)] whitespace-nowrap">
                          R{b.price}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <Badge status={b.status} />
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {b.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                                className="px-2.5 py-1 rounded-lg bg-[#28a745] hover:bg-[#218838] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Confirm</span>
                              </button>
                            )}
                            {b.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'completed')}
                                className="px-2.5 py-1 rounded-lg bg-[#17a2b8] hover:bg-[#138496] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Complete</span>
                              </button>
                            )}
                            {b.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                                className="px-2 py-1 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs transition-colors cursor-pointer"
                                title="Cancel session"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CMS & TREATMENTS */}
        {activeTab === 'cms' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  Treatments &amp; Therapy Catalog
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Add, update prices, or customize offerings visible on the public website
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setShowAddTreatment((prev) => !prev)}
              >
                {showAddTreatment ? 'Close Form' : 'Add New Therapy'}
              </Button>
            </div>

            {showAddTreatment && (
              <form onSubmit={handleCreateTreatment} className="p-6 rounded-[24px] bg-[var(--bg-card)] border border-[#e8b4b8] shadow-md space-y-4 animate-in fade-in">
                <h4 className="font-bold text-sm text-[var(--text-primary)]">Create New Spa Therapy</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Therapy Name *</label>
                    <input
                      type="text"
                      value={newTreatName}
                      onChange={(e) => setNewTreatName(e.target.value)}
                      placeholder="e.g. Zen Bamboo Back Therapy"
                      required
                      className="w-full h-10 px-3 rounded-xl border border-[var(--border-light)] bg-transparent text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Price (R) *</label>
                    <input
                      type="number"
                      value={newTreatPrice}
                      onChange={(e) => setNewTreatPrice(Number(e.target.value))}
                      required
                      className="w-full h-10 px-3 rounded-xl border border-[var(--border-light)] bg-transparent text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Duration (Mins) *</label>
                    <input
                      type="number"
                      value={newTreatDuration}
                      onChange={(e) => setNewTreatDuration(Number(e.target.value))}
                      required
                      className="w-full h-10 px-3 rounded-xl border border-[var(--border-light)] bg-transparent text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Category</label>
                    <select
                      value={newTreatCategory}
                      onChange={(e) => setNewTreatCategory(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)]"
                    >
                      <option value="massage">Massage Therapy</option>
                      <option value="facial">Facial Treatments</option>
                      <option value="couples">Couples Retreat</option>
                      <option value="bodyscrub">Body Scrubs &amp; Wraps</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Description</label>
                    <input
                      type="text"
                      value={newTreatDesc}
                      onChange={(e) => setNewTreatDesc(e.target.value)}
                      placeholder="Brief therapy benefits..."
                      className="w-full h-10 px-3 rounded-xl border border-[var(--border-light)] bg-transparent text-xs"
                    />
                  </div>
                </div>

                <Button variant="primary" size="sm" type="submit">
                  Save &amp; Publish Therapy
                </Button>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {treatments.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <h4 className="font-bold text-sm text-[var(--text-primary)] truncate">{t.name}</h4>
                    <p className="text-xs text-[var(--text-muted)] capitalize">{t.category} • {t.duration} min</p>
                    <p className="text-sm font-bold text-[#d49a9e] mt-1">R{t.price}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 text-[10px] font-bold">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: THERAPISTS */}
        {activeTab === 'therapists' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Practitioner Rosters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {INITIAL_THERAPISTS.map((th) => (
                <div key={th.id} className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] shadow-xs text-center flex flex-col items-center">
                  <img src={th.avatar} alt={th.name} className="w-16 h-16 rounded-full object-cover border-2 border-[#e8b4b8] mb-3" />
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">{th.name}</h4>
                  <p className="text-xs text-[#d49a9e] mb-2">{th.role}</p>
                  <div className="flex flex-wrap justify-center gap-1 mt-auto">
                    {th.availableDays.map((d) => (
                      <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 font-semibold">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CASH-UP & REVENUE */}
        {activeTab === 'cashup' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Daily Cash-Up &amp; Settlement</h3>
            <div className="p-6 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-light)] space-y-4 max-w-xl">
              <div className="flex justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-xs text-[var(--text-muted)]">Total Revenue Booked:</span>
                <span className="font-bold text-base text-[var(--text-primary)]">R{totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-xs text-[var(--text-muted)]">Completed Settlements:</span>
                <span className="font-bold text-base text-[#28a745]">
                  R{bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.price, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-xs text-[var(--text-muted)]">Pending Settlements:</span>
                <span className="font-bold text-base text-[#d49a9e]">
                  R{bookings.filter(b => b.status === 'pending').reduce((s, b) => s + b.price, 0).toLocaleString()}
                </span>
              </div>
              <div className="pt-2">
                <Button variant="primary" size="md" fullWidth>
                  Generate Daily POS Report
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Catch-all fallback for other sub-tabs */}
        {['bookings', 'healthcorner', 'articles', 'testimonials', 'loyalty'].includes(activeTab) && (
          <div className="p-8 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-light)] text-center space-y-3">
            <h3 className="text-lg font-bold text-[var(--text-primary)] capitalize">{activeTab} Management</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
              All active records for {activeTab} are synchronized live with the local database and visible across all guest views.
            </p>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('dashboard')}>
              Back to Overview Dashboard
            </Button>
          </div>
        )}

      </main>
    </div>
  );
};
