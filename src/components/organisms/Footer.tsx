import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  Instagram,
  Facebook,
  MessageSquare,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../atoms/Button';
import { settingsService } from '../../services/settingsService';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenVoucher: () => void;
  onOpenAdmin?: () => void;
  onSelectCategory?: (category: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking, onOpenVoucher, onOpenAdmin }) => {
  const [settings, setSettings] = useState(settingsService.getSettings());
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  useEffect(() => {
    const unsub = settingsService.subscribe((updated) => {
      setSettings(updated);
    });
    return () => unsub();
  }, []);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSuccess(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSuccess(false), 4000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;
    setContactSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactMsg('');
    setTimeout(() => setContactSuccess(false), 5000);
  };

  return (
    <footer id="contact" className="bg-[#1a1418] text-white pt-14 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter Subscription Strip */}
        <div className="pb-12 border-b border-white/10 mb-12 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center lg:text-left">
            <div className="w-12 h-12 rounded-full bg-[#e8b4b8]/20 flex items-center justify-center text-[#e8b4b8] shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white tracking-wide uppercase">
                Stay Updated
              </h4>
              <p className="text-xs text-white/70">
                Subscribe to our newsletter for seasonal wellness specials &amp; exclusive retreats.
              </p>
            </div>
          </div>

          <form onSubmit={handleNewsletter} className="flex items-center gap-2 w-full lg:w-auto max-w-md">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 text-xs focus:outline-none focus:border-[#e8b4b8]"
            />
            <Button variant="primary" size="sm" type="submit" className="shrink-0 text-xs font-bold">
              {newsletterSuccess ? 'Subscribed!' : 'Subscribe'}
            </Button>
          </form>
        </div>

        {/* 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-white/10">
          
          {/* Column 1: Brand & Contact Info (Dynamically updated from Admin Settings) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Lusentic Spa Logo"
                    className="w-10 h-10 rounded-full object-cover border border-[#e8b4b8]"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#d49a9e] to-[#e8b4b8] flex items-center justify-center text-[#1a1418]">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <h4 className="text-2xl font-bold tracking-tight text-white">
                  {settings.brandName || settings.businessName || 'Lusentic'}{' '}
                  <span className="font-light text-[#e8b4b8] font-serif-luxury italic">{settings.brandSuffix || 'Spa'}</span>
                </h4>
              </div>

              <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-6">
                A luxury wellness and holistic sanctuary dedicated to restoring harmony, physical vitality, and deep peace of mind through authentic organic therapies.
              </p>

              <div className="space-y-3 text-xs text-white/80">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#e8b4b8] shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#e8b4b8] shrink-0" />
                  <span>{settings.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#e8b4b8] shrink-0" />
                  <span>{settings.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#e8b4b8] shrink-0" />
                  <span>{settings.operatingHours}</span>
                </div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3.5 mt-6">
              <a
                href={settings.socials?.whatsapp || 'https://wa.me/27825550192'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#25D366] text-white flex items-center justify-center transition-all hover:-translate-y-1 shadow-sm"
                title="WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href={settings.socials?.instagram || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E1306C] text-white flex items-center justify-center transition-all hover:-translate-y-1 shadow-sm"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings.socials?.facebook || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#1877F2] text-white flex items-center justify-center transition-all hover:-translate-y-1 shadow-sm"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#e8b4b8] hover:text-[#1a1418] text-white flex items-center justify-center transition-all hover:-translate-y-1 shadow-sm"
                title="Email Concierge"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-white/75">
              <li>
                <a href="#hero" className="hover:text-[#e8b4b8] transition-colors">Home</a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#e8b4b8] transition-colors">About Lusentic</a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#e8b4b8] transition-colors">Our Therapies</a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-[#e8b4b8] transition-colors">Spa Gallery</a>
              </li>
              <li>
                <a href="#team" className="hover:text-[#e8b4b8] transition-colors">Our Therapists</a>
              </li>
              <li>
                <a href="#articles" className="hover:text-[#e8b4b8] transition-colors">Health Corner</a>
              </li>
              <li>
                <button onClick={onOpenVoucher} className="hover:text-[#FFD700] transition-colors text-left cursor-pointer">
                  Gift Vouchers
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Featured Services */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Popular Care
            </h4>
            <ul className="space-y-2.5 text-xs text-white/75">
              <li>
                <a href="#services" className="hover:text-[#e8b4b8] transition-colors">Aromatherapy Massage</a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#e8b4b8] transition-colors">Swedish Muscle Relief</a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#e8b4b8] transition-colors">Volcanic Hot Stones</a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#e8b4b8] transition-colors">Couples Harmony Suite</a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#e8b4b8] transition-colors">Botanical Hydro-Facial</a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#e8b4b8] transition-colors">Himalayan Salt Scrub</a>
              </li>
              <li>
                <button onClick={onOpenBooking} className="text-[#e8b4b8] font-bold hover:underline cursor-pointer">
                  Book A Session →
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact / Inquiry Form */}
          <div className="lg:col-span-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Send an Inquiry
            </h4>
            
            {contactSuccess ? (
              <div className="p-5 rounded-2xl bg-white/5 border border-green-500/40 text-xs text-green-300 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <div>
                  <p className="font-bold text-white mb-1">Message Received!</p>
                  <p>Our guest concierge will respond via email or phone within 2 business hours.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-[#e8b4b8]"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-[#e8b4b8]"
                />
                <textarea
                  rows={2}
                  placeholder="Questions about treatments, couples suites, or custom packages?"
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-[#e8b4b8] resize-none"
                />
                <Button variant="primary" size="sm" type="submit" fullWidth icon={<Send className="w-3.5 h-3.5" />}>
                  Send Message
                </Button>
              </form>
            )}
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© 2026 {settings.businessName || 'Lusentic Spa & Wellness'}. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms &amp; Etiquette</span>
            <span className="hover:text-white cursor-pointer">Cancellation Policy</span>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hover:text-[#e8b4b8] text-white/70 flex items-center gap-1.5 cursor-pointer font-medium transition-colors"
                title="Open Super Admin Panel"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#e8b4b8]" />
                <span>Admin Sanctuary Portal</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
