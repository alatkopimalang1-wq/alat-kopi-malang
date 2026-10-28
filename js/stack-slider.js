/**
 * 3D STACK / OVERLAPPING CARD CAROUSEL SLIDER
 * Minimalist showcase: Displays only the photo and Coffee Shop Name.
 * Features: Continuous Autoplay, side arrows, swipe/drag, wheel scroll, keyboard controls, click-to-center.
 */

(function () {
  'use strict';

  // Card data repository 1: Mitra & Client Coffee Shops
  const STACK_CARDS_DATA = [
    {
      id: 'stack-1',
      title: 'Sanubari Roastery & Slow Bar',
      city: 'Malang',
      img: 'images/article_slowbar.jpg'
    },
    {
      id: 'stack-2',
      title: 'Bataputih Coffee Roaster',
      city: 'Malang',
      img: 'images/article_roastery.jpg'
    },
    {
      id: 'stack-3',
      title: 'Lafayette Coffee & Eatery',
      city: 'Malang',
      img: 'images/article_showroom.jpg'
    },
    {
      id: 'stack-4',
      title: 'Vosco Coffee Heritage',
      city: 'Malang',
      img: 'images/article_sensory.jpg'
    },
    {
      id: 'stack-5',
      title: 'Nakoa Coffee & Space',
      city: 'Malang',
      img: 'images/v60_wood_station.jpg'
    },
    {
      id: 'stack-6',
      title: 'Dialoogi Space & Coffee',
      city: 'Malang',
      img: 'images/fellow_tumbler.jpg'
    },
    {
      id: 'stack-7',
      title: 'Gartenhaus Coffee Sanctuary',
      city: 'Malang',
      img: 'images/vietnam_drip.jpg'
    }
  ];

  // Card data repository 2: Penawaran Khusus (Layanan AKM)
  const PENAWARAN_KHUSUS_DATA = [
    {
      id: 'offer-1',
      title: 'Training Barista',
      city: 'Sertifikasi & Sensory Class',
      img: 'images/article_slowbar.jpg'
    },
    {
      id: 'offer-2',
      title: 'Jasa Servis',
      city: 'Maintenance Mesin & Grinder',
      img: 'images/article_showroom.jpg'
    },
    {
      id: 'offer-3',
      title: 'Titip Jual',
      city: 'Konsinyasi Alat Kopi Resmi',
      img: 'images/vietnam_drip.jpg'
    },
    {
      id: 'offer-4',
      title: 'Pengadaan Barang',
      city: 'Paket Usaha Cafe & B2B Supply',
      img: 'images/v60_wood_station.jpg'
    }
  ];

  class StackSlider {
    constructor(sectionElement) {
      this.section = sectionElement || document.querySelector('.stack-slider-section');
      if (!this.section) return;

      const isPenawaran = this.section.id === 'stackSliderSectionTop' || 
                          this.section.getAttribute('data-type') === 'penawaran-khusus';

      const dynamicOffers = (typeof DEFAULT_OFFERS !== 'undefined' && Array.isArray(DEFAULT_OFFERS) && DEFAULT_OFFERS.length > 0)
        ? DEFAULT_OFFERS
        : PENAWARAN_KHUSUS_DATA;
      const dynamicPartners = (typeof DEFAULT_PARTNERS !== 'undefined' && Array.isArray(DEFAULT_PARTNERS) && DEFAULT_PARTNERS.length > 0)
        ? DEFAULT_PARTNERS
        : STACK_CARDS_DATA;

      this.cardData = isPenawaran ? dynamicOffers : dynamicPartners;
      this.cardsContainer = this.section.querySelector('.stack-cards-container');
      this.cards = [];
      this.currentIndex = 0;
      this.totalCards = this.cardData.length;

      // Autoplay configuration (Always active)
      this.isPlaying = true;
      this.autoplayDuration = 3500;
      this.timerId = null;

      // Gesture & Physics state
      this.isDragging = false;
      this.startX = 0;
      this.currentX = 0;
      this.diffX = 0;
      this.dragThreshold = 45;

      // Wheel throttle
      this.lastWheelTime = 0;
      this.wheelCooldown = 380;

      // Side navigation arrow buttons
      this.prevBtn = this.section.querySelector('.stack-side-prev');
      this.nextBtn = this.section.querySelector('.stack-side-next');

      this.init();
    }

    init() {
      this.renderCards();
      this.updateStack(false);
      this.bindEvents();
      this.startAutoplay();

      // Hydrate Lucide icons in section (for side arrows)
      if (typeof window.lucide !== 'undefined' && window.lucide.createIcons) {
        window.lucide.createIcons({ root: this.section });
      }
    }

    renderCards() {
      if (!this.cardsContainer) return;
      this.cardsContainer.innerHTML = '';

      this.cardData.forEach((item, index) => {
        const card = document.createElement('article');
        card.className = 'stack-card';
        card.setAttribute('role', 'region');
        card.setAttribute('aria-label', `${item.title} - ${item.city}`);
        card.dataset.index = index;

        card.innerHTML = `
          <div class="stack-card-inner">
            <img src="${item.img}" alt="${item.title}" class="stack-card-img" loading="lazy">
            <div class="stack-card-vignette"></div>
            
            <div class="stack-card-bottom">
              <h3 class="stack-card-title">${item.title}</h3>
              <span class="stack-card-city">${item.city}</span>
            </div>
          </div>
        `;

        this.cardsContainer.appendChild(card);
      });

      this.cards = Array.from(this.cardsContainer.querySelectorAll('.stack-card'));
    }

    updateStack(animated = true) {
      const isMobile = window.innerWidth <= 768;
      const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

      this.cards.forEach((card, i) => {
        // Calculate shortest circular offset
        let offset = (i - this.currentIndex) % this.totalCards;
        if (offset > Math.floor(this.totalCards / 2)) {
          offset -= this.totalCards;
        } else if (offset < -Math.floor(this.totalCards / 2)) {
          offset += this.totalCards;
        }

        const absOffset = Math.abs(offset);
        const sign = Math.sign(offset);

        // Hardware-accelerated depth transform calculation
        let translateX = 0;
        let translateZ = 0;
        let scale = 1;
        let rotateY = 0;
        let opacity = 1;
        let brightness = 1;
        let zIndex = 20;
        let pointerEvents = 'auto';

        if (absOffset === 0) {
          // Center card: stands tall at full opacity & brightness
          translateX = 0;
          translateZ = 0;
          scale = 1;
          rotateY = 0;
          opacity = 1;
          brightness = 1;
          zIndex = 25;
          card.classList.add('is-active');
        } else if (absOffset === 1) {
          // Immediate flanking cards
          const stepX = isMobile ? 100 : (isTablet ? 160 : 210);
          translateX = sign * stepX;
          translateZ = isMobile ? -60 : -90;
          scale = isMobile ? 0.88 : 0.88;
          rotateY = sign * (isMobile ? -3 : -5);
          opacity = 0.95;
          brightness = 0.72;
          zIndex = 18;
          card.classList.remove('is-active');
        } else if (absOffset === 2) {
          // Secondary flanking cards
          const stepX = isMobile ? 175 : (isTablet ? 290 : 380);
          translateX = sign * stepX;
          translateZ = isMobile ? -130 : -180;
          scale = isMobile ? 0.75 : 0.76;
          rotateY = sign * (isMobile ? -6 : -8);
          opacity = isMobile ? 0.6 : 0.82;
          brightness = 0.48;
          zIndex = 12;
          card.classList.remove('is-active');
        } else if (absOffset === 3) {
          // Tertiary flanking cards
          const stepX = isMobile ? 240 : (isTablet ? 390 : 510);
          translateX = sign * stepX;
          translateZ = -260;
          scale = 0.64;
          rotateY = sign * -10;
          opacity = isMobile ? 0 : 0.4;
          brightness = 0.28;
          zIndex = 6;
          card.classList.remove('is-active');
          if (isMobile) pointerEvents = 'none';
        } else {
          // Distant cards off-stage
          translateX = sign * (isMobile ? 280 : 620);
          translateZ = -340;
          scale = 0.52;
          opacity = 0;
          brightness = 0.15;
          zIndex = 1;
          pointerEvents = 'none';
          card.classList.remove('is-active');
        }

        card.style.zIndex = zIndex;
        card.style.opacity = opacity;
        card.style.filter = `brightness(${brightness})`;
        card.style.pointerEvents = pointerEvents;
        card.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`;
      });
    }

    goToSlide(index) {
      this.currentIndex = ((index % this.totalCards) + this.totalCards) % this.totalCards;
      this.updateStack();
      this.resetAutoplay();
    }

    nextSlide() {
      this.goToSlide(this.currentIndex + 1);
    }

    prevSlide() {
      this.goToSlide(this.currentIndex - 1);
    }

    // Autoplay Controls
    startAutoplay() {
      this.clearAutoplay();
      if (!this.isPlaying) return;

      this.timerId = setInterval(() => {
        this.nextSlide();
      }, this.autoplayDuration);
    }

    clearAutoplay() {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    }

    resetAutoplay() {
      if (this.isPlaying) {
        this.clearAutoplay();
        this.startAutoplay();
      }
    }

    bindEvents() {
      // Side Nav buttons
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.prevSlide();
        });
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.nextSlide();
        });
      }

      // Card clicks: Only flanking cards are clickable to center them. Center card does nothing.
      this.cards.forEach((card) => {
        card.addEventListener('click', (e) => {
          const idx = parseInt(card.dataset.index, 10);
          if (idx !== this.currentIndex) {
            this.goToSlide(idx);
          }
        });

        // Keyboard Enter on card
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const idx = parseInt(card.dataset.index, 10);
            if (idx !== this.currentIndex) {
              this.goToSlide(idx);
            }
          }
        });
      });

      // Pause autoplay on mouse enter / resume on leave
      const viewport = this.section.querySelector('.stack-slider-viewport');
      if (viewport) {
        viewport.addEventListener('mouseenter', () => {
          this.clearAutoplay();
        });
        viewport.addEventListener('mouseleave', () => {
          if (this.isPlaying) {
            this.startAutoplay();
          }
        });

        // Mouse Wheel Scroll Navigation
        viewport.addEventListener('wheel', (e) => {
          const now = Date.now();
          if (now - this.lastWheelTime < this.wheelCooldown) return;

          const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
          if (Math.abs(delta) > 22) {
            this.lastWheelTime = now;
            if (delta > 0) {
              this.nextSlide();
            } else {
              this.prevSlide();
            }
          }
        }, { passive: true });

        // Touch & Mouse Drag Gestures
        const handleDragStart = (clientX) => {
          this.isDragging = true;
          this.startX = clientX;
          this.currentX = clientX;
          this.diffX = 0;
          this.clearAutoplay();
        };

        const handleDragMove = (clientX) => {
          if (!this.isDragging) return;
          this.currentX = clientX;
          this.diffX = this.currentX - this.startX;
        };

        const handleDragEnd = () => {
          if (!this.isDragging) return;
          this.isDragging = false;

          if (Math.abs(this.diffX) >= this.dragThreshold) {
            if (this.diffX > 0) {
              this.prevSlide();
            } else {
              this.nextSlide();
            }
          } else {
            this.resetAutoplay();
          }
          this.diffX = 0;
        };

        // Pointer / Touch events
        viewport.addEventListener('touchstart', (e) => {
          if (e.touches && e.touches.length > 0) {
            handleDragStart(e.touches[0].clientX);
          }
        }, { passive: true });

        viewport.addEventListener('touchmove', (e) => {
          if (e.touches && e.touches.length > 0) {
            handleDragMove(e.touches[0].clientX);
          }
        }, { passive: true });

        viewport.addEventListener('touchend', () => {
          handleDragEnd();
        }, { passive: true });

        viewport.addEventListener('mousedown', (e) => {
          // Avoid triggering on side nav buttons
          if (e.target.closest('button')) return;
          handleDragStart(e.clientX);
        });

        window.addEventListener('mousemove', (e) => {
          if (this.isDragging) {
            handleDragMove(e.clientX);
          }
        });

        window.addEventListener('mouseup', () => {
          if (this.isDragging) {
            handleDragEnd();
          }
        });
      }

      // Keyboard Controls (ArrowLeft / ArrowRight)
      window.addEventListener('keydown', (e) => {
        const rect = this.section.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

        if (isInViewport) {
          if (e.key === 'ArrowLeft') {
            this.prevSlide();
          } else if (e.key === 'ArrowRight') {
            this.nextSlide();
          }
        }
      });

      // Window resize re-calculation
      window.addEventListener('resize', () => {
        this.updateStack();
      });
    }
  }

  // Initialize on DOM ready for all stack slider sections on the page
  function initStackSliders() {
    const sections = document.querySelectorAll('.stack-slider-section');
    sections.forEach(sec => new StackSlider(sec));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStackSliders);
  } else {
    initStackSliders();
  }
})();
