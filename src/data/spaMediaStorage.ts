export interface StoragePhotoAsset {
  id: string;
  title: string;
  category: 'Suites' | 'Therapies' | 'Products' | 'Facilities';
  image: string;
  caption: string;
  tags: string[];
}

export const SPA_MEDIA_STORAGE_ASSETS: StoragePhotoAsset[] = [
  // SUITES
  {
    id: 'storage-suite-1',
    title: 'Aromatic Treatment Suite',
    category: 'Suites',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    caption: 'Private serene rooms designed with soothing warm lighting, natural bamboo, and ambient soundscapes.',
    tags: ['suite', 'room', 'interior', 'candles', 'tranquil'],
  },
  {
    id: 'storage-suite-2',
    title: 'Presidential Couple Retreat Suite',
    category: 'Suites',
    image: 'https://images.unsplash.com/photo-1591343395082-e120087004b4?auto=format&fit=crop&w=1200&q=80',
    caption: 'Dual massage beds, private hot tub, and champagne lounge for intimate couple experiences.',
    tags: ['couple', 'suite', 'luxury', 'private', 'romantic'],
  },
  {
    id: 'storage-suite-3',
    title: 'Zen Garden Bath Suite',
    category: 'Suites',
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
    caption: 'Open-air thermal soak tub overlooking a curated Japanese rock and moss garden.',
    tags: ['bath', 'garden', 'zen', 'tub', 'soak'],
  },
  {
    id: 'storage-suite-4',
    title: 'Himalayan Salt Meditation Suite',
    category: 'Suites',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80',
    caption: 'Ambient ionized pink salt brick room promoting cellular respiration and calm nervous systems.',
    tags: ['salt', 'meditation', 'pink salt', 'relaxation'],
  },
  {
    id: 'storage-suite-5',
    title: 'Nordic Cedar Steam Suite',
    category: 'Suites',
    image: 'https://images.unsplash.com/photo-1583416750470-965b2707b355?auto=format&fit=crop&w=1200&q=80',
    caption: 'Handcrafted red cedar aromatic steam cabin infused with eucalyptus and menthol vapors.',
    tags: ['steam', 'sauna', 'cedar', 'detox'],
  },

  // THERAPIES
  {
    id: 'storage-therapy-1',
    title: 'Volcanic River Stones Ritual',
    category: 'Therapies',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80',
    caption: 'Handpicked basalt volcanic river stones pre-warmed with botanical infusions for deep relaxation.',
    tags: ['hot stones', 'massage', 'therapy', 'basalt'],
  },
  {
    id: 'storage-therapy-2',
    title: 'Botanical Skin Facial Ritual',
    category: 'Therapies',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    caption: 'Custom facial serums formulated with natural floral actives, peptide boosters, and antioxidant vitamin C.',
    tags: ['facial', 'skincare', 'glow', 'beauty'],
  },
  {
    id: 'storage-therapy-3',
    title: 'Aromatherapy Oil Pouring',
    category: 'Therapies',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
    caption: 'Warm organic essential oils streamed rhythmically along acupuncture meridians to relieve fatigue.',
    tags: ['oil', 'aromatherapy', 'pouring', 'meridian'],
  },
  {
    id: 'storage-therapy-4',
    title: 'Tibetan Sound Singing Bowls',
    category: 'Therapies',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    caption: 'Frequency vibration therapy aligning alpha brainwaves into states of deep regenerative meditation.',
    tags: ['sound', 'bowls', 'meditation', 'harmonic'],
  },
  {
    id: 'storage-therapy-5',
    title: 'Herbal Compress Thermal Poultice',
    category: 'Therapies',
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1200&q=80',
    caption: 'Steamed muslin pouches packed with lemongrass, turmeric, and kaffir lime for joint relief.',
    tags: ['poultice', 'herbal', 'thai', 'compress'],
  },

  // PRODUCTS
  {
    id: 'storage-product-1',
    title: 'Pure Organic Essential Oils',
    category: 'Products',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80',
    caption: '100% certified cold-pressed jojoba, lavender, lemongrass, and sweet almond massage bases.',
    tags: ['oils', 'bottles', 'essential oils', 'organic'],
  },
  {
    id: 'storage-product-2',
    title: 'Dead Sea Minerals & Lavender Scrub',
    category: 'Products',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
    caption: 'Exfoliating salt crystals blended with wildflower honey and soothing French lavender petals.',
    tags: ['scrub', 'salts', 'dead sea', 'exfoliation'],
  },
  {
    id: 'storage-product-3',
    title: 'Rose Quartz Guasha & Facial Rollers',
    category: 'Products',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    caption: 'Handcrafted semi-precious stone rollers designed for lymphatic puffiness relief and dermal firming.',
    tags: ['roller', 'crystals', 'rose quartz', 'tools'],
  },
  {
    id: 'storage-product-4',
    title: 'Artisanal Herbal Tea Elixirs',
    category: 'Products',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
    caption: 'Organic loose leaf blends of chamomile, rosehip, and lemon verbena served to guests post-treatment.',
    tags: ['tea', 'elixir', 'herbal', 'blend'],
  },

  // FACILITIES
  {
    id: 'storage-facility-1',
    title: 'Serene Hydro Relaxation Lounge',
    category: 'Facilities',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
    caption: 'Unwind post-treatment with artisanal herbal tea, infused water, and gentle harmonic loungers.',
    tags: ['lounge', 'relaxation', 'tea', 'rest'],
  },
  {
    id: 'storage-facility-2',
    title: 'Deluxe Pedicure Station',
    category: 'Facilities',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    caption: 'Heated whirlpool copper foot baths with eucalyptus minerals and ergonomic plush armchairs.',
    tags: ['pedicure', 'feet', 'station', 'copper'],
  },
  {
    id: 'storage-facility-3',
    title: 'Infinity Thermal Reflection Pool',
    category: 'Facilities',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    caption: 'Temperature-regulated outdoor mineral pool immersed in natural greenery and water fountains.',
    tags: ['pool', 'water', 'infinity', 'swimming'],
  },
  {
    id: 'storage-facility-4',
    title: 'Zen Botanical Sanctuary Courtyard',
    category: 'Facilities',
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
    caption: 'Tranquil garden walkway bordered by bamboo, orchids, and soothing river stone waterways.',
    tags: ['garden', 'nature', 'courtyard', 'bamboo'],
  },
];
