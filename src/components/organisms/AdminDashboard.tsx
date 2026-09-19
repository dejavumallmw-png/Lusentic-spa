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
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Plus,
  Search,
  Check,
  Edit2,
  Edit3,
  Trash2,
  Camera,
  Shield,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Globe,
  Share2,
  Image as ImageIcon,
  FolderPlus,
  UserPlus,
  Star,
  X
} from 'lucide-react';
import { Booking, BookingStatus, Treatment, Therapist, UserRole, UserProfile, GalleryItem, Testimonial } from '../../types';
import { bookingService } from '../../services/bookingService';
import { treatmentService } from '../../services/treatmentService';
import { therapistService } from '../../services/therapistService';
import { categoryService } from '../../services/categoryService';
import { articleService, Article } from '../../services/articleService';
import { settingsService } from '../../services/settingsService';
import { authService } from '../../services/authService';
import { galleryService } from '../../services/galleryService';
import { testimonialService } from '../../services/testimonialService';
import { useAuth } from '../../app/providers/AuthProvider';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { StatCard } from '../molecules/StatCard';

interface AdminDashboardProps {
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  const { user, role, switchRole } = useAuth();
  const isAdmin = role === 'admin';

  // Automatically elevate from client to Admin role when viewing Admin Dashboard
  useEffect(() => {
    if (role === 'client') {
      switchRole('admin');
    }
  }, [role, switchRole]);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [staffList, setStaffList] = useState<UserProfile[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [siteSettings, setSiteSettings] = useState(settingsService.getSettings());
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // CATEGORIES SECTION: Add Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');

  // TREATMENTS CMS: Add Treatment Form State
  const [showAddTreatment, setShowAddTreatment] = useState(false);
  const [newTreatName, setNewTreatName] = useState('');
  const [newTreatPrice, setNewTreatPrice] = useState(750);
  const [newTreatDuration, setNewTreatDuration] = useState(60);
  const [newTreatCategory, setNewTreatCategory] = useState<string>('massage');
  const [newTreatDesc, setNewTreatDesc] = useState('');
  const [newTreatImage, setNewTreatImage] = useState<string>('');

  // EDIT TREATMENT STATE
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [editTreatName, setEditTreatName] = useState('');
  const [editTreatPrice, setEditTreatPrice] = useState(750);
  const [editTreatDuration, setEditTreatDuration] = useState(60);
  const [editTreatCategory, setEditTreatCategory] = useState('massage');
  const [editTreatDesc, setEditTreatDesc] = useState('');
  const [editTreatImage, setEditTreatImage] = useState('');

  // STAFF MANAGEMENT: Add Staff Form State
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaffFirst, setNewStaffFirst] = useState('');
  const [newStaffLast, setNewStaffLast] = useState('');
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'admin' | 'receptionist'>('receptionist');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffAvatar, setNewStaffAvatar] = useState('');

  // TEAM / THERAPISTS: Add Therapist Form State
  const [showAddTherapist, setShowAddTherapist] = useState(false);
  const [newThName, setNewThName] = useState('');
  const [newThRole, setNewThRole] = useState('');
  const [newThBio, setNewThBio] = useState('');
  const [newThSpecialties, setNewThSpecialties] = useState('');
  const [newThAvatar, setNewThAvatar] = useState('');

  // ARTICLES: Add Article Form State
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [newArtTitle, setNewArtTitle] = useState('');
  const [newArtCategory, setNewArtCategory] = useState('Wellness & Longevity');
  const [newArtExcerpt, setNewArtExcerpt] = useState('');
  const [newArtContent, setNewArtContent] = useState('');
  const [newArtReadTime, setNewArtReadTime] = useState('4 min read');
  const [newArtImage, setNewArtImage] = useState('');

  // GALLERY PHOTOS: Add Photo Form State
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Suites');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoImage, setNewPhotoImage] = useState('');

  // SITE SETTINGS: Brand & Contact Info Form State
  const [settingBrandName, setSettingBrandName] = useState(siteSettings.brandName || 'Lusentic');
  const [settingBrandSuffix, setSettingBrandSuffix] = useState(siteSettings.brandSuffix || 'Spa');
  const [settingLogo, setSettingLogo] = useState(siteSettings.logoUrl || '');
  const [settingPhone, setSettingPhone] = useState(siteSettings.phone);
  const [settingEmail, setSettingEmail] = useState(siteSettings.email);
  const [settingAddress, setSettingAddress] = useState(siteSettings.address);
  const [settingHours, setSettingHours] = useState(siteSettings.operatingHours);
  const [settingInstagram, setSettingInstagram] = useState(siteSettings.socials?.instagram || '');
  const [settingFacebook, setSettingFacebook] = useState(siteSettings.socials?.facebook || '');
  const [settingTiktok, setSettingTiktok] = useState(siteSettings.socials?.tiktok || '');
  const [settingWhatsapp, setSettingWhatsapp] = useState(siteSettings.socials?.whatsapp || '');

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [allBookings, allTreatments, allCats, allTherapists, allArticles, allStaff, settings, allGallery, allTestimonials] = await Promise.all([
        bookingService.getBookings(),
        treatmentService.getAll(),
        categoryService.getAll(),
        therapistService.getAll(),
        articleService.getAll(),
        authService.getAllStaff(),
        settingsService.getSettings(),
        galleryService.getAll(),
        testimonialService.getAll(),
      ]);
      setBookings(allBookings);
      setTreatments(allTreatments);
      const catLabels = allCats.map((c) => c.label);
      setCategories(catLabels);
      if (catLabels.length > 0 && !newTreatCategory) {
        setNewTreatCategory(catLabels[0]);
      }
      setTherapists(allTherapists);
      setArticles(allArticles);
      setStaffList(allStaff);
      setSiteSettings(settings);
      setSettingBrandName(settings.brandName || 'Lusentic');
      setSettingBrandSuffix(settings.brandSuffix || 'Spa');
      setSettingLogo(settings.logoUrl || '');
      setSettingPhone(settings.phone || '');
      setSettingEmail(settings.email || '');
      setSettingAddress(settings.address || '');
      setSettingHours(settings.operatingHours || '');
      setSettingInstagram(settings.socials?.instagram || '');
      setSettingFacebook(settings.socials?.facebook || '');
      setSettingTiktok(settings.socials?.tiktok || '');
      setSettingWhatsapp(settings.socials?.whatsapp || '');
      setGalleryList(allGallery);
      setTestimonials(allTestimonials);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Image Uploader with automatic downscaling/compression to prevent LocalStorage quota overflow
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const img = new Image();
          img.onload = () => {
            const maxDim = 400; // Optimal for logos and badges
            let { width, height } = img;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL('image/png', 0.9);
              setter(compressedDataUrl);
            } else {
              setter(reader.result as string);
            }
          };
          img.src = reader.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. Booking Status
  const handleUpdateStatus = async (id: number, status: BookingStatus) => {
    await bookingService.updateStatus(id, status);
    showNotification(`Booking status updated to ${status}`);
    loadData();
  };

  // 2. Categories
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await categoryService.addCategory({ label: newCategoryName.trim() });
    setNewCategoryName('');
    showNotification('New treatment category added successfully');
    loadData();
  };

  const handleDeleteCategory = async (cat: string) => {
    await categoryService.deleteCategory(cat);
    showNotification(`Category "${cat}" removed`);
    loadData();
  };

  // 3. Treatment CMS
  const handleCreateTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTreatName) return;

    await treatmentService.addTreatment({
      name: newTreatName,
      price: Number(newTreatPrice),
      duration: Number(newTreatDuration),
      category: newTreatCategory || (categories[0] || 'massage'),
      description: newTreatDesc,
      isMonthlySpecial: false,
      rating: 5.0,
      imageUrl: newTreatImage || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    });

    setNewTreatName('');
    setNewTreatDesc('');
    setNewTreatImage('');
    setShowAddTreatment(false);
    showNotification('New treatment therapy added to sanctuary catalog');
    loadData();
  };

  const handleStartEditTreatment = (t: Treatment) => {
    setEditingTreatment(t);
    setEditTreatName(t.name);
    setEditTreatPrice(t.price);
    setEditTreatDuration(t.duration);
    setEditTreatCategory(t.category);
    setEditTreatDesc(t.description || '');
    setEditTreatImage(t.imageUrl || '');
  };

  const handleSaveEditTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTreatment || !editTreatName) return;

    await treatmentService.updateTreatment(editingTreatment.id, {
      name: editTreatName,
      price: Number(editTreatPrice),
      duration: Number(editTreatDuration),
      category: editTreatCategory,
      description: editTreatDesc,
      imageUrl: editTreatImage,
    });

    setEditingTreatment(null);
    showNotification(`Treatment "${editTreatName}" updated successfully`);
    loadData();
  };

  const handleDeleteTreatment = async (id: number) => {
    await treatmentService.deleteTreatment(id);
    showNotification('Treatment deleted successfully');
    loadData();
  };

  // 4. Staff Management
  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffFirst || !newStaffEmail) return;

    await authService.addStaff({
      firstName: newStaffFirst,
      lastName: newStaffLast,
      username: newStaffUsername || `${newStaffFirst.toLowerCase()}_staff`,
      email: newStaffEmail,
      role: newStaffRole,
      phone: newStaffPhone,
      avatar: newStaffAvatar || undefined,
    });

    setNewStaffFirst('');
    setNewStaffLast('');
    setNewStaffUsername('');
    setNewStaffEmail('');
    setNewStaffPhone('');
    setNewStaffAvatar('');
    setShowAddStaff(false);
    showNotification(`New ${newStaffRole} registered successfully`);
    loadData();
  };

  // 5. Therapists Management
  const handleAddTherapistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThName || !newThRole) return;

    await therapistService.addTherapist({
      name: newThName,
      role: newThRole,
      bio: newThBio,
      specialties: newThSpecialties.split(',').map((s) => s.trim()).filter(Boolean),
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      avatar: newThAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      rating: 5.0,
    });

    setNewThName('');
    setNewThRole('');
    setNewThBio('');
    setNewThSpecialties('');
    setNewThAvatar('');
    setShowAddTherapist(false);
    showNotification('New therapist added to sanctuary team');
    loadData();
  };

  const handleDeleteTherapist = async (id: number) => {
    await therapistService.deleteTherapist(id);
    showNotification('Therapist removed successfully');
    loadData();
  };

  // 6. Articles Management
  const handleAddArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtTitle || !newArtContent) return;

    await articleService.addArticle({
      title: newArtTitle,
      category: 'Health Corner',
      summary: newArtExcerpt || newArtContent.slice(0, 100) + '...',
      content: newArtContent,
      readTime: newArtReadTime,
      author: `${user?.firstName || 'Sanctuary'} ${user?.lastName || 'Expert'}`,
      imageUrl: newArtImage || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    });

    setNewArtTitle('');
    setNewArtExcerpt('');
    setNewArtContent('');
    setNewArtImage('');
    setShowAddArticle(false);
    showNotification('New Health Corner article published');
    loadData();
  };

  const handleDeleteArticle = async (id: number) => {
    await articleService.deleteArticle(id);
    showNotification('Article removed successfully');
    loadData();
  };

  // 7. Gallery Photos Management
  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoTitle || !newPhotoImage) return;

    await galleryService.addPhoto({
      title: newPhotoTitle,
      category: newPhotoCategory,
      caption: newPhotoCaption || 'Lusentic Spa tranquility experience',
      image: newPhotoImage,
    });

    setNewPhotoTitle('');
    setNewPhotoCaption('');
    setNewPhotoImage('');
    setShowAddPhoto(false);
    showNotification('New sanctuary atmosphere photo added to gallery');
    loadData();
  };

  const handleDeletePhoto = async (id: number) => {
    await galleryService.deletePhoto(id);
    showNotification('Photo removed successfully');
    loadData();
  };

  // 8. Testimonials Management
  const handleDeleteTestimonial = async (id: number) => {
    await testimonialService.deleteTestimonial(id);
    showNotification('Guest testimonial removed successfully');
    loadData();
  };

  // 8. Site Branding & Contact Info
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    settingsService.updateSettings({
      brandName: settingBrandName.trim() || 'Lusentic',
      brandSuffix: settingBrandSuffix.trim() || 'Spa',
      logoUrl: settingLogo,
      phone: settingPhone,
      email: settingEmail,
      address: settingAddress,
      operatingHours: settingHours,
      socials: {
        instagram: settingInstagram,
        facebook: settingFacebook,
        tiktok: settingTiktok,
        whatsapp: settingWhatsapp,
      },
    });
    showNotification('Site logo, brand title, footer contact info, and socials saved!');
    loadData();
  };

  // Stats
  const totalRevenue = bookings.reduce((sum, b) => (b.status !== 'cancelled' ? sum + b.price : sum), 0);
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

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

  // Navigation Items according to role
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'bookings', label: 'Bookings & Schedule', icon: <Calendar className="w-4 h-4" />, count: bookings.length },
    ...(isAdmin ? [
      { id: 'categories', label: 'Treatment Categories', icon: <FolderPlus className="w-4 h-4" />, count: categories.length },
      { id: 'cms', label: 'Treatments Catalog', icon: <Sparkles className="w-4 h-4" />, count: treatments.length },
      { id: 'staff', label: 'Staff & Receptionists', icon: <ShieldCheck className="w-4 h-4" />, count: staffList.length },
      { id: 'therapists', label: 'Sanctuary Therapists', icon: <Users className="w-4 h-4" />, count: therapists.length },
      { id: 'articles', label: 'Health Corner Articles', icon: <BookOpen className="w-4 h-4" />, count: articles.length },
      { id: 'gallery', label: 'Gallery Photos (Storage)', icon: <ImageIcon className="w-4 h-4" />, count: galleryList.length },
      { id: 'testimonials', label: 'Guest Testimonials', icon: <MessageSquare className="w-4 h-4" />, count: testimonials.length },
      { id: 'settings', label: 'Logo, Footer & Socials', icon: <Globe className="w-4 h-4" /> },
    ] : [
      { id: 'cms', label: 'View Treatments', icon: <Sparkles className="w-4 h-4" /> },
      { id: 'therapists', label: 'View Therapists', icon: <Users className="w-4 h-4" /> },
    ]),
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col lg:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full lg:w-[280px] bg-[#1a1418] text-white p-5 flex flex-col justify-between shrink-0 border-r border-white/10">
        <div>
          {/* Logo Group */}
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-white/10">
            {siteSettings.logoUrl ? (
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#e8b4b8] shadow-sm shrink-0 bg-white/10 flex items-center justify-center">
                <img src={siteSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#d49a9e] to-[#e8b4b8] flex items-center justify-center text-[#1a1418] shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-white text-base">{siteSettings.brandName || 'Lusentic'}</span>
                <span className="font-light italic text-[#e8b4b8] font-serif-luxury text-base">{siteSettings.brandSuffix || 'Spa'}</span>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">
                {isAdmin ? 'Super Admin Portal' : 'Staff / Receptionist Portal'}
              </p>
            </div>
          </div>

          {/* Role badge */}
          <div className="mb-4 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-white">{user?.firstName} {user?.lastName}</p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 ${
                isAdmin ? 'bg-[#e8b4b8] text-[#1a1418]' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {role}
              </span>
            </div>
            {isAdmin ? <Shield className="w-5 h-5 text-[#e8b4b8]" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#e8b4b8] text-[#1a1418] font-bold shadow-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-[#1a1418]/20 text-[#1a1418]' : 'bg-white/10 text-white/70'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Back and Role switcher */}
        <div className="pt-4 border-t border-white/10 space-y-2 mt-6">
          <button
            onClick={onBackToHome}
            className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#e8b4b8]" />
            <span>Return to Public Website</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl">
        
        {/* Floating Notification */}
        {statusMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-900/80 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-xl animate-in slide-in-from-top duration-200">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Role difference alert when logged in as receptionist */}
        {!isAdmin && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
            <div>
              <p className="font-bold">Staff / Receptionist Mode Active</p>
              <p className="text-[11px] opacity-80">
                You can manage guest bookings and view therapies. Admin powers (adding staff &amp; receptionists, editing categories, logo, articles &amp; footer contacts) are strictly reserved for the Administrator.
              </p>
            </div>
            <button
              onClick={() => switchRole('admin')}
              className="px-3 py-1.5 rounded-lg bg-[#e8b4b8] text-[#1a1418] font-bold text-[11px] shrink-0 cursor-pointer shadow-xs"
            >
              Switch to Admin
            </button>
          </div>
        )}

        {/* 1. OVERVIEW DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  {isAdmin ? 'Administrator Sanctuary Hub' : 'Receptionist Daily Schedule'}
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                  Overview of appointments, client volume, therapy revenue, and sanctuary operations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={loadData} icon={<Clock className="w-3.5 h-3.5" />}>
                  Refresh Data
                </Button>
                {isAdmin && (
                  <Button variant="primary" size="sm" onClick={() => setActiveTab('cms')} icon={<Plus className="w-3.5 h-3.5" />}>
                    Add Therapy
                  </Button>
                )}
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Bookings"
                value={bookings.length}
                subtitle="All logged sessions"
                icon={<Calendar className="w-5 h-5" />}
              />
              <StatCard
                title="Pending Review"
                value={pendingCount}
                subtitle="Awaiting staff action"
                variant="pink"
                icon={<Clock className="w-5 h-5 text-[#d49a9e]" />}
              />
              <StatCard
                title="Confirmed"
                value={confirmedCount}
                subtitle="Upcoming visits"
                variant="green"
                icon={<CheckCircle className="w-5 h-5 text-[#28a745]" />}
              />
              <StatCard
                title="Revenue"
                value={`R${totalRevenue.toLocaleString()}`}
                subtitle="Realized bookings"
                variant="gold"
                icon={<DollarSign className="w-5 h-5 text-[#FFD700]" />}
              />
            </div>

            {/* Quick Action: Recent Bookings */}
            <div className="rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-light)] p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-[var(--text-primary)]">Recent Client Reservations</h3>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs font-bold text-[#b57377] dark:text-[#e8b4b8] hover:underline cursor-pointer"
                >
                  View All ({bookings.length}) →
                </button>
              </div>

              <div className="space-y-2">
                {bookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="p-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-[var(--border-light)] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">{b.clientName}</span>
                      <span className="text-[var(--text-muted)] ml-2">({b.treatmentName})</span>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        {b.date} at {b.time} • Therapist: {b.therapistName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge status={b.status} />
                      {b.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 cursor-pointer"
                        >
                          Confirm
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. BOOKINGS & SCHEDULE LIST */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  Sanctuary Appointments Schedule
                </h1>
                <p className="text-xs text-[var(--text-muted)]">
                  Live reservations queue. Confirm, complete, or cancel appointments.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter client, ID, therapist..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[var(--border-light)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d49a9e]"
                />
              </div>
            </div>

            <div className="rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-light)] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-light)] bg-stone-100/60 dark:bg-white/5 text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Booking ID</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Treatment</th>
                      <th className="py-3 px-4">Therapist</th>
                      <th className="py-3 px-4">Date &amp; Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-[#b57377] whitespace-nowrap">
                          {b.bookingId}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-[var(--text-primary)]">{b.clientName}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">{b.clientPhone || b.clientEmail || 'No contact'}</p>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                          {b.treatmentName}
                          <span className="block text-[11px] text-[var(--text-muted)] font-normal">R{b.price}</span>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)] whitespace-nowrap">
                          {b.therapistName}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-primary)] whitespace-nowrap font-medium">
                          {b.date} • {b.time}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge status={b.status} />
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {b.status !== 'confirmed' && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                                title="Confirm Booking"
                              >
                                Confirm
                              </button>
                            )}
                            {b.status !== 'completed' && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'completed')}
                                className="px-2 py-1 rounded-lg bg-[#FFD700] hover:bg-[#e6c200] text-[#1a1418] font-bold text-[10px] cursor-pointer"
                                title="Mark Completed"
                              >
                                Complete
                              </button>
                            )}
                            {b.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                                className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] cursor-pointer"
                                title="Cancel Booking"
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

        {/* 3. CATEGORIES SECTION (Admin Only) */}
        {activeTab === 'categories' && isAdmin && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  Treatment Categories Section
                </h1>
                <p className="text-xs text-[var(--text-muted)]">
                  Create and manage categories here. When registering a new treatment, the system will ask you to choose from these categories.
                </p>
              </div>
            </div>

            {/* Input New Category Form */}
            <form onSubmit={handleAddCategory} className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-light)] shadow-sm flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 w-full">
                <Input
                  label="Input New Treatment Category Name *"
                  placeholder="e.g. Aromatherapy, Hydrotherapy, Manicure & Pedicure..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                />
              </div>
              <Button variant="primary" size="md" type="submit" icon={<FolderPlus className="w-4 h-4" />} className="shrink-0 font-bold text-xs sm:text-sm">
                Add Category
              </Button>
            </form>

            {/* Existing Categories List */}
            <div className="rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-light)] p-6 shadow-sm">
              <h3 className="font-bold text-base text-[var(--text-primary)] mb-4">
                Available Treatment Categories ({categories.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => {
                  const treatmentCount = treatments.filter((t) => t.category.toLowerCase() === cat.toLowerCase()).length;
                  return (
                    <div
                      key={cat}
                      className="p-4 rounded-2xl bg-stone-50 dark:bg-white/5 border border-[var(--border-light)] flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-bold text-sm text-[var(--text-primary)] capitalize">{cat}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{treatmentCount} treatments linked</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. TREATMENTS CMS */}
        {activeTab === 'cms' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  Treatments Catalog ({treatments.length})
                </h1>
                <p className="text-xs text-[var(--text-muted)]">
                  Sanctuary therapies with dynamic categories, durations, and pricing.
                </p>
              </div>

              {isAdmin && (
                <Button
                  variant="primary"
                  size="md"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowAddTreatment(!showAddTreatment)}
                  className="font-bold text-xs sm:text-sm"
                >
                  {showAddTreatment ? 'Close Form' : 'Register New Treatment'}
                </Button>
              )}
            </div>

            {/* Register New Treatment Form */}
            {showAddTreatment && isAdmin && (
              <form onSubmit={handleCreateTreatment} className="p-6 rounded-[24px] bg-[var(--bg-card)] border border-[#e8b4b8] shadow-xl space-y-4 animate-in fade-in duration-200">
                <h3 className="font-serif-luxury text-xl font-bold text-[var(--text-primary)]">
                  Register New Spa Therapy
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Treatment Title *"
                    placeholder="e.g. Balinese Deep Muscle Therapy"
                    value={newTreatName}
                    onChange={(e) => setNewTreatName(e.target.value)}
                    required
                  />

                  {/* Which Category Question */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                      Which Category Do You Want? *
                    </label>
                    <select
                      value={newTreatCategory}
                      onChange={(e) => setNewTreatCategory(e.target.value)}
                      required
                      className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-light)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d49a9e] capitalize"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c} className="bg-[var(--bg-card)] text-[var(--text-primary)] capitalize">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Price (ZAR) *"
                    type="number"
                    value={newTreatPrice}
                    onChange={(e) => setNewTreatPrice(Number(e.target.value))}
                    required
                  />
                  <Input
                    label="Duration (Minutes) *"
                    type="number"
                    value={newTreatDuration}
                    onChange={(e) => setNewTreatDuration(Number(e.target.value))}
                    required
                  />
                </div>

                {/* Photo selected from internal storage */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Treatment Photo (Select from Device / Internal Storage) *
                  </label>
                  <div className="flex items-center gap-4">
                    {newTreatImage && (
                      <img src={newTreatImage} alt="Treatment preview" className="w-16 h-16 rounded-xl object-cover border border-[#e8b4b8]" />
                    )}
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 border border-[var(--border-light)] text-xs font-bold text-[var(--text-primary)] cursor-pointer">
                      <Camera className="w-4 h-4 text-[#d49a9e]" />
                      <span>{newTreatImage ? 'Change Photo from Storage' : 'Select Photo from Internal Storage'}</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setNewTreatImage)} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Description &amp; Key Healing Benefits
                  </label>
                  <textarea
                    rows={3}
                    value={newTreatDesc}
                    onChange={(e) => setNewTreatDesc(e.target.value)}
                    placeholder="Describe therapeutic oils, muscle techniques, sensory notes..."
                    className="w-full p-3.5 rounded-xl border border-[var(--border-light)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d49a9e] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowAddTreatment(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" className="font-bold">
                    Save Therapy to Catalog
                  </Button>
                </div>
              </form>
            )}

            {/* Treatments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {treatments.map((t) => (
                <div key={t.id} className="p-4 rounded-[20px] bg-[var(--bg-card)] border border-[var(--border-light)] shadow-sm flex flex-col justify-between gap-3">
                  <div>
                    <div className="relative rounded-xl overflow-hidden h-36 mb-3">
                      <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-black/60 text-white backdrop-blur-xs">
                        {t.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)]">{t.name}</h4>
                    <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{t.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-light)] text-xs">
                    <span className="font-bold text-base text-[#b57377] dark:text-[#e8b4b8]">R{t.price}</span>
                    <span className="text-[var(--text-muted)]">{t.duration} min</span>
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEditTreatment(t)}
                          className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg cursor-pointer transition-colors"
                          title="Edit treatment details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTreatment(t.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer transition-colors"
                          title="Delete treatment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Edit Treatment Modal */}
            {editingTreatment && isAdmin && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                <div className="w-full max-w-2xl bg-[var(--bg-card)] rounded-[28px] border border-[#e8b4b8] p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-4">
                    <div>
                      <h3 className="font-serif-luxury text-xl font-bold text-[var(--text-primary)]">
                        Edit Spa Treatment
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        Modify treatment title, price, duration, category, photo, and healing benefits.
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingTreatment(null)}
                      className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-stone-100 dark:hover:bg-white/10 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditTreatment} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Treatment Title *"
                        value={editTreatName}
                        onChange={(e) => setEditTreatName(e.target.value)}
                        required
                      />

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                          Category *
                        </label>
                        <select
                          value={editTreatCategory}
                          onChange={(e) => setEditTreatCategory(e.target.value)}
                          required
                          className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-light)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d49a9e] capitalize"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c} className="bg-[var(--bg-card)] text-[var(--text-primary)] capitalize">
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Price (ZAR) *"
                        type="number"
                        value={editTreatPrice}
                        onChange={(e) => setEditTreatPrice(Number(e.target.value))}
                        required
                      />
                      <Input
                        label="Duration (Minutes) *"
                        type="number"
                        value={editTreatDuration}
                        onChange={(e) => setEditTreatDuration(Number(e.target.value))}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                        Treatment Photo (Select from Device / Internal Storage)
                      </label>
                      <div className="flex items-center gap-4">
                        {editTreatImage && (
                          <img src={editTreatImage} alt="Treatment preview" className="w-16 h-16 rounded-xl object-cover border border-[#e8b4b8]" />
                        )}
                        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 border border-[var(--border-light)] text-xs font-bold text-[var(--text-primary)] cursor-pointer">
                          <Camera className="w-4 h-4 text-[#d49a9e]" />
                          <span>Change Photo from Storage</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setEditTreatImage)} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                        Description &amp; Key Healing Benefits
                      </label>
                      <textarea
                        rows={3}
                        value={editTreatDesc}
                        onChange={(e) => setEditTreatDesc(e.target.value)}
                        placeholder="Describe therapeutic oils, muscle techniques, sensory notes..."
                        className="w-full p-3.5 rounded-xl border border-[var(--border-light)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d49a9e] resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-light)]">
                      <Button variant="outline" size="sm" type="button" onClick={() => setEditingTreatment(null)}>
                        Cancel
                      </Button>
                      <Button variant="primary" size="sm" type="submit" className="font-bold">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. STAFF & RECEPTIONIST MANAGEMENT (Admin Only) */}
        {activeTab === 'staff' && isAdmin && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  Staff &amp; Receptionist Team
                </h1>
                <p className="text-xs text-[var(--text-muted)]">
                  Register receptionists and staff members with customized access credentials.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                icon={<UserPlus className="w-4 h-4" />}
                onClick={() => setShowAddStaff(!showAddStaff)}
                className="font-bold text-xs sm:text-sm"
              >
                {showAddStaff ? 'Cancel' : 'Add New Staff / Receptionist'}
              </Button>
            </div>

            {/* Add Staff Form */}
            {showAddStaff && (
              <form onSubmit={handleAddStaffSubmit} className="p-6 rounded-[24px] bg-[var(--bg-card)] border border-[#e8b4b8] shadow-xl space-y-4 animate-in fade-in duration-200">
                <h3 className="font-serif-luxury text-xl font-bold text-[var(--text-primary)]">
                  Register New Spa Personnel
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name *"
                    value={newStaffFirst}
                    onChange={(e) => setNewStaffFirst(e.target.value)}
                    required
                  />
                  <Input
                    label="Last Name *"
                    value={newStaffLast}
                    onChange={(e) => setNewStaffLast(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Email Address *"
                    type="email"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Username"
                    value={newStaffUsername}
                    onChange={(e) => setNewStaffUsername(e.target.value)}
                    placeholder="e.g. receptionist_pam"
                  />
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                      Assigned Role *
                    </label>
                    <select
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value as 'admin' | 'receptionist')}
                      className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-light)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d49a9e]"
                    >
                      <option value="receptionist" className="bg-[var(--bg-card)]">Receptionist (Bookings &amp; Schedules)</option>
                      <option value="admin" className="bg-[var(--bg-card)]">Administrator (Full Control)</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Contact Phone Number"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  placeholder="e.g. +27 82 555 0192"
                />

                {/* Avatar from internal storage */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Staff Photo (Select from Device / Internal Storage)
                  </label>
                  <div className="flex items-center gap-4">
                    {newStaffAvatar && (
                      <img src={newStaffAvatar} alt="Staff preview" className="w-14 h-14 rounded-full object-cover border border-[#e8b4b8]" />
                    )}
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 border border-[var(--border-light)] text-xs font-bold text-[var(--text-primary)] cursor-pointer">
                      <Camera className="w-4 h-4 text-[#d49a9e]" />
                      <span>Select Photo from Device</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setNewStaffAvatar)} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowAddStaff(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" className="font-bold">
                    Save Personnel Account
                  </Button>
                </div>
              </form>
            )}

            {/* Staff Table */}
            <div className="rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-light)] shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-light)] bg-stone-100/60 dark:bg-white/5 text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Personnel</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {staffList.map((s) => (
                    <tr key={s.id} className="hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        {s.avatar ? (
                          <img src={s.avatar} alt={s.firstName} className="w-9 h-9 rounded-full object-cover border border-[#e8b4b8]" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#e8b4b8] text-[#1a1418] font-bold flex items-center justify-center text-xs">
                            {s.firstName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-[var(--text-primary)]">{s.firstName} {s.lastName}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">@{s.username}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          s.role === 'admin' ? 'bg-[#e8b4b8]/20 text-[#b57377] dark:text-[#e8b4b8]' : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {s.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-muted)]">{s.email}</td>
                      <td className="py-3 px-4 text-[var(--text-muted)]">{s.phone || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. SANCTUARY THERAPISTS */}
        {activeTab === 'therapists' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  Sanctuary Therapists &amp; Team ({therapists.length})
                </h1>
                <p className="text-xs text-[var(--text-muted)]">
                  Master therapists providing personalized care and therapies.
                </p>
              </div>

              {isAdmin && (
                <Button
                  variant="primary"
                  size="md"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowAddTherapist(!showAddTherapist)}
                  className="font-bold text-xs sm:text-sm"
                >
                  {showAddTherapist ? 'Cancel' : 'Add New Therapist'}
                </Button>
              )}
            </div>

            {/* Add Therapist Form */}
            {showAddTherapist && isAdmin && (
              <form onSubmit={handleAddTherapistSubmit} className="p-6 rounded-[24px] bg-[var(--bg-card)] border border-[#e8b4b8] shadow-xl space-y-4 animate-in fade-in duration-200">
                <h3 className="font-serif-luxury text-xl font-bold text-[var(--text-primary)]">
                  Add Master Therapist
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Therapist Full Name *"
                    placeholder="e.g. Zola Dlamini"
                    value={newThName}
                    onChange={(e) => setNewThName(e.target.value)}
                    required
                  />
                  <Input
                    label="Professional Title / Specialty *"
                    placeholder="e.g. Senior Holistic Therapist &amp; Reflexology Lead"
                    value={newThRole}
                    onChange={(e) => setNewThRole(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Specialties (comma separated)"
                  placeholder="e.g. Deep Tissue, Aromatherapy, Hot Stones"
                  value={newThSpecialties}
                  onChange={(e) => setNewThSpecialties(e.target.value)}
                />

                {/* Photo selected from internal storage */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Therapist Photo (Select from Device / Internal Storage) *
                  </label>
                  <div className="flex items-center gap-4">
                    {newThAvatar && (
                      <img src={newThAvatar} alt="Therapist preview" className="w-16 h-16 rounded-full object-cover border border-[#e8b4b8]" />
                    )}
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 border border-[var(--border-light)] text-xs font-bold text-[var(--text-primary)] cursor-pointer">
                      <Camera className="w-4 h-4 text-[#d49a9e]" />
                      <span>{newThAvatar ? 'Change Photo from Storage' : 'Select Photo from Internal Storage'}</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setNewThAvatar)} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Bio &amp; Healing Philosophy
                  </label>
                  <textarea
                    rows={3}
                    value={newThBio}
                    onChange={(e) => setNewThBio(e.target.value)}
                    placeholder="Over 8 years of dedicated practice in mindfulness and body rehabilitation..."
                    className="w-full p-3.5 rounded-xl border border-[var(--border-light)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d49a9e] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowAddTherapist(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" className="font-bold">
                    Save Therapist
                  </Button>
                </div>
              </form>
            )}

            {/* Therapists Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {therapists.map((th) => (
                <div key={th.id} className="p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-light)] shadow-sm flex items-start gap-4">
                  <img src={th.avatar} alt={th.name} className="w-16 h-16 rounded-full object-cover border-2 border-[#e8b4b8] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[var(--text-primary)] truncate">{th.name}</h4>
                    <p className="text-xs text-[#b57377] dark:text-[#e8b4b8] font-medium truncate">{th.role}</p>
                    <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-1">{th.bio}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {th.specialties.map((s, idx) => (
                        <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-white/10 text-[var(--text-muted)]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteTherapist(th.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer shrink-0"
                      title="Delete Therapist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. HEALTH CORNER ARTICLES (Admin Only) */}
        {activeTab === 'articles' && isAdmin && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  Health Corner Articles &amp; Editorial ({articles.length})
                </h1>
                <p className="text-xs text-[var(--text-muted)]">
                  Publish wellness tips, aromatherapy guides, and holistic living advice.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setShowAddArticle(!showAddArticle)}
                className="font-bold text-xs sm:text-sm"
              >
                {showAddArticle ? 'Cancel' : 'Write New Article'}
              </Button>
            </div>

            {/* Add Article Form */}
            {showAddArticle && (
              <form onSubmit={handleAddArticleSubmit} className="p-6 rounded-[24px] bg-[var(--bg-card)] border border-[#e8b4b8] shadow-xl space-y-4 animate-in fade-in duration-200">
                <h3 className="font-serif-luxury text-xl font-bold text-[var(--text-primary)]">
                  Publish Health Corner Article
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      label="Article Title *"
                      placeholder="e.g. The Science of Essential Oils for Nervous System Reset"
                      value={newArtTitle}
                      onChange={(e) => setNewArtTitle(e.target.value)}
                      required
                    />
                  </div>
                  <Input
                    label="Category"
                    value={newArtCategory}
                    onChange={(e) => setNewArtCategory(e.target.value)}
                    placeholder="e.g. Mind & Body"
                  />
                </div>

                {/* Photo selected from internal storage */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Cover Photo (Select from Device / Internal Storage) *
                  </label>
                  <div className="flex items-center gap-4">
                    {newArtImage && (
                      <img src={newArtImage} alt="Article cover preview" className="w-20 h-14 rounded-xl object-cover border border-[#e8b4b8]" />
                    )}
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 border border-[var(--border-light)] text-xs font-bold text-[var(--text-primary)] cursor-pointer">
                      <Camera className="w-4 h-4 text-[#d49a9e]" />
                      <span>{newArtImage ? 'Change Cover Photo' : 'Select Photo from Internal Storage'}</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setNewArtImage)} className="hidden" />
                    </label>
                  </div>
                </div>

                <Input
                  label="Short Excerpt"
                  placeholder="A one-sentence summary for the card preview..."
                  value={newArtExcerpt}
                  onChange={(e) => setNewArtExcerpt(e.target.value)}
                />

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Full Editorial Content *
                  </label>
                  <textarea
                    rows={5}
                    value={newArtContent}
                    onChange={(e) => setNewArtContent(e.target.value)}
                    placeholder="Write your therapeutic insights, daily rituals, guidance..."
                    required
                    className="w-full p-3.5 rounded-xl border border-[var(--border-light)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d49a9e]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowAddArticle(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" className="font-bold">
                    Publish Article
                  </Button>
                </div>
              </form>
            )}

            {/* Articles List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((art) => (
                <div key={art.id} className="p-4 rounded-[20px] bg-[var(--bg-card)] border border-[var(--border-light)] shadow-sm flex gap-4">
                  <img src={art.imageUrl} alt={art.title} className="w-24 h-24 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#b57377] dark:text-[#e8b4b8]">{art.category}</span>
                      <h4 className="font-bold text-sm text-[var(--text-primary)] line-clamp-1">{art.title}</h4>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-0.5">{art.excerpt}</p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mt-2">
                      <span>{art.date} • {art.readTime}</span>
                      <button
                        onClick={() => handleDeleteArticle(art.id)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. SANCTUARY GALLERY PHOTOS (Admin Only) */}
        {activeTab === 'gallery' && isAdmin && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  Atmosphere &amp; Gallery Photos ({galleryList.length})
                </h1>
                <p className="text-xs text-[var(--text-muted)]">
                  Manage the public gallery showcase by uploading photos selected directly from internal storage.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                icon={<Camera className="w-4 h-4" />}
                onClick={() => setShowAddPhoto(!showAddPhoto)}
                className="font-bold text-xs sm:text-sm"
              >
                {showAddPhoto ? 'Cancel' : 'Add Photo from Storage'}
              </Button>
            </div>

            {/* Add Photo Form */}
            {showAddPhoto && (
              <form onSubmit={handleAddPhotoSubmit} className="p-6 rounded-[24px] bg-[var(--bg-card)] border border-[#e8b4b8] shadow-xl space-y-4 animate-in fade-in duration-200">
                <h3 className="font-serif-luxury text-xl font-bold text-[var(--text-primary)]">
                  Upload Sanctuary Atmosphere Photo
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Photo Title *"
                    placeholder="e.g. Hydrotherapy Zen Garden Suite"
                    value={newPhotoTitle}
                    onChange={(e) => setNewPhotoTitle(e.target.value)}
                    required
                  />

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                      Gallery Category *
                    </label>
                    <select
                      value={newPhotoCategory}
                      onChange={(e) => setNewPhotoCategory(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-light)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d49a9e]"
                    >
                      <option value="Suites" className="bg-[var(--bg-card)]">Suites</option>
                      <option value="Therapies" className="bg-[var(--bg-card)]">Therapies</option>
                      <option value="Products" className="bg-[var(--bg-card)]">Products</option>
                      <option value="Facilities" className="bg-[var(--bg-card)]">Facilities</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Short Caption"
                  placeholder="e.g. Private thermal garden tub surrounded by aromatic jasmine..."
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                />

                {/* Photo file selection from internal storage */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Select Photo from Internal Storage *
                  </label>
                  <div className="flex items-center gap-4">
                    {newPhotoImage && (
                      <img src={newPhotoImage} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-[#e8b4b8]" />
                    )}
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 border border-[var(--border-light)] text-xs font-bold text-[var(--text-primary)] cursor-pointer">
                      <Camera className="w-4 h-4 text-[#d49a9e]" />
                      <span>{newPhotoImage ? 'Change Photo' : 'Select Photo from Device Storage'}</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setNewPhotoImage)} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowAddPhoto(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" className="font-bold">
                    Add to Gallery
                  </Button>
                </div>
              </form>
            )}

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryList.map((item) => (
                <div key={item.id} className="group relative rounded-2xl overflow-hidden aspect-square border border-[var(--border-light)] bg-stone-100 dark:bg-white/5">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDeletePhoto(item.id)}
                        className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-md"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-[#e8b4b8]">{item.category}</span>
                      <p className="text-xs font-bold line-clamp-1">{item.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. SITE SETTINGS: BRAND LOGO, FOOTER CONTACT INFO & SOCIALS (Admin Only) */}
        {activeTab === 'settings' && isAdmin && (
          <div className="max-w-3xl mx-auto rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-light)] p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                Site Branding &amp; Footer Settings
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Customize the sanctuary logo image, footer contact phone and email, address, and live social media accounts.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Logo & Brand Identity */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-white/5 border border-[var(--border-light)] space-y-4">
                <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#d49a9e]" />
                  <span>Sanctuary Logo & Brand Name</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Primary Brand Name"
                    value={settingBrandName}
                    onChange={(e) => setSettingBrandName(e.target.value)}
                    placeholder="Lusentic"
                    required
                  />
                  <Input
                    label="Brand Suffix / Category"
                    value={settingBrandSuffix}
                    onChange={(e) => setSettingBrandSuffix(e.target.value)}
                    placeholder="Spa"
                    required
                  />
                </div>

                <div className="pt-2 border-t border-[var(--border-light)] flex flex-wrap items-center gap-4">
                  {settingLogo ? (
                    <div className="relative group">
                      <img src={settingLogo} alt="Logo" className="w-16 h-16 rounded-2xl object-cover border border-[#e8b4b8] shadow-sm" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#d49a9e] to-[#e8b4b8] text-[#1a1418] font-bold flex flex-col items-center justify-center shadow-sm">
                      <Sparkles className="w-6 h-6 text-[#1a1418]" />
                      <span className="text-[9px] uppercase font-bold tracking-wider">Default</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-200 dark:bg-white/10 hover:bg-stone-300 dark:hover:bg-white/20 text-xs font-bold text-[var(--text-primary)] cursor-pointer transition-colors">
                        <Camera className="w-4 h-4 text-[#d49a9e]" />
                        <span>Select Logo from Device Storage</span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setSettingLogo)} className="hidden" />
                      </label>

                      {settingLogo && (
                        <button
                          type="button"
                          onClick={() => setSettingLogo('')}
                          className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold transition-colors"
                        >
                          Remove Logo (Use Default Sparkle)
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Instant update on Top Floating Navbar, Centered Hero Card, Footer, and Admin Portal upon saving.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Contact Details */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-white/5 border border-[var(--border-light)] space-y-4">
                <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#d49a9e]" />
                  <span>Footer Contact Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Sanctuary Phone / WhatsApp Number *"
                    value={settingPhone}
                    onChange={(e) => setSettingPhone(e.target.value)}
                    placeholder="+27 82 555 0192"
                    required
                  />
                  <Input
                    label="Support Email Address *"
                    type="email"
                    value={settingEmail}
                    onChange={(e) => setSettingEmail(e.target.value)}
                    placeholder="concierge@lusenticspa.com"
                    required
                  />
                </div>

                <Input
                  label="Physical Address / Sanctuary Location"
                  value={settingAddress}
                  onChange={(e) => setSettingAddress(e.target.value)}
                  placeholder="14 Serenity Ridge, Camps Bay, Cape Town, South Africa"
                />

                <Input
                  label="Operating Hours"
                  value={settingHours}
                  onChange={(e) => setSettingHours(e.target.value)}
                  placeholder="Mon – Sun: 08:00 AM – 20:00 PM"
                />
              </div>

              {/* Social Media Links */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-white/5 border border-[var(--border-light)] space-y-4">
                <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#d49a9e]" />
                  <span>Social Media Links</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Instagram URL"
                    value={settingInstagram}
                    onChange={(e) => setSettingInstagram(e.target.value)}
                    placeholder="https://instagram.com/lusenticspa"
                  />
                  <Input
                    label="Facebook URL"
                    value={settingFacebook}
                    onChange={(e) => setSettingFacebook(e.target.value)}
                    placeholder="https://facebook.com/lusenticspa"
                  />
                  <Input
                    label="TikTok URL"
                    value={settingTiktok}
                    onChange={(e) => setSettingTiktok(e.target.value)}
                    placeholder="https://tiktok.com/@lusenticspa"
                  />
                  <Input
                    label="WhatsApp Direct Link"
                    value={settingWhatsapp}
                    onChange={(e) => setSettingWhatsapp(e.target.value)}
                    placeholder="https://wa.me/27825550192"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                className="font-bold text-xs sm:text-sm shadow-md w-full sm:w-auto"
              >
                Save Site Branding &amp; Footer Info
              </Button>
            </form>
          </div>
        )}

        {/* 9. TESTIMONIALS SECTION (Admin Only) */}
        {activeTab === 'testimonials' && isAdmin && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  Guest Reviews &amp; Testimonials ({testimonials.length})
                </h1>
                <p className="text-xs text-[var(--text-muted)]">
                  Manage client reviews and feedback. Delete inappropriate or outdated guest testimonials.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testimonials.map((test) => (
                <div key={test.id} className="p-5 rounded-[22px] bg-[var(--bg-card)] border border-[var(--border-light)] shadow-sm flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        {test.avatar ? (
                          <img src={test.avatar} alt={test.name} className="w-10 h-10 rounded-full object-cover border border-[#e8b4b8]" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#f5edea] dark:bg-[#2d2228] text-[#d49a9e] font-bold flex items-center justify-center text-xs">
                            {test.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-[var(--text-primary)]">{test.name}</h4>
                          <p className="text-[11px] text-[var(--text-muted)]">{test.treatment} • {test.date}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTestimonial(test.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 text-[#FFD700] mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < test.stars ? 'fill-[#FFD700]' : 'text-stone-300'}`} />
                      ))}
                      <span className="text-xs font-bold text-[var(--text-primary)] ml-1">{test.stars}.0</span>
                    </div>

                    <p className="text-xs text-stone-700 dark:text-stone-200 italic leading-relaxed">
                      "{test.content}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
