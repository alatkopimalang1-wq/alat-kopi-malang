/**
 * Alat Kopi Malang - Application Logic
 * Mobile-friendly, high performance, interactive e-commerce app
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const State = {
    products: (() => {
      const stored = localStorage.getItem('nexus_products');
      if (!stored) return DEFAULT_PRODUCTS;
      if (localStorage.getItem('nexus_admin_products_saved') === 'true') {
        try { return JSON.parse(stored); } catch (_) { return DEFAULT_PRODUCTS; }
      }
      try {
        const parsed = JSON.parse(stored);
        const existingIds = new Set(parsed.map(p => p.id));
        const newDefaults = DEFAULT_PRODUCTS.filter(d => !existingIds.has(d.id));
        const mapped = parsed.map(p => {
          const def = DEFAULT_PRODUCTS.find(d => d.id === p.id);
          const brand = p.brand || (def ? def.brand : 'Alat Kopi Malang');
          const badge = p.badge === 'Terlaris' ? 'Unggulan' : p.badge;
          const category = def ? def.category : (p.category || 'Lainnya');
          if (def && Array.isArray(def.variants) && def.variants.length === 0) {
            return { ...p, brand, badge, category, variants: [] };
          }
          return { ...p, brand, badge, category };
        });
        return [...mapped, ...newDefaults];
      } catch (e) {
        return DEFAULT_PRODUCTS;
      }
    })(),
    cart: JSON.parse(localStorage.getItem('nexus_cart')) || [],
    wishlist: JSON.parse(localStorage.getItem('nexus_wishlist')) || [],
    orders: JSON.parse(localStorage.getItem('nexus_orders')) || [],
    settings: (() => {
      const stored = localStorage.getItem('nexus_settings');
      if (!stored) return DEFAULT_SETTINGS;
      try {
        const s = JSON.parse(stored);
        if (!s.storeName || s.storeName.toUpperCase().includes('NEXUS') || !s.whatsappNumber || s.whatsappNumber === '6281234567890') {
          s.storeName = 'Alat Kopi Malang';
          s.storeTagline = 'Toko Alat Kopi Terlengkap & Terpercaya di Malang';
          s.storeAddress = 'Jl. Soekarno Hatta No. 45, Lowokwaru, Kota Malang, Jawa Timur';
          s.whatsappNumber = '6282132095241';
          s.bankAccounts = DEFAULT_SETTINGS.bankAccounts;
          localStorage.setItem('nexus_settings', JSON.stringify(s));
        }
        s.whatsappNumber = '6282132095241';
        return s;
      } catch (_) {
        return DEFAULT_SETTINGS;
      }
    })(),
    theme: localStorage.getItem('nexus_theme') || 'light',
    
    currentCategory: 'ALL',
    filterBrand: null,
    searchQuery: '',
    currentSort: 'popular',
    filterPromoOnly: false,
    filterFeaturedOnly: false,
    appliedVoucher: null,
    selectedPaymentMethod: 'bca',
    selectedVariant: null,
    currentPage: 1,
    itemsPerPage: typeof window !== 'undefined' && window.innerWidth <= 768 ? 4 : 8
  };

  // Sync back clean mapped products to localStorage
  try {
    localStorage.setItem('nexus_products', JSON.stringify(State.products));
  } catch (_) {}

  // Helper to persist state
  const saveState = () => {
    localStorage.setItem('nexus_products', JSON.stringify(State.products));
    localStorage.setItem('nexus_cart', JSON.stringify(State.cart));
    localStorage.setItem('nexus_wishlist', JSON.stringify(State.wishlist));
    localStorage.setItem('nexus_orders', JSON.stringify(State.orders));
    localStorage.setItem('nexus_settings', JSON.stringify(State.settings));
  };

  // ==========================================
  // UTILITIES
  // ==========================================
  const formatRupiah = (number) => {
    return 'Rp ' + Number(number || 0).toLocaleString('id-ID');
  };

  const refreshIcons = () => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  const showToast = (message, type = 'success') => {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconName = 'check-circle';
    if (type === 'danger') iconName = 'alert-circle';
    if (type === 'info') iconName = 'info';

    toast.innerHTML = `
      <i data-lucide="${iconName}" size="18"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    refreshIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  };

  // ==========================================
  // THEME SWITCHER
  // ==========================================
  const applyTheme = (theme) => {
    State.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nexus_theme', theme);
    
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
      refreshIcons();
    }
  };

  applyTheme(State.theme);

  document.getElementById('btnToggleTheme')?.addEventListener('click', () => {
    const newTheme = State.theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    showToast(`Beralih ke mode ${newTheme === 'dark' ? 'Gelap' : 'Terang'}`, 'info');
  });

  // ==========================================
  // BADGES UPDATE
  // ==========================================
  const updateBadges = () => {
    const totalCartCount = State.cart.reduce((sum, item) => sum + item.quantity, 0);
    const wishlistCount = State.wishlist.length;

    const cartBadge = document.getElementById('cartBadge');
    const mobileCartBadge = document.getElementById('mobileCartBadge');
    const wishlistBadge = document.getElementById('wishlistBadge');
    const mobileWishlistBadge = document.getElementById('mobileWishlistBadge');

    if (cartBadge) {
      cartBadge.textContent = totalCartCount;
      cartBadge.classList.add('badge-bounce');
      setTimeout(() => cartBadge.classList.remove('badge-bounce'), 350);
    }
    if (mobileCartBadge) mobileCartBadge.textContent = totalCartCount;

    if (wishlistBadge) wishlistBadge.textContent = wishlistCount;
    if (mobileWishlistBadge) mobileWishlistBadge.textContent = wishlistCount;

    // Dynamically update category item counts
    document.querySelectorAll('.cat-drop-item[data-category]').forEach(item => {
      const cat = item.dataset.category;
      const badge = item.querySelector('.cat-badge-mini');
      if (badge) {
        if (cat === 'ALL') {
          badge.textContent = `${State.products.length} Item`;
        } else {
          const count = State.products.filter(p => p.category === cat).length;
          badge.textContent = `${count} Item`;
        }
      }
    });
  };

  // ==========================================
  // ENSURE GLOBAL FOOTER IS ALWAYS ACTIVE
  // ==========================================
  const ensureGlobalFooter = () => {
    // Hanya tampilkan footer di Home Page (index.html atau root /)
    const path = window.location.pathname;
    const page = path.split('/').pop().toLowerCase();
    const isHome = page === '' || page === 'index.html';

    if (!isHome) {
      const existing = document.querySelector('.site-footer');
      if (existing) existing.remove();
      return;
    }

    if (document.querySelector('.site-footer')) return;
    const footerHTML = `
    <footer class="site-footer" id="siteFooter">
      <div class="footer-container">
        <div class="footer-grid">
          <!-- Column 1: Lokasi & Jam Operasional & Media Sosial -->
          <div class="footer-col footer-col-contact">
            <h4 class="footer-col-title">Lokasi & Jam Operasional</h4>
            <ul class="footer-contact-list">
              <li>
                <a href="article.html?id=art-002" class="footer-contact-link" title="Lokasi Showroom Alat Kopi Malang">
                  <i data-lucide="map-pin" class="footer-contact-icon"></i>
                  <span>Ruko Tlogomas Square Kav.34, Kec. Lowokwaru Kota Malang</span>
                </a>
              </li>
              <li>
                <div class="footer-contact-link" style="cursor: default;" title="Jam Operasional Showroom">
                  <i data-lucide="clock" class="footer-contact-icon"></i>
                  <span>Setiap Hari 09.00 AM - 22.00 PM WIB</span>
                </div>
              </li>
              <li>
                <a href="https://wa.me/6282132095241" target="_blank" rel="noopener noreferrer" class="footer-contact-link" title="Hubungi via WhatsApp">
                  <i data-lucide="message-circle" class="footer-contact-icon"></i>
                  <span>+6282132095241</span>
                </a>
              </li>
              <li>
                <a href="mailto:alatkopimalang1@gmail.com" class="footer-contact-link" title="Hubungi via Email">
                  <i data-lucide="mail" class="footer-contact-icon"></i>
                  <span>alatkopimalang1@gmail.com</span>
                </a>
              </li>
            </ul>

            <div class="footer-social-wrapper">
              <div class="footer-social-section">
                <h5 class="footer-social-title">Dapatkan Update Seputar Alat Kopi</h5>
                <div class="footer-social-icons">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="footer-social-btn social-instagram" title="Ikuti kami di Instagram" aria-label="Instagram">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="footer-social-btn social-facebook" title="Ikuti kami di Facebook" aria-label="Facebook">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" class="footer-social-btn social-youtube" title="Tonton YouTube kami" aria-label="YouTube">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                  <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" class="footer-social-btn social-tiktok" title="Ikuti kami di TikTok" aria-label="TikTok">
                    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.78 1.25-.03 2.4-0.74 2.92-1.84.4-0.79.49-1.7.49-2.58.01-4.91.01-9.82.01-14.73z"/>
                    </svg>
                  </a>
                </div>
              </div>

              <div class="footer-ecommerce-section">
                <h5 class="footer-social-title">Kunjungi Toko Kami di:</h5>
                <div class="footer-social-icons">
                  <a href="https://shopee.co.id" target="_blank" rel="noopener noreferrer" class="footer-social-btn social-shopee" title="Official Store Shopee" aria-label="Shopee">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                      <path d="M19.2 8H4.8C4.36 8 4 8.36 4 8.8l1.3 12.2c.1.9.9 1.6 1.8 1.6h9.8c.9 0 1.7-.7 1.8-1.6L20 8.8c0-.44-.36-.8-.8-.8z" fill="#FFFFFF"/>
                      <path d="M8 8V5.5C8 3.57 9.57 2 11.5 2h1c1.93 0 3.5 1.57 3.5 3.5V8" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
                      <path d="M14.2 12.3c-.3-.2-.8-.4-1.4-.5-.8-.2-1.2-.4-1.2-.8 0-.4.3-.6.9-.6.6 0 1.1.2 1.5.5l.6-1.1c-.6-.4-1.3-.6-2.1-.6-1.4 0-2.3.8-2.3 1.9 0 .9.6 1.4 1.6 1.7.8.2 1.1.4 1.1.8 0 .4-.4.7-1 .7-.7 0-1.3-.3-1.8-.7l-.6 1.1c.7.5 1.4.8 2.4.8 1.5 0 2.4-.8 2.4-2 0-.8-.6-1.4-1.5-1.7z" fill="#EE4D2D"/>
                    </svg>
                  </a>
                  <a href="https://www.tokopedia.com" target="_blank" rel="noopener noreferrer" class="footer-social-btn social-tokopedia" title="Official Store Tokopedia" aria-label="Tokopedia">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                      <path d="M4 8.5C4 7.67 4.67 7 5.5 7h13c.83 0 1.5.67 1.5 1.5V19c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V8.5z" fill="#FFFFFF"/>
                      <path d="M8 7V5.5C8 3.57 9.57 2 11.5 2h1c1.93 0 3.5 1.57 3.5 3.5V7" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
                      <circle cx="9" cy="13.5" r="2.2" fill="#03AC0E"/>
                      <circle cx="15" cy="13.5" r="2.2" fill="#03AC0E"/>
                      <circle cx="9.4" cy="13.5" r="1.1" fill="#FFFFFF"/>
                      <circle cx="15.4" cy="13.5" r="1.1" fill="#FFFFFF"/>
                      <path d="M10.8 17.2c.7.4 1.7.4 2.4 0" stroke="#03AC0E" stroke-width="1.6" stroke-linecap="round"/>
                    </svg>
                  </a>
                  <a href="https://shop.tiktok.com" target="_blank" rel="noopener noreferrer" class="footer-social-btn social-tiktokshop" title="Belanja di TikTok Shop" aria-label="TikTok Shop">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                      <path d="M5.5 8h13l1.2 11.5c.1.8-.6 1.5-1.4 1.5H5.7c-.8 0-1.5-.7-1.4-1.5L5.5 8z" fill="#18181b" stroke="#ffffff" stroke-width="1.4"/>
                      <path d="M8.5 8V6a3.5 3.5 0 0 1 7 0v2" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round"/>
                      <path d="M14.2 11.2a2.3 2.3 0 0 1-1.5-.7v3.5a2.2 2.2 0 1 1-1.9-2.2v1.3a1 1 0 1 0 .8 1V9h1.3c0 .8.6 1.5 1.3 1.7v.5z" fill="#FFFFFF"/>
                      <path d="M13.9 11.1a2.3 2.3 0 0 1-1.2-.6v3.5a2.2 2.2 0 0 1-1.9 2.2c-.2 0-.3 0-.4-.1.9.7 2.2.4 2.8-.5.1-.2.2-.5.2-.9v-3.7h.5z" fill="#25F4EE" opacity="0.85"/>
                      <path d="M13.2 9h-.5v4.2c0 1-.6 1.9-1.6 2.2-.2 0-.4.1-.6.1 1 .5 2.3 0 2.7-1 .1-.2.2-.5.2-.9V10c.4.2.8.3 1.2.4V9.4c-.5-.1-1-.5-1.3-.9-.1.2-.2.5-.2.5z" fill="#FE2C55" opacity="0.85"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Column 2: Alat Kopi Malang -->
          <div class="footer-col">
            <h4 class="footer-col-title">Alat Kopi Malang</h4>
            <ul class="footer-links-list">
              <li><a href="about.html">Tentang Kami</a></li>
              <li><a href="brands.html">Brands</a></li>
              <li><a href="partnership.html">Kemitraan</a></li>
              <li><a href="articles.html">Artikel AKM</a></li>
            </ul>
          </div>

          <!-- Column 3: Bantuan -->
          <div class="footer-col">
            <h4 class="footer-col-title">Bantuan</h4>
            <ul class="footer-links-list">
              <li><a href="account.html">Lacak Pengiriman</a></li>
              <li><a href="return-policy.html">Pengembalian Produk</a></li>
              <li><a href="warranty.html">Ketentuan Garansi</a></li>
              <li><a href="terms.html">Syarat dan Ketentuan</a></li>
              <li><a href="privacy-policy.html">Kebijakan Privasi</a></li>
            </ul>
          </div>

          <!-- Column 4: Customer Care -->
          <div class="footer-col">
            <h4 class="footer-col-title">Customer Care</h4>
            <ul class="footer-links-list">
              <li><a href="https://wa.me/6282132095241" target="_blank" rel="noopener noreferrer">Hubungi Kami</a></li>
              <li><a href="checkout.html">Konfirmasi Pembayaran</a></li>
              <li><a href="faq.html">FAQ / Bantuan</a></li>
            </ul>
          </div>
        </div>

        <!-- Footer Bottom Copyright & Trust Info -->
        <div class="footer-bottom">
          <p class="footer-copyright">© 2026 Alat Kopi Malang. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
    `;

    const mainEl = document.querySelector('main');
    const bottomNav = document.querySelector('.bottom-nav');
    const toastContainer = document.querySelector('.toast-container');
    const stickyBottom = document.querySelector('.sticky-bottom-action-bar');

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = footerHTML.trim();
    const footerNode = tempDiv.firstElementChild;

    if (bottomNav) {
      bottomNav.parentNode.insertBefore(footerNode, bottomNav);
    } else if (stickyBottom) {
      stickyBottom.parentNode.insertBefore(footerNode, stickyBottom);
    } else if (toastContainer) {
      toastContainer.parentNode.insertBefore(footerNode, toastContainer);
    } else if (mainEl && mainEl.nextSibling) {
      mainEl.parentNode.insertBefore(footerNode, mainEl.nextSibling);
    } else {
      document.body.appendChild(footerNode);
    }
    refreshIcons();
  };

  ensureGlobalFooter();

  // ==========================================
  // CATALOG PAGINATION CONTROLLER
  // ==========================================
  const getPaginationItems = (currentPage, totalPages) => {
    if (totalPages <= 7) {
      const pages = [];
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const renderPagination = (currentPage, totalPages) => {
    const wrap = document.getElementById('paginationWrapper');
    const nav = document.getElementById('catalogPagination');
    if (!wrap || !nav) return;

    if (totalPages <= 1) {
      wrap.style.display = 'none';
      nav.innerHTML = '';
      return;
    }

    wrap.style.display = 'flex';
    const items = getPaginationItems(currentPage, totalPages);

    let html = `
      <button type="button" class="pagination-btn pagination-prev ${currentPage === 1 ? 'disabled' : ''}" 
        data-page="${currentPage - 1}" 
        ${currentPage === 1 ? 'disabled' : ''} 
        aria-label="Halaman Sebelumnya"
        title="Halaman Sebelumnya">
        <i data-lucide="chevron-left" size="18"></i>
      </button>
    `;

    items.forEach(it => {
      if (it === '...') {
        html += `<span class="pagination-ellipsis">...</span>`;
      } else {
        const isActive = it === currentPage;
        html += `
          <button type="button" class="pagination-btn pagination-number ${isActive ? 'active' : ''}" 
            data-page="${it}" 
            ${isActive ? 'aria-current="page"' : ''}
            title="Halaman ${it}">
            ${it}
          </button>
        `;
      }
    });

    html += `
      <button type="button" class="pagination-btn pagination-next ${currentPage === totalPages ? 'disabled' : ''}" 
        data-page="${currentPage + 1}" 
        ${currentPage === totalPages ? 'disabled' : ''} 
        aria-label="Halaman Berikutnya"
        title="Halaman Berikutnya">
        <i data-lucide="chevron-right" size="18"></i>
      </button>
    `;

    nav.innerHTML = html;
  };

  // ==========================================
  // PRODUCT CATALOG RENDERING
  // ==========================================
  const renderProducts = () => {
    const grid = document.getElementById('productsGrid');
    const countEl = document.getElementById('productCountNum');
    if (!grid) return;

    // Filter by Category, Brand & Special filters
    let filtered = State.products.filter(p => {
      if (State.currentCategory && State.currentCategory !== 'ALL') {
        const productCat = (p.category || '').trim().toLowerCase();
        const activeCat = State.currentCategory.trim().toLowerCase();
        if (productCat !== activeCat) return false;
      }
      if (State.filterBrand) {
        const pBrand = (p.brand || '').trim().toLowerCase();
        const targetBrand = State.filterBrand.trim().toLowerCase();
        if (pBrand !== targetBrand && !pBrand.includes(targetBrand)) return false;
      }
      if (State.filterPromoOnly && (!p.originalPrice || p.originalPrice <= p.price)) {
        return false;
      }
      if (State.filterFeaturedOnly && !p.featured) {
        return false;
      }
      if (State.searchQuery) {
        const query = State.searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        const matchCat = p.category.toLowerCase().includes(query);
        const matchBrand = (p.brand || '').toLowerCase().includes(query);
        return matchName || matchDesc || matchCat || matchBrand;
      }
      return true;
    });

    // Sort Products
    if (State.currentSort === 'newest') {
      filtered.sort((a, b) => {
        const numA = parseInt((a.id || '').replace('prod-', '')) || 0;
        const numB = parseInt((b.id || '').replace('prod-', '')) || 0;
        return numB - numA;
      });
    } else if (State.currentSort === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (State.currentSort === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (State.currentSort === 'name-az') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Popular / Featured
      filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    const totalFiltered = filtered.length;
    const itemsPerPage = window.innerWidth <= 768 ? 4 : 8;
    State.itemsPerPage = itemsPerPage;
    const totalPages = Math.ceil(totalFiltered / itemsPerPage) || 1;

    // Safety checks for currentPage
    if (State.currentPage > totalPages) State.currentPage = totalPages;
    if (State.currentPage < 1) State.currentPage = 1;

    const startIndex = (State.currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayProducts = filtered.slice(startIndex, endIndex);

    if (countEl) {
      if (totalFiltered > itemsPerPage) {
        countEl.innerHTML = `<strong>${startIndex + 1}-${Math.min(endIndex, totalFiltered)}</strong> dari <strong>${totalFiltered}</strong>`;
      } else {
        countEl.textContent = totalFiltered;
      }
    }

    // Active Brand Filter Banner on shop page
    const activeBanner = document.getElementById('activeFilterBanner');
    if (activeBanner) {
      if (State.filterBrand) {
        activeBanner.style.display = 'flex';
        activeBanner.innerHTML = `
          <div class="active-brand-chip">
            <span class="active-brand-chip-label">
              <i data-lucide="tag" size="14"></i>
              <span>Filter Brand: <strong>${State.filterBrand}</strong></span>
            </span>
            <button type="button" class="btn-clear-brand-filter" id="btnClearBrandFilter" aria-label="Hapus filter brand" title="Tampilkan Semua Produk">
              <i data-lucide="x" size="14"></i>
              <span>Hapus Filter</span>
            </button>
          </div>
        `;
        document.getElementById('btnClearBrandFilter')?.addEventListener('click', (e) => {
          e.preventDefault();
          State.filterBrand = null;
          try {
            window.history.pushState({}, '', 'shop.html');
          } catch (_) {}
          updateShopHeaderInfo('ALL');
          renderProducts();
        });
      } else {
        activeBanner.style.display = 'none';
        activeBanner.innerHTML = '';
      }
    }

    if (filtered.length === 0) {
      const paginationWrap = document.getElementById('paginationWrapper');
      if (paginationWrap) paginationWrap.style.display = 'none';

      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <i data-lucide="search-x" size="32"></i>
          </div>
          <h3>Produk Tidak Ditemukan</h3>
          <p>Coba gunakan kata kunci pencarian lain atau pilih kategori yang berbeda.</p>
          <button class="btn-primary" id="btnResetSearchFilter">
            <i data-lucide="rotate-ccw" size="16"></i>
            <span>Tampilkan Semua Produk</span>
          </button>
        </div>
      `;
      refreshIcons();

      document.getElementById('btnResetSearchFilter')?.addEventListener('click', () => {
        State.searchQuery = '';
        State.currentCategory = 'ALL';
        State.currentPage = 1;
        const dInput = document.getElementById('desktopSearchInput');
        const mInput = document.getElementById('mobileSearchInput');
        if (dInput) dInput.value = '';
        if (mInput) mInput.value = '';
        document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        document.querySelector('.category-pill[data-category="ALL"]')?.classList.add('active');
        renderProducts();
      });
      return;
    }

    const getEffectiveProductStock = (p) => {
      if (!p) return 0;
      const isPO = !!(p.isPreOrder || (p.badge && String(p.badge).toUpperCase().includes('PRE-ORDER')));
      if (isPO) return 999999;
      const rawStock = Number(p.stock);
      if (!isNaN(rawStock) && rawStock <= 0) return 0;
      if (Array.isArray(p.variantItems) && p.variantItems.length > 0) {
        const hasExplicitStock = p.variantItems.some(v => v && v.stock !== undefined && v.stock !== '');
        if (hasExplicitStock) {
          return p.variantItems.reduce((sum, v) => sum + Math.max(0, parseInt(v?.stock) || 0), 0);
        }
      }
      return isNaN(rawStock) ? 0 : Math.max(0, rawStock);
    };

    grid.innerHTML = displayProducts.map(product => {
      const isWishlisted = State.wishlist.some(id => id === product.id);
      const discountPercentage = product.originalPrice 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
        : null;
      const hasVariants = Array.isArray(product.variants) && product.variants.length > 0 && !(product.variants.length === 1 && product.variants[0].toLowerCase() === 'standar');
      const isPreOrder = !!(product.isPreOrder || (product.badge && product.badge.toUpperCase().includes('PRE-ORDER')));
      const effectiveStock = getEffectiveProductStock(product);
      const isSoldOut = !isPreOrder && effectiveStock <= 0;

      return `
        <article class="product-card ${isSoldOut ? 'is-sold-out' : ''}" data-id="${product.id}" onclick="if (!event.target.closest('button') && !event.target.closest('a')) window.location.href='product.html?id=${product.id}'">
          <div class="product-card-img-wrap" onclick="window.location.href='product.html?id=${product.id}'" style="${isSoldOut ? 'background:#0f172a;' : ''}">
            ${isSoldOut
              ? `<span class="card-badge badge-sold-out" style="background:linear-gradient(135deg, #111827, #334155); color:#fff; border:1px solid rgba(255,255,255,0.28); font-weight:800; letter-spacing:0.06em; z-index:4;">SOLD OUT</span>`
              : (isPreOrder
                  ? `<span class="card-badge" style="background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; font-weight:800; letter-spacing:0.04em;">PRE-ORDER</span>`
                  : (discountPercentage ? `<span class="card-badge">Diskon ${discountPercentage}%</span>` : (product.badge ? `<span class="card-badge popular">${product.badge}</span>` : '')))
            }
            ${isSoldOut ? `
              <div class="sold-out-overlay" style="position:absolute; inset:0; background:rgba(15,23,42,0.46); display:flex; align-items:center; justify-content:center; z-index:2; pointer-events:none;">
                <span class="sold-out-overlay-pill" style="background:rgba(15,23,42,0.9); color:#fff; border:1.5px solid rgba(255,255,255,0.38); padding:6px 14px; border-radius:999px; font-size:0.75rem; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; box-shadow:0 4px 14px rgba(0,0,0,0.45);">SOLD OUT</span>
              </div>
            ` : ''}
            
            <button type="button" class="btn-wishlist ${isWishlisted ? 'active' : ''}" 
              onclick="event.stopPropagation(); window.toggleWishlist('${product.id}')" 
              title="${isWishlisted ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}"
              aria-label="Favorit ${product.name}">
              <i data-lucide="heart" size="18" ${isWishlisted ? 'fill="currentColor"' : ''}></i>
            </button>

            <img src="${product.image}" alt="${product.name}" class="product-card-img" loading="lazy" style="${isSoldOut ? 'filter:brightness(0.42) contrast(0.95) grayscale(35%);' : ''}">
          </div>

          <div class="product-card-body" style="${isSoldOut ? 'opacity:0.78;' : ''}">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; flex-wrap:wrap;">
              <span class="product-category-name">${product.category}</span>
              ${isSoldOut
                ? `<span style="font-size:0.64rem; font-weight:800; background:rgba(239,68,68,0.12); color:#ef4444; border:1px solid rgba(239,68,68,0.3); padding:1px 6px; border-radius:4px; letter-spacing:0.03em;">SOLD OUT</span>`
                : (isPreOrder ? `<span style="font-size:0.64rem; font-weight:800; background:rgba(245,158,11,0.14); color:#d97706; border:1px solid rgba(245,158,11,0.35); padding:1px 6px; border-radius:4px; letter-spacing:0.03em;">PRE-ORDER</span>` : '')
              }
            </div>
            <a href="product.html?id=${product.id}" class="product-title" title="Buka detail ${product.name}">
              ${product.name}
            </a>


            <div class="product-card-bottom-row">
              <div class="product-price-col">
                <span class="price-current">${formatRupiah(product.price)}</span>
                ${product.originalPrice ? `<span class="price-original">${formatRupiah(product.originalPrice)}</span>` : ''}
                ${!isPreOrder ? `
                  <div class="stock-indicator ${effectiveStock <= 5 ? 'low' : ''}">
                    <i data-lucide="${isSoldOut ? 'x-circle' : (effectiveStock <= 5 ? 'alert-triangle' : 'check')}" size="11"></i>
                    <span>${isSoldOut ? 'Sold Out' : (effectiveStock <= 5 ? `Sisa ${effectiveStock} unit` : `Tersedia`)}</span>
                  </div>
                ` : ''}
              </div>
              ${isSoldOut ? `
                <button type="button" class="btn-card-select-variant" 
                  onclick="event.stopPropagation(); window.location.href='product.html?id=${product.id}'" 
                  style="background:var(--bg-secondary); color:var(--text-muted); border:1px solid var(--border-subtle); box-shadow:none;"
                  title="Stok Habis - ${product.name}">
                  <span>Habis</span>
                </button>
              ` : (hasVariants ? `
                <button type="button" class="btn-card-select-variant" 
                  onclick="event.stopPropagation(); window.location.href='product.html?id=${product.id}'" 
                  title="Pilih Varian ${product.name}" 
                  aria-label="Pilih Varian ${product.name}">
                  <span>Pilih</span>
                  <i data-lucide="chevron-right" size="14"></i>
                </button>
              ` : `
                <button type="button" class="btn-card-cart-icon" 
                  onclick="event.stopPropagation(); window.addToCart('${product.id}')" 
                  title="Tambah ke Keranjang" 
                  aria-label="Tambah ${product.name} ke Keranjang">
                  <i data-lucide="shopping-bag" size="17"></i>
                </button>
              `)}
            </div>
          </div>
        </article>
      `;
    }).join('');

    renderPagination(State.currentPage, totalPages);

    refreshIcons();
  };

  // ==========================================
  // CART OPERATIONS
  // ==========================================
  window.addToCart = (productId, variant = null, quantity = 1, customPrice = null) => {
    const product = State.products.find(p => p.id === productId);
    if (!product) return;

    const isPreOrder = !!(product.isPreOrder || (product.badge && product.badge.toUpperCase().includes('PRE-ORDER')));
    if (!isPreOrder && product.stock <= 0) {
      showToast('Maaf, stok produk ini sedang habis!', 'danger');
      return;
    }

    const firstVarItem = Array.isArray(product.variantItems) && product.variantItems.length > 0 ? product.variantItems[0] : null;
    const defaultVarLabel = firstVarItem
      ? `${firstVarItem.type || 'Varian'}: ${firstVarItem.name}`
      : (product.variants && product.variants.length > 0 ? product.variants[0] : 'Standar');
    const selectedVar = variant || defaultVarLabel;

    let resolvedPrice = Number(customPrice) || 0;
    let resolvedWeight = Number(product.weight) || 500;
    let resolvedImage = product.image;
    let resolvedStock = isPreOrder ? 999999 : Number(product.stock || 0);
    if (Array.isArray(product.variantItems)) {
      const matchedItem = product.variantItems.find(v =>
        `${v.type}: ${v.name}` === selectedVar || v.name === selectedVar
      );
      if (matchedItem) {
        if (!resolvedPrice && Number(matchedItem.price) > 0) {
          resolvedPrice = Number(matchedItem.price);
        }
        if (Number(matchedItem.weight) > 0) {
          resolvedWeight = Number(matchedItem.weight);
        }
        if (matchedItem.image) {
          resolvedImage = matchedItem.image;
        }
        if (!isPreOrder && matchedItem.stock !== undefined && matchedItem.stock !== '') {
          resolvedStock = Number(matchedItem.stock) || 0;
        }
      }
    }
    if (!resolvedPrice) resolvedPrice = product.price;

    if (resolvedStock <= 0) {
      showToast('Maaf, stok varian ini sedang habis!', 'danger');
      return;
    }

    const existingIndex = State.cart.findIndex(item => item.id === productId && item.variant === selectedVar);

    if (existingIndex > -1) {
      if (State.cart[existingIndex].quantity + quantity > resolvedStock) {
        showToast(`Stok tidak mencukupi! Maksimal ${resolvedStock} pcs`, 'danger');
        return;
      }
      State.cart[existingIndex].quantity += quantity;
      State.cart[existingIndex].price = resolvedPrice;
      State.cart[existingIndex].weight = resolvedWeight;
      State.cart[existingIndex].image = resolvedImage;
      State.cart[existingIndex].maxStock = resolvedStock;
    } else {
      State.cart.push({
        id: product.id,
        name: product.name,
        price: resolvedPrice,
        weight: resolvedWeight,
        image: resolvedImage,
        variant: selectedVar,
        quantity: quantity,
        maxStock: resolvedStock
      });
    }

    saveState();
    updateBadges();
    renderCart();
    showToast(`✓ "${product.name}" ditambahkan ke keranjang!`, 'success');
  };

  window.updateCartQty = (index, delta) => {
    if (!State.cart[index]) return;
    const item = State.cart[index];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      window.removeFromCart(index);
      return;
    }

    if (newQty > item.maxStock) {
      showToast(`Maksimal pembelian untuk barang ini adalah ${item.maxStock} pcs`, 'danger');
      return;
    }

    item.quantity = newQty;
    saveState();
    updateBadges();
    renderCart();
  };

  window.removeFromCart = (index) => {
    if (!State.cart[index]) return;
    const removedItem = State.cart.splice(index, 1)[0];
    saveState();
    updateBadges();
    renderCart();
    showToast(`"${removedItem.name}" dihapus dari keranjang`, 'info');
  };

  let cartUniqueCode = Math.floor(100 + Math.random() * 899);

  const calculateCartTotals = () => {
    const subtotal = State.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let shipping = State.cart.length > 0 ? (State.settings.defaultShippingCost || 15000) : 0;
    let discount = 0;

    if (State.appliedVoucher && subtotal >= State.appliedVoucher.minPurchase) {
      if (State.appliedVoucher.type === 'percentage') {
        discount = Math.round((subtotal * State.appliedVoucher.value) / 100);
      } else if (State.appliedVoucher.type === 'fixed') {
        discount = State.appliedVoucher.value;
      } else if (State.appliedVoucher.type === 'shipping') {
        discount = Math.min(shipping, State.appliedVoucher.value);
      }
    }

    const baseTotal = Math.max(0, subtotal - discount + shipping);
    const grandTotal = baseTotal > 0 ? (baseTotal + cartUniqueCode) : 0;

    return { subtotal, shipping, discount, baseTotal, uniqueCode: cartUniqueCode, grandTotal };
  };

  const renderCart = () => {
    const container = document.getElementById('cartItemsContainer');
    const subtotalEl = document.getElementById('summarySubtotal');
    const discountEl = document.getElementById('summaryDiscount');
    const discountRow = document.getElementById('summaryDiscountRow');
    const shippingEl = document.getElementById('summaryShipping');
    const grandTotalEl = document.getElementById('summaryGrandTotal');
    const appliedInfo = document.getElementById('appliedVoucherInfo');

    if (!container) return;

    if (State.cart.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 40px 10px;">
          <div class="empty-state-icon">
            <i data-lucide="shopping-cart" size="30"></i>
          </div>
          <h4>Keranjang Anda Kosong</h4>
          <p>Yuk cari produk impian Anda dan belanja sekarang!</p>
          <button class="btn-primary" onclick="window.closeAllModals();">
            <span>Mulai Belanja</span>
          </button>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = 'Rp 0';
      if (discountRow) discountRow.style.display = 'none';
      if (shippingEl) shippingEl.textContent = 'Rp 0';
      if (grandTotalEl) grandTotalEl.textContent = 'Rp 0';
      if (appliedInfo) appliedInfo.innerHTML = '';
      refreshIcons();
      return;
    }

    container.innerHTML = State.cart.map((item, idx) => `
      <div class="cart-item">
        <a href="product.html?id=${item.id}" class="cart-item-img-link" title="Lihat ${item.name}">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        </a>
        <div class="cart-item-info">
          <div class="cart-item-header-row">
            <a href="product.html?id=${item.id}" class="cart-item-title">${item.name}</a>
            <button type="button" class="btn-remove-cart" onclick="window.removeFromCart(${idx})" title="Hapus produk" aria-label="Hapus ${item.name}">
              <i data-lucide="trash-2" size="16"></i>
            </button>
          </div>
          <div class="cart-item-variant">Varian: <strong>${item.variant}</strong></div>
          <div class="cart-item-bottom-row">
            <div class="cart-item-price">${formatRupiah(item.price)}</div>
            <div class="cart-item-qty">
              <button type="button" class="btn-qty" onclick="window.updateCartQty(${idx}, -1)" aria-label="Kurang">-</button>
              <span class="qty-number">${item.quantity}</span>
              <button type="button" class="btn-qty" onclick="window.updateCartQty(${idx}, 1)" aria-label="Tambah">+</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    const totals = calculateCartTotals();

    if (subtotalEl) subtotalEl.textContent = formatRupiah(totals.subtotal);
    if (shippingEl) shippingEl.textContent = formatRupiah(totals.shipping);

    if (totals.discount > 0) {
      if (discountRow) discountRow.style.display = 'flex';
      if (discountEl) discountEl.textContent = `- ${formatRupiah(totals.discount)}`;
      if (appliedInfo) {
        appliedInfo.innerHTML = `
          <div class="applied-voucher-badge">
            <i data-lucide="check" size="14"></i>
            <span>Voucher <strong>${State.appliedVoucher.code}</strong> aktif! (${State.appliedVoucher.label})</span>
            <button onclick="window.removeVoucher()" style="color:var(--danger); margin-left:6px; font-weight:bold;">✕</button>
          </div>
        `;
      }
    } else {
      if (discountRow) discountRow.style.display = 'none';
      if (appliedInfo) appliedInfo.innerHTML = '';
    }

    if (grandTotalEl) grandTotalEl.textContent = formatRupiah(totals.grandTotal);

    refreshIcons();
  };

  // ==========================================
  // VOUCHER LOGIC
  // ==========================================
  document.getElementById('btnApplyVoucher')?.addEventListener('click', () => {
    const input = document.getElementById('voucherInput');
    if (!input) return;
    const code = input.value.trim().toUpperCase();

    if (!code) {
      showToast('Masukkan kode voucher terlebih dahulu!', 'info');
      return;
    }

    const matched = DEFAULT_VOUCHERS.find(v => v.code === code);
    if (!matched) {
      showToast('Kode voucher tidak valid atau telah kadaluarsa!', 'danger');
      return;
    }

    const subtotal = State.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (subtotal < matched.minPurchase) {
      showToast(`Voucher ini minimal pembelanjaan ${formatRupiah(matched.minPurchase)}!`, 'danger');
      return;
    }

    State.appliedVoucher = matched;
    renderCart();
    showToast(`✓ Berhasil memasang voucher ${code}!`, 'success');
  });

  window.removeVoucher = () => {
    State.appliedVoucher = null;
    const input = document.getElementById('voucherInput');
    if (input) input.value = '';
    renderCart();
    showToast('Voucher dihapus', 'info');
  };

  // ==========================================
  // WISHLIST OPERATIONS
  // ==========================================
  window.toggleWishlist = (productId) => {
    const index = State.wishlist.indexOf(productId);
    const product = State.products.find(p => p.id === productId);

    if (index > -1) {
      State.wishlist.splice(index, 1);
      showToast(`"${product ? product.name : 'Produk'}" dihapus dari favorit`, 'info');
    } else {
      State.wishlist.push(productId);
      showToast(`❤ "${product ? product.name : 'Produk'}" ditambahkan ke favorit!`, 'success');
    }

    saveState();
    updateBadges();
    renderProducts();
    if (typeof window.refreshLatestProducts === 'function') window.refreshLatestProducts();
    renderWishlist();
  };

  const renderWishlist = () => {
    const container = document.getElementById('wishlistItemsContainer');
    if (!container) return;

    if (State.wishlist.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 40px 10px;">
          <div class="empty-state-icon">
            <i data-lucide="heart" size="30"></i>
          </div>
          <h4>Belum Ada Produk Favorit</h4>
          <p>Ketuk ikon hati pada produk untuk menyimpannya di sini.</p>
          <button class="btn-primary" onclick="window.closeAllModals();">
            <span>Jelajahi Produk</span>
          </button>
        </div>
      `;
      refreshIcons();
      return;
    }

    const wishlistedProducts = State.products.filter(p => State.wishlist.includes(p.id));

    container.innerHTML = wishlistedProducts.map(p => `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}" class="cart-item-img">
        <div class="cart-item-info">
          <h4 class="cart-item-title">${p.name}</h4>
          <div class="cart-item-variant">${p.category}</div>
          <div class="cart-item-price">${formatRupiah(p.price)}</div>
        </div>
        <button class="btn-primary" style="padding:6px 12px; font-size:0.75rem;" onclick="window.addToCart('${p.id}'); window.toggleWishlist('${p.id}');">
          <i data-lucide="plus" size="14"></i>
          <span>Beli</span>
        </button>
        <button type="button" class="btn-remove-cart" onclick="window.toggleWishlist('${p.id}')" title="Hapus">
          <i data-lucide="trash-2" size="18"></i>
        </button>
      </div>
    `).join('');

    refreshIcons();
  };

  // ==========================================
  // PRODUCT DETAIL MODAL
  // ==========================================
  window.viewProductDetail = (productId) => {
    const product = State.products.find(p => p.id === productId);
    if (!product) return;

    const modalBody = document.getElementById('productModalBody');
    if (!modalBody) return;

    const modalVariantItems = Array.isArray(product.variantItems) && product.variantItems.length > 0
      ? product.variantItems.map(v => ({
          type: v.type === 'Ukuran' ? 'Ukuran' : 'Warna',
          name: v.name || '',
          price: Number(v.price) || product.price || 0,
          label: `${v.type === 'Ukuran' ? 'Ukuran' : 'Warna'}: ${v.name}`
        }))
      : (Array.isArray(product.variants) ? product.variants.map(vStr => {
          const cleanStr = String(vStr || '').replace(/^(Ukuran|Warna)\s*:\s*/i, '').trim();
          const isUk = /^ukuran\s*:/i.test(vStr) || /(ukuran|size|gram|\bg\b|kg|ml|liter|\bl\b|\bs\b|\bm\b|xl|cm|mm|01|02|cup|oz)/i.test(cleanStr);
          const t = isUk ? 'Ukuran' : 'Warna';
          return { type: t, name: cleanStr, price: product.price || 0, label: `${t}: ${cleanStr}` };
        }) : []);

    State.selectedVariant = modalVariantItems.length > 0 ? modalVariantItems[0].label : null;
    State.selectedVariantPrice = modalVariantItems.length > 0 ? modalVariantItems[0].price : product.price;

    const tokopediaUrl = product.tokopediaUrl || State.settings.tokopediaUrl || 'https://www.tokopedia.com';
    const shopeeUrl = product.shopeeUrl || State.settings.shopeeUrl || 'https://shopee.co.id';
    const tiktokUrl = product.tiktokUrl || State.settings.tiktokUrl || 'https://www.tiktok.com';

    const rawModalPhotos = Array.isArray(product.images) && product.images.length > 0
      ? [...product.images]
      : (product.image ? [product.image] : []);
    const modalGalleryPhotos = [
      product.image || rawModalPhotos[0],
      ...rawModalPhotos.filter(u => u && u !== (product.image || rawModalPhotos[0]))
    ].filter(Boolean).slice(0, 6);

    modalBody.innerHTML = `
      <div class="product-detail-layout">
        <div style="display:flex; flex-direction:column; gap:10px;">
          <div class="product-detail-gallery">
            <img src="${modalGalleryPhotos[0] || product.image}" alt="${product.name}" id="detailMainImg">
          </div>
          ${modalGalleryPhotos.length > 1 ? `
            <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:6px;">
              ${modalGalleryPhotos.map((imgUrl, idx) => `
                <button type="button" onclick="document.getElementById('detailMainImg').src='${imgUrl}'; this.parentElement.querySelectorAll('button').forEach(b=>b.style.borderColor='var(--border-subtle)'); this.style.borderColor='var(--primary)';" style="padding:0; border-radius:8px; overflow:hidden; aspect-ratio:1/1; background:var(--bg-secondary); cursor:pointer; border:2px solid ${idx === 0 ? 'var(--primary)' : 'var(--border-subtle)'};">
                  <img src="${imgUrl}" alt="Foto ${idx + 1}" style="width:100%; height:100%; object-fit:cover; display:block;">
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div class="product-detail-info">
          <div class="detail-badge-row">
            <span class="category-pill" style="padding:4px 10px; font-size:0.72rem;">${product.category}</span>
            ${product.badge ? `<span class="card-badge popular" style="position:static;">${product.badge}</span>` : ''}
          </div>

          <h2 class="product-detail-title">${product.name}</h2>


          <div class="product-detail-price">
            <span id="modalDetailPriceText">${formatRupiah(State.selectedVariantPrice || product.price)}</span>
            ${product.originalPrice ? `<span class="price-original" style="font-size:0.9rem; margin-left:8px;">${formatRupiah(product.originalPrice)}</span>` : ''}
          </div>

          ${modalVariantItems.length > 0 ? `
            <div class="product-detail-variants" id="detailVariantsContainer" style="display:flex; flex-direction:column; gap:10px;">
              ${modalVariantItems.some(v => v.type === 'Ukuran') ? `
                <div>
                  <label style="font-size:0.8rem; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">📏 Pilih Variasi Ukuran:</label>
                  <div class="variants-pills">
                    ${modalVariantItems.filter(v => v.type === 'Ukuran').map((v) => `
                      <button type="button" class="variant-btn ${v.label === State.selectedVariant ? 'active' : ''}" onclick="window.selectDetailVariant('${v.label.replace(/'/g, "\\'")}', ${v.price}, this)">
                        <span>${v.name}</span>
                        <small style="display:block; font-size:0.66rem; opacity:0.85;">${formatRupiah(v.price)}</small>
                      </button>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
              ${modalVariantItems.some(v => v.type === 'Warna') ? `
                <div>
                  <label style="font-size:0.8rem; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:4px;">🎨 Pilih Variasi Warna:</label>
                  <div class="variants-pills">
                    ${modalVariantItems.filter(v => v.type === 'Warna').map((v) => `
                      <button type="button" class="variant-btn ${v.label === State.selectedVariant ? 'active' : ''}" onclick="window.selectDetailVariant('${v.label.replace(/'/g, "\\'")}', ${v.price}, this)">
                        <span>${v.name}</span>
                        <small style="display:block; font-size:0.66rem; opacity:0.85;">${formatRupiah(v.price)}</small>
                      </button>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <div class="stock-indicator ${product.stock <= 5 ? 'low' : ''}" style="margin-bottom:12px;">
            <i data-lucide="${product.stock <= 5 ? 'alert-triangle' : 'check-circle'}" size="14"></i>
            <span>Stok Tersedia: <strong>${product.stock} pcs</strong></span>
          </div>

          <div class="product-detail-desc">
            <strong>Deskripsi Produk:</strong><br>
            ${product.description}
          </div>

          <!-- Quantity Stepper & Buttons -->
          <div style="display:flex; flex-direction:column; gap:10px; margin-top:auto;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="cart-item-qty" style="padding:4px 8px;">
                <button type="button" class="btn-qty" onclick="window.changeDetailQty(-1)">-</button>
                <span class="qty-number" id="detailQtyNumber" style="font-size:1rem; min-width:30px;">1</span>
                <button type="button" class="btn-qty" onclick="window.changeDetailQty(1)">+</button>
              </div>
              <span style="font-size:0.8rem; color:var(--text-muted);">Pilih jumlah unit</span>
            </div>

            <div class="modal-detail-actions" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
              <button type="button" class="btn-add-cart" id="btnDetailAddToCart" style="padding:12px; border-radius:var(--radius-full);">
                <i data-lucide="shopping-bag" size="18"></i>
                <span>+ Keranjang</span>
              </button>
              <a href="product.html?id=${product.id}" class="btn-primary" style="padding:12px; border-radius:var(--radius-full); justify-content:center;">
                <i data-lucide="arrow-right" size="16"></i>
                <span>Buka Halaman Produk</span>
              </a>
            </div>

            <!-- Pemberitahuan Marketplace E-Commerce -->
            <div class="product-ecommerce-section" style="margin-top:8px;">
              <div class="ecommerce-notice-header">
                <div class="ecommerce-notice-title">
                  <i data-lucide="shopping-bag" size="16"></i>
                  <span>Produk Ini Tersedia di:</span>
                </div>
                <span class="ecommerce-official-badge">Toko Resmi</span>
              </div>
              <div class="ecommerce-links-grid">
                <a href="${tokopediaUrl}" target="_blank" rel="noopener noreferrer" class="ecommerce-link-card tokopedia" title="Tokopedia">
                  <div class="ecommerce-icon-wrap">
                    <svg class="ecommerce-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 8.5C4 7.67 4.67 7 5.5 7h13c.83 0 1.5.67 1.5 1.5V19c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V8.5z" fill="#03AC0E"/>
                      <path d="M8 7V5.5C8 3.57 9.57 2 11.5 2h1c1.93 0 3.5 1.57 3.5 3.5V7" stroke="#03AC0E" stroke-width="2" stroke-linecap="round"/>
                      <circle cx="9" cy="13.5" r="2.2" fill="#FFFFFF"/>
                      <circle cx="15" cy="13.5" r="2.2" fill="#FFFFFF"/>
                      <circle cx="9.4" cy="13.5" r="1.1" fill="#03AC0E"/>
                      <circle cx="15.4" cy="13.5" r="1.1" fill="#03AC0E"/>
                      <path d="M10.8 17.2c.7.4 1.7.4 2.4 0" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <span class="ecommerce-store-name">Tokopedia</span>
                </a>

                <a href="${shopeeUrl}" target="_blank" rel="noopener noreferrer" class="ecommerce-link-card shopee" title="Shopee">
                  <div class="ecommerce-icon-wrap">
                    <svg class="ecommerce-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.2 8H4.8C4.36 8 4 8.36 4 8.8l1.3 12.2c.1.9.9 1.6 1.8 1.6h9.8c.9 0 1.7-.7 1.8-1.6L20 8.8c0-.44-.36-.8-.8-.8z" fill="#EE4D2D"/>
                      <path d="M8 8V5.5C8 3.57 9.57 2 11.5 2h1c1.93 0 3.5 1.57 3.5 3.5V8" stroke="#EE4D2D" stroke-width="2" stroke-linecap="round"/>
                      <path d="M14.2 12.3c-.3-.2-.8-.4-1.4-.5-.8-.2-1.2-.4-1.2-.8 0-.4.3-.6.9-.6.6 0 1.1.2 1.5.5l.6-1.1c-.6-.4-1.3-.6-2.1-.6-1.4 0-2.3.8-2.3 1.9 0 .9.6 1.4 1.6 1.7.8.2 1.1.4 1.1.8 0 .4-.4.7-1 .7-.7 0-1.3-.3-1.8-.7l-.6 1.1c.7.5 1.4.8 2.4.8 1.5 0 2.4-.8 2.4-2 0-.8-.6-1.4-1.5-1.7z" fill="#FFFFFF"/>
                    </svg>
                  </div>
                  <span class="ecommerce-store-name">Shopee</span>
                </a>

                <a href="${tiktokUrl}" target="_blank" rel="noopener noreferrer" class="ecommerce-link-card tiktok" title="TikTok Shop">
                  <div class="ecommerce-icon-wrap">
                    <svg class="ecommerce-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="6" fill="#000000"/>
                      <path d="M16.8 8.2a4.2 4.2 0 0 1-2.8-1.2v6a4.2 4.2 0 1 1-3.6-4.1v2.3a2 2 0 1 0 1.4 1.9V4h2.2c.1 1.6 1.2 2.8 2.8 3.2v1z" fill="#FFFFFF"/>
                      <path d="M16.3 8a4.2 4.2 0 0 1-2.3-1v6a4.2 4.2 0 0 1-3.6 4.1c-.3 0-.5 0-.8-.1 1.7 1.3 4.2.8 5.3-.9.3-.5.4-1.1.4-1.7V8.5c.3.1.7.2 1 .2V8z" fill="#25F4EE" opacity="0.85"/>
                      <path d="M14.8 4h-.9v7.7c0 1.9-1.2 3.6-3 4.1-.3.1-.6.1-.9.1 1.9 1 4.3.1 5.1-1.8.2-.5.3-1.1.3-1.6V5.9c.7.4 1.5.6 2.3.7V4.8c-.9-.1-1.9-.9-2.6-1.8V4z" fill="#FE2C55" opacity="0.85"/>
                    </svg>
                  </div>
                  <span class="ecommerce-store-name">TikTok Shop</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    refreshIcons();

    // Attach listeners
    let currentQty = 1;
    window.changeDetailQty = (delta) => {
      const newQty = currentQty + delta;
      if (newQty >= 1 && newQty <= product.stock) {
        currentQty = newQty;
        document.getElementById('detailQtyNumber').textContent = currentQty;
      }
    };

    window.selectDetailVariant = (variantName, variantPrice, btn) => {
      State.selectedVariant = variantName;
      State.selectedVariantPrice = Number(variantPrice) || product.price;
      const priceEl = document.getElementById('modalDetailPriceText');
      if (priceEl) priceEl.textContent = formatRupiah(State.selectedVariantPrice);
      document.querySelectorAll('#detailVariantsContainer .variant-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
    };

    document.getElementById('btnDetailAddToCart')?.addEventListener('click', () => {
      window.addToCart(product.id, State.selectedVariant, currentQty, State.selectedVariantPrice);
      window.closeAllModals();
      window.openCart();
    });

    document.getElementById('btnDetailBuyNow')?.addEventListener('click', () => {
      window.addToCart(product.id, State.selectedVariant, currentQty, State.selectedVariantPrice);
      window.closeAllModals();
      window.openCheckout();
    });

    // Open Modal
    document.getElementById('productModalOverlay')?.classList.add('open');
  };

  // ==========================================
  // PAYMENT METHODS & CHECKOUT (Selesaikan Pembayaran BCA / BRI)
  // ==========================================
  const modalBankDetails = {
    bca: {
      name: 'BCA',
      label: 'Nomor Rekening BCA',
      number: '8720192831',
      displayNumber: '8720.192.831',
      holder: 'ALAT KOPI MALANG',
      badgeClass: 'bca'
    },
    bri: {
      name: 'BRI',
      label: 'Nomor Rekening BRI',
      number: '034101002345501',
      displayNumber: '0341.0100.2345.501',
      holder: 'ALAT KOPI MALANG',
      badgeClass: 'bri'
    }
  };

  const getFormattedExpiryDate = () => {
    const d = new Date(Date.now() + 3 * 3600 * 1000);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dayName = days[d.getDay()];
    const day = d.getDate();
    const monthName = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${dayName}, ${day} ${monthName} ${year} ${hours}:${minutes} WIB`;
  };

  let cachedModalExpiryDate = getFormattedExpiryDate();

  const renderPaymentInstructions = (method = 'bca') => {
    State.selectedPaymentMethod = (method === 'bri') ? 'bri' : 'bca';
    const bank = modalBankDetails[State.selectedPaymentMethod];
    const totals = calculateCartTotals();

    const expiryEl = document.getElementById('modalExpiryDate');
    if (expiryEl) expiryEl.textContent = cachedModalExpiryDate;

    const labelEl = document.getElementById('modalAccountLabel');
    if (labelEl) labelEl.textContent = bank.label;

    const numEl = document.getElementById('modalAccountNumber');
    if (numEl) numEl.textContent = bank.displayNumber || bank.number;

    const nameEl = document.getElementById('modalBankName');
    if (nameEl) nameEl.textContent = bank.name;

    const totalEl = document.getElementById('modalTotalAmount');
    if (totalEl) totalEl.textContent = formatRupiah(totals.grandTotal);

    const badgeEl = document.getElementById('modalBankBadge');
    if (badgeEl) {
      badgeEl.innerHTML = `<div class="bank-logo-icon ${bank.badgeClass}" style="width:48px; height:26px; font-size:0.72rem; border-radius:4px;">${bank.name}</div>`;
    }

    document.querySelectorAll('#modalBankSelector .bank-choice-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.bank === State.selectedPaymentMethod);
    });

    refreshIcons();
  };

  window.copyPaymentText = (text, label) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`✓ ${label} berhasil disalin: ${text}`, 'success');
      }).catch(() => {
        fallbackCopy(text, label);
      });
    } else {
      fallbackCopy(text, label);
    }
  };

  window.copyPaymentAmount = (rawAmount, label) => {
    window.copyPaymentText(String(rawAmount), label);
  };

  const fallbackCopy = (text, label) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(`✓ ${label} berhasil disalin!`, 'success');
  };

  document.getElementById('modalBtnCopyAccount')?.addEventListener('click', () => {
    const bank = modalBankDetails[State.selectedPaymentMethod] || modalBankDetails.bca;
    window.copyPaymentText(bank.number, bank.label);
  });

  document.getElementById('modalBtnCopyAmount')?.addEventListener('click', () => {
    const totals = calculateCartTotals();
    window.copyPaymentAmount(totals.grandTotal, 'Total Pembayaran');
  });

  document.querySelectorAll('#modalBankSelector .bank-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      renderPaymentInstructions(btn.dataset.bank);
    });
  });

  // Open Checkout
  window.openCheckout = () => {
    if (State.cart.length === 0) {
      showToast('Keranjang belanja Anda masih kosong!', 'info');
      return;
    }
    cachedModalExpiryDate = getFormattedExpiryDate();
    renderPaymentInstructions(State.selectedPaymentMethod || 'bca');
    document.getElementById('checkoutOverlay')?.classList.add('open');
  };

  // ==========================================
  // WHATSAPP DIRECT CHECKOUT & ORDER CREATION
  // ==========================================
  const generateOrderId = () => {
    return 'NEX-' + Math.floor(100000 + Math.random() * 900000);
  };

  const validateCheckoutForm = () => {
    const name = document.getElementById('custName')?.value.trim();
    const phone = document.getElementById('custPhone')?.value.trim();
    const address = document.getElementById('custAddress')?.value.trim();
    const city = document.getElementById('custCity')?.value.trim();
    const courier = document.getElementById('custCourier')?.value;
    const note = document.getElementById('cartOrderNote')?.value.trim() || '-';

    if (!name || !phone || !address || !city) {
      showToast('Harap lengkapi semua kolom bertanda bintang (*)!', 'danger');
      return null;
    }

    return { name, phone, address, city, courier, note };
  };

  const processOrder = (isWhatsAppCheckout = true, mode = 'confirm') => {
    const customer = validateCheckoutForm();
    if (!customer) return null;

    const totals = calculateCartTotals();
    const orderId = generateOrderId();
    const currentDate = new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const bank = modalBankDetails[State.selectedPaymentMethod] || modalBankDetails.bca;
    const nowTime = new Date();
    const createdAt = nowTime.toISOString();
    const expiresAt = new Date(nowTime.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const newOrder = {
      id: orderId,
      date: currentDate,
      createdAt,
      expiresAt,
      customer: customer,
      items: [...State.cart],
      voucher: State.appliedVoucher ? State.appliedVoucher.code : null,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      discount: totals.discount,
      uniqueCode: totals.uniqueCode,
      grandTotal: totals.grandTotal,
      paymentMethod: `Transfer Bank ${bank.name} (Verifikasi Manual)`,
      bankName: bank.name,
      accountNumber: bank.number,
      accountHolder: bank.holder,
      status: mode === 'confirm' ? 'Menunggu Verifikasi Pembayaran' : 'Menunggu Pembayaran'
    };

    // Deduct stock in products
    State.cart.forEach(cartItem => {
      const prod = State.products.find(p => p.id === cartItem.id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - cartItem.quantity);
      }
    });

    // Save order
    State.orders.unshift(newOrder);
    
    // Clear cart & voucher
    State.cart = [];
    State.appliedVoucher = null;
    saveState();
    updateBadges();
    renderProducts();

    if (isWhatsAppCheckout) {
      const itemsListText = newOrder.items.map((item, i) => 
        `${i + 1}. *${item.name}* (${item.variant})\n   Qty: ${item.quantity} x ${formatRupiah(item.price)} = ${formatRupiah(item.price * item.quantity)}`
      ).join('\n\n');

      let waText = '';
      if (mode === 'confirm') {
        waText = 
`Halo Admin ${State.settings.storeName}, saya telah melakukan transfer pembayaran pesanan:

━━━━━━━━━━━━━━━━━━━
💳 *KONFIRMASI PEMBAYARAN (#${orderId})*
━━━━━━━━━━━━━━━━━━━
📅 Tanggal: ${currentDate}

👤 *DATA PENERIMA:*
• Nama: ${customer.name}
• No. WhatsApp: ${customer.phone}
• Alamat: ${customer.address}
• Kota/Kab: ${customer.city}
• Ekspedisi: ${customer.courier}
• Catatan: ${customer.note}

📦 *DAFTAR ITEM:*
${itemsListText}

━━━━━━━━━━━━━━━━━━━
• Subtotal: ${formatRupiah(newOrder.subtotal)}
${newOrder.discount > 0 ? `• Diskon Voucher: -${formatRupiah(newOrder.discount)}\n` : ''}• Ongkos Kirim: ${formatRupiah(newOrder.shipping)}
• Kode Unik: +Rp ${newOrder.uniqueCode}
💰 *TOTAL TRANSFER: ${formatRupiah(newOrder.grandTotal)}*
🏦 Rekening Tujuan: Bank ${bank.name} (${bank.number} a/n ${bank.holder})
━━━━━━━━━━━━━━━━━━━

Berikut saya lampirkan bukti transfer pembayaran saya. Mohon pesanan segera diproses ya min. Terima kasih! 🙏`;
      } else {
        waText = 
`Halo Admin ${State.settings.storeName}, saya ingin melakukan pemesanan via WhatsApp:

━━━━━━━━━━━━━━━━━━━
🛒 *DETAIL PESANAN (#${orderId})*
━━━━━━━━━━━━━━━━━━━
📅 Tanggal: ${currentDate}

👤 *DATA PENERIMA:*
• Nama: ${customer.name}
• No. WhatsApp: ${customer.phone}
• Alamat: ${customer.address}
• Kota/Kab: ${customer.city}
• Ekspedisi: ${customer.courier}
• Catatan: ${customer.note}

📦 *DAFTAR PRODUK:*
${itemsListText}

━━━━━━━━━━━━━━━━━━━
• Subtotal: ${formatRupiah(newOrder.subtotal)}
${newOrder.discount > 0 ? `• Diskon Voucher: -${formatRupiah(newOrder.discount)}\n` : ''}• Ongkos Kirim: ${formatRupiah(newOrder.shipping)}
• Kode Unik: +Rp ${newOrder.uniqueCode}
💰 *TOTAL AKHIR: ${formatRupiah(newOrder.grandTotal)}*
• Metode Bayar: Transfer Bank ${bank.name}
• Rekening Tujuan: ${bank.name} (${bank.number} a/n ${bank.holder})
━━━━━━━━━━━━━━━━━━━

Mohon instruksi dan konfirmasi ketersediaan barangnya ya min. Terima kasih! 🙏`;
      }

      const targetNumber = State.settings.whatsappNumber || '6282132095241';
      const encodedUrl = `https://api.whatsapp.com/send?phone=${targetNumber}&text=${encodeURIComponent(waText)}`;

      window.open(encodedUrl, '_blank');
    }

    // Show digital receipt modal
    window.showReceiptModal(newOrder);

    return newOrder;
  };

  document.getElementById('btnModalConfirmPayment')?.addEventListener('click', () => {
    processOrder(true, 'confirm');
  });

  document.getElementById('btnCheckoutWhatsApp')?.addEventListener('click', () => {
    processOrder(true, 'direct');
  });

  document.getElementById('btnConfirmWebOrder')?.addEventListener('click', () => {
    processOrder(false, 'receipt');
  });

  // ==========================================
  // RECEIPT / INVOICE MODAL
  // ==========================================
  window.showReceiptModal = (order) => {
    window.closeAllModals();
    const receiptBox = document.getElementById('receiptContent');
    if (!receiptBox) return;

    receiptBox.innerHTML = `
      <div class="receipt-paper">
        <div class="receipt-header">
          <div class="receipt-title">${State.settings.storeName}</div>
          <div style="font-size:0.75rem; color:#64748b;">${State.settings.storeAddress}</div>
          <div class="receipt-status-badge">✓ Pesanan Berhasil Dibuat</div>
          <div style="font-size:0.78rem; font-weight:700; margin-top:8px;">No. Pesanan: #${order.id}</div>
          <div style="font-size:0.72rem; color:#64748b;">${order.date}</div>
        </div>

        <div style="margin-bottom:12px; font-size:0.8rem; line-height:1.4;">
          <strong>Tujuan Pengiriman:</strong><br>
          ${order.customer.name} (${order.customer.phone})<br>
          ${order.customer.address}, ${order.customer.city}<br>
          <span style="color:#64748b;">Kurir: ${order.customer.courier} | Bayar: ${order.paymentMethod}</span>
        </div>

        <table class="receipt-table">
          <thead>
            <tr style="text-align:left; border-bottom:2px solid #e2e8f0; font-size:0.78rem;">
              <th>Item</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>
                  <strong>${item.name}</strong><br>
                  <span style="font-size:0.72rem; color:#64748b;">${item.variant}</span>
                </td>
                <td style="text-align:center;">${item.quantity}</td>
                <td style="text-align:right; font-weight:600;">${formatRupiah(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display:flex; flex-direction:column; gap:4px; font-size:0.82rem; margin-top:8px;">
          <div style="display:flex; justify-content:space-between;">
            <span>Subtotal</span>
            <span>${formatRupiah(order.subtotal)}</span>
          </div>
          ${order.discount > 0 ? `
            <div style="display:flex; justify-content:space-between; color:var(--success);">
              <span>Diskon (${order.voucher})</span>
              <span>- ${formatRupiah(order.discount)}</span>
            </div>
          ` : ''}
          <div style="display:flex; justify-content:space-between;">
            <span>Ongkos Kirim</span>
            <span>${formatRupiah(order.shipping)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; color:#d97706; font-weight:600;">
            <span>Kode Unik Verifikasi</span>
            <span>+ Rp ${order.uniqueCode || 0}</span>
          </div>
          <div class="receipt-total-row">
            <span>TOTAL TRANSFER</span>
            <span style="color:#d97706; font-size:1.15rem;">${formatRupiah(order.grandTotal)}</span>
          </div>
        </div>

        <div style="background:var(--bg-secondary); border-left:3px solid #617a55; padding:10px 12px; margin:14px 0 8px 0; border-radius:6px; font-size:0.8rem; text-align:left;">
          <strong>Instruksi Transfer Bank ${order.bankName || 'BCA'}:</strong><br>
          Bank: <strong>Bank ${order.bankName || 'BCA'}</strong><br>
          No. Rekening: <code style="font-weight:800; font-size:0.95rem; color:#617a55;">${order.accountNumber || '8720192831'}</code><br>
          Atas Nama: <strong>${order.accountHolder || 'ALAT KOPI MALANG'}</strong><br>
          Nominal: <strong style="color:#d97706; font-size:0.95rem;">${formatRupiah(order.grandTotal)}</strong><br>
          <span style="font-size:0.72rem; color:#64748b;">(Mohon transfer tepat sampai 3 digit angka terakhir)</span>
        </div>

        <a href="https://wa.me/${State.settings.whatsappNumber || '6282132095241'}?text=${encodeURIComponent('Halo Admin ' + State.settings.storeName + ', saya ingin konfirmasi pembayaran untuk pesanan #' + order.id + ' sebesar ' + formatRupiah(order.grandTotal) + ' via Bank ' + (order.bankName || 'BCA'))}" target="_blank" class="btn-whatsapp-checkout" style="padding:10px 14px; font-size:0.82rem; margin-top:12px; text-decoration:none;">
          <i data-lucide="message-circle" size="18"></i>
          <span>Konfirmasi Bukti Transfer via WhatsApp</span>
        </a>

        <div style="text-align:center; margin-top:20px; font-size:0.72rem; color:#94a3b8;">
          Terima kasih telah berbelanja di ${State.settings.storeName}!<br>
          Simpan bukti pemesanan ini untuk pelacakan pengiriman.
        </div>
      </div>
    `;
    refreshIcons();

    document.getElementById('receiptOverlay')?.classList.add('open');
  };

  document.getElementById('btnPrintReceipt')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('btnFinishReceipt')?.addEventListener('click', () => {
    window.closeAllModals();
    showToast('Terima kasih atas pesanan Anda!', 'success');
  });

  // ==========================================
  // ADMIN & SELLER DASHBOARD
  // ==========================================
  const renderAdminDashboard = () => {
    // Stats
    const totalRev = State.orders.reduce((sum, o) => sum + o.grandTotal, 0);
    const totalOrd = State.orders.length;
    const totalItems = State.orders.reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0), 0);

    const revEl = document.getElementById('statTotalRevenue');
    const ordEl = document.getElementById('statTotalOrders');
    const soldEl = document.getElementById('statItemsSold');
    const badgeOrdersCount = document.getElementById('adminOrdersCount');
    const badgeProductsCount = document.getElementById('adminProductsCount');

    if (revEl) revEl.textContent = formatRupiah(totalRev);
    if (ordEl) ordEl.textContent = totalOrd;
    if (soldEl) soldEl.textContent = totalItems + ' pcs';
    if (badgeOrdersCount) badgeOrdersCount.textContent = totalOrd;
    if (badgeProductsCount) badgeProductsCount.textContent = State.products.length;

    // Render Orders Tab
    const ordersContainer = document.getElementById('adminOrdersContainer');
    if (ordersContainer) {
      if (State.orders.length === 0) {
        ordersContainer.innerHTML = `
          <div class="empty-state" style="padding:30px;">
            <p>Belum ada pesanan masuk.</p>
          </div>
        `;
      } else {
        ordersContainer.innerHTML = State.orders.map((ord, idx) => `
          <div style="background:var(--bg-secondary); border-radius:var(--radius-md); padding:14px; margin-bottom:12px; border:1px solid var(--border-subtle);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <div>
                <strong>Order #${ord.id}</strong>
                <span style="font-size:0.75rem; color:var(--text-muted); margin-left:6px;">${ord.date}</span>
              </div>
              <span class="category-pill" style="padding:3px 10px; font-size:0.72rem; background:var(--primary-light); color:var(--primary); font-weight:700;">
                ${ord.status}
              </span>
            </div>
            <div style="font-size:0.82rem; margin-bottom:8px;">
              <strong>${ord.customer.name}</strong> (${ord.customer.phone}) | ${ord.customer.city}<br>
              <span style="color:var(--text-muted);">Kurir: ${ord.customer.courier} | Total: <strong style="color:var(--primary);">${formatRupiah(ord.grandTotal)}</strong> (${ord.paymentMethod})</span>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <select class="form-select" style="padding:4px 8px; font-size:0.75rem; width:auto;" onchange="window.updateOrderStatus(${idx}, this.value)">
                <option value="Menunggu Pembayaran" ${ord.status === 'Menunggu Pembayaran' ? 'selected' : ''}>Menunggu Pembayaran</option>
                <option value="Diproses & Dikemas" ${ord.status === 'Diproses & Dikemas' ? 'selected' : ''}>Diproses & Dikemas</option>
                <option value="Sedang Dikirim" ${ord.status === 'Sedang Dikirim' ? 'selected' : ''}>Sedang Dikirim</option>
                <option value="Pesanan Selesai" ${ord.status === 'Pesanan Selesai' ? 'selected' : ''}>Pesanan Selesai</option>
              </select>
              <a href="https://wa.me/${ord.customer.phone.replace(/[^0-9]/g, '')}" target="_blank" class="btn-primary" style="padding:4px 10px; font-size:0.75rem;">
                <i data-lucide="message-circle" size="14"></i> Chat Pembeli
              </a>
            </div>
          </div>
        `).join('');
      }
    }

    // Render Products Table
    const tableBody = document.getElementById('adminProductsTableBody');
    if (tableBody) {
      tableBody.innerHTML = State.products.map(p => `
        <tr>
          <td><img src="${p.image}" alt="" style="width:40px; height:40px; object-fit:cover; border-radius:6px;"></td>
          <td><strong>${p.name}</strong></td>
          <td>${p.category}</td>
          <td>${formatRupiah(p.price)}</td>
          <td>
            <input type="number" value="${p.stock}" style="width:60px; padding:3px 6px; border:1px solid var(--border-subtle); border-radius:4px;" 
              onchange="window.updateProductStock('${p.id}', this.value)">
          </td>
          <td>
            <button onclick="window.deleteProduct('${p.id}')" style="color:var(--danger); padding:4px 8px;" title="Hapus Produk">
              <i data-lucide="trash-2" size="16"></i>
            </button>
          </td>
        </tr>
      `).join('');
    }

    // Settings fields
    const setStoreName = document.getElementById('settingStoreName');
    const setStoreWA = document.getElementById('settingStoreWA');
    const setStoreAddr = document.getElementById('settingStoreAddress');
    const setShipping = document.getElementById('settingShippingCost');

    if (setStoreName) setStoreName.value = State.settings.storeName;
    if (setStoreWA) setStoreWA.value = State.settings.whatsappNumber;
    if (setStoreAddr) setStoreAddr.value = State.settings.storeAddress;
    if (setShipping) setShipping.value = State.settings.defaultShippingCost;

    refreshIcons();
  };

  window.updateOrderStatus = (orderIndex, newStatus) => {
    if (State.orders[orderIndex]) {
      State.orders[orderIndex].status = newStatus;
      saveState();
      showToast(`Status pes #${State.orders[orderIndex].id} diubah ke "${newStatus}"`, 'info');
      renderAdminDashboard();
    }
  };

  window.updateProductStock = (productId, newStock) => {
    const prod = State.products.find(p => p.id === productId);
    if (prod) {
      prod.stock = Math.max(0, parseInt(newStock) || 0);
      saveState();
      renderProducts();
      showToast(`Stok "${prod.name}" diperbarui ke ${prod.stock} pcs`, 'info');
    }
  };

  window.deleteProduct = (productId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini dari katalog?')) return;
    State.products = State.products.filter(p => p.id !== productId);
    saveState();
    renderProducts();
    renderAdminDashboard();
    showToast('Produk berhasil dihapus!', 'info');
  };

  // Add Product Action
  document.getElementById('btnSaveNewProduct')?.addEventListener('click', () => {
    const name = document.getElementById('newProdName')?.value.trim();
    const category = document.getElementById('newProdCategory')?.value;
    const badge = document.getElementById('newProdBadge')?.value.trim();
    const price = parseInt(document.getElementById('newProdPrice')?.value) || 0;
    const origPrice = parseInt(document.getElementById('newProdOriginalPrice')?.value) || 0;
    const stock = parseInt(document.getElementById('newProdStock')?.value) || 10;
    const image = document.getElementById('newProdImageSelect')?.value || 'images/smartwatch.jpg';
    const variantsStr = document.getElementById('newProdVariants')?.value.trim();
    const desc = document.getElementById('newProdDesc')?.value.trim();

    if (!name || price <= 0 || !desc) {
      showToast('Harap isi Nama, Harga jual, dan Deskripsi produk!', 'danger');
      return;
    }

    const variants = variantsStr ? variantsStr.split(',').map(v => v.trim()).filter(Boolean) : ['Standar'];

    const newProd = {
      id: 'prod-' + Date.now(),
      name,
      category,
      price,
      originalPrice: origPrice > price ? origPrice : null,
      badge: badge || 'Baru',
      image,
      rating: 5.0,
      reviewsCount: 1,
      stock,
      variants,
      description: desc,
      featured: false
    };

    State.products.unshift(newProd);
    saveState();
    renderProducts();
    renderAdminDashboard();
    showToast('✓ Produk baru berhasil diterbitkan!', 'success');

    // Switch to products tab
    document.querySelector('.admin-tab-btn[data-tab="tab-products"]')?.click();
  });

  // Save Store Settings
  document.getElementById('btnSaveStoreSettings')?.addEventListener('click', () => {
    State.settings.storeName = document.getElementById('settingStoreName')?.value.trim() || 'Alat Kopi Malang';
    State.settings.whatsappNumber = document.getElementById('settingStoreWA')?.value.trim().replace(/[^0-9]/g, '') || '6282132095241';
    State.settings.storeAddress = document.getElementById('settingStoreAddress')?.value.trim() || 'Malang';
    State.settings.defaultShippingCost = parseInt(document.getElementById('settingShippingCost')?.value) || 15000;

    saveState();
    
    // Update store branding in navigation
    const navTitle = document.getElementById('storeTitleNav');
    if (navTitle) navTitle.textContent = State.settings.storeName;

    showToast('✓ Pengaturan toko berhasil disimpan!', 'success');
  });

  // Reset to default sample data
  document.getElementById('btnResetDefaultData')?.addEventListener('click', () => {
    if (!confirm('Yakin ingin mereset seluruh data produk, order, dan keranjang ke pengaturan awal?')) return;
    localStorage.clear();
    State.products = DEFAULT_PRODUCTS;
    State.cart = [];
    State.wishlist = [];
    State.orders = [];
    State.settings = DEFAULT_SETTINGS;
    saveState();
    location.reload();
  });

  // Admin Tab Navigation
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');

      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.style.display = 'block';
    });
  });

  // ==========================================
  // MODAL / DRAWER CONTROLS
  // ==========================================
  window.closeAllModals = () => {
    document.querySelectorAll('.modal-overlay').forEach(el => el.classList.remove('open'));
    document.getElementById('cartDrawer')?.classList.remove('open');
    document.getElementById('wishlistDrawer')?.classList.remove('open');
  };

  window.openCart = () => {
    renderCart();
    document.getElementById('cartOverlay')?.classList.add('open');
    document.getElementById('cartDrawer')?.classList.add('open');
  };

  window.openWishlist = () => {
    renderWishlist();
    document.getElementById('wishlistOverlay')?.classList.add('open');
    document.getElementById('wishlistDrawer')?.classList.add('open');
  };

  window.openAdmin = () => {
    renderAdminDashboard();
    document.getElementById('adminOverlay')?.classList.add('open');
  };

  // Header and Navigation Bindings
  document.getElementById('btnOpenCart')?.addEventListener('click', window.openCart);
  document.getElementById('navCart')?.addEventListener('click', window.openCart);

  document.getElementById('btnOpenWishlist')?.addEventListener('click', window.openWishlist);
  document.getElementById('navWishlist')?.addEventListener('click', window.openWishlist);

  document.getElementById('btnOpenAdmin')?.addEventListener('click', window.openAdmin);
  document.getElementById('navAdmin')?.addEventListener('click', window.openAdmin);

  // Close buttons
  document.getElementById('btnCloseCart')?.addEventListener('click', window.closeAllModals);
  document.getElementById('btnCloseCheckout')?.addEventListener('click', window.closeAllModals);
  document.getElementById('btnCloseProductModal')?.addEventListener('click', window.closeAllModals);
  document.getElementById('btnCloseWishlist')?.addEventListener('click', window.closeAllModals);
  document.getElementById('btnCloseAdmin')?.addEventListener('click', window.closeAllModals);
  document.getElementById('btnCloseReceipt')?.addEventListener('click', window.closeAllModals);

  // Overlay click to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        window.closeAllModals();
      }
    });
  });

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeAllModals();
    }
  });

  // Proceed from Cart to Checkout
  document.getElementById('btnProceedCheckout')?.addEventListener('click', () => {
    if (State.cart.length === 0) {
      showToast('Keranjang Anda masih kosong!', 'info');
      return;
    }
    window.closeAllModals();
    window.openCheckout();
  });

  // ==========================================
  // SHOP PAGE & CATEGORY ROUTING
  // ==========================================
  const isShopPage = typeof window !== 'undefined' && (
    window.location.pathname.toLowerCase().includes('shop.html') || 
    window.location.pathname.toLowerCase().endsWith('/shop')
  );

  const CATEGORY_META = {
    'ALL': {
      title: 'Katalog Belanja',
      subtitle: 'Temukan koleksi mesin espresso, manual grinder, gadget, dan perlengkapan gaya hidup terlengkap dengan garansi resmi.',
      badge: 'Katalog Lengkap'
    },
    'Produk Terbaru': {
      title: 'Koleksi Produk Terbaru',
      subtitle: 'Menampilkan produk peralatan seduh kopi, manual grinder, dan mesin espresso yang baru saja hadir di Alat Kopi Malang.',
      badge: 'Produk Terbaru'
    },
    'Mesin Espresso': {
      title: 'Koleksi Mesin Espresso',
      subtitle: 'Mesin espresso berkualitas tinggi dengan ekstraksi presisi untuk standar barista terbaik.',
      badge: 'Mesin Kopi'
    },
    'Manual Grinder': {
      title: 'Manual Coffee Grinder',
      subtitle: 'Hand grinder presisi tinggi dengan burr baja premium untuk gilingan kopi konsisten dan nikmat.',
      badge: 'Grinder Manual'
    },
    'Grinder Listrik': {
      title: 'Grinder Kopi Listrik',
      subtitle: 'Penggiling kopi elektrik otomatis bertenaga dengan pengaturan mikro dari espresso hingga filter.',
      badge: 'Grinder Elektrik'
    },
    'Manual Brew': {
      title: 'Manual Brew & Pour Over',
      subtitle: 'Peralatan seduh manual dripper, server, dan kettle untuk kreasi kopi pour over berkelas.',
      badge: 'Seduh Manual'
    },
    'Gadget & Elektronik': {
      title: 'Gadget & Elektronik',
      subtitle: 'Smartwatch retina, headphone noise cancelling, dan gadget pintar penunjang produktivitas.',
      badge: 'Smart Devices'
    },
    'Fashion & Sepatu': {
      title: 'Fashion & Sepatu',
      subtitle: 'Sneakers urban inovatif dan pakaian stylish dengan kenyamanan maksimal.',
      badge: 'Urban Apparel'
    },
    'Aksesoris & Tas': {
      title: 'Aksesoris & Tas',
      subtitle: 'Tas ransel tahan cuaca, pouch, dan aksesoris fungsional untuk gaya hidup dinamis.',
      badge: 'Aksesoris'
    },
    'Lifestyle & Rumah': {
      title: 'Lifestyle & Rumah',
      subtitle: 'Dekorasi estetis, diffuser aromaterapi, dan produk pilihan untuk suasana hunian nyaman.',
      badge: 'Gaya Hidup'
    }
  };

  const updateShopHeaderInfo = (categoryName) => {
    if (!isShopPage) return;
    const headingEl = document.getElementById('shopHeading');
    const descEl = document.getElementById('shopDesc');
    const breadcrumbEl = document.getElementById('shopBreadcrumbCurrent');
    const storeName = State.settings?.storeName || 'Alat Kopi Malang';

    if (categoryName && categoryName.startsWith('Brand: ')) {
      const bName = categoryName.replace('Brand: ', '').trim();
      if (headingEl) headingEl.textContent = `Koleksi Brand: ${bName}`;
      if (descEl) descEl.textContent = `Menampilkan seluruh katalog produk resmi dan original dari brand ${bName}.`;
      if (breadcrumbEl) breadcrumbEl.textContent = `Brand: ${bName}`;
      document.title = `Brand ${bName} - ${storeName}`;
      return;
    }

    const meta = CATEGORY_META[categoryName] || {
      title: categoryName || 'Katalog Belanja',
      subtitle: `Menampilkan seluruh produk dalam kategori ${categoryName || ''}.`
    };

    if (headingEl) headingEl.textContent = meta.title;
    if (descEl) descEl.textContent = meta.subtitle;
    if (breadcrumbEl) breadcrumbEl.textContent = (!categoryName || categoryName === 'ALL') ? 'Semua Produk' : categoryName;

    document.title = `${meta.title} - ${storeName}`;
  };

  // ==========================================
  // CATEGORY NAVIGATION & SELECTION CONTROLLER
  // ==========================================
  window.selectCategory = (categoryName) => {
    // If not currently on shop.html, redirect directly to shop page with query parameter
    if (!isShopPage) {
      const targetParam = (categoryName && categoryName !== 'ALL')
        ? `?category=${encodeURIComponent(categoryName)}`
        : '';
      window.location.href = `shop.html${targetParam}`;
      return;
    }

    // On shop.html: filter in-place and push state
    State.currentCategory = categoryName;
    State.filterBrand = null;
    State.filterPromoOnly = false;
    State.filterFeaturedOnly = false;
    State.searchQuery = '';
    State.currentPage = 1;
    
    const desktopSearch = document.getElementById('desktopSearchInput');
    const mobileSearch = document.getElementById('mobileSearchInput');
    if (desktopSearch) desktopSearch.value = '';
    if (mobileSearch) mobileSearch.value = '';

    // Update URL history state without reloading the page
    try {
      const newUrl = (categoryName && categoryName !== 'ALL')
        ? `shop.html?category=${encodeURIComponent(categoryName)}`
        : 'shop.html';
      window.history.pushState({ category: categoryName }, '', newUrl);
    } catch (_) {}

    updateShopHeaderInfo(categoryName);

    // Update Category Pills
    document.querySelectorAll('.category-pill').forEach(pill => {
      const pillCat = (pill.dataset.category || '').trim().toLowerCase();
      const targetCat = (categoryName || '').trim().toLowerCase();
      if (pillCat === targetCat) {
        pill.classList.add('active');
        try {
          pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        } catch (_) {}
      } else {
        pill.classList.remove('active');
      }
    });

    // Update Dropdown Items
    document.querySelectorAll('.cat-drop-item').forEach(item => {
      const itemCat = (item.dataset.category || '').trim().toLowerCase();
      const targetCat = (categoryName || '').trim().toLowerCase();
      if (itemCat === targetCat) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update Category Nav Links
    document.querySelectorAll('.cat-nav-link').forEach(link => {
      const linkCat = (link.dataset.category || '').trim().toLowerCase();
      const targetCat = (categoryName || '').trim().toLowerCase();
      if (linkCat === targetCat) {
        link.classList.add('active');
      } else if (categoryName === 'ALL' && link.getAttribute('href') === 'index.html') {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    renderProducts();

    // Close Dropdown & Mobile Sheet
    const dropdownWrap = document.getElementById('categoryDropdownWrap');
    const backdrop = document.getElementById('categoryMobileBackdrop');
    const btn = document.getElementById('btnCategoryDropdown');
    if (dropdownWrap) dropdownWrap.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    // Update bottom nav active indicator: on shop.html, navCategory is active
    document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
    const navCategoryEl = document.getElementById('navCategory') || document.getElementById('navCatalog');
    if (isShopPage && navCategoryEl) {
      navCategoryEl.classList.add('active');
    } else if (categoryName === 'ALL') {
      document.getElementById('navHome')?.classList.add('active');
    } else if (navCategoryEl) {
      navCategoryEl.classList.add('active');
    }

    // Scroll smoothly to catalog section only if it's out of viewport
    const catalogEl = document.getElementById('catalogSection');
    if (catalogEl) {
      const rect = catalogEl.getBoundingClientRect();
      if (rect.top < -50 || rect.top > window.innerHeight) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Category Dropdown & Mobile Bottom Sheet Controller
  const btnCatDropdown = document.getElementById('btnCategoryDropdown');
  const catDropdownWrap = document.getElementById('categoryDropdownWrap');
  const catMenu = document.getElementById('categoryDropdownMenu');
  const catMobileBackdrop = document.getElementById('categoryMobileBackdrop');
  const btnCloseCatSheet = document.getElementById('btnCloseCatSheet');

  let catHoverTimer = null;

  // On mobile (<= 768px), ensure #categoryDropdownMenu and #categoryMobileBackdrop are direct children of <body>
  // so they are not trapped inside header stacking context & backdrop-filter (z-index 90).
  const syncCategoryMenuPlacement = () => {
    const isMobile = window.innerWidth <= 768;
    const menuEl = document.getElementById('categoryDropdownMenu');
    const backdropEl = document.getElementById('categoryMobileBackdrop');
    const wrapEl = document.getElementById('categoryDropdownWrap');

    if (isMobile) {
      if (menuEl && menuEl.parentElement !== document.body) {
        document.body.appendChild(menuEl);
      }
      if (backdropEl && backdropEl.parentElement !== document.body) {
        document.body.appendChild(backdropEl);
      }
    } else {
      if (menuEl && wrapEl && menuEl.parentElement !== wrapEl) {
        wrapEl.appendChild(menuEl);
      }
      if (backdropEl && wrapEl && backdropEl.parentElement !== wrapEl) {
        wrapEl.appendChild(backdropEl);
      }
    }
  };
  syncCategoryMenuPlacement();
  window.addEventListener('resize', syncCategoryMenuPlacement);

  const openCategoryDropdown = () => {
    if (catHoverTimer) {
      clearTimeout(catHoverTimer);
      catHoverTimer = null;
    }
    const currentWrap = document.getElementById('categoryDropdownWrap');
    const currentMenu = document.getElementById('categoryDropdownMenu');
    const currentBackdrop = document.getElementById('categoryMobileBackdrop');
    const currentBtn = document.getElementById('btnCategoryDropdown');

    currentWrap?.classList.add('open');
    currentMenu?.classList.add('open');
    if (currentBtn) currentBtn.setAttribute('aria-expanded', 'true');

    if (window.innerWidth <= 768) {
      currentBackdrop?.classList.add('open');
      document.body.style.overflow = 'hidden';

      // Update bottom nav active indicator
      document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
      const navCategoryEl = document.getElementById('navCategory') || document.getElementById('navCatalog');
      if (navCategoryEl) navCategoryEl.classList.add('active');
    }
  };

  const scheduleCloseCategoryDropdown = (delay = 220) => {
    if (catHoverTimer) clearTimeout(catHoverTimer);
    catHoverTimer = setTimeout(() => {
      closeCategoryDropdown();
    }, delay);
  };

  const closeCategoryDropdown = () => {
    if (catHoverTimer) clearTimeout(catHoverTimer);
    const currentWrap = document.getElementById('categoryDropdownWrap');
    const currentMenu = document.getElementById('categoryDropdownMenu');
    const currentBackdrop = document.getElementById('categoryMobileBackdrop');
    const currentBtn = document.getElementById('btnCategoryDropdown');

    currentWrap?.classList.remove('open');
    currentMenu?.classList.remove('open');
    if (currentBtn) currentBtn.setAttribute('aria-expanded', 'false');
    currentBackdrop?.classList.remove('open');
    document.body.style.overflow = '';
  };

  const toggleCategoryDropdown = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (catHoverTimer) clearTimeout(catHoverTimer);

    const currentMenu = document.getElementById('categoryDropdownMenu');
    const currentWrap = document.getElementById('categoryDropdownWrap');
    const isCurrentlyOpen = currentMenu?.classList.contains('open') || currentWrap?.classList.contains('open');

    if (isCurrentlyOpen) {
      closeCategoryDropdown();
    } else {
      openCategoryDropdown();
    }
  };

  // Hover support for desktop: view categories and flyout menus by moving cursor
  if (catDropdownWrap) {
    catDropdownWrap.addEventListener('mouseenter', () => {
      if (window.innerWidth > 768) {
        openCategoryDropdown();
      }
    });

    catDropdownWrap.addEventListener('mouseleave', () => {
      if (window.innerWidth > 768) {
        scheduleCloseCategoryDropdown(220);
      }
    });
  }

  btnCatDropdown?.addEventListener('click', toggleCategoryDropdown);
  catMobileBackdrop?.addEventListener('click', closeCategoryDropdown);
  btnCloseCatSheet?.addEventListener('click', closeCategoryDropdown);

  document.addEventListener('click', (e) => {
    const currentWrap = document.getElementById('categoryDropdownWrap');
    const currentMenu = document.getElementById('categoryDropdownMenu');
    const currentBtn = document.getElementById('btnCategoryDropdown');
    const navCategory = document.getElementById('navCategory') || document.getElementById('navCatalog');

    const clickedInside =
      (currentWrap && currentWrap.contains(e.target)) ||
      (currentMenu && currentMenu.contains(e.target)) ||
      (currentBtn && currentBtn.contains(e.target)) ||
      (navCategory && navCategory.contains(e.target));

    if (!clickedInside) {
      closeCategoryDropdown();
    }
  });

  // Mobile submenu accordion toggle if tapped
  document.querySelectorAll('.cat-drop-item.has-submenu').forEach(item => {
    item.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        if (e.target.closest('.submenu-link') || e.target.closest('.submenu-all-link')) {
          return;
        }
        item.classList.toggle('open-sub');
      }
    });
  });

  // Listeners for elements with [data-category]
  document.querySelectorAll('[data-category]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (el.classList.contains('has-submenu') && window.innerWidth <= 768 && !e.target.closest('.submenu-all-link')) {
        return;
      }
      const cat = el.dataset.category;
      if (cat) {
        e.preventDefault();
        window.selectCategory(cat);
      }
    });
  });

  // Special filter types (promo, featured)
  document.querySelectorAll('[data-filter-type]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const type = el.dataset.filterType;
      if (!isShopPage) {
        window.location.href = `shop.html?filter=${encodeURIComponent(type)}`;
        return;
      }
      State.searchQuery = '';
      State.currentPage = 1;
      if (type === 'promo') {
        State.filterPromoOnly = true;
        State.filterFeaturedOnly = false;
        State.currentCategory = 'ALL';
      } else if (type === 'featured') {
        State.filterFeaturedOnly = true;
        State.filterPromoOnly = false;
        State.currentCategory = 'ALL';
      }
      try {
        window.history.pushState({ filter: type }, '', `shop.html?filter=${encodeURIComponent(type)}`);
      } catch (_) {}
      updateShopHeaderInfo(type === 'promo' ? 'Promo Spesial' : 'Produk Terlaris');
      renderProducts();
      closeCategoryDropdown();
      document.getElementById('catalogSection')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Search Inputs
  const handleSearch = (query) => {
    State.searchQuery = query;
    State.currentPage = 1;
    const desktopClear = document.getElementById('desktopSearchClear');
    const mobileClear = document.getElementById('mobileSearchClear');
    
    if (desktopClear) desktopClear.style.display = query ? 'block' : 'none';
    if (mobileClear) mobileClear.style.display = query ? 'block' : 'none';

    renderProducts();
  };

  const desktopSearch = document.getElementById('desktopSearchInput');
  const mobileSearch = document.getElementById('mobileSearchInput');

  desktopSearch?.addEventListener('input', (e) => {
    if (mobileSearch) mobileSearch.value = e.target.value;
    handleSearch(e.target.value);
  });

  mobileSearch?.addEventListener('input', (e) => {
    if (desktopSearch) desktopSearch.value = e.target.value;
    handleSearch(e.target.value);
  });

  const handleSearchEnter = (e) => {
    if (e.key === 'Enter') {
      const query = (e.target.value || '').trim();
      if (!isShopPage) {
        if (query) {
          window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
        } else {
          window.location.href = `shop.html`;
        }
      }
    }
  };

  desktopSearch?.addEventListener('keydown', handleSearchEnter);
  mobileSearch?.addEventListener('keydown', handleSearchEnter);

  document.getElementById('desktopSearchClear')?.addEventListener('click', () => {
    if (desktopSearch) desktopSearch.value = '';
    if (mobileSearch) mobileSearch.value = '';
    handleSearch('');
  });

  document.getElementById('mobileSearchClear')?.addEventListener('click', () => {
    if (desktopSearch) desktopSearch.value = '';
    if (mobileSearch) mobileSearch.value = '';
    handleSearch('');
  });

  // Sort dropdown
  document.getElementById('sortSelect')?.addEventListener('change', (e) => {
    State.currentSort = e.target.value;
    State.currentPage = 1;
    renderProducts();
  });

  // Catalog Pagination Click Handler (Event Delegation)
  document.getElementById('catalogPagination')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.pagination-btn');
    if (!btn || btn.classList.contains('disabled') || btn.disabled) return;
    const pageNum = parseInt(btn.dataset.page);
    if (!isNaN(pageNum) && pageNum !== State.currentPage) {
      State.currentPage = pageNum;
      renderProducts();
      // Scroll smoothly to top of catalog section
      const catalogEl = document.getElementById('catalogSection');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  // Responsive Pagination Breakpoint: 4 on mobile, 8 on desktop
  let lastItemsPerPage = window.innerWidth <= 768 ? 4 : 8;
  window.addEventListener('resize', () => {
    const currentItemsPerPage = window.innerWidth <= 768 ? 4 : 8;
    if (currentItemsPerPage !== lastItemsPerPage) {
      lastItemsPerPage = currentItemsPerPage;
      renderProducts();
    }
  });

  // Hero Actions
  document.getElementById('btnHeroExplore')?.addEventListener('click', () => {
    document.getElementById('catalogSection')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('btnHeroContactWA')?.addEventListener('click', () => {
    const wa = State.settings.whatsappNumber || '6282132095241';
    window.open(`https://api.whatsapp.com/send?phone=${wa}&text=Halo%20Admin%2C%20saya%20ingin%20bertanya%20seputar%20produk%20di%20Alat%20Kopi%20Malang`, '_blank');
  });

  const handleNavCategoryClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggleCategoryDropdown();
  };

  document.getElementById('navCategory')?.addEventListener('click', handleNavCategoryClick);
  document.getElementById('navCatalog')?.addEventListener('click', handleNavCategoryClick);

  document.getElementById('navHome')?.addEventListener('click', () => {
    document.querySelectorAll('.bottom-nav-item').forEach(btn => btn.classList.remove('active'));
    document.getElementById('navHome')?.classList.add('active');
    closeCategoryDropdown();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('navWishlist')?.addEventListener('click', () => {
    closeCategoryDropdown();
  });

  // ==========================================
  // HERO IMAGE SLIDER CONTROLLER
  // ==========================================
  const initHeroSlider = () => {
    const track = document.getElementById('sliderTrack');
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.getElementById('sliderPrevBtn');
    const nextBtn = document.getElementById('sliderNextBtn');
    const sliderWrap = document.getElementById('heroSlider');

    if (!track || slides.length === 0) return;

    let currentSlide = 0;
    const totalSlides = slides.length;
    let autoPlayTimer = null;

    const goToSlide = (index) => {
      currentSlide = (index + totalSlides) % totalSlides;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;

      dots.forEach((dot, idx) => {
        if (idx === currentSlide) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    };

    const nextSlide = () => goToSlide(currentSlide + 1);
    const prevSlide = () => goToSlide(currentSlide - 1);

    // Arrow button listeners
    nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      nextSlide();
      resetAutoPlay();
    });

    prevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      prevSlide();
      resetAutoPlay();
    });

    // Dot button listeners
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(idx);
        resetAutoPlay();
      });
    });

    // Autoplay setup
    const startAutoPlay = () => {
      stopAutoPlay();
      autoPlayTimer = setInterval(nextSlide, 4500);
    };

    const stopAutoPlay = () => {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    };

    const resetAutoPlay = () => {
      stopAutoPlay();
      startAutoPlay();
    };

    sliderWrap?.addEventListener('mouseenter', stopAutoPlay);
    sliderWrap?.addEventListener('mouseleave', startAutoPlay);

    // Touch Swipe Support for Mobile Devices
    let touchStartX = 0;
    let touchEndX = 0;

    sliderWrap?.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    sliderWrap?.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          nextSlide(); // Swiped left -> next
        } else {
          prevSlide(); // Swiped right -> prev
        }
      }
      startAutoPlay();
    }, { passive: true });

    startAutoPlay();
  };

  // ==========================================
  // HORIZONTAL CATEGORIES DRAG & SCROLL CONTROLLER
  // ==========================================
  const initCategoriesDragScroll = () => {
    const slider = document.getElementById('categoriesBar');
    if (!slider) return;

    const wrapper = slider.closest('.categories-scroll-wrapper') || slider.parentElement;
    const btnLeft = document.getElementById('catScrollLeft');
    const btnRight = document.getElementById('catScrollRight');

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasDragged = false;
    const dragThreshold = 5;

    // Refresh scroll arrow visibility & edge gradients
    const updateScrollIndicators = () => {
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      const canScroll = maxScroll > 4;
      const cur = slider.scrollLeft;

      if (wrapper) {
        if (canScroll && cur > 6) {
          wrapper.classList.add('has-scroll-left');
          if (btnLeft) btnLeft.classList.add('visible');
        } else {
          wrapper.classList.remove('has-scroll-left');
          if (btnLeft) btnLeft.classList.remove('visible');
        }

        if (canScroll && cur < maxScroll - 6) {
          wrapper.classList.add('has-scroll-right');
          if (btnRight) btnRight.classList.add('visible');
        } else {
          wrapper.classList.remove('has-scroll-right');
          if (btnRight) btnRight.classList.remove('visible');
        }
      }
    };

    // Navigation arrow buttons (Desktop click)
    btnLeft?.addEventListener('click', (e) => {
      e.preventDefault();
      slider.scrollBy({ left: -240, behavior: 'smooth' });
    });

    btnRight?.addEventListener('click', (e) => {
      e.preventDefault();
      slider.scrollBy({ left: 240, behavior: 'smooth' });
    });

    // Mouse Drag-to-Scroll (Desktop)
    slider.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Only primary mouse button
      isDown = true;
      hasDragged = false;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove('is-dragging');
      // Hold hasDragged briefly to prevent pill click immediately after drag
      setTimeout(() => {
        hasDragged = false;
      }, 50);
      updateScrollIndicators();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const x = e.pageX - slider.offsetLeft;
      const dist = Math.abs(x - startX);
      if (dist > 8) {
        hasDragged = true;
        slider.classList.add('is-dragging');
        const walk = (x - startX) * 1.35;
        slider.scrollLeft = scrollLeft - walk;
        updateScrollIndicators();
      }
    });

    // Mouse Wheel Scroll (Translate vertical wheel to horizontal scroll)
    slider.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > 0 && Math.abs(e.deltaX) === 0) {
        e.preventDefault();
        slider.scrollLeft += e.deltaY * 0.85;
        updateScrollIndicators();
      }
    }, { passive: false });

    // Touch and regular scroll events (Mobile & Trackpad)
    slider.addEventListener('scroll', updateScrollIndicators, { passive: true });
    window.addEventListener('resize', updateScrollIndicators);

    // Direct event delegation for category pill clicks on slider
    slider.addEventListener('click', (e) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const pill = e.target.closest('.category-pill');
      if (pill) {
        const cat = pill.dataset.category;
        if (cat) {
          e.preventDefault();
          window.selectCategory(cat);
        }
      }
    });

    // Initial check
    refreshIcons();
    setTimeout(updateScrollIndicators, 120);
    setTimeout(updateScrollIndicators, 600);
  };

  // ==========================================
  // INITIAL RENDER & URL PARAM HANDLING
  // ==========================================
  updateBadges();
  renderProducts();
  initHeroSlider();
  initCategoriesDragScroll();

  // Check URL search params for category, brand, filter, or search on load
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category');
  const initialBrand = urlParams.get('brand');
  const initialFilter = urlParams.get('filter');
  const initialSort = urlParams.get('sort');
  const initialSearch = urlParams.get('search');

  if (isShopPage) {
    if (initialBrand) {
      State.filterBrand = decodeURIComponent(initialBrand);
      State.currentCategory = 'ALL';
      State.filterPromoOnly = false;
      State.filterFeaturedOnly = false;
      State.searchQuery = '';
      State.currentPage = 1;
      updateShopHeaderInfo(`Brand: ${State.filterBrand}`);
      renderProducts();
    } else if (initialFilter === 'newest' || initialSort === 'newest') {
      State.currentSort = 'newest';
      State.filterPromoOnly = false;
      State.filterFeaturedOnly = false;
      State.currentCategory = 'ALL';
      const sortSelect = document.getElementById('sortSelect');
      if (sortSelect) sortSelect.value = 'newest';
      updateShopHeaderInfo('Produk Terbaru');
      renderProducts();
    } else if (initialCategory) {
      window.selectCategory(decodeURIComponent(initialCategory));
    } else if (initialFilter === 'promo') {
      State.filterPromoOnly = true;
      State.filterFeaturedOnly = false;
      State.currentCategory = 'ALL';
      updateShopHeaderInfo('Promo Spesial');
      renderProducts();
    } else if (initialFilter === 'featured') {
      State.filterFeaturedOnly = true;
      State.filterPromoOnly = false;
      State.currentCategory = 'ALL';
      updateShopHeaderInfo('Produk Terlaris');
      renderProducts();
    } else if (initialSearch) {
      const sTerm = decodeURIComponent(initialSearch);
      State.searchQuery = sTerm;
      const desktopSearch = document.getElementById('desktopSearchInput');
      const mobileSearch = document.getElementById('mobileSearchInput');
      if (desktopSearch) desktopSearch.value = sTerm;
      if (mobileSearch) mobileSearch.value = sTerm;
      updateShopHeaderInfo('Pencarian');
      renderProducts();
    } else {
      updateShopHeaderInfo('ALL');
    }
  } else {
    // On Homepage or Other Pages
    if (initialCategory) {
      window.selectCategory(decodeURIComponent(initialCategory));
    } else if (initialFilter === 'promo') {
      State.filterPromoOnly = true;
      renderProducts();
    } else if (initialFilter === 'featured') {
      State.filterFeaturedOnly = true;
      renderProducts();
    }

    if (initialSearch) {
      const sTerm = decodeURIComponent(initialSearch);
      State.searchQuery = sTerm;
      const desktopSearch = document.getElementById('desktopSearchInput');
      const mobileSearch = document.getElementById('mobileSearchInput');
      if (desktopSearch) desktopSearch.value = sTerm;
      if (mobileSearch) mobileSearch.value = sTerm;
      renderProducts();
    }
  }

  // ==========================================
  // HOME HERO VIDEO CONTROLS & AUTOPLAY
  // ==========================================
  const initHomeHeroVideo = () => {
    const video = document.getElementById('homeHeroVideo');
    if (!video) return;

    const btnPlayPause = document.getElementById('btnVideoPlayPause');
    const playPauseIcon = document.getElementById('videoPlayPauseIcon');
    const btnMuteUnmute = document.getElementById('btnVideoMuteUnmute');
    const muteUnmuteIcon = document.getElementById('videoMuteUnmuteIcon');

    // Ensure muted for strict browser autoplay policy
    video.muted = true;

    // Safely attempt autoplay
    const tryAutoplay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          if (playPauseIcon) {
            playPauseIcon.setAttribute('data-lucide', 'pause');
            refreshIcons();
          }
        }).catch(() => {
          // If browser policy blocks unmuted or interaction required, user can tap to play
          if (playPauseIcon) {
            playPauseIcon.setAttribute('data-lucide', 'play');
            refreshIcons();
          }
        });
      }
    };

    tryAutoplay();

    // Toggle Play / Pause
    if (btnPlayPause) {
      btnPlayPause.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (video.paused) {
          video.play().then(() => {
            if (playPauseIcon) {
              playPauseIcon.setAttribute('data-lucide', 'pause');
              refreshIcons();
            }
          }).catch(err => console.log('Play error:', err));
        } else {
          video.pause();
          if (playPauseIcon) {
            playPauseIcon.setAttribute('data-lucide', 'play');
            refreshIcons();
          }
        }
      });
    }

    // Toggle Mute / Unmute
    if (btnMuteUnmute) {
      btnMuteUnmute.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        video.muted = !video.muted;
        if (muteUnmuteIcon) {
          muteUnmuteIcon.setAttribute('data-lucide', video.muted ? 'volume-x' : 'volume-2');
          refreshIcons();
        }
      });
    }

    // Update play button state on video events
    video.addEventListener('play', () => {
      if (playPauseIcon) {
        playPauseIcon.setAttribute('data-lucide', 'pause');
        refreshIcons();
      }
    });

    video.addEventListener('pause', () => {
      if (playPauseIcon) {
        playPauseIcon.setAttribute('data-lucide', 'play');
        refreshIcons();
      }
    });
  };

  initHomeHeroVideo();

  // ==========================================
  // FLASH SALE COUNTDOWN CONTROLLER
  // ==========================================
  const initFlashSaleCountdown = () => {
    const hoursEl = document.getElementById('flashHours');
    const minutesEl = document.getElementById('flashMinutes');
    const secondsEl = document.getElementById('flashSeconds');
    if (!hoursEl || !minutesEl || !secondsEl) return;

    const STORAGE_KEY = 'nexus_flash_end_time';
    let endTime = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    const now = Date.now();

    // Default duration: 4 hours, 11 minutes, 21 seconds matching reference
    if (!endTime || endTime <= now) {
      endTime = now + (4 * 3600 + 11 * 60 + 21) * 1000;
      try {
        localStorage.setItem(STORAGE_KEY, endTime.toString());
      } catch (_) {}
    }

    const updateTimer = () => {
      const remainingMs = Math.max(0, endTime - Date.now());
      if (remainingMs <= 0) {
        endTime = Date.now() + (4 * 3600 + 11 * 60 + 21) * 1000;
        try {
          localStorage.setItem(STORAGE_KEY, endTime.toString());
        } catch (_) {}
      }

      const totalSeconds = Math.floor(remainingMs / 1000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      hoursEl.textContent = String(h).padStart(2, '0');
      minutesEl.textContent = String(m).padStart(2, '0');
      secondsEl.textContent = String(s).padStart(2, '0');
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  };

  initFlashSaleCountdown();

  // ==========================================
  // FLASH SALE MOBILE CAROUSEL CONTROLLER
  // ==========================================
  const initFlashSaleCarousel = () => {
    const grid = document.getElementById('flashCardsGrid');
    if (!grid) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasDragged = false;
    const dragThreshold = 6;

    grid.addEventListener('mousedown', (e) => {
      isDown = true;
      hasDragged = false;
      startX = e.pageX - grid.offsetLeft;
      scrollLeft = grid.scrollLeft;
      grid.style.scrollBehavior = 'auto';
      grid.style.scrollSnapType = 'none';
    });

    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      grid.style.scrollSnapType = 'x mandatory';
      grid.style.scrollBehavior = '';
      setTimeout(() => { hasDragged = false; }, 60);
    });

    grid.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const x = e.pageX - grid.offsetLeft;
      const walk = (x - startX);
      if (Math.abs(walk) > dragThreshold) {
        hasDragged = true;
      }
      grid.scrollLeft = scrollLeft - walk;
    });

    // Prevent navigation if user dragged
    grid.addEventListener('click', (e) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  };

  initFlashSaleCarousel();

  // ==========================================
  // BRAND PILIHAN CIRCULAR CAROUSEL
  // ==========================================
  const initFeaturedBrandsCarousel = () => {
    const track = document.getElementById('brandsCarouselTrack');
    if (!track) return;

    // Load ALL available brands from DEFAULT_BRANDS and any custom brands from products
    const brandsList = (() => {
      const base = (typeof DEFAULT_BRANDS !== 'undefined' && Array.isArray(DEFAULT_BRANDS) && DEFAULT_BRANDS.length > 0)
        ? [...DEFAULT_BRANDS]
        : [];
      
      const existing = new Set(base.map(b => (b.name || '').trim().toLowerCase()));
      (State.products || []).forEach(p => {
        const bName = (p.brand || '').trim();
        if (bName && !existing.has(bName.toLowerCase())) {
          existing.add(bName.toLowerCase());
          base.push({
            name: bName,
            monogram: bName.slice(0, 4).toUpperCase(),
            origin: 'Official Partner',
            color: '#4f46e5',
            bg: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(99, 102, 241, 0.22))'
          });
        }
      });
      return base;
    })();

    track.innerHTML = brandsList.map(b => {
      const isAkm = (b.name || '').toLowerCase().includes('alat kopi malang');
      const logoSrc = (typeof b.logo === 'string' && b.logo.trim().length > 1)
        ? b.logo.trim()
        : ((b.logo === true || isAkm) ? 'images/logo.png?v=9' : '');
      const innerContent = logoSrc
        ? `<img src="${logoSrc}" alt="${b.name}" class="store-logo-img" style="width:100%; height:100%; object-fit:contain; padding:3px;">`
        : `<span class="brand-monogram">${b.monogram}</span>`;

      return `
        <a href="shop.html?brand=${encodeURIComponent(b.name)}" class="brand-circle-item" title="Lihat produk ${b.name}">
          <div class="brand-circle-avatar" style="--brand-color:${b.color}; --brand-bg:${b.bg};">
            <div class="brand-circle-inner">
              ${innerContent}
            </div>
            <div class="brand-verified-dot" title="Original & Resmi">
              <i data-lucide="check" size="11"></i>
            </div>
          </div>
          <span class="brand-name-label">${b.name}</span>
        </a>
      `;
    }).join('');

    refreshIcons();

    // Arrows
    const btnPrev = document.getElementById('btnBrandsPrev');
    const btnNext = document.getElementById('btnBrandsNext');
    const scrollStep = 240;

    btnNext?.addEventListener('click', (e) => {
      e.preventDefault();
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 5) return;
      if (track.scrollLeft >= maxScroll - 15) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: scrollStep, behavior: 'smooth' });
      }
    });

    btnPrev?.addEventListener('click', (e) => {
      e.preventDefault();
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 5) return;
      if (track.scrollLeft <= 15) {
        track.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: -scrollStep, behavior: 'smooth' });
      }
    });

    // Mouse Drag-to-scroll support
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasDragged = false;
    const dragThreshold = 5;

    track.addEventListener('mousedown', (e) => {
      isDown = true;
      hasDragged = false;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.style.scrollBehavior = 'auto';
      track.style.scrollSnapType = 'none';
      stopAutoplay();
    });

    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      track.style.scrollSnapType = 'x mandatory';
      track.style.scrollBehavior = 'smooth';
      setTimeout(() => { hasDragged = false; }, 60);
      startAutoplay();
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX);
      if (Math.abs(walk) > dragThreshold) {
        hasDragged = true;
      }
      track.scrollLeft = scrollLeft - walk;
    });

    track.addEventListener('click', (e) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // Active Carousel Auto-Advance (Autoplay every 3.2s)
    let autoplayTimer = null;
    const startAutoplay = () => {
      stopAutoplay();
      autoplayTimer = setInterval(() => {
        if (isDown) return;
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (maxScroll <= 10) return;
        if (track.scrollLeft >= maxScroll - 15) {
          track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          track.scrollBy({ left: 140, behavior: 'smooth' });
        }
      }, 3200);
    };

    const stopAutoplay = () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    // Pause on hover or touch
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);
    track.addEventListener('touchstart', stopAutoplay, { passive: true });
    track.addEventListener('touchend', () => { setTimeout(startAutoplay, 1500); }, { passive: true });

    startAutoplay();
  };

  initFeaturedBrandsCarousel();

  // ==========================================
  // REELS VIDEO CAROUSEL & PLAYER (OTTEN STYLE)
  // Supports MP4, Instagram Reels, and TikTok
  // ==========================================
  const initReelsCarousel = () => {
    const track = document.getElementById('reelsTrack');
    if (!track) return;

    const reels = (() => {
      const stored = localStorage.getItem('nexus_reels');
      if (!stored) return (typeof DEFAULT_REELS !== 'undefined' ? DEFAULT_REELS : []);
      try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : (typeof DEFAULT_REELS !== 'undefined' ? DEFAULT_REELS : []);
      } catch (e) {
        return (typeof DEFAULT_REELS !== 'undefined' ? DEFAULT_REELS : []);
      }
    })();
    if (reels.length === 0) return;

    // Render cards
    track.innerHTML = reels.map((reel, idx) => {
      const prodCount = reel.productIds && Array.isArray(reel.productIds) ? reel.productIds.length : 1;
      return `
        <article class="reel-card" data-reel-index="${idx}" title="${reel.title}">
          <img src="${reel.thumbnail}" alt="${reel.title}" class="reel-card-thumb" loading="lazy">
          <div class="reel-card-gradient"></div>
          <div class="reel-card-top">
            <span class="reel-play-badge"><i data-lucide="play" size="13"></i></span>
          </div>
          <div class="reel-card-hook">
            ${reel.title}
          </div>
          <div class="reel-card-bottom">
            <span class="reel-products-badge">
              <i data-lucide="shopping-bag" size="12"></i> ${prodCount} Produk
            </span>
            <p class="reel-card-caption">${reel.caption}</p>
          </div>
        </article>
      `;
    }).join('');

    // Re-render Lucide icons inside cards
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }

    // Navigation arrows
    const prevBtn = document.getElementById('btnReelsPrev');
    const nextBtn = document.getElementById('btnReelsNext');

    const updateArrows = () => {
      if (!prevBtn || !nextBtn) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft > 20) {
        prevBtn.classList.add('visible');
      } else {
        prevBtn.classList.remove('visible');
      }

      if (maxScroll > 10 && track.scrollLeft < maxScroll - 15) {
        nextBtn.classList.add('visible');
      } else {
        nextBtn.classList.remove('visible');
      }
    };

    updateArrows();
    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        track.scrollBy({ left: -260, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        track.scrollBy({ left: 260, behavior: 'smooth' });
      });
    }

    // Drag-to-scroll & Touch handling
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasMoved = false;

    track.addEventListener('mousedown', (e) => {
      isDown = true;
      hasMoved = false;
      window.__reelIsDragging = false;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.classList.add('is-dragging');
    });

    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      track.classList.remove('is-dragging');
      if (hasMoved) {
        setTimeout(() => {
          window.__reelIsDragging = false;
        }, 120);
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const x = e.pageX - track.offsetLeft;
      const dist = Math.abs(x - startX);
      if (dist > 5) {
        hasMoved = true;
        window.__reelIsDragging = true;
        e.preventDefault();
        const walk = (x - startX) * 1.35;
        track.scrollLeft = scrollLeft - walk;
      }
    });

    track.addEventListener('touchstart', (e) => {
      hasMoved = false;
      window.__reelIsDragging = false;
      if (e.touches && e.touches[0]) {
        startX = e.touches[0].pageX;
      }
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        const dist = Math.abs(e.touches[0].pageX - startX);
        if (dist > 8) {
          hasMoved = true;
          window.__reelIsDragging = true;
        }
      }
    }, { passive: true });

    track.addEventListener('touchend', () => {
      if (hasMoved) {
        setTimeout(() => {
          window.__reelIsDragging = false;
        }, 140);
      }
    });

    // Modal elements
    const modalOverlay = document.getElementById('reelModalOverlay');
    const modalBackdrop = document.getElementById('reelModalBackdrop');
    const closeBtn = document.getElementById('btnCloseReelModal');
    const viewport = document.getElementById('reelPlayerViewport');
    const titleEl = document.getElementById('reelModalTitle');
    const captionEl = document.getElementById('reelModalCaption');
    const sourceText = document.getElementById('reelModalSourceText');
    const sourceBadge = document.getElementById('reelModalSourceBadge');
    const socialActionRow = document.getElementById('reelSocialActionRow');
    const taggedList = document.getElementById('reelTaggedList');
    const taggedCount = document.getElementById('reelTaggedCount');
    const muteBtn = document.getElementById('btnReelMute');
    const muteIcon = document.getElementById('reelMuteIcon');
    const modalPrevBtn = document.getElementById('btnReelModalPrev');
    const modalNextBtn = document.getElementById('btnReelModalNext');

    let currentReelIndex = 0;
    let isMuted = true;

    const updateMuteIcon = () => {
      if (!muteIcon) return;
      muteIcon.setAttribute('data-lucide', isMuted ? 'volume-x' : 'volume-2');
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }
    };

    const openReelModal = (index) => {
      if (!modalOverlay || !viewport) return;
      if (index < 0) index = reels.length - 1;
      if (index >= reels.length) index = 0;
      currentReelIndex = index;

      const reel = reels[index];
      if (!reel) return;

      // Update text
      if (titleEl) titleEl.textContent = reel.title;
      if (captionEl) captionEl.textContent = reel.caption;

      // Update Source Badge (Always native video)
      if (sourceText && sourceBadge) {
        sourceText.textContent = 'Video Produk';
        sourceBadge.style.borderColor = 'rgba(56, 189, 248, 0.4)';
      }

      if (socialActionRow) {
        socialActionRow.innerHTML = '';
      }

      // Render Native HTML5 Video Viewport
      viewport.innerHTML = '';
      if (muteBtn) {
        muteBtn.style.display = 'flex';
      }

      const video = document.createElement('video');
      video.id = 'activeReelVideo';
      video.src = reel.videoUrl || 'images/home-hero-video.mp4';
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.muted = isMuted;
      video.poster = reel.thumbnail;
      video.controls = false;
      viewport.appendChild(video);

      // Tap on video to toggle play / pause
      viewport.onclick = (e) => {
        if (e.target.tagName && e.target.tagName.toLowerCase() === 'video') {
          if (video.paused) {
            video.play();
          } else {
            video.pause();
          }
        }
      };

      video.play().catch(() => {
        video.muted = true;
        isMuted = true;
        updateMuteIcon();
        video.play().catch(() => {});
      });

      // Render Tagged Products
      if (taggedList) {
        taggedList.innerHTML = '';
        const allProds = (State && State.products) ? State.products : DEFAULT_PRODUCTS;
        const pIds = reel.productIds || [];
        const matched = allProds.filter(p => pIds.includes(p.id));

        if (taggedCount) {
          taggedCount.textContent = `Produk dalam Video (${matched.length})`;
        }

        if (matched.length > 0) {
          matched.forEach(p => {
            const item = document.createElement('div');
            item.className = 'reel-product-item';
            item.innerHTML = `
              <img src="${p.image}" alt="${p.name}">
              <div class="reel-product-meta">
                <p class="reel-product-name">${p.name}</p>
                <p class="reel-product-price">${formatRupiah(p.price)}</p>
              </div>
              <button type="button" class="reel-product-btn" onclick="window.location.href='product.html?id=${p.id}'">
                Beli <i data-lucide="chevron-right" size="13"></i>
              </button>
            `;
            taggedList.appendChild(item);
          });
        } else {
          taggedList.innerHTML = `<p style="color:#94a3b8; font-size:0.75rem; margin:0;">Tidak ada produk tertaut</p>`;
        }
      }

      // Open Modal
      modalOverlay.classList.add('open');
      modalOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }
    };

    const closeReelModal = () => {
      if (!modalOverlay) return;
      modalOverlay.classList.remove('open');
      modalOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (viewport) {
        viewport.innerHTML = '';
      }
    };

    // Attach card click listeners
    track.addEventListener('click', (e) => {
      if (window.__reelIsDragging) return;
      const card = e.target.closest('.reel-card');
      if (card && card.dataset.reelIndex !== undefined) {
        const idx = parseInt(card.dataset.reelIndex, 10);
        openReelModal(idx);
      }
    });

    // Close triggers
    if (closeBtn) closeBtn.addEventListener('click', closeReelModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeReelModal);

    // Prev / Next inside modal
    if (modalPrevBtn) {
      modalPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openReelModal(currentReelIndex - 1);
      });
    }

    if (modalNextBtn) {
      modalNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openReelModal(currentReelIndex + 1);
      });
    }

    // Mute control
    if (muteBtn) {
      muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const video = document.getElementById('activeReelVideo');
        if (video) {
          isMuted = !isMuted;
          video.muted = isMuted;
          updateMuteIcon();
        }
      });
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!modalOverlay || !modalOverlay.classList.contains('open')) return;
      if (e.key === 'Escape') {
        closeReelModal();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        openReelModal(currentReelIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        openReelModal(currentReelIndex - 1);
      }
    });
  };

  // ==========================================
  // LATEST PRODUCTS ON HOMEPAGE
  // ==========================================
  const initLatestProducts = () => {
    const grid = document.getElementById('latestProductsGrid');
    if (!grid) return;

    let activeFilter = 'all';

    const render = () => {
      let prods = [...State.products];

      // Filter if category tab selected
      if (activeFilter !== 'all') {
        prods = prods.filter(p => (p.category || '').toLowerCase().includes(activeFilter.toLowerCase()));
      } else {
        // Prioritize newest coffee gear
        const coffeeCategories = ['Mesin Espresso', 'Manual Grinder', 'Grinder Listrik', 'Manual Brew', 'Lifestyle & Rumah'];
        prods.sort((a, b) => {
          const aCoffee = coffeeCategories.includes(a.category) ? 1 : 0;
          const bCoffee = coffeeCategories.includes(b.category) ? 1 : 0;
          return bCoffee - aCoffee;
        });
      }

      // Display strictly top 4 latest items
      const displayProducts = prods.slice(0, 4);

      if (displayProducts.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 0.88rem; background: var(--bg-secondary); border-radius: var(--radius-lg);">
            <i data-lucide="package-open" size="36" style="margin-bottom:8px; opacity:0.6;"></i>
            <p>Belum ada produk untuk kategori ini.</p>
          </div>
        `;
        refreshIcons();
        return;
      }

      grid.innerHTML = displayProducts.map(product => {
        const isWishlisted = State.wishlist.some(item => item === product.id);
        const discountPercentage = product.originalPrice 
          ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
          : null;
        const hasVariants = product.variants && product.variants.length > 0 && !(product.variants.length === 1 && product.variants[0].toLowerCase() === 'standar');
        const isPreOrder = !!(product.isPreOrder || (product.badge && product.badge.toUpperCase().includes('PRE-ORDER')));
        const rawStock = Number(product.stock);
        let effectiveStock = (!isNaN(rawStock) && rawStock <= 0) ? 0 : (isNaN(rawStock) ? 0 : Math.max(0, rawStock));
        if (!isPreOrder && effectiveStock > 0 && Array.isArray(product.variantItems) && product.variantItems.length > 0) {
          const hasExplicitStock = product.variantItems.some(v => v && v.stock !== undefined && v.stock !== '');
          if (hasExplicitStock) {
            effectiveStock = product.variantItems.reduce((sum, v) => sum + Math.max(0, parseInt(v?.stock) || 0), 0);
          }
        }
        const isSoldOut = !isPreOrder && effectiveStock <= 0;

        return `
          <article class="product-card ${isSoldOut ? 'is-sold-out' : ''}" data-id="${product.id}" onclick="if (!event.target.closest('button') && !event.target.closest('a')) window.location.href='product.html?id=${product.id}'">
            <div class="product-card-img-wrap" onclick="window.location.href='product.html?id=${product.id}'" style="${isSoldOut ? 'background:#0f172a;' : ''}">
              ${isSoldOut
                ? `<span class="card-badge badge-sold-out" style="background:linear-gradient(135deg, #111827, #334155); color:#fff; border:1px solid rgba(255,255,255,0.28); font-weight:800; letter-spacing:0.06em; z-index:4;">SOLD OUT</span>`
                : (isPreOrder
                    ? `<span class="card-badge" style="background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; font-weight:800; letter-spacing:0.04em;">PRE-ORDER</span>`
                    : `<span class="card-badge badge-terbaru">Terbaru</span>`)
              }
              ${isSoldOut ? `
                <div class="sold-out-overlay" style="position:absolute; inset:0; background:rgba(15,23,42,0.46); display:flex; align-items:center; justify-content:center; z-index:2; pointer-events:none;">
                  <span class="sold-out-overlay-pill" style="background:rgba(15,23,42,0.9); color:#fff; border:1.5px solid rgba(255,255,255,0.38); padding:6px 14px; border-radius:999px; font-size:0.75rem; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; box-shadow:0 4px 14px rgba(0,0,0,0.45);">SOLD OUT</span>
                </div>
              ` : ''}
              
              <button type="button" class="btn-wishlist ${isWishlisted ? 'active' : ''}" 
                onclick="event.stopPropagation(); window.toggleWishlist('${product.id}')" 
                title="${isWishlisted ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}"
                aria-label="Favorit ${product.name}">
                <i data-lucide="heart" size="18" ${isWishlisted ? 'fill="currentColor"' : ''}></i>
              </button>

              <img src="${product.image}" alt="${product.name}" class="product-card-img" loading="lazy" style="${isSoldOut ? 'filter:brightness(0.42) contrast(0.95) grayscale(35%);' : ''}">
            </div>

            <div class="product-card-body" style="${isSoldOut ? 'opacity:0.78;' : ''}">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; flex-wrap:wrap;">
                <span class="product-category-name">${product.brand || product.category}</span>
                ${isSoldOut
                  ? `<span style="font-size:0.64rem; font-weight:800; background:rgba(239,68,68,0.12); color:#ef4444; border:1px solid rgba(239,68,68,0.3); padding:1px 6px; border-radius:4px; letter-spacing:0.03em;">SOLD OUT</span>`
                  : (isPreOrder ? `<span style="font-size:0.64rem; font-weight:800; background:rgba(245,158,11,0.14); color:#d97706; border:1px solid rgba(245,158,11,0.35); padding:1px 6px; border-radius:4px; letter-spacing:0.03em;">PRE-ORDER</span>` : '')
                }
              </div>
              <a href="product.html?id=${product.id}" class="product-title" title="Buka detail ${product.name}">
                ${product.name}
              </a>

              <div class="product-card-bottom-row">
                <div class="product-price-col">
                  <span class="price-current">${formatRupiah(product.price)}</span>
                  ${product.originalPrice ? `<span class="price-original">${formatRupiah(product.originalPrice)}</span>` : ''}
                  ${!isPreOrder ? `
                    <div class="stock-indicator ${effectiveStock <= 5 ? 'low' : ''}">
                      <i data-lucide="${isSoldOut ? 'x-circle' : (effectiveStock <= 5 ? 'alert-triangle' : 'check')}" size="11"></i>
                      <span>${isSoldOut ? 'Sold Out' : (effectiveStock <= 5 ? `Sisa ${effectiveStock} unit` : `Tersedia`)}</span>
                    </div>
                  ` : ''}
                </div>
                ${isSoldOut ? `
                  <button type="button" class="btn-card-select-variant" 
                    onclick="event.stopPropagation(); window.location.href='product.html?id=${product.id}'" 
                    style="background:var(--bg-secondary); color:var(--text-muted); border:1px solid var(--border-subtle); box-shadow:none;"
                    title="Stok Habis - ${product.name}">
                    <span>Habis</span>
                  </button>
                ` : (hasVariants ? `
                  <button type="button" class="btn-card-select-variant" 
                    onclick="event.stopPropagation(); window.location.href='product.html?id=${product.id}'" 
                    title="Pilih Varian ${product.name}" 
                    aria-label="Pilih Varian ${product.name}">
                    <span>Pilih</span>
                    <i data-lucide="chevron-right" size="14"></i>
                  </button>
                ` : `
                  <button type="button" class="btn-card-cart-icon" 
                    onclick="event.stopPropagation(); window.addToCart('${product.id}')" 
                    title="Tambah ke Keranjang" 
                    aria-label="Tambah ${product.name} ke Keranjang">
                    <i data-lucide="shopping-bag" size="17"></i>
                  </button>
                `)}
              </div>
            </div>
          </article>
        `;
      }).join('');

      refreshIcons();
    };

    window.refreshLatestProducts = render;

    // Filter tab clicks
    document.querySelectorAll('.latest-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.latest-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter || 'all';
        render();
      });
    });

    render();
  };

  initLatestProducts();
  initReelsCarousel();

  // ==========================================
  // KUMPULAN ARTIKEL & RUANG KOPI
  // ==========================================
  const initArticlesSection = () => {
    const track = document.getElementById('articlesCarouselTrack');
    const prevBtn = document.getElementById('btnArticlesPrev');
    const nextBtn = document.getElementById('btnArticlesNext');
    if (!track) return;

    // Scroll navigation arrows
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        track.scrollBy({ left: -320, behavior: 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        track.scrollBy({ left: 320, behavior: 'smooth' });
      });
    }
  };

  initArticlesSection();



  // Browser History Navigation (Back / Forward) Support on Shop Page
  window.addEventListener('popstate', () => {
    if (isShopPage) {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category') || 'ALL';
      const filt = params.get('filter');
      const sort = params.get('sort');
      const search = params.get('search') || '';

      State.currentCategory = cat;
      State.filterPromoOnly = filt === 'promo';
      State.filterFeaturedOnly = filt === 'featured';
      State.currentSort = (filt === 'newest' || sort === 'newest') ? 'newest' : 'popular';
      const sortSelect = document.getElementById('sortSelect');
      if (sortSelect) sortSelect.value = State.currentSort;
      State.searchQuery = search;
      State.currentPage = 1;

      const dSearch = document.getElementById('desktopSearchInput');
      const mSearch = document.getElementById('mobileSearchInput');
      if (dSearch) dSearch.value = search;
      if (mSearch) mSearch.value = search;

      const brand = params.get('brand');
      State.filterBrand = brand ? decodeURIComponent(brand) : null;

      if (brand) {
        State.currentCategory = 'ALL';
        State.filterPromoOnly = false;
        State.filterFeaturedOnly = false;
        updateShopHeaderInfo(`Brand: ${State.filterBrand}`);
      } else {
        updateShopHeaderInfo((filt === 'newest' || sort === 'newest') ? 'Produk Terbaru' : (filt === 'promo' ? 'Promo Spesial' : (filt === 'featured' ? 'Produk Terlaris' : cat)));
      }

      document.querySelectorAll('.category-pill').forEach(pill => {
        const pillCat = (pill.dataset.category || '').trim().toLowerCase();
        if (!brand && pillCat === cat.trim().toLowerCase()) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });

      renderProducts();
    }
  });
});
