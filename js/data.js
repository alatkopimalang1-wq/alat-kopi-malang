/**
 * Data Toko Online & Produk Awal
 */

// Clean URL: sembunyikan ".html" dari address bar (contoh: /shop.html -> /shop)
(function cleanHtmlExtensionFromUrl() {
  try {
    if (!/^https?:$/.test(window.location.protocol)) return;
    const p = window.location.pathname;
    if (!/\.html$/i.test(p)) return;
    let clean = p.replace(/\.html$/i, '');
    if (/\/index$/i.test(clean)) clean = clean.replace(/index$/i, '');
    window.history.replaceState(null, '', clean + window.location.search + window.location.hash);
  } catch (_) {}
})();


// Dukungan navigasi jika file dibuka secara lokal (file:///) di browser
(function fixLocalFileLinks() {
  if (typeof window === 'undefined' || window.location.protocol !== 'file:') return;
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('javascript:') && !href.includes('.html')) {
        const [path, query] = href.split('?');
        const [p, hash] = path.split('#');
        if (p && p !== './' && p !== '/') {
          link.setAttribute('href', p + '.html' + (query ? '?' + query : '') + (hash ? '#' + hash : ''));
        }
      }
    });
  });
})();

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'Smartwatch Ultra Pro Series X',
    brand: 'Alat Kopi Malang',
    category: 'Gadget & Elektronik',
    price: 899000,
    originalPrice: 1250000,
    image: 'images/smartwatch.jpg',
    badge: 'Unggulan',
    rating: 4.9,
    reviewsCount: 248,
    stock: 14,
    variants: ['Space Grey', 'Titanium Silver', 'Midnight Black'],
    description: 'Layar AMOLED 1.96 inci Retina Always-on, sensor detak jantung 24/7, SpO2, pelacak olahraga 100+ mode, tahan air IP68, daya tahan baterai hingga 10 hari.',
    featured: true
  },
  {
    id: 'prod-002',
    name: 'Studio ANC Wireless Headphones V9',
    brand: 'StudioSound',
    category: 'Gadget & Elektronik',
    price: 1450000,
    originalPrice: 2100000,
    badge: 'Diskon 31%',
    image: 'images/headphones.jpg',
    rating: 4.8,
    reviewsCount: 185,
    stock: 8,
    variants: ['Matte Black', 'Graphite Grey'],
    description: 'Driver Audio Hi-Res 40mm, Active Noise Cancellation 45dB, daya tahan baterai 50 jam pemakaian, konektivitas Bluetooth 5.3 multipoint, bantalan telinga memory foam ultra empuk.',
    featured: true
  },
  {
    id: 'prod-003',
    name: 'HyperStride Neon Runner Sneakers',
    brand: 'HyperStride',
    category: 'Fashion & Sepatu',
    price: 749000,
    originalPrice: 999000,
    badge: 'Trending',
    image: 'images/sneakers.jpg',
    rating: 4.9,
    reviewsCount: 312,
    stock: 19,
    variants: ['Ukuran 40', 'Ukuran 41', 'Ukuran 42', 'Ukuran 43', 'Ukuran 44'],
    description: 'Sepatu lari ultra ringan dengan teknologi sol bantalan udara AirBurst, breathable mesh upper anti gerah, aksen neon sporty yang memukau dan grip sol anti slip untuk segala medan.',
    featured: true
  },
  {
    id: 'prod-004',
    name: 'Stealth Urban Commuter Leather Backpack',
    brand: 'Stealth Urban',
    category: 'Aksesoris & Tas',
    price: 580000,
    originalPrice: 780000,
    badge: 'Best Choice',
    image: 'images/backpack.jpg',
    rating: 4.9,
    reviewsCount: 142,
    stock: 12,
    variants: ['Obsidian Black', 'Slate Grey'],
    description: 'Tas ransel tahan air material premium vegan leather & oxford waterproof. Kompartemen laptop 15.6 inch berbusa empuk, port USB charging terintegrasi, dan strap ergonomis anti pegal.',
    featured: false
  },
  {
    id: 'prod-005',
    name: 'Aura Smart Heat Coffee Tumbler 500ml',
    brand: 'Aura Living',
    category: 'Lifestyle & Rumah',
    price: 385000,
    originalPrice: 499000,
    badge: 'Inovasi Baru',
    image: 'images/smartmug.jpg',
    rating: 4.7,
    reviewsCount: 96,
    stock: 22,
    variants: [],
    description: 'Botol tumbler pintar dengan display temperatur LED layar sentuh real-time, insulasi vacuum ganda menjaga minuman panas/dingin hingga 24 jam, bahan food grade SUS 316 anti karat.',
    featured: false
  },
  {
    id: 'prod-006',
    name: 'MechCraft 75% Wireless Mechanical Keyboard',
    brand: 'MechCraft',
    category: 'Gadget & Elektronik',
    price: 1150000,
    originalPrice: 1550000,
    badge: 'Hot Item',
    image: 'images/keyboard.jpg',
    rating: 5.0,
    reviewsCount: 178,
    stock: 7,
    variants: ['Yellow Switch (Linear)', 'Brown Switch (Tactile)', 'Blue Switch (Clicky)'],
    description: 'Keyboard mekanikal 75% compact, tri-mode connection (Bluetooth 5.0, 2.4Ghz dongle, Type-C wired), hot-swappable PCB 5-pin, RGB per-key backlighting, PBT double-shot keycaps.',
    featured: true
  },
  {
    id: 'prod-007',
    name: 'Comandante C40 MK4 Nitro Blade Lab Series Grinder',
    brand: 'Comandante',
    category: 'Manual Grinder',
    price: 4850000,
    originalPrice: 5450000,
    badge: 'NEW PRODUCT',
    image: 'images/banner_coffee.jpg',
    rating: 5.0,
    reviewsCount: 89,
    stock: 6,
    variants: ['Batch 3 Stainless Steel', 'American Cherry Wood', 'Obsidian Black'],
    description: 'Grinder kopi manual kelas dunia buatan Jerman. Menggunakan burr Nitro Blade paten Comandante dari baja martensitik nitrogen tinggi, presisi mikro-klik gilingan konsisten dari Turkish hingga Cold Brew.',
    featured: true
  },
  {
    id: 'prod-008',
    name: 'Gemilai CRM3605 Commercial Espresso Machine 15 Bar',
    brand: 'Gemilai',
    category: 'Mesin Espresso',
    price: 2450000,
    originalPrice: 3200000,
    badge: 'Terlaris',
    image: 'images/smartmug.jpg',
    rating: 4.9,
    reviewsCount: 112,
    stock: 10,
    variants: ['Stainless Silver', 'Matte Black'],
    description: 'Mesin espresso semi-otomatis dengan pompa 15 Bar ULKA Italia, PID temperature control presisi tinggi, dan steam wand stainless steel profesional untuk latte art mikro-foam tebal.',
    featured: true
  },
  {
    id: 'prod-009',
    name: 'Timemore Chestnut C3 Pro Hand Grinder',
    brand: 'Timemore',
    category: 'Manual Grinder',
    price: 845000,
    originalPrice: 1050000,
    badge: 'Best Value',
    image: 'images/backpack.jpg',
    rating: 4.8,
    reviewsCount: 204,
    stock: 18,
    variants: ['Matte Black', 'Titanium Grey'],
    description: 'Penggiling kopi manual dengan mata burr Spike-to-Cut (S2C) 660 baja stainless steel, bodi alumunium unibody bertekstur anti slip, gilingan presisi untuk Pour Over hingga Espresso.',
    featured: false
  },
  {
    id: 'prod-010',
    name: 'Fellow Ode Gen 2 Electric Brew Coffee Grinder',
    brand: 'Fellow',
    category: 'Grinder Listrik',
    price: 6850000,
    originalPrice: 7500000,
    badge: 'Flagship',
    image: 'images/keyboard.jpg',
    rating: 5.0,
    reviewsCount: 76,
    stock: 5,
    variants: ['Matte Black', 'Matte White'],
    description: 'Grinder kopi listrik spesialis dengan burr flat 64mm Gen 2, motor bertenaga auto-stop technology, ionizer anti retensi statis, 31 tingkat kehalusan gilingan super konsisten.',
    featured: true
  },
  {
    id: 'prod-011',
    name: 'Hario V60 Ceramic Pour Over Dripper 02 & Glass Server Set',
    brand: 'Hario',
    category: 'Manual Brew',
    price: 425000,
    originalPrice: 550000,
    badge: 'Pilihan Barista',
    image: 'images/smartmug.jpg',
    rating: 4.9,
    reviewsCount: 310,
    stock: 25,
    variants: ['White Ceramic', 'Matte Black'],
    description: 'Set alat seduh kopi manual dripper keramik Arita asli Jepang dengan server kaca borosilikat tahan panas 600ml. Menghasilkan ekstraksi kopi pour over berkarakter jernih dan aroma maksimal.',
    featured: false
  },
  {
    id: 'prod-012',
    name: 'Otten - Vietnam Drip XL',
    brand: 'Otten Coffee',
    category: 'Manual Brew',
    price: 189000,
    originalPrice: 249000,
    badge: 'Flash Deal',
    image: 'images/vietnam_drip.jpg',
    rating: 4.9,
    reviewsCount: 142,
    stock: 15,
    variants: ['Navy Blue Matte', 'Stainless Chrome'],
    description: 'Vietnam Drip XL original Otten Coffee. Material stainless steel SUS 304 food grade tebal tahan karat, saringan mikro ganda untuk hasil ekstraksi kopi kental, pekat, dan kaya aroma.',
    featured: true
  },
  {
    id: 'prod-013',
    name: 'Hario - Alat Seduh Saringan Kopi V60 Ceramic Cyan',
    brand: 'Hario',
    category: 'Manual Brew',
    price: 159000,
    originalPrice: 200000,
    badge: 'Official Distributor',
    image: 'images/v60_dripper.jpg',
    rating: 4.9,
    reviewsCount: 228,
    stock: 12,
    variants: ['Cyan Pastel 02', 'White Ceramic 02'],
    description: 'Dripper keramik V60 cone shape asli Hario Jepang dengan alur spiral presisi. Menghasilkan seduhan pour over dengan ekstraksi optimal dan kejernihan rasa kopi terbaik.',
    featured: true
  },
  {
    id: 'prod-014',
    name: 'Fellow - Rocky Lowball Tumblers (Matte White / Black)',
    brand: 'Fellow',
    category: 'Lifestyle & Rumah',
    price: 395000,
    originalPrice: 495000,
    badge: 'Flash Deal',
    image: 'images/fellow_tumbler.jpg',
    rating: 5.0,
    reviewsCount: 96,
    stock: 9,
    variants: ['Matte White', 'Matte Black'],
    description: 'Tumbler kopi premium Fellow Rocky Lowball dengan lapisan keramik anti bau dan insulasi vacuum ganda. Menjaga minuman panas hingga 12 jam dan dingin hingga 24 jam.',
    featured: true
  },
  {
    id: 'prod-015',
    name: 'Hario V60 Station VSS-1-OV Olive Wood Drip Stand',
    brand: 'Hario',
    category: 'Manual Brew',
    price: 1850000,
    originalPrice: 2310000,
    badge: 'Official Distributor',
    image: 'images/v60_wood_station.jpg',
    rating: 5.0,
    reviewsCount: 54,
    stock: 4,
    variants: ['Olive Wood Natural'],
    description: 'Drip stand kopi manual seduh Hario mewah dari kayu pohon zaitun (olive wood) alami berpadu dengan aksen kuningan. Stand pour over barista kelas dunia dengan sentuhan artisan elegan.',
    featured: true
  },
  {
    id: 'prod-016',
    name: 'Bali Curtina Natural Kismis Filter',
    brand: 'Sanubari Roastery',
    category: 'Biji Kopi Specialty',
    price: 59000,
    originalPrice: 79000,
    badge: 'Specialty Beans',
    image: 'images/bali_curtina_coffee.jpg',
    rating: 5.0,
    reviewsCount: 318,
    stock: 25,
    variants: ['100 g', '200 g', '500 g', '1 kg'],
    description: 'Biji kopi single origin Bali Curtina dengan proses Natural Kismis (raisin anaerobic). Profile seduh filter V60 dengan notes kismis manis, kranberi, blackcurrant, dan gula kelapa.',
    featured: true
  }
];

const DEFAULT_VOUCHERS = [
  { code: 'DISKON10', type: 'percentage', value: 10, minPurchase: 200000, label: 'Diskon 10% (Min. Belanja 200rb)' },
  { code: 'HEMAT50RB', type: 'fixed', value: 50000, minPurchase: 500000, label: 'Potongan Rp 50.000 (Min. 500rb)' },
  { code: 'GRATISONGKIR', type: 'shipping', value: 20000, minPurchase: 150000, label: 'Gratis Ongkir s/d 20rb' }
];

const DEFAULT_SETTINGS = {
  storeName: 'Alat Kopi Malang',
  storeTagline: 'Toko Alat Kopi Terlengkap & Terpercaya di Malang',
  whatsappNumber: '6282132095241', // Format internasional tanpa simbol +
  storeAddress: 'Jl. Soekarno Hatta No. 45, Lowokwaru, Kota Malang, Jawa Timur',
  defaultShippingCost: 15000,
  tokopediaUrl: 'https://www.tokopedia.com',
  shopeeUrl: 'https://shopee.co.id',
  tiktokUrl: 'https://www.tiktok.com',
  socialSectionTitle: 'Dapatkan Update Seputar Alat Kopi',
  paymentCategoryHeading: 'QRIS & TRANSFER BANK',
  paymentDeadlineSubtitle: 'Selesaikan pembayaran dalam waktu 24 jam setelah pesanan dibuat.',
  bankAccounts: [
    { bank: 'BCA', number: '8720192831', name: 'ALAT KOPI MALANG' },
    { bank: 'Mandiri', number: '1370019283746', name: 'ALAT KOPI MALANG' },
    { bank: 'BRI', number: '034101002345501', name: 'ALAT KOPI MALANG' }
  ]
};

/**
 * REELS & VIDEO REVIEWS DATA (Website Uploaded Video Carousel)
 * Video diupload langsung di website (format MP4 / WebM), bukan link eksternal TikTok / Instagram.
 * 
 * Pengelolaan & Upload Video:
 * - Admin dapat mengupload video baru melalui Panel Penjual (admin -> Tab 'Kelola Video Reels')
 * - Video yang diupload disimpan langsung di website dan otomatis muncul di carousel beranda.
 */
const DEFAULT_REELS = [
  {
    id: 'reel-001',
    title: 'Kalo Mesin Espresso Diperkecil, Maka Jadi Segini..',
    caption: 'Kalau mesin espresso bisa diperkecil, maka akan jadi sekecil ini! Tetap bisa seduh crema mantap.',
    thumbnail: 'images/reel_1.jpg',
    videoUrl: 'images/home-hero-video.mp4',
    views: '2,5rb',
    productIds: ['prod-008', 'prod-012']
  },
  {
    id: 'reel-002',
    title: 'Sekarang jadi ngerti alasan kenapa orang yang kesurupan selalu minta kopi',
    caption: 'Sekarang mulai paham alasan kenapa yang kesurupan selalu minta seduhan manual brew aromatik...',
    thumbnail: 'images/reel_2.jpg',
    videoUrl: 'images/home-hero-video.mp4',
    views: '1,5rb',
    productIds: ['prod-007', 'prod-013']
  },
  {
    id: 'reel-003',
    title: 'Review tombol yang ada di mesin kopi Kees Van Der!',
    caption: 'Review tombol-tombol yg ada di mesinnya orang have. Kees Van Der Speedster build quality monster!',
    thumbnail: 'images/reel_3.jpg',
    videoUrl: 'images/home-hero-video.mp4',
    views: '1,1rb',
    productIds: ['prod-008']
  },
  {
    id: 'reel-004',
    title: 'Campur 2 Single Origin Sendiri Buat Espresso, Rasanya Aneh Nggak?',
    caption: 'Campur 2 Single Origin Buat Espresso, Rasanya Enak Nggak? Eksperimen blend beans fruity + nutty.',
    thumbnail: 'images/reel_4.jpg',
    videoUrl: 'images/home-hero-video.mp4',
    views: '3,8rb',
    productIds: ['prod-010', 'prod-013']
  },
  {
    id: 'reel-005',
    title: 'Home Espresso Naik Level Kalo Pakai Mesin Ini',
    caption: 'Home espresso naik level pakai ini. Mesin Fellow Espresso Series & Rocky Lowball tumbler siap pakai.',
    thumbnail: 'images/reel_5.jpg',
    videoUrl: 'images/home-hero-video.mp4',
    views: '2,4rb',
    productIds: ['prod-014', 'prod-011']
  },
  {
    id: 'reel-006',
    title: 'Robusta Buat Espresso Cobain yang Ini, crema tebal!',
    caption: 'Kalau lo suka espresso bold & crema tebal, wajib banget cobain seduhan V60 atau espresso manual ini!',
    thumbnail: 'images/reel_6.jpg',
    videoUrl: 'images/home-hero-video.mp4',
    views: '4,2rb',
    productIds: ['prod-015', 'prod-012']
  }
];

/**
 * DEFAULT STORE BRANDS
 * Kumpulan Brand Resmi Alat Kopi Malang
 */
const DEFAULT_BRANDS = [
  {
    name: 'Alat Kopi Malang',
    monogram: 'AKM',
    logo: 'images/logo.png',
    origin: 'Kota Malang, Indonesia',
    flag: '🇮🇩',
    category: 'Official Store Brand',
    description: 'Koleksi resmi Alat Kopi Malang yang dikurasi khusus dengan standar presisi barista dan garansi toko resmi.',
    color: '#4f46e5',
    bg: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(99, 102, 241, 0.25))',
    featured: true
  },
  {
    name: 'Hario',
    monogram: 'HARIO',
    origin: 'Tokyo, Jepang',
    flag: '🇯🇵',
    category: 'Manual Brew',
    description: 'Pelopor V60 keramik Arita, server kaca borosilikat tahan panas, dan aksesoris manual brew terfavorit barista dunia.',
    color: '#0284c7',
    bg: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15), rgba(56, 189, 248, 0.25))',
    featured: true
  },
  {
    name: 'Comandante',
    monogram: 'C40',
    origin: 'Munich, Jerman',
    flag: '🇩🇪',
    category: 'Manual Grinder',
    description: 'Standar emas grinder kopi manual buatan Jerman dengan mata burr Nitro Blade paten untuk konsistensi mikro-partikel maksimal.',
    color: '#b45309',
    bg: 'linear-gradient(135deg, rgba(180, 83, 9, 0.15), rgba(245, 158, 11, 0.25))',
    featured: true
  },
  {
    name: 'Fellow',
    monogram: 'FELLOW',
    origin: 'San Francisco, USA',
    flag: '🇺🇸',
    category: 'Grinder Listrik & Tumbler',
    description: 'Perlengkapan kopi modern berestetika minimalis, flat burr grinder elektrik Ode Gen 2, dan tumbler keramik insulasi.',
    color: '#334155',
    bg: 'linear-gradient(135deg, rgba(51, 65, 85, 0.15), rgba(100, 116, 139, 0.25))',
    featured: true
  },
  {
    name: 'Timemore',
    monogram: 'TIME',
    origin: 'Precision Gear',
    flag: '⚙️',
    category: 'Manual Grinder',
    description: 'Hand grinder berdesain compact dengan mata burr Spike-to-Cut (S2C) 660 baja presisi tinggi dan bodi aluminium textured.',
    color: '#be123c',
    bg: 'linear-gradient(135deg, rgba(190, 18, 60, 0.15), rgba(244, 63, 94, 0.25))',
    featured: true
  },
  {
    name: 'Gemilai',
    monogram: 'GEMILAI',
    origin: 'Espresso Tech',
    flag: '☕',
    category: 'Mesin Espresso',
    description: 'Mesin espresso semi-komersial bertenaga pompa 15 Bar ULKA Italia, PID controller presisi, dan steam wand susu profesional.',
    color: '#047857',
    bg: 'linear-gradient(135deg, rgba(4, 120, 87, 0.15), rgba(16, 185, 129, 0.25))',
    featured: true
  },
  {
    name: 'Otten Coffee',
    monogram: 'OTTEN',
    origin: 'Indonesia',
    flag: '🇮🇩',
    category: 'Manual Brew',
    description: 'Roastery dan penyedia peralatan seduh kopi terkemuka di Indonesia, menghadirkan Vietnam Drip stainless tebal SUS 304.',
    color: '#c2410c',
    bg: 'linear-gradient(135deg, rgba(194, 65, 12, 0.15), rgba(249, 115, 22, 0.25))',
    featured: true
  },
  {
    name: 'Aura Living',
    monogram: 'AURA',
    origin: 'Smart Barista Gear',
    flag: '✨',
    category: 'Lifestyle & Tumbler',
    description: 'Botol tumbler pintar dengan display temperatur LED sentuh real-time dan insulasi vacuum SUS 316 untuk pecinta kopi on-the-go.',
    color: '#7c3aed',
    bg: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(168, 85, 247, 0.25))',
    featured: true
  },
  {
    name: 'StudioSound',
    monogram: 'SOUND',
    origin: 'Acoustic Lab',
    flag: '🎧',
    category: 'Gadget & Audio',
    description: 'Headphone nirkabel Hi-Res ANC untuk menciptakan suasana fokus dan relaks saat ritual menyeduh kopi di rumah.',
    color: '#0f766e',
    bg: 'linear-gradient(135deg, rgba(15, 118, 110, 0.15), rgba(20, 184, 166, 0.25))',
    featured: false
  },
  {
    name: 'HyperStride',
    monogram: 'STRIDE',
    origin: 'Sport & Footwear',
    flag: '👟',
    category: 'Fashion & Sepatu',
    description: 'Sneakers kasual berbobot ultra-ringan dengan bantalan sol udara untuk mobilitas aktif dan gaya barista modern.',
    color: '#ea580c',
    bg: 'linear-gradient(135deg, rgba(234, 88, 12, 0.15), rgba(251, 146, 60, 0.25))',
    featured: false
  },
  {
    name: 'Stealth Urban',
    monogram: 'STEALTH',
    origin: 'Urban Commuter',
    flag: '🎒',
    category: 'Aksesoris & Tas',
    description: 'Tas ransel tahan air material vegan leather elegan dengan slot busa aman untuk laptop dan gear seduh portabel.',
    color: '#475569',
    bg: 'linear-gradient(135deg, rgba(71, 85, 105, 0.15), rgba(148, 163, 184, 0.25))',
    featured: false
  },
  {
    name: 'MechCraft',
    monogram: 'MECH',
    origin: 'Desk Gear Studio',
    flag: '⌨️',
    category: 'Gadget & Workspace',
    description: 'Keyboard mekanikal nirkabel 75% hot-swappable dengan tactile feedback empuk untuk melengkapi setup meja kerja sambil ngopi.',
    color: '#d97706',
    bg: 'linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(245, 158, 11, 0.25))',
    featured: false
  }
];

// ============================================================================
// DEFAULT ARTICLES & COFFEE EXPERIENCE SPACES (Eksplorasi Ruang & Jurnal Kopi)
// ============================================================================
const DEFAULT_ARTICLES = [
  {
    id: 'art-005',
    slug: 'resep-seduh-by-sanubari-roastery',
    category: 'RESEP & BREWING GUIDE',
    badgeInfo: 'Signature Recipe',
    badgeIcon: 'coffee',
    title: 'Resep Seduh By Sanubari Roastery',
    tagline: 'Panduan racikan seduh manual V60 specialty dengan rasio emas 1:15 untuk ekstraksi sweetness maksimal dan keasaman buah yang jernih',
    excerpt: 'Resep kalibrasi seduh manual V60 resmi dari Sanubari Roastery: rasio emas 1:15, teknik 3 pourings, dan rahasia ekstraksi sweetness maksimal.',
    actionText: 'Lihat Resep Seduh',
    image: 'images/article_resep_seduh.jpg',
    readTime: '4 Menit Baca',
    date: '27 Oktober 2026',
    author: 'Head Roaster Sanubari',
    authorRole: 'Certified Brewer & Specialty Roaster',
    location: 'Sanubari Roastery & Slow Bar, Malang',
    address: 'Gedung Sanubari Lt. 1, Jl. Sanubari No. 12, Klojen, Kota Malang',
    hours: '09.00 - 23.00 WIB (Buka Setiap Hari)',
    facilities: ['Panduan Rasio Emas 1:15', 'Teknik 3-Pouring Method', 'Kalibrasi Suhu 92°C & TDS Air', 'Tabel Grind Size Medium-Fine', 'Rekomendasi Biji Kopi Specialty'],
    highlights: [
      { icon: 'scale', title: 'Dosis & Rasio Emas', desc: '15 gram kopi gilingan medium-fine dengan 225 ml air bersuhu 92°C.' },
      { icon: 'clock', title: 'Waktu Seduh Presisi', desc: 'Total waktu ekstraksi berkisar 2 menit 15 detik hingga 2 menit 30 detik.' },
      { icon: 'droplet', title: 'Teknik 3 Tahap Pouring', desc: 'Blooming 45 detik, pour kedua body, dan pour ketiga penyeimbang sweetness.' },
      { icon: 'sparkles', title: 'Karakter Rasa Optimal', desc: 'Menghadirkan keasaman buah jernih (clean acidity) dan manis gula tebu tahan lama.' }
    ],
    content: `
      <p class="article-lead">Setiap batch biji kopi yang disangrai di <strong>Sanubari Roastery</strong> membawa potensi cita rasa unik hasil dedikasi para petani lokal. Agar karakter floral yang lembut, keasaman buah tropis yang segar, serta manis alami (natural sweetness) dapat terekstraksi optimal di cangkir Anda, tim barista dan roaster kami merumuskan <strong>Resep Seduh Signature V60</strong> yang konsisten dan mudah dipraktikkan di rumah maupun di kedai.</p>

      <h3>Parameter Dasar Seduhan (The Golden Ratio)</h3>
      <p>Kunci dari secangkir manual filter yang bersih dan berlapis (complex & clean cup) adalah konsistensi variabel seduh. Berikut adalah parameter kalibrasi yang kami gunakan setiap hari di bar Sanubari Roastery:</p>

      <div class="brewing-params-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:14px; margin: 20px 0;">
        <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:12px; padding:14px; text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Dosis Biji Kopi</div>
          <div style="font-size:1.35rem; font-weight:800; color:var(--text-primary); margin-top:4px;">15 Gram</div>
          <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">Medium-Fine Grind</div>
        </div>
        <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:12px; padding:14px; text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Volume Air (Yield)</div>
          <div style="font-size:1.35rem; font-weight:800; color:var(--text-primary); margin-top:4px;">225 ml</div>
          <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">Rasio 1 : 15</div>
        </div>
        <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:12px; padding:14px; text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Temperatur Air</div>
          <div style="font-size:1.35rem; font-weight:800; color:var(--text-primary); margin-top:4px;">92°C</div>
          <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">TDS Air 100 - 130 ppm</div>
        </div>
        <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:12px; padding:14px; text-align:center;">
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Total Brew Time</div>
          <div style="font-size:1.35rem; font-weight:800; color:var(--text-primary); margin-top:4px;">02:15 - 02:30</div>
          <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">Menit : Detik</div>
        </div>
      </div>

      <h3>Langkah Demi Langkah: Teknik 3-Pour Method</h3>
      <p>Metode seduh ini membagi penuangan air menjadi tiga fase terukur untuk mengekstraksi aroma secara bertahap dan menonjolkan body yang lembut:</p>

      <ol style="margin-left: 20px; line-height: 1.8; color: var(--text-secondary);">
        <li style="margin-bottom: 12px;">
          <strong style="color:var(--text-primary);">Tahap 1 — Blooming (00:00 - 00:45 | 45 ml air):</strong><br>
          Basahi seluruh bubuk kopi secara merata dengan gerakan melingkar lambat dari tengah ke luar. Beri waktu 45 detik agar gas karbon dioksida (degassing) terlepas sempurna. Blooming yang baik ditandai dengan kubah kopi yang mengembang indah.
        </li>
        <li style="margin-bottom: 12px;">
          <strong style="color:var(--text-primary);">Tahap 2 — Ekstraksi Inti / Body (00:45 - 01:20 | Tuang hingga 140 ml):</strong><br>
          Tuang air secara konstan dengan laju aliran sedang (sekitar 4–5 ml/detik) membentuk spiral lembut. Tahap ini mengekstrak senyawa asam manis dan komponen rasa aromatik utama dari biji kopi.
        </li>
        <li style="margin-bottom: 12px;">
          <strong style="color:var(--text-primary);">Tahap 3 — Sweetness Balancing (01:20 - 01:50 | Tuang hingga 225 ml):</strong><br>
          Lanjutkan penuangan terakhir hingga timbangan digital menunjukkan angka 225 ml. Lakukan satu kali putaran lembut (<em>gentle swirl</em>) pada dripper untuk meratakan dasar bubuk kopi (<em>flat coffee bed</em>).
        </li>
        <li style="margin-bottom: 12px;">
          <strong style="color:var(--text-primary);">Drawdown & Penyajian (01:50 - 02:25):</strong><br>
          Biarkan air menetes seluruhnya ke dalam server kaca. Goyangkan server perlahan untuk mencampur seluruh lapisan ekstraksi sebelum dituangkan ke cangkir seduh hangat.
        </li>
      </ol>

      <blockquote class="article-quote">
        "Kunci keajaiban seduhan manual ada pada temperatur air dan laju tuangan. Jangan biarkan air mengenai dinding kertas filter secara langsung agar aliran air tidak bypass tanpa mengekstraksi bubuk kopi."
      </blockquote>

      <h3>Tips Kalibrasi Rasa (Troubleshooting)</h3>
      <ul style="margin-left: 20px; line-height: 1.8; color: var(--text-secondary);">
        <li><strong>Rasa terlalu asam atau encer (Under-extracted)?</strong> Giling kopi sedikit lebih halus (<em>finer</em>) atau naikkan suhu air menjadi 93°C–94°C untuk memperpanjang kontak ekstraksi.</li>
        <li><strong>Rasa pahit, sepat atau kering di lidah (Over-extracted)?</strong> Buat gilingan sedikit lebih kasar (<em>coarser</em>) atau gunakan rasio lebih longgar (1:16) dengan suhu air 90°C.</li>
        <li><strong>Kualitas Air Seduh:</strong> Gunakan air mineral dengan TDS antara 100–130 ppm untuk mengeluarkan spektrum rasa fruity dan floral yang optimal.</li>
      </ul>

      <h3>Rekomendasi Biji Kopi Sanubari Roastery</h3>
      <p>Resep ini sangat cocok diterapkan pada varian single origin andalan kami, seperti <em>Arabika Kawi Natural Anaerobic</em> dengan notes strawberry & brown sugar, serta <em>Ijen Full Washed</em> dengan notes jeruk nipis segar, melati, dan black tea.</p>
    `,
    whatsappText: 'Halo Tim Sanubari Roastery & Alat Kopi Malang, saya ingin berkonsultasi mengenai Resep Seduh Signature dan beans yang direkomendasikan.',
    relatedProducts: ['prod-007', 'prod-013', 'prod-015']
  },
  {
    id: 'art-001',
    slug: 'slow-bar-manual-brew-experience',
    category: 'SLOW BAR & TASTING',
    badgeInfo: '09.00 - 23.00 WIB',
    badgeIcon: 'clock',
    title: 'Slow Bar & Manual Brew Experience',
    tagline: 'Kalibrasi seduhan manual filter V60, Aeropress, dan Kalita Wave langsung di hadapan barista profesional',
    excerpt: 'Cicipi kalibrasi seduhan manual filter V60, Aeropress, dan Kalita Wave langsung di hadapan barista profesional kami.',
    actionText: 'Kunjungi Slow Bar',
    image: 'images/article_slowbar.jpg',
    readTime: '4 Menit Baca',
    date: '27 Oktober 2026',
    author: 'Head Barista AKM',
    authorRole: 'SCA Certified Barista & Brewing Specialist',
    location: 'Slow Bar Lt. 1, Malang',
    address: 'Gedung Sanubari Lt. 1, Jl. Sanubari No. 12, Klojen, Kota Malang',
    hours: '09.00 - 23.00 WIB (Buka Setiap Hari)',
    facilities: ['Wi-Fi High Speed 100 Mbps', 'Stopkontak Tiap Meja', 'Area AC & Non-Smoking', 'Parkir Mobil & Motor Luas', 'Musholla & Toilet Bersih'],
    highlights: [
      { icon: 'filter', title: 'Manual Brew Lengkap', desc: 'V60, Aeropress, Kalita Wave, Origami, hingga Syphon.' },
      { icon: 'rotate-cw', title: 'Nitro Blade Grinder', desc: 'Comandante C40 MK4 & Timemore S2C burr presisi.' },
      { icon: 'coffee', title: 'Single Origin Terkurasi', desc: 'Beans arabika lereng Kawi, Ijen, hingga Ethiopia.' },
      { icon: 'users', title: 'Dialog Kalibrasi Barista', desc: 'Bebas diskusi rasio seduh, grind size, dan water profile.' }
    ],
    content: `
      <p class="article-lead">Pengalaman Slow Bar di <strong>Alat Kopi Malang</strong> dirancang khusus bagi para penikmat kopi yang menghargai setiap tetes proses seduhan presisi. Di sini, Anda bukan sekadar memesan secangkir kopi biasa, melainkan diajak berdialog secara langsung mengenai origin biji kopi, rasio seduh ideal, suhu air, hingga ukuran gilingan partikel mikro.</p>

      <h3>Eksplorasi Alat Seduh Manual Terlengkap</h3>
      <p>Kami menyediakan jajaran dripper specialty ternama dunia mulai dari <em>Hario V60 Ceramic 02</em>, <em>Kalita Wave Tsubame Stainless</em>, <em>Origami Dripper</em> dari Jepang, hingga <em>Aeropress Clear</em>. Seluruh proses penggilingan didukung oleh hand grinder legendaris <strong>Comandante C40 MK4 Nitro Blade</strong> dan <strong>Timemore Chestnut S2C</strong> untuk memastikan ekstraksi yang optimal, manis seimbang (sweetness), dan bebas dari rasa pahit (bitterness) berlebih.</p>

      <blockquote class="article-quote">
        "Menyeduh manual filter bukan sekadar menuang air panas ke bubuk kopi. Ini adalah seni mengontrol variabel aliran air, turbulensi, dan termodinamika agar karakter unik buah, bunga, dan cokelat dari biji kopi dapat bersinar seutuhnya."
      </blockquote>

      <h3>Sesi Kalibrasi Personal Bersama Barista</h3>
      <p>Pengunjung dipersilakan memilih single origin favorit mereka—mulai dari proses Natural Anaerobic Gunung Ijen, Full Washed Lereng Kawi, hingga beans impor Ethiopia Yirgacheffe. Anda dapat mengamati kurva aliran air secara langsung menggunakan teko leher angsa (gooseneck kettle) bertemperatur presisi 92°C serta timbangan digital bertoleransi 0.1 gram.</p>

      <h3>Suasana Hangat & Interaktif</h3>
      <p>Terletak di lantai 1 Gedung Sanubari Malang, Slow Bar kami didesain dengan konsep open-counter bermaterial kayu jati hangat dan pencahayaan temaram yang menenangkan. Sangat cocok untuk sesi santai sambil membaca buku, kerja remote, maupun berdiskusi seputar teknik brewing kopi.</p>
    `,
    whatsappText: 'Halo Alat Kopi Malang, saya ingin reservasi / bertanya mengenai sesi Slow Bar & Manual Brew Experience di Gedung Sanubari.',
    relatedProducts: ['prod-007', 'prod-013', 'prod-015']
  },
  {
    id: 'art-002',
    slug: 'equipment-commercial-espresso-showroom',
    category: 'ALAT KOPI MALANG',
    badgeInfo: 'Ruko Tlogomas Square',
    badgeIcon: 'map-pin',
    title: 'Equipment & Commercial Espresso Showroom',
    tagline: 'Pusat uji coba langsung mesin espresso komersial, grinder flat burr, dan konsultasi setup coffee shop',
    excerpt: 'Kolaborasi dengan Alat Kopi Malang: coba langsung mesin espresso komersial, grinder, dan setup coffee shop impian.',
    actionText: 'Eksplorasi Showroom',
    image: 'images/article_showroom.jpg',
    readTime: '5 Menit Baca',
    date: '25 Oktober 2026',
    author: 'Technical Gear Specialist',
    authorRole: 'Coffee Equipment Engineer & Consultant',
    location: 'Ruko Tlogomas Square Kav.34, Kec. Lowokwaru Kota Malang',
    address: 'Ruko Tlogomas Square Kav.34, Kec. Lowokwaru Kota Malang',
    hours: 'Setiap Hari 09.00 AM - 22.00 PM WIB',
    facilities: ['Area Uji Mesin Espresso Aktif', 'Water Treatment Demo System', 'Ruang Konsultasi Bisnis Kedai', 'Layanan Kalibrasi Grinder', 'Suku Cadang Resmi Ready Stock'],
    highlights: [
      { icon: 'coffee', title: 'Hands-on Experience', desc: 'Tarik shot espresso dan coba steaming susu langsung.' },
      { icon: 'shield-check', title: 'Garansi Resmi Distributor', desc: 'Layanan purna jual, teknisi standby, dan spare parts.' },
      { icon: 'zap', title: 'PID & Dual Boiler Tech', desc: 'Eksplorasi kestabilan suhu dan tekanan pompa ULKA 15 Bar.' },
      { icon: 'briefcase', title: 'Konsultasi Kedai Gratis', desc: 'Hitung RAB alat kopi, kelistrikan bar, dan water filter.' }
    ],
    content: `
      <p class="article-lead">Bagi pemilik kedai kopi, roastery, maupun home barista yang ingin berinvestasi pada mesin espresso komersial berkualitas, <strong>Showroom Alat Kopi Malang</strong> di Ruko Tlogomas Square Kav.34, Kec. Lowokwaru Kota Malang menyediakan fasilitas <em>Hands-on Experience</em> sebelum Anda mengambil keputusan pembelian.</p>

      <h3>Uji Coba Mesin & Grinder Langsung di Tempat</h3>
      <p>Uji performa jajaran mesin espresso komersial <strong>Gemilai CRM Series</strong> berpompa 15 Bar ULKA Italia, sistem PID controller ganda presisi suhu, boiler berbahan stainless steel tebal, serta grinder elektrik flat burr 64mm. Anda dipersilakan melakukan steaming susu microfoam bertekstur sutra (silky latte art foam) dan menarik double shot espresso secara real-time.</p>

      <blockquote class="article-quote">
        "Membeli mesin espresso adalah komitmen jangka panjang. Di showroom kami, Anda bisa menyentuh, mendengar suara pompa, menguji konsistensi temperatur, dan merasakan workflow sebelum berinvestasi."
      </blockquote>

      <h3>Konsultasi Teknis & Tata Letak Barista Gratis</h3>
      <p>Tim teknisi berpengalaman kami siap mendampingi Anda merancang sistem filtrasi air yang tepat (water filtration & softening TDS), estimasi kebutuhan daya listrik yang stabil, serta workflow bar yang ergonomis dan efisien untuk memangkas waktu pelayanan pesanan (order fulfillment speed) saat jam sibuk kedai kopi.</p>

      <h3>Ketersediaan Suku Cadang & Garansi Resmi</h3>
      <p>Setiap unit mesin komersial yang Anda beli melalui Alat Kopi Malang dilengkapi garansi servis resmi hingga 1 tahun, ketersediaan suku cadang asli (gasket, shower screen, solenoid valve, heating element), serta pelatihan dasar perawatan rutin untuk staf barista Anda.</p>
    `,
    whatsappText: 'Halo Alat Kopi Malang, saya ingin konsultasi pembelian mesin espresso komersial / kunjungan ke Showroom Sanubari.',
    relatedProducts: ['prod-008', 'prod-010', 'prod-014']
  },
  {
    id: 'art-003',
    slug: 'laboratorium-roastery-kurva-digital',
    category: 'ROASTING ROOM',
    badgeInfo: 'Live Roasting',
    badgeIcon: 'flame',
    title: 'Laboratorium Roastery & Kurva Digital',
    tagline: 'Sangrai presisi biji kopi specialty lereng Kawi & Ijen dengan pemantauan software digital profiling real-time',
    excerpt: 'Pusat sangrai presisi biji kopi lereng Gunung Kawi dengan mesin sangrai berteknologi kurva digital real-time.',
    actionText: 'Tentang Roastery',
    image: 'images/article_roastery.jpg',
    readTime: '6 Menit Baca',
    date: '22 Oktober 2026',
    author: 'Master Roaster AKM',
    authorRole: 'Certified Roaster & Green Bean Buyer',
    location: 'Roasting Room Sanubari, Malang',
    address: 'Gedung Sanubari Wing Barat, Jl. Sanubari No. 12, Kota Malang',
    hours: '08.00 - 17.00 WIB (Senin - Jumat)',
    facilities: ['Mesin Drum Roaster Komersial', 'Dual Thermocouple Data Logger', 'Color Track Agtron Meter', 'Silo Penyimpanan Biji Hijau Ber-AC', 'Area Packing Kedap Nitrogen'],
    highlights: [
      { icon: 'flame', title: 'Roast Profiling Digital', desc: 'Pemantauan kurva RoR, BT, dan ET real-time via software.' },
      { icon: 'award', title: 'Traceability Petani Lokal', desc: 'Kemitraan langsung lereng Gunung Kawi, Arjuna, dan Ijen.' },
      { icon: 'sparkles', title: 'Sortasi Zero-Defect', desc: 'Meja sortasi optik dan manual untuk biji kopi specialty.' },
      { icon: 'package', title: 'Custom Roast Wholesale', desc: 'Penyedia biji kopi house blend untuk puluhan kafe mitra.' }
    ],
    content: `
      <p class="article-lead">Roasting adalah simfoni antara sains termodinamika dan intuisi sensorik. Di <strong>Laboratorium Roastery Alat Kopi Malang</strong>, setiap batch green beans disangrai menggunakan mesin drum roaster dengan thermocouple sensor ganda yang tersambung langsung ke software digital profiling real-time.</p>

      <h3>Traceability & Petani Kopi Jawa Timur</h3>
      <p>Kami bermitra erat dengan kelompok tani lokal di lereng Gunung Kawi, lereng Gunung Arjuna, dan dataran tinggi Ijen. Melalui prinsip <em>direct trade</em> dan kurasi sortasi ketat (Zero Defect target), kami memastikan kualitas biji hijau specialty sekaligus memberikan harga beli yang adil bagi kesejahteraan petani mitra kami.</p>

      <blockquote class="article-quote">
        "Dengan memetakan Rate of Rise (RoR) dan fase Maillard secara digital, kami dapat mereplikasi profil sangrai yang konsisten dari batch ke batch, menghadirkan aroma buah yang jernih dan manis karamel yang tebal."
      </blockquote>

      <h3>Saksikan Live Roasting & Custom Profiles</h3>
      <p>Nikmati semerbak aroma <em>first crack</em> yang memikat setiap hari kerja. Pelanggan kedai kopi bisnis dapat memesan profil sangrai custom—mulai dari <strong>Light Roast</strong> untuk manual filter bernuansa fruity floral hingga <strong>Medium-Dark Roast</strong> untuk racikan house blend espresso bercita rasa bold, dark chocolate, dan gula kelapa.</p>

      <h3>Penyimpanan Berstandar Khusus</h3>
      <p>Seluruh biji hijau (green beans) disimpan dalam ruang berpengatur kelembapan (humidity-controlled storage) bersuhu 20–22°C menggunakan kantong plastik hermetis GrainPro untuk menjaga kesegaran kadar air (moisture content 11–12%) sebelum masuk ke drum sangrai.</p>
    `,
    whatsappText: 'Halo Tim Roastery Alat Kopi Malang, saya tertarik memesan biji kopi sangrai custom / wholesale untuk kedai kopi saya.',
    relatedProducts: ['prod-007', 'prod-012', 'prod-013']
  },
  {
    id: 'art-004',
    slug: 'sensory-room-weekly-cupping',
    category: 'SENSORY LAB',
    badgeInfo: 'Weekly Cupping',
    badgeIcon: 'sparkles',
    title: 'Sensory Room & Weekly Cupping',
    tagline: 'Ruang kalibrasi rasa standar SCA internasional untuk mengevaluasi notes, acidity, dan body kopi specialty',
    excerpt: 'Ruang kalibrasi rasa standar SCA: sensorik batch baru, cupping notes, dan eksplorasi profil kopi single origin.',
    actionText: 'Jadwal Acara & Cupping',
    image: 'images/article_sensory.jpg',
    readTime: '4 Menit Baca',
    date: '20 Oktober 2026',
    author: 'Q-Grader Certified AKM',
    authorRole: 'Licensed Q-Arabica Grader & Sensory Instructor',
    location: 'Sensory Lab Lt. 2, Malang',
    address: 'Gedung Sanubari Lt. 2, Jl. Sanubari No. 12, Klojen, Kota Malang',
    hours: 'Setiap Sabtu & Minggu (10.00 - 12.00 & 14.00 - 16.00 WIB)',
    facilities: ['Meja Cupping Marmer Standar SCA', 'Sendok Titanium Anti-Oksidasi', 'Air Kalibrasi TDS 130 ppm', 'Roda Rasa SCA (Flavor Wheel)', 'Ruang Steril Bebas Polusi Bau'],
    highlights: [
      { icon: 'award', title: 'Standar SCA Protokol', desc: 'Rasio seduh 8.25g per 150ml air, suhu 93°C, evaluasi 5 tahap.' },
      { icon: 'users', title: 'Terbuka untuk Umum', desc: 'Sesi ramah pemula dan barista yang ingin belajar kalibrasi rasa.' },
      { icon: 'sparkles', title: 'Eksplorasi Flavor Wheel', desc: 'Kenali aroma jasmine, stone fruits, caramel, hingga citrus.' },
      { icon: 'check-circle', title: 'Sertifikat Partisipasi', desc: 'Lembar evaluasi cupping sheet resmi untuk setiap peserta.' }
    ],
    content: `
      <p class="article-lead">Sensory Room adalah ruang khusus yang steril dari gangguan aroma luar dan dirancang mengikuti regulasi ketat <strong>SCA (Specialty Coffee Association)</strong>. Di sinilah kami rutin mengevaluasi cita rasa, aroma kering (fragrance), aroma basah (aroma), keasaman (acidity), rasa manis (sweetness), serta aftertaste setiap batch panen kopi terbaru.</p>

      <h3>Terbuka untuk Umum & Komunitas Penikmat Kopi</h3>
      <p>Sesi <strong>Weekly Cupping</strong> diadakan setiap akhir pekan (Sabtu & Minggu) dan terbuka bagi siapa saja—mulai dari pemula yang baru belajar mengenal notas rasa hingga barista profesional yang ingin mengasah kepekaan indra pengecap dan penciuman.</p>

      <blockquote class="article-quote">
        "Cupping adalah bahasa universal para pelaku industri kopi global. Melalui mangkuk cupping, kita dapat menilai keaslian karakter tanah, ketinggian kebun, dan dedikasi proses pascapanen para petani."
      </blockquote>

      <h3>Standar Uji Rasa Internasional</h3>
      <p>Kami menggunakan sendok cupping berlapis titanium anti-oksidasi, mangkuk keramik putih standar SCA, dan air seduh yang dikalibrasi mineral TDS 120–150 ppm guna menjamin kejernihan spektrum rasa floral, buah-buahan, rempah, dan nuts dalam setiap seruputan.</p>

      <h3>Bagaimana Cara Bergabung?</h3>
      <p>Cukup pilih jadwal sesi di akhir pekan dan lakukan konfirmasi melalui tombol WhatsApp di bawah ini. Kuota peserta dibatasi maksimal 10 orang per sesi untuk memastikan kenyamanan dan fokus belajar sensory yang optimal.</p>
    `,
    whatsappText: 'Halo Tim Sensory Lab Alat Kopi Malang, saya ingin mendaftar sesi Weekly Cupping akhir pekan ini di Gedung Sanubari Lt. 2.',
    relatedProducts: ['prod-013', 'prod-014', 'prod-015']
  }
];

// ============================================================================
// DEFAULT HERO BANNERS, FLASH SALE, STACK SLIDER & ABOUT US DATA
// ============================================================================
const DEFAULT_BANNERS = [
  { id: 'ban-1', image: 'images/banner_coffee.jpg', title: 'Comandante C40 Lab Series', link: 'shop?category=Manual%20Grinder' },
  { id: 'ban-2', image: 'images/banner_gadgets.jpg', title: 'Koleksi Alat Kopi Malang', link: 'shop' },
  { id: 'ban-3', image: 'images/banner_sneakers.jpg', title: 'Promo Alat Kopi Malang', link: 'flashsale' },
  { id: 'ban-4', image: 'images/article_showroom.jpg', title: 'Showroom Alat Kopi Malang', link: 'article?id=art-002' },
  { id: 'ban-5', image: 'images/article_slowbar.jpg', title: 'Training Barista Alat Kopi Malang', link: 'article?id=art-001' },
  { id: 'ban-6', image: 'images/article_roastery.jpg', title: 'Jasa Servis Mesin Kopi Alat Kopi Malang', link: 'article?id=art-003' }
];

const DEFAULT_FLASHSALE = [
  { id: 'prod-012', name: 'Otten - Vietnam Drip XL', category: 'Manual Brew', price: 189000, originalPrice: 249000, image: 'images/vietnam_drip.jpg', stock: 15, distributorBadge: false, hasVariants: true },
  { id: 'prod-013', name: 'Hario - Alat Seduh Saringan Kopi V60 Ceramic Cyan', category: 'Manual Brew', price: 159000, originalPrice: 200000, image: 'images/v60_dripper.jpg', stock: 12, distributorBadge: true, hasVariants: true },
  { id: 'prod-014', name: 'Fellow - Rocky Lowball Tumblers (Matte White / Black)', category: 'Lifestyle & Rumah', price: 395000, originalPrice: 495000, image: 'images/fellow_tumbler.jpg', stock: 9, distributorBadge: false, hasVariants: true },
  { id: 'prod-015', name: 'Hario V60 Station VSS-1-OV Olive Wood', category: 'Manual Brew', price: 1850000, originalPrice: 2310000, image: 'images/v60_wood_station.jpg', stock: 4, distributorBadge: true, hasVariants: false }
];

const DEFAULT_OFFERS = [
  { id: 'offer-1', title: 'Training Barista', city: 'Sertifikasi & Sensory Class', img: 'images/article_slowbar.jpg' },
  { id: 'offer-2', title: 'Jasa Servis', city: 'Maintenance Mesin & Grinder', img: 'images/article_showroom.jpg' },
  { id: 'offer-3', title: 'Titip Jual', city: 'Konsinyasi Alat Kopi Resmi', img: 'images/vietnam_drip.jpg' },
  { id: 'offer-4', title: 'Pengadaan Barang', city: 'Paket Usaha Cafe & B2B Supply', img: 'images/v60_wood_station.jpg' }
];

const DEFAULT_PARTNERS = [
  { id: 'stack-1', title: 'Sanubari Roastery & Slow Bar', city: 'Malang', img: 'images/article_slowbar.jpg' },
  { id: 'stack-2', title: 'Bataputih Coffee Roaster', city: 'Malang', img: 'images/article_roastery.jpg' },
  { id: 'stack-3', title: 'Lafayette Coffee & Eatery', city: 'Malang', img: 'images/article_showroom.jpg' },
  { id: 'stack-4', title: 'Vosco Coffee Heritage', city: 'Malang', img: 'images/article_sensory.jpg' },
  { id: 'stack-5', title: 'Nakoa Coffee & Space', city: 'Malang', img: 'images/v60_wood_station.jpg' },
  { id: 'stack-6', title: 'Dialoogi Space & Coffee', city: 'Malang', img: 'images/fellow_tumbler.jpg' },
  { id: 'stack-7', title: 'Gartenhaus Coffee Sanctuary', city: 'Malang', img: 'images/vietnam_drip.jpg' }
];

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Mesin Espresso', icon: 'coffee' },
  { id: 'cat-2', name: 'Manual Grinder', icon: 'rotate-cw' },
  { id: 'cat-3', name: 'Grinder Listrik', icon: 'zap' },
  { id: 'cat-4', name: 'Manual Brew', icon: 'filter' },
  { id: 'cat-5', name: 'Biji Kopi Specialty', icon: 'flame' },
  { id: 'cat-6', name: 'Gadget & Elektronik', icon: 'smartphone' },
  { id: 'cat-7', name: 'Fashion & Sepatu', icon: 'shirt' },
  { id: 'cat-8', name: 'Aksesoris & Tas', icon: 'briefcase' },
  { id: 'cat-9', name: 'Lifestyle & Rumah', icon: 'sparkles' }
];

const DEFAULT_ABOUT = {
  badge: 'Berdiri Sejak 2017 • Kota Malang, Jawa Timur',
  heroTitle: 'Mengawal Perjalanan Seduhan Kopi Terbaik Sejak Tahun 2017 Hingga Saat Ini',
  heroDesc: 'Berawal dari semangat komunitas seduh rumahan di sudut Kota Malang pada tahun 2017, Alat Kopi Malang (AKM) terus bertumbuh menjadi ekosistem peralatan kopi terlengkap—menghadirkan showroom mesin espresso komersial, pusat servis bersertifikat, akademi barista, hingga kolaborasi roastery & slow bar pertama di Malang Raya.',
  statYear: '2017',
  statExp: '9+ Tahun',
  statCustomers: '15.000+',
  statPartners: '250+',
  storyTitle: 'Dari Ruang Seduh Sederhana Menjadi Rumah Bagi Para Pecinta Kopi',
  storyQuote: 'Belanja alat kopi gak perlu ribet. Sejak 2017, misi kami tetap sama: menghadirkan peralatan kopi presisi yang membuat setiap seduhan di rumah maupun di bar komersial terasa istimewa.',
  timelines: [
    { id: 'tl-1', year: 'Tahun 2017', phase: 'Fondasi & Awal Berdiri', title: 'Kelahiran Alat Kopi Malang & Komunitas Manual Brew', desc: 'Alat Kopi Malang resmi berdiri di Kota Malang sebagai toko spesialis perlengkapan seduh kopi manual (manual brew gear) dan aksesoris barista. Menjadi titik kumpul bagi para home brewer dan mahasiswa untuk berdiskusi rasio seduh V60, French Press, Vietnam Drip, serta kalibrasi hand grinder.', isCurrent: false },
    { id: 'tl-2', year: 'Tahun 2018 – 2019', phase: 'Ekspansi Katalog & Mitra Kedai', title: 'Memasuki Lini Mesin Espresso & Pengadaan Coffee Shop Lokal', desc: 'Merespons pesatnya pertumbuhan kedai kopi di Malang Raya dan Kota Batu, Alat Kopi Malang memperluas katalog produk ke lini mesin espresso semi-komersial, grinder elektrik flat burr, dan perlengkapan bar profesional.', isCurrent: false },
    { id: 'tl-3', year: 'Tahun 2020 – 2021', phase: 'Akselerasi Digital & Workshop Teknis', title: 'Transformasi E-Commerce Nasional & Pembukaan Divisi Servis Mesin', desc: 'Ketika budaya menyeduh kopi di rumah (Home Cafe) meningkat tajam, kami memperkuat jaringan distribusi online ke seluruh Indonesia serta membentuk tim teknisi khusus untuk perawatan, kalibrasi, dan servis mesin kopi komersial.', isCurrent: false },
    { id: 'tl-4', year: 'Tahun 2022 – 2023', phase: 'Showroom Experience Center', title: 'Peresmian Showroom Ruko Tlogomas Square & Lisensi Brand Global', desc: 'Meremikan Showroom fisik di Ruko Tlogomas Square Kav. 34, Lowokwaru, Kota Malang dengan konsep Hands-on Experience untuk menguji langsung mesin espresso dan grinder dari Comandante, Hario, Fellow, Timemore, dan Gemilai.', isCurrent: false },
    { id: 'tl-5', year: 'Tahun 2024 – 2025', phase: 'Ekosistem Layanan 4-in-1', title: 'Peluncuran Barista Academy, Konsinyasi Resmi & Pengadaan B2B', desc: 'Memperkuat posisi sebagai pusat solusi bisnis kopi melalui 4 program unggulan: Training Barista & Sensory Class, Jasa Servis & Overhaul Mesin, Program Titip Jual (Konsinyasi) Alat Kopi, serta Pengadaan Barang B2B.', isCurrent: false },
    { id: 'tl-6', year: 'Tahun 2026 – Saat Ini', phase: 'Era Kolaborasi & Omnichannel Modern', title: 'Kolaborasi Alat Kopi Malang X Sanubari Roastery & Platform Digital Terpadu', desc: 'Saat ini, Alat Kopi Malang menghadirkan kolaborasi strategis bersama Sanubari Roastery—menyatukan Showroom Alat Kopi, Laboratorium Roastery berkurva digital, Slow Bar Manual Brew, dan Sensory Room berstandar SCA.', isCurrent: true }
  ]
};

// ============================================================================
// DEFAULT SOCIAL MEDIA LINKS ("Dapatkan Update Seputar Alat Kopi")
// ============================================================================
const DEFAULT_SOCIALS = [
  { id: 'soc-ig', platform: 'instagram', name: 'Instagram', url: 'https://instagram.com', active: true },
  { id: 'soc-fb', platform: 'facebook', name: 'Facebook', url: 'https://facebook.com', active: true },
  { id: 'soc-yt', platform: 'youtube', name: 'YouTube', url: 'https://youtube.com', active: true },
  { id: 'soc-tt', platform: 'tiktok', name: 'TikTok', url: 'https://tiktok.com', active: true }
];

window.getSocialPlatformMeta = (platform = 'instagram') => {
  const key = (platform || '').toLowerCase();
  const map = {
    instagram: {
      className: 'social-instagram',
      bgStyle: 'background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%); color: #fff;',
      svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`
    },
    facebook: {
      className: 'social-facebook',
      bgStyle: 'background: #1877F2; color: #fff;',
      svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`
    },
    youtube: {
      className: 'social-youtube',
      bgStyle: 'background: #FF0000; color: #fff;',
      svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
    },
    tiktok: {
      className: 'social-tiktok',
      bgStyle: 'background: #000000; color: #fff;',
      svg: `<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.78 1.25-.03 2.4-0.74 2.92-1.84.4-0.79.49-1.7.49-2.58.01-4.91.01-9.82.01-14.73z"/></svg>`
    },
    whatsapp: {
      className: 'social-whatsapp',
      bgStyle: 'background: #25D366; color: #fff;',
      svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`
    },
    twitter: {
      className: 'social-twitter',
      bgStyle: 'background: #0f172a; color: #fff;',
      svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
    },
    telegram: {
      className: 'social-telegram',
      bgStyle: 'background: #0088cc; color: #fff;',
      svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`
    },
    website: {
      className: 'social-website',
      bgStyle: 'background: #4f46e5; color: #fff;',
      svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`
    }
  };
  return map[key] || map.website;
};

// ============================================================================
// DEFAULT PAYMENT METHODS (Metode Pembayaran Website Checkout)
// ============================================================================
const DEFAULT_PAYMENTS = [
  {
    id: 'pay-bca',
    code: 'bca',
    type: 'bank',
    tabLabel: 'Bank BCA',
    title: 'Transfer Bank BCA',
    fullName: 'Bank Central Asia',
    badgeText: 'BCA',
    badgeColor: '#00529c',
    accountNumber: '8720192831',
    accountHolder: 'ALAT KOPI MALANG',
    rightNote: 'Transfer Manual',
    active: true
  },
  {
    id: 'pay-bri',
    code: 'bri',
    type: 'bank',
    tabLabel: 'Bank BRI',
    title: 'Transfer Bank BRI',
    fullName: 'Bank Rakyat Indonesia',
    badgeText: 'BRI',
    badgeColor: '#002855',
    accountNumber: '034101002345501',
    accountHolder: 'ALAT KOPI MALANG',
    rightNote: 'Transfer Manual',
    active: true
  },
  {
    id: 'pay-qris',
    code: 'qris',
    type: 'qris',
    tabLabel: 'QRIS Toko',
    title: 'QRIS Toko',
    fullName: 'QRIS Toko Resmi',
    badgeText: 'QRIS',
    badgeColor: '#4f46e5',
    nmid: 'ID1024334436911',
    accountHolder: 'ALAT KOPI MALANG.',
    qrisImage: 'images/qris-alat-kopi-malang.png',
    infoNotice: 'Barcode QRIS Ditampilkan Setelah Pesanan Dibuat',
    rightNote: 'Semua E-Wallet & m-Banking',
    active: true
  }
];

// ============================================================================
// DEFAULT PICKUP SETTINGS ("Ambil di toko / roastery" pada Halaman Checkout)
// ============================================================================
const DEFAULT_PICKUP = {
  enabled: true,
  isDefaultMethod: true,
  title: 'Ambil di toko / roastery',
  address: 'Jl. Jombang No. 16, Malang 65116',
  mapsLabel: 'Lihat di Google Maps',
  mapsUrl: 'https://maps.google.com/?q=Jl.+Jombang+No.+16,+Malang+65116',
  operationalHours: 'Setiap hari 08:00 – 21:00 WIB',
  fee: 0,
  feeLabel: 'Biaya Pengambilan',
  subformTitle: 'Detail Pengambilan',
  buttonText: 'Buat Pesanan Pickup',
  notesInstruction: 'Tunjukkan bukti pesanan atau nomor order kepada kasir/barista saat mengambil pesanan di toko.'
};

// Keep deep copies of factory defaults for Reset functionality
window.__FACTORY_DEFAULTS__ = {
  products: JSON.parse(JSON.stringify(DEFAULT_PRODUCTS)),
  vouchers: JSON.parse(JSON.stringify(DEFAULT_VOUCHERS)),
  settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
  reels: JSON.parse(JSON.stringify(DEFAULT_REELS)),
  brands: JSON.parse(JSON.stringify(DEFAULT_BRANDS)),
  articles: JSON.parse(JSON.stringify(DEFAULT_ARTICLES)),
  banners: JSON.parse(JSON.stringify(DEFAULT_BANNERS)),
  flashsale: JSON.parse(JSON.stringify(DEFAULT_FLASHSALE)),
  offers: JSON.parse(JSON.stringify(DEFAULT_OFFERS)),
  partners: JSON.parse(JSON.stringify(DEFAULT_PARTNERS)),
  categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
  socials: JSON.parse(JSON.stringify(DEFAULT_SOCIALS)),
  payments: JSON.parse(JSON.stringify(DEFAULT_PAYMENTS)),
  pickup: JSON.parse(JSON.stringify(DEFAULT_PICKUP)),
  about: JSON.parse(JSON.stringify(DEFAULT_ABOUT))
};

// Synchronize in-memory DEFAULT_* arrays with Admin localStorage overrides
(function syncAdminDataOverrides() {
  if (typeof window === 'undefined' || !window.localStorage) return;

  const syncArray = (storageKey, targetArray) => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          targetArray.splice(0, targetArray.length, ...parsed);
        }
      }
    } catch (_) {}
  };

  // If admin has explicitly saved products (or nexus_admin_products_saved is set), use exact saved products list
  if (localStorage.getItem('nexus_admin_products_saved') === 'true') {
    syncArray('nexus_products', DEFAULT_PRODUCTS);
  }
  syncArray('nexus_vouchers', DEFAULT_VOUCHERS);
  syncArray('nexus_reels', DEFAULT_REELS);
  syncArray('nexus_brands', DEFAULT_BRANDS);
  syncArray('nexus_articles', DEFAULT_ARTICLES);
  syncArray('nexus_banners', DEFAULT_BANNERS);
  syncArray('nexus_flashsale', DEFAULT_FLASHSALE);
  syncArray('nexus_offers', DEFAULT_OFFERS);
  syncArray('nexus_partners', DEFAULT_PARTNERS);
  syncArray('nexus_categories', DEFAULT_CATEGORIES);
  syncArray('nexus_socials', DEFAULT_SOCIALS);
  syncArray('nexus_payments', DEFAULT_PAYMENTS);

  try {
    const rawSettings = localStorage.getItem('nexus_settings');
    if (rawSettings) {
      const parsedSettings = JSON.parse(rawSettings);
      if (parsedSettings && typeof parsedSettings === 'object') {
        Object.assign(DEFAULT_SETTINGS, parsedSettings);
      }
    }
  } catch (_) {}

  try {
    const rawAbout = localStorage.getItem('nexus_about');
    if (rawAbout) {
      const parsedAbout = JSON.parse(rawAbout);
      if (parsedAbout && typeof parsedAbout === 'object') {
        Object.assign(DEFAULT_ABOUT, parsedAbout);
      }
    }
  } catch (_) {}

  try {
    const rawPickup = localStorage.getItem('nexus_pickup');
    if (rawPickup) {
      const parsedPickup = JSON.parse(rawPickup);
      if (parsedPickup && typeof parsedPickup === 'object') {
        Object.assign(DEFAULT_PICKUP, parsedPickup);
      }
    }
  } catch (_) {}
})();

// Hydrate dynamic sections on DOMContentLoaded before app.js initializes carousels
document.addEventListener('DOMContentLoaded', () => {
  const formatRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

  // 1. Top Announcement Ticker (if customized in settings)
  if (DEFAULT_SETTINGS.tickerText) {
    const tickerEl = document.querySelector('.top-ticker span');
    if (tickerEl) tickerEl.innerHTML = DEFAULT_SETTINGS.tickerText;
  }

  // 2. Hero Banner Slider on index.html
  const sliderTrack = document.getElementById('sliderTrack');
  const sliderDots = document.getElementById('sliderDotsContainer');
  if (sliderTrack && sliderDots && Array.isArray(DEFAULT_BANNERS) && DEFAULT_BANNERS.length > 0) {
    sliderTrack.innerHTML = DEFAULT_BANNERS.map((b, i) => `
      <div class="hero-slide" ${b.link ? `style="cursor:pointer;" onclick="window.location.href='${b.link}'"` : ''}>
        <img src="${b.image}" alt="${b.title || 'Banner Alat Kopi Malang'}" class="hero-slide-bg" ${i > 0 ? 'loading="lazy"' : ''}>
      </div>
    `).join('');
    sliderDots.innerHTML = DEFAULT_BANNERS.map((_, i) => `
      <button type="button" class="slider-dot ${i === 0 ? 'active' : ''}" data-slide="${i}" aria-label="Slide ${i + 1}"></button>
    `).join('');
  }

  // 3. Flash Sale Cards on index.html (#flashCardsGrid)
  const flashCardsGrid = document.getElementById('flashCardsGrid');
  if (flashCardsGrid && Array.isArray(DEFAULT_FLASHSALE) && DEFAULT_FLASHSALE.length > 0) {
    flashCardsGrid.innerHTML = DEFAULT_FLASHSALE.map(item => {
      const isSoldOut = Number(item.stock) <= 0;
      return `
      <article class="flash-product-card ${isSoldOut ? 'is-sold-out' : ''}" data-id="${item.id}" onclick="window.location.href='product?id=${item.id}'" title="${item.name}">
        <div class="flash-card-img-wrap" style="position:relative; ${isSoldOut ? 'background:#0f172a;' : ''}">
          ${isSoldOut
            ? '<span class="flash-card-badge-distributor" style="background:linear-gradient(135deg, #111827, #334155); color:#fff; border:1px solid rgba(255,255,255,0.28); font-weight:800; letter-spacing:0.06em; z-index:4;">SOLD OUT</span>'
            : (item.distributorBadge ? '<span class="flash-card-badge-distributor">FLASH SALE</span>' : '')
          }
          ${isSoldOut ? `
            <div class="sold-out-overlay" style="position:absolute; inset:0; background:rgba(15,23,42,0.46); display:flex; align-items:center; justify-content:center; z-index:2; pointer-events:none;">
              <span class="sold-out-overlay-pill" style="background:rgba(15,23,42,0.9); color:#fff; border:1.5px solid rgba(255,255,255,0.38); padding:6px 14px; border-radius:999px; font-size:0.75rem; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; box-shadow:0 4px 14px rgba(0,0,0,0.45);">SOLD OUT</span>
            </div>
          ` : ''}
          <img src="${item.image}" alt="${item.name}" class="flash-card-img" loading="lazy" style="${isSoldOut ? 'filter:brightness(0.42) contrast(0.95) grayscale(35%);' : ''}">
        </div>
        <div class="flash-card-info" style="${isSoldOut ? 'opacity:0.78;' : ''}">
          <h4 class="flash-card-title">${item.name}</h4>
          <div class="flash-card-price-row">
            ${item.originalPrice ? `<span class="flash-card-price-original">${formatRp(item.originalPrice)}</span>` : ''}
            <span class="flash-card-price-deal">${formatRp(item.price)}</span>
          </div>
          <div class="flash-card-divider"></div>
          <div class="flash-card-stock">
            <span style="${isSoldOut ? 'color:#ef4444; font-weight:800;' : ''}">${item.stock > 0 ? 'Tersedia' : 'Sold Out'}</span>
          </div>
        </div>
      </article>
    `;
    }).join('');
  }

  // 4. Flash Sale Page Grid on flashsale (#flashPromoGrid)
  const flashPromoGrid = document.getElementById('flashPromoGrid');
  if (flashPromoGrid && Array.isArray(DEFAULT_FLASHSALE) && DEFAULT_FLASHSALE.length > 0) {
    flashPromoGrid.innerHTML = DEFAULT_FLASHSALE.map(item => {
      const disc = item.originalPrice && item.originalPrice > item.price
        ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
        : 20;
      const isSoldOut = Number(item.stock) <= 0;
      return `
        <article class="product-card ${isSoldOut ? 'is-sold-out' : ''}" data-id="${item.id}" onclick="if (!event.target.closest('button') && !event.target.closest('a')) window.location.href='product?id=${item.id}'">
          <div class="product-card-img-wrap" onclick="window.location.href='product?id=${item.id}'" style="${isSoldOut ? 'background:#0f172a;' : ''}">
            ${isSoldOut
              ? `<span class="card-badge badge-sold-out" style="background:linear-gradient(135deg, #111827, #334155); color:#fff; border:1px solid rgba(255,255,255,0.28); font-weight:800; letter-spacing:0.06em; z-index:4;">SOLD OUT</span>`
              : `<span class="card-badge">${item.distributorBadge ? 'FLASH SALE' : `Diskon ${disc}%`}</span>`
            }
            ${isSoldOut ? `
              <div class="sold-out-overlay" style="position:absolute; inset:0; background:rgba(15,23,42,0.46); display:flex; align-items:center; justify-content:center; z-index:2; pointer-events:none;">
                <span class="sold-out-overlay-pill" style="background:rgba(15,23,42,0.9); color:#fff; border:1.5px solid rgba(255,255,255,0.38); padding:6px 14px; border-radius:999px; font-size:0.75rem; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; box-shadow:0 4px 14px rgba(0,0,0,0.45);">SOLD OUT</span>
              </div>
            ` : ''}
            <button type="button" class="btn-wishlist" onclick="event.stopPropagation(); window.toggleWishlist && window.toggleWishlist('${item.id}')" title="Tambah ke Favorit">
              <i data-lucide="heart" size="18"></i>
            </button>
            <img src="${item.image}" alt="${item.name}" class="product-card-img" loading="lazy" style="${isSoldOut ? 'filter:brightness(0.42) contrast(0.95) grayscale(35%);' : ''}">
          </div>
          <div class="product-card-body" style="${isSoldOut ? 'opacity:0.78;' : ''}">
            <span class="product-category-name">${item.category || 'Promo Flash Sale'}</span>
            <a href="product?id=${item.id}" class="product-title" title="Buka detail ${item.name}">${item.name}</a>
            <div class="product-card-bottom-row">
              <div class="product-price-col">
                <span class="price-current">${formatRp(item.price)}</span>
                ${item.originalPrice ? `<span class="price-original">${formatRp(item.originalPrice)}</span>` : ''}
                <div class="stock-indicator ${item.stock <= 5 ? 'low' : ''}">
                  <i data-lucide="${isSoldOut ? 'x-circle' : (item.stock <= 5 ? 'alert-triangle' : 'check')}" size="11"></i>
                  <span>${isSoldOut ? 'Sold Out' : (item.stock <= 5 ? `Sisa ${item.stock} unit` : 'Tersedia')}</span>
                </div>
              </div>
              <button type="button" class="btn-card-select-variant" onclick="event.stopPropagation(); window.location.href='product?id=${item.id}'" style="${isSoldOut ? 'background:var(--bg-secondary); color:var(--text-muted); border:1px solid var(--border-subtle); box-shadow:none;' : ''}">
                <span>${isSoldOut ? 'Habis' : 'Pilih'}</span>
                ${isSoldOut ? '' : '<i data-lucide="chevron-right" size="14"></i>'}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // 5. Articles Carousel on index.html (#articlesCarouselTrack)
  const articlesTrack = document.getElementById('articlesCarouselTrack');
  if (articlesTrack && Array.isArray(DEFAULT_ARTICLES) && DEFAULT_ARTICLES.length > 0) {
    articlesTrack.innerHTML = DEFAULT_ARTICLES.map(art => `
      <a href="article?id=${art.id}" class="article-card" data-article-id="${art.id}" title="Buka halaman artikel ${art.title}">
        <div class="article-card-thumb">
          <img src="${art.image}" alt="${art.title}" class="article-card-img" loading="lazy">
        </div>
        <div class="article-card-body">
          <h3 class="article-card-title">${art.title}</h3>
          <p class="article-card-desc">${art.excerpt || art.tagline || ''}</p>
        </div>
        <div class="article-card-footer">
          <span class="article-card-action-text">${art.actionText || 'Baca Selengkapnya'}</span>
          <div class="article-card-arrow">
            <i data-lucide="arrow-right" size="16"></i>
          </div>
        </div>
      </a>
    `).join('');
  }

  // 6. Categories Bar (#categoriesBar) & Category Dropdown Menu (#categoryDropdownMenu)
  if (Array.isArray(DEFAULT_CATEGORIES) && DEFAULT_CATEGORIES.length > 0) {
    const categoriesBar = document.getElementById('categoriesBar');
    if (categoriesBar) {
      categoriesBar.innerHTML = `
        <button class="category-pill active" data-category="ALL" role="tab">
          <i data-lucide="layout-grid" size="14"></i>
          <span>Semua Produk</span>
        </button>
      ` + DEFAULT_CATEGORIES.map(c => `
        <button class="category-pill" data-category="${c.name}" role="tab">
          <i data-lucide="${c.icon || 'tag'}" size="14"></i>
          <span>${c.name}</span>
        </button>
      `).join('');
    }

    const categoryDropdownMenu = document.getElementById('categoryDropdownMenu');
    if (categoryDropdownMenu) {
      const sheetHeader = categoryDropdownMenu.querySelector('.category-sheet-header');
      const headerHtml = sheetHeader ? sheetHeader.outerHTML : `
        <div class="category-sheet-header hide-desktop">
          <div class="sheet-drag-handle"></div>
          <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
            <div class="sheet-title">
              <i data-lucide="layout-grid" size="18"></i>
              <span>Kategori Produk</span>
            </div>
            <button type="button" class="btn-close-cat-sheet" id="btnCloseCatSheet" aria-label="Tutup Menu">
              <i data-lucide="x" size="18"></i>
            </button>
          </div>
        </div>
      `;

      const hasProductGrid = !!document.getElementById('productsGrid');
      const allHref = hasProductGrid ? 'javascript:void(0)' : 'shop?category=ALL';
      const featuredHref = hasProductGrid ? 'javascript:void(0)' : 'shop?sort=popular';

      categoryDropdownMenu.innerHTML = headerHtml + `
        <a href="${allHref}" class="cat-drop-item" data-category="ALL">
          <span class="cat-drop-left">
            <i data-lucide="layout-grid" size="16"></i>
            <span>Semua Kategori</span>
          </span>
          <span class="cat-badge-mini">${DEFAULT_PRODUCTS.length} Item</span>
        </a>
      ` + DEFAULT_CATEGORIES.map(c => {
        const count = DEFAULT_PRODUCTS.filter(p => (p.category || '').toLowerCase() === (c.name || '').toLowerCase()).length;
        const itemHref = hasProductGrid ? 'javascript:void(0)' : `shop?category=${encodeURIComponent(c.name)}`;
        return `
          <a href="${itemHref}" class="cat-drop-item" data-category="${c.name}">
            <span class="cat-drop-left">
              <i data-lucide="${c.icon || 'tag'}" size="16"></i>
              <span>${c.name}</span>
            </span>
            <span class="cat-badge-mini">${count} Item</span>
          </a>
        `;
      }).join('') + `
        <a href="${featuredHref}" class="cat-drop-item" data-filter-type="featured">
          <span class="cat-drop-left">
            <i data-lucide="flame" size="16" style="color:#ef4444;"></i>
            <span>Produk Terlaris & Trending</span>
          </span>
          <span class="cat-badge-hot">HOT</span>
        </a>
        <a href="flashsale" class="cat-drop-item">
          <span class="cat-drop-left">
            <i data-lucide="badge-percent" size="16" style="color:#f59e0b;"></i>
            <span>Promo & Diskon Spesial</span>
          </span>
          <span class="cat-badge-sale">SALE</span>
        </a>
      `;
    }
  }

  // 7. About Page Hydration (about) if customized
  if (localStorage.getItem('nexus_about')) {
    const heroBadgeEl = document.querySelector('.about-hero-badge span');
    const heroTitleEl = document.querySelector('.about-hero-title');
    const heroDescEl = document.querySelector('.about-hero-desc');
    const statNums = document.querySelectorAll('.about-stat-box .about-stat-num');
    const storyQuoteEl = document.querySelector('.about-story-quote');
    const timelineContainer = document.querySelector('.timeline-container');

    if (heroBadgeEl && DEFAULT_ABOUT.badge) heroBadgeEl.textContent = DEFAULT_ABOUT.badge;
    if (heroTitleEl && DEFAULT_ABOUT.heroTitle) heroTitleEl.textContent = DEFAULT_ABOUT.heroTitle;
    if (heroDescEl && DEFAULT_ABOUT.heroDesc) heroDescEl.textContent = DEFAULT_ABOUT.heroDesc;
    if (statNums.length >= 4) {
      statNums[0].textContent = DEFAULT_ABOUT.statYear || '2017';
      statNums[1].textContent = DEFAULT_ABOUT.statExp || '9+ Tahun';
      statNums[2].textContent = DEFAULT_ABOUT.statCustomers || '15.000+';
      statNums[3].textContent = DEFAULT_ABOUT.statPartners || '250+';
    }
    if (storyQuoteEl && DEFAULT_ABOUT.storyQuote) storyQuoteEl.textContent = `"${DEFAULT_ABOUT.storyQuote.replace(/^"|"$/g, '')}"`;
    if (timelineContainer && Array.isArray(DEFAULT_ABOUT.timelines)) {
      timelineContainer.innerHTML = DEFAULT_ABOUT.timelines.map(tl => `
        <div class="timeline-item ${tl.isCurrent ? 'current-era' : ''}">
          <div class="timeline-dot"></div>
          <div class="timeline-top-row">
            <span class="timeline-year-badge"><i data-lucide="${tl.isCurrent ? 'sparkles' : 'calendar'}" size="13"></i> ${tl.year}</span>
            <span class="timeline-phase-tag" ${tl.isCurrent ? 'style="color:#059669;"' : ''}>${tl.phase || ''}</span>
          </div>
          <h3 class="timeline-title">${tl.title}</h3>
          <p class="timeline-desc">${tl.desc}</p>
        </div>
      `).join('');
    }
  }

  // 8. Footer Social Media Hydration ("Dapatkan Update Seputar Alat Kopi") across all pages
  const footerSocialSections = document.querySelectorAll('.footer-social-section');
  if (footerSocialSections.length > 0 && Array.isArray(DEFAULT_SOCIALS)) {
    const activeSocials = DEFAULT_SOCIALS.filter(s => s.active !== false);
    footerSocialSections.forEach(sec => {
      const titleEl = sec.querySelector('.footer-social-title');
      if (titleEl && DEFAULT_SETTINGS.socialSectionTitle) {
        titleEl.textContent = DEFAULT_SETTINGS.socialSectionTitle;
      }
      const iconsWrap = sec.querySelector('.footer-social-icons');
      if (iconsWrap) {
        iconsWrap.innerHTML = activeSocials.map(soc => {
          const meta = window.getSocialPlatformMeta(soc.platform);
          return `
            <a href="${soc.url || '#'}" target="_blank" rel="noopener noreferrer" class="footer-social-btn ${meta.className}" style="${meta.bgStyle}" title="${soc.name || soc.platform}" aria-label="${soc.name || soc.platform}">
              ${meta.svg}
            </a>
          `;
        }).join('');
      }
    });
  }

  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
});





