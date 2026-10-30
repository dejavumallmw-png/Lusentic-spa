import React, { useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Navigation,
  Compass,
  Phone,
  Clock,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Shield,
  Car,
} from 'lucide-react';
import { Button } from '../atoms/Button';
import { SparkleEmblem } from '../atoms/SparkleEmblem';
import { SiteSettings } from '../../types';

interface LocationDirectionsSectionProps {
  settings: SiteSettings;
}

export const LocationDirectionsSection: React.FC<LocationDirectionsSectionProps> = ({ settings }) => {
  // Sanctuary coordinates specified by user: 26.170776, 26.166044
  const targetCoordinates = settings.coordinates || { lat: 26.170776, lng: 26.166044 };
  const coordinatesDisplay = settings.coordinatesString || '26.170776, 26.166044';

  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const mapsApiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    'AIzaSyD7i4Kp96w4RYOQKMnrRupwzp_WCspxOPU';

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${targetCoordinates.lat},${targetCoordinates.lng}`;
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${targetCoordinates.lat},${targetCoordinates.lng}`;

  const handleCopyCoordinates = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(coordinatesDisplay);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section id="location" className="py-16 sm:py-24 bg-[var(--bg-primary)] border-t border-[var(--border-light)] scroll-mt-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#e8b4b8]/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#d49a9e]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e8b4b8]/15 border border-[#e8b4b8]/40 text-[#b57377] dark:text-[#e8b4b8] text-xs font-bold tracking-wider uppercase mb-3">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Sanctuary Coordinates &amp; Navigation</span>
          </div>

          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-[var(--text-primary)] mb-4">
            Visit Lusentic <span className="italic text-[#d49a9e]">Sanctuary</span>
          </h2>

          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-[1px] bg-[#e8b4b8]" />
            <span className="text-[#d49a9e] text-xs">❀</span>
            <div className="w-10 h-[1px] bg-[#e8b4b8]" />
          </div>

          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            Nestled in tranquil botanical gardens. Get precise live Google Maps turn-by-turn navigation, coordinates, and concierge arrival assistance.
          </p>
        </div>

        {/* Bento Grid: Location Details Card + Interactive Google Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Sanctuary Concierge & Directions Details (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Primary Details Card */}
            <div className="p-6 sm:p-8 rounded-[32px] bg-[var(--bg-card)] border border-[var(--border-light)] shadow-lg space-y-6">
              
              {/* Brand Header */}
              <div className="flex items-center gap-3.5 pb-5 border-b border-[var(--border-light)]">
                <SparkleEmblem size="sm" customLogo={settings.logoUrl} />
                <div>
                  <h3 className="font-serif-luxury text-2xl font-bold text-[var(--text-primary)]">
                    {settings.brandName || 'Lusentic'}{' '}
                    <span className="italic font-light text-[#d49a9e]">{settings.brandSuffix || 'Spa'}</span>
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {settings.tagline || 'Where Nature Meets Serenity'}
                  </p>
                </div>
              </div>

              {/* Physical Address */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-[#e8b4b8]/20 text-[#b57377] dark:text-[#e8b4b8] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
                    Sanctuary Address
                  </h4>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                    {settings.address || '128 Rosebank Boulevard, Sanctuary Quarter, Johannesburg, 2196'}
                  </p>
                </div>
              </div>

              {/* Exact Coordinates Highlight */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-white/5 border border-[var(--border-light)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Compass className="w-5 h-5 text-[#d49a9e] shrink-0" />
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      GPS Coordinates
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-[var(--text-primary)]">
                      {coordinatesDisplay}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCoordinates}
                  className="p-2 rounded-xl bg-white dark:bg-white/10 hover:bg-[#e8b4b8]/20 text-[var(--text-primary)] border border-[var(--border-light)] transition-all cursor-pointer shadow-xs flex items-center gap-1.5 text-xs font-semibold"
                  title="Copy Coordinates to Clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#d49a9e]" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Operating Hours & Concierge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-2.5 text-xs">
                  <Clock className="w-4 h-4 text-[#d49a9e] shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-[var(--text-primary)]">Sanctuary Hours</span>
                    <span className="text-[var(--text-muted)] text-[11px]">
                      {settings.operatingHours || 'Mon – Sun: 08:00 – 20:00'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs">
                  <Phone className="w-4 h-4 text-[#d49a9e] shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-[var(--text-primary)]">Concierge Phone</span>
                    <a
                      href={`tel:${settings.phone}`}
                      className="text-[#b57377] dark:text-[#e8b4b8] text-[11px] font-semibold hover:underline"
                    >
                      {settings.phone || '+27 83 815 4513'}
                    </a>
                  </div>
                </div>
              </div>

              {/* Arrival Amenities */}
              <div className="pt-4 border-t border-[var(--border-light)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-[#28a745]" />
                  <span>Complimentary Valet Parking</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#e8b4b8]" />
                  <span>Private Access Suite</span>
                </span>
              </div>

              {/* Direct Directions Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#1a1418] dark:bg-[#e8b4b8] text-white dark:text-[#1a1418] hover:bg-[#b57377] dark:hover:bg-[#d49a9e] font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer group"
                >
                  <Navigation className="w-4 h-4 text-[#e8b4b8] dark:text-[#1a1418] group-hover:scale-110 transition-transform" />
                  <span>Get Google Maps Directions</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-0.5" />
                </a>

                <a
                  href={googleMapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] hover:border-[#e8b4b8] text-[var(--text-primary)] font-semibold text-xs transition-all cursor-pointer shadow-xs"
                  title="Open location in Google Maps browser"
                >
                  <MapPin className="w-4 h-4 text-[#d49a9e]" />
                  <span>View in Maps</span>
                </a>
              </div>

            </div>
          </div>

          {/* Right Column: Interactive Google Map (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative flex-1 w-full min-h-[380px] sm:min-h-[480px] rounded-[32px] overflow-hidden border border-[var(--border-light)] shadow-xl bg-stone-900">
              
              <APIProvider apiKey={mapsApiKey}>
                <Map
                  defaultCenter={targetCoordinates}
                  defaultZoom={15}
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  className="w-full h-full min-h-[380px] sm:min-h-[480px]"
                  gestureHandling="cooperative"
                  disableDefaultUI={false}
                  fullscreenControl={true}
                  mapTypeControl={true}
                  zoomControl={true}
                  streetViewControl={false}
                >
                  {/* Sanctuary Advanced Marker Pin */}
                  <AdvancedMarker
                    position={targetCoordinates}
                    onClick={() => setIsInfoOpen(true)}
                    title="Lusentic Spa & Wellness Sanctuary"
                  >
                    <Pin
                      background="#1a1418"
                      borderColor="#e8b4b8"
                      glyphColor="#e8b4b8"
                      scale={1.2}
                    />
                  </AdvancedMarker>

                  {/* Luxury Info Window */}
                  {isInfoOpen && (
                    <InfoWindow
                      position={targetCoordinates}
                      onCloseClick={() => setIsInfoOpen(false)}
                      maxWidth={320}
                    >
                      <div className="p-2 space-y-2 text-[#1a1418]">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#1a1418] text-[#e8b4b8] flex items-center justify-center text-xs">
                            ❀
                          </span>
                          <h4 className="font-serif-luxury text-base font-bold text-[#1a1418]">
                            Lusentic Spa &amp; Wellness
                          </h4>
                        </div>
                        <p className="text-[11px] text-stone-600 leading-tight">
                          {settings.address || '128 Rosebank Boulevard, Sanctuary Quarter'}
                        </p>
                        <p className="text-[10px] font-mono font-semibold text-[#b57377]">
                          GPS: {coordinatesDisplay}
                        </p>
                        <a
                          href={googleMapsDirectionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1418] text-[#e8b4b8] hover:bg-stone-800 text-[11px] font-bold shadow-xs transition-colors mt-1 w-full justify-center"
                        >
                          <Navigation className="w-3 h-3 text-[#e8b4b8]" />
                          <span>Start Route in Google Maps</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>

              {/* Floating Map Overlay Badge */}
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <div className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Sanctuary Satellite &amp; Street View</span>
                </div>
              </div>

              {/* Floating Bottom Quick-Action Prompt */}
              <div className="absolute bottom-4 right-4 z-20">
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-stone-900 text-xs font-bold shadow-xl border border-stone-200 transition-all hover:scale-105"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#b57377]" />
                  <span>Navigate ({coordinatesDisplay})</span>
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
