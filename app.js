/**
 * AUREVIA ESTATES - Core Application Logic
 * Zero-freeze architecture, reactive filters, client-side routing,
 * localStorage favorites, mortgage calculator, and accessible modals.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  const state = {
    filters: {
      status: 'all',          // 'all' | 'for-sale' | 'for-rent'
      location: 'all',        // 'all' | string
      type: 'all',            // 'all' | string
      priceRange: 'all',      // 'all' | 'under-25m' | '25m-35m' | 'above-35m'
      bedrooms: 'all',        // 'all' | '4' | '6' | '8'
      bathrooms: 'all',       // 'all' | '4' | '6' | '8'
      minArea: 'all',         // 'all' | '6000' | '10000' | '15000'
      amenities: new Set(),   // Set of amenity strings
      keyword: '',            // Search term
      sort: 'featured'        // 'featured' | 'price-asc' | 'price-desc' | 'popular' | 'newest'
    },
    favorites: new Set(),
    activeModal: null,
    lightbox: {
      images: [],
      currentIndex: 0,
      title: ''
    }
  };

  // Load Saved Favorites from localStorage
  function loadFavorites() {
    try {
      const saved = localStorage.getItem('aurevia_favorites');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          state.favorites = new Set(parsed);
        }
      }
    } catch (err) {
      console.warn('LocalStorage unavailable for favorites', err);
    }
    updateFavoritesBadge();
  }

  function saveFavorites() {
    try {
      localStorage.setItem('aurevia_favorites', JSON.stringify(Array.from(state.favorites)));
    } catch (err) {
      console.warn('Failed to save favorites to localStorage', err);
    }
    updateFavoritesBadge();
  }

  function updateFavoritesBadge() {
    const badge = document.getElementById('favorites-badge-count');
    const drawerBadge = document.getElementById('drawer-favorites-count');
    const count = state.favorites.size;
    if (badge) badge.textContent = count;
    if (drawerBadge) drawerBadge.textContent = count;
  }

  // ---------------------------------------------------------------------------
  // 2. DOM ELEMENT REFERENCES
  // ---------------------------------------------------------------------------
  const DOM = {
    siteHeader: document.getElementById('site-header'),
    mobileToggle: document.getElementById('mobile-menu-toggle'),
    mobileDrawer: document.getElementById('mobile-drawer'),
    drawerBackdrop: document.getElementById('drawer-backdrop'),
    drawerCloseBtn: document.getElementById('drawer-close-btn'),
    propertiesGrid: document.getElementById('properties-grid'),
    favoritesGrid: document.getElementById('favorites-grid'),
    favoritesSection: document.getElementById('favorites-section'),
    statsContainer: document.getElementById('stats-container'),
    servicesGrid: document.getElementById('services-grid'),
    agentsGrid: document.getElementById('agents-grid'),
    testimonialsGrid: document.getElementById('testimonials-grid'),
    resultsCount: document.getElementById('results-count'),
    btnClearFilters: document.getElementById('btn-clear-all-filters'),
    btnToggleFilters: document.getElementById('btn-toggle-filters'),
    advancedFiltersPanel: document.getElementById('advanced-filters-panel'),
    filterKeywordInput: document.getElementById('filter-keyword-input'),
    sortSelect: document.getElementById('sort-select'),
    filterStatusSelect: document.getElementById('filter-status-select'),
    filterTypeSelect: document.getElementById('filter-type-select'),
    filterBathsSelect: document.getElementById('filter-baths-select'),
    filterAreaSelect: document.getElementById('filter-area-select'),
    amenitiesTagCloud: document.getElementById('amenities-tag-cloud'),
    headerFavoritesBtn: document.getElementById('header-favorites-btn'),
    btnClearFavorites: document.getElementById('btn-clear-all-favorites'),
    toastContainer: document.getElementById('toast-container'),

    // Hero Search Elements
    heroLocationSelect: document.getElementById('hero-location-select'),
    heroTypeSelect: document.getElementById('hero-type-select'),
    heroPriceSelect: document.getElementById('hero-price-select'),
    heroBedsSelect: document.getElementById('hero-beds-select'),
    heroSearchBtn: document.getElementById('hero-search-btn'),
    tabHeroAll: document.getElementById('tab-hero-all'),
    tabHeroBuy: document.getElementById('tab-hero-buy'),
    tabHeroRent: document.getElementById('tab-hero-rent'),

    // Modals
    propertyDetailModal: document.getElementById('property-detail-modal'),
    modalPropertyBody: document.getElementById('modal-property-body'),
    detailModalClose: document.getElementById('detail-modal-close'),
    scheduleTourModal: document.getElementById('schedule-tour-modal'),
    tourModalClose: document.getElementById('tour-modal-close'),
    serviceModal: document.getElementById('service-modal'),
    serviceModalBody: document.getElementById('service-modal-body'),
    serviceModalClose: document.getElementById('service-modal-close'),

    // Lightbox
    lightboxOverlay: document.getElementById('lightbox-overlay'),
    lightboxActiveImg: document.getElementById('lightbox-active-img'),
    lightboxClose: document.getElementById('lightbox-close'),
    lightboxPrev: document.getElementById('lightbox-prev'),
    lightboxNext: document.getElementById('lightbox-next'),

    // Forms
    generalContactForm: document.getElementById('general-contact-form'),
    sellEstateForm: document.getElementById('sell-estate-form'),
    scheduleTourForm: document.getElementById('schedule-tour-form'),
    newsletterForm: document.getElementById('newsletter-form'),

    // Calculator Elements
    calcPriceSlider: document.getElementById('calc-price-slider'),
    calcDownSlider: document.getElementById('calc-down-slider'),
    calcInterestSlider: document.getElementById('calc-interest-slider'),
    calcTermSlider: document.getElementById('calc-term-slider'),
    calcPriceDisplay: document.getElementById('calc-price-display'),
    calcDownDisplay: document.getElementById('calc-down-display'),
    calcInterestDisplay: document.getElementById('calc-interest-display'),
    calcTermDisplay: document.getElementById('calc-term-display'),
    calcMonthlyPayment: document.getElementById('calc-monthly-payment'),
    calcBreakdownPi: document.getElementById('calc-breakdown-pi'),
    calcBreakdownLoan: document.getElementById('calc-breakdown-loan'),
    calcBreakdownTax: document.getElementById('calc-breakdown-tax'),
    calcBreakdownInsurance: document.getElementById('calc-breakdown-insurance')
  };

  // ---------------------------------------------------------------------------
  // 3. TOAST NOTIFICATION SYSTEM
  // ---------------------------------------------------------------------------
  function showToast(title, message, iconClass = 'fa-solid fa-circle-check') {
    if (!DOM.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon"><i class="${iconClass}"></i></div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    DOM.toastContainer.appendChild(toast);

    // Force reflow for animation
    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3800);
  }

  // ---------------------------------------------------------------------------
  // 4. STATS, SERVICES, AGENTS & TESTIMONIALS RENDERING
  // ---------------------------------------------------------------------------
  function renderAgencyData() {
    // Stats
    if (DOM.statsContainer && AUREVIA_DATA.stats) {
      DOM.statsContainer.innerHTML = AUREVIA_DATA.stats.map(stat => `
        <div class="stat-item">
          <div class="stat-value">${stat.value}</div>
          <div class="stat-label">${stat.label}</div>
          <div class="stat-detail">${stat.detail}</div>
        </div>
      `).join('');
    }

    // Services
    if (DOM.servicesGrid && AUREVIA_DATA.services) {
      DOM.servicesGrid.innerHTML = AUREVIA_DATA.services.map(srv => `
        <article class="service-card" data-service-id="${srv.id}">
          <div class="service-icon-box">
            <i class="fa-solid ${srv.icon || 'fa-gem'}"></i>
          </div>
          <h3 class="service-title">${srv.title}</h3>
          <div class="service-tagline">${srv.tagline}</div>
          <p class="service-desc">${srv.description}</p>
          <div class="service-features-list">
            ${srv.features.map(f => `
              <div class="service-feature-item">
                <i class="fa-solid fa-check"></i>
                <span>${f}</span>
              </div>
            `).join('')}
          </div>
          <button class="service-learn-btn" data-learn-service="${srv.id}">
            <span>Learn More</span>
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </article>
      `).join('');
    }

    // Agents
    if (DOM.agentsGrid && AUREVIA_DATA.agents) {
      DOM.agentsGrid.innerHTML = AUREVIA_DATA.agents.map(agent => `
        <article class="agent-card">
          <div class="agent-photo-wrap">
            <img src="${agent.image}" alt="${agent.name} - ${agent.title}" class="agent-photo" loading="lazy">
            <div class="agent-volume-badge">${agent.salesVolume} Volume</div>
          </div>
          <div class="agent-info">
            <h3 class="agent-name">${agent.name}</h3>
            <div class="agent-title">${agent.title}</div>
            <p class="agent-bio">${agent.bio}</p>
            <div class="agent-specs">
              <div class="agent-spec-item">
                <span class="agent-spec-val">${agent.experience}</span>
                <span class="agent-spec-lbl">Experience</span>
              </div>
              <div class="agent-spec-item">
                <span class="agent-spec-val">${agent.propertiesCount}</span>
                <span class="agent-spec-lbl">Trophy Listings</span>
              </div>
              <div class="agent-spec-item">
                <span class="agent-spec-val">${agent.languages.length}</span>
                <span class="agent-spec-lbl">Languages</span>
              </div>
            </div>
            <button class="btn btn-outline btn-sm w-100 btn-inquire-agent" data-agent-id="${agent.id}" style="width: 100%;">
              <i class="fa-solid fa-envelope"></i>
              <span>Consult with Partner</span>
            </button>
          </div>
        </article>
      `).join('');
    }

    // Testimonials
    if (DOM.testimonialsGrid && AUREVIA_DATA.testimonials) {
      DOM.testimonialsGrid.innerHTML = AUREVIA_DATA.testimonials.map(t => `
        <article class="testimonial-card">
          <blockquote class="testimonial-quote">“${t.quote}”</blockquote>
          <div class="testimonial-client">
            <img src="${t.avatar}" alt="${t.client}" class="client-avatar" loading="lazy">
            <div class="client-info">
              <h4>${t.client}</h4>
              <p>${t.role}</p>
            </div>
          </div>
        </article>
      `).join('');
    }
  }

  // ---------------------------------------------------------------------------
  // 5. PROPERTY CARDS RENDERING (PERFORMANCE OPTIMIZED VIA DOCUMENT FRAGMENT)
  // ---------------------------------------------------------------------------
  function createPropertyCard(prop) {
    const isFavorited = state.favorites.has(prop.id);
    const card = document.createElement('article');
    card.className = 'property-card';
    card.setAttribute('data-id', prop.id);

    const formattedArea = prop.area.toLocaleString();

    card.innerHTML = `
      <div class="card-media">
        <img src="${prop.images[0]}" alt="${prop.title} - ${prop.location}" class="card-img" loading="lazy">
        <div class="card-badges">
          ${prop.featured ? '<span class="badge badge-featured">Featured Estate</span>' : ''}
          <span class="badge badge-status">${prop.status === 'for-sale' ? 'For Sale' : 'For Lease'}</span>
          <span class="badge badge-type">${prop.type}</span>
        </div>
        <button class="card-favorite-btn ${isFavorited ? 'is-favorited' : ''}" data-favorite-id="${prop.id}" aria-label="${isFavorited ? 'Remove from Saved' : 'Save Property'}">
          <i class="${isFavorited ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}"></i>
        </button>
      </div>

      <div class="card-body">
        <div class="card-price-row">
          <div class="card-price">${prop.formattedPrice}</div>
          <div class="card-rating">
            <i class="fa-solid fa-star"></i>
            <span>${prop.rating}</span>
          </div>
        </div>

        <h3 class="card-title">${prop.title}</h3>
        <div class="card-location">
          <i class="fa-solid fa-location-dot"></i>
          <span>${prop.location}</span>
        </div>

        <div class="card-specs">
          <div class="spec-item">
            <span class="spec-val">${prop.bedrooms}</span>
            <span class="spec-lbl">Beds</span>
          </div>
          <div class="spec-item">
            <span class="spec-val">${prop.bathrooms}</span>
            <span class="spec-lbl">Baths</span>
          </div>
          <div class="spec-item">
            <span class="spec-val">${formattedArea}</span>
            <span class="spec-lbl">Sq Ft</span>
          </div>
        </div>

        <div class="card-footer">
          <button class="btn btn-outline btn-sm btn-view-details" data-detail-id="${prop.id}">
            <span>View Residence</span>
            <i class="fa-solid fa-arrow-right"></i>
          </button>
          <button class="btn btn-dark btn-sm btn-quick-tour" data-tour-id="${prop.id}">
            <span>Schedule Tour</span>
          </button>
        </div>
      </div>
    `;

    return card;
  }

  function renderProperties(list, container) {
    if (!container) return;
    container.innerHTML = '';

    if (list.length === 0) {
      container.innerHTML = `
        <div class="catalog-empty-state">
          <div class="empty-icon-wrap">
            <i class="fa-solid fa-house-circle-xmark"></i>
          </div>
          <h3 class="empty-title">No Residences Match Your Search</h3>
          <p class="empty-desc">
            We could not find any properties matching your current filter criteria. Reset your parameters to browse our entire global portfolio.
          </p>
          <button class="btn btn-primary" id="btn-empty-reset">
            <i class="fa-solid fa-rotate-left"></i>
            <span>Reset All Filters</span>
          </button>
        </div>
      `;

      const resetBtn = document.getElementById('btn-empty-reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', resetAllFilters);
      }
      return;
    }

    const fragment = document.createDocumentFragment();
    list.forEach(prop => {
      fragment.appendChild(createPropertyCard(prop));
    });

    container.appendChild(fragment);
  }

  // ---------------------------------------------------------------------------
  // 6. FILTER ENGINE & RECEPTIVE DEBOUNCE
  // ---------------------------------------------------------------------------
  function filterProperties() {
    let filtered = AUREVIA_DATA.properties.slice();

    // 1. Status Filter
    if (state.filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === state.filters.status);
    }

    // 2. Location Filter
    if (state.filters.location !== 'all') {
      const loc = state.filters.location.toLowerCase();
      filtered = filtered.filter(p => 
        p.location.toLowerCase().includes(loc) || 
        p.city.toLowerCase().includes(loc) ||
        p.country.toLowerCase().includes(loc)
      );
    }

    // 3. Property Type Filter
    if (state.filters.type !== 'all') {
      filtered = filtered.filter(p => p.type.toLowerCase() === state.filters.type.toLowerCase());
    }

    // 4. Price Range Filter
    if (state.filters.priceRange !== 'all') {
      if (state.filters.priceRange === 'under-25m') {
        filtered = filtered.filter(p => p.price < 25000000);
      } else if (state.filters.priceRange === '25m-35m') {
        filtered = filtered.filter(p => p.price >= 25000000 && p.price <= 35000000);
      } else if (state.filters.priceRange === 'above-35m') {
        filtered = filtered.filter(p => p.price > 35000000);
      }
    }

    // 5. Bedrooms Filter
    if (state.filters.bedrooms !== 'all') {
      const minBeds = parseInt(state.filters.bedrooms, 10);
      filtered = filtered.filter(p => p.bedrooms >= minBeds);
    }

    // 6. Bathrooms Filter
    if (state.filters.bathrooms !== 'all') {
      const minBaths = parseInt(state.filters.bathrooms, 10);
      filtered = filtered.filter(p => p.bathrooms >= minBaths);
    }

    // 7. Area Filter
    if (state.filters.minArea !== 'all') {
      const minSqFt = parseInt(state.filters.minArea, 10);
      filtered = filtered.filter(p => p.area >= minSqFt);
    }

    // 8. Amenities Checklist Filter
    if (state.filters.amenities.size > 0) {
      filtered = filtered.filter(p => {
        return Array.from(state.filters.amenities).every(amenity => p.amenities.includes(amenity));
      });
    }

    // 9. Keyword Search Filter
    if (state.filters.keyword.trim() !== '') {
      const term = state.filters.keyword.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(term) ||
        p.tagline.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term) ||
        p.type.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.amenities.some(a => a.toLowerCase().includes(term))
      );
    }

    // 10. Sorting
    switch (state.filters.sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
      case 'newest':
        filtered.sort((a, b) => b.yearBuilt - a.yearBuilt);
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.featured === a.featured ? 0 : b.featured ? 1 : -1));
        break;
    }

    // Update Counter
    if (DOM.resultsCount) {
      DOM.resultsCount.textContent = filtered.length;
    }

    // Render Properties
    renderProperties(filtered, DOM.propertiesGrid);
  }

  // Debounced input handler (150ms for lightning speed, zero lag)
  let searchDebounceTimer = null;
  function handleKeywordInput(e) {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      state.filters.keyword = e.target.value;
      filterProperties();
    }, 150);
  }

  function resetAllFilters() {
    state.filters.status = 'all';
    state.filters.location = 'all';
    state.filters.type = 'all';
    state.filters.priceRange = 'all';
    state.filters.bedrooms = 'all';
    state.filters.bathrooms = 'all';
    state.filters.minArea = 'all';
    state.filters.amenities.clear();
    state.filters.keyword = '';
    state.filters.sort = 'featured';

    // Reset UI Elements
    if (DOM.filterKeywordInput) DOM.filterKeywordInput.value = '';
    if (DOM.sortSelect) DOM.sortSelect.value = 'featured';
    if (DOM.filterStatusSelect) DOM.filterStatusSelect.value = 'all';
    if (DOM.filterTypeSelect) DOM.filterTypeSelect.value = 'all';
    if (DOM.filterBathsSelect) DOM.filterBathsSelect.value = 'all';
    if (DOM.filterAreaSelect) DOM.filterAreaSelect.value = 'all';

    if (DOM.heroLocationSelect) DOM.heroLocationSelect.value = 'all';
    if (DOM.heroTypeSelect) DOM.heroTypeSelect.value = 'all';
    if (DOM.heroPriceSelect) DOM.heroPriceSelect.value = 'all';
    if (DOM.heroBedsSelect) DOM.heroBedsSelect.value = 'all';

    // Reset Hero Tabs
    [DOM.tabHeroAll, DOM.tabHeroBuy, DOM.tabHeroRent].forEach(tab => {
      if (tab) tab.classList.remove('active');
    });
    if (DOM.tabHeroAll) DOM.tabHeroAll.classList.add('active');

    // Uncheck Amenity Chips
    const chips = document.querySelectorAll('.amenity-chip');
    chips.forEach(chip => {
      chip.classList.remove('selected');
      const input = chip.querySelector('input');
      if (input) input.checked = false;
    });

    filterProperties();
    showToast('Filters Reset', 'All property filters have been cleared to view the full collection.', 'fa-solid fa-rotate-left');
  }

  // ---------------------------------------------------------------------------
  // 7. FAVORITES SYSTEM
  // ---------------------------------------------------------------------------
  function toggleFavorite(propId, e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const prop = AUREVIA_DATA.properties.find(p => p.id === propId);
    if (!prop) return;

    if (state.favorites.has(propId)) {
      state.favorites.delete(propId);
      showToast('Removed from Saved', `“${prop.title}” was removed from your private portfolio.`, 'fa-regular fa-heart');
    } else {
      state.favorites.add(propId);
      showToast('Saved to Portfolio', `“${prop.title}” has been saved to your private collection.`, 'fa-solid fa-heart');
    }

    saveFavorites();

    // Re-render affected cards
    document.querySelectorAll(`[data-favorite-id="${propId}"]`).forEach(btn => {
      const isFav = state.favorites.has(propId);
      btn.classList.toggle('is-favorited', isFav);
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
      }
    });

    // If favorites section is active, update it
    if (DOM.favoritesSection && DOM.favoritesSection.classList.contains('is-active-view')) {
      renderFavoritesView();
    }
  }

  function renderFavoritesView() {
    if (!DOM.favoritesGrid) return;
    const favoriteProperties = AUREVIA_DATA.properties.filter(p => state.favorites.has(p.id));

    if (favoriteProperties.length === 0) {
      DOM.favoritesGrid.innerHTML = `
        <div class="catalog-empty-state">
          <div class="empty-icon-wrap">
            <i class="fa-regular fa-heart"></i>
          </div>
          <h3 class="empty-title">Your Saved Portfolio is Empty</h3>
          <p class="empty-desc">
            You have not added any residences to your saved list. Click the heart icon on any estate card to curate your private collection.
          </p>
          <a href="#properties" class="btn btn-primary" id="btn-browse-portfolio">
            <i class="fa-solid fa-compass"></i>
            <span>Browse Trophy Estates</span>
          </a>
        </div>
      `;
      return;
    }

    renderProperties(favoriteProperties, DOM.favoritesGrid);
  }

  // ---------------------------------------------------------------------------
  // 8. PROPERTY DETAILS MODAL & GALLERY LIGHTBOX
  // ---------------------------------------------------------------------------
  function openPropertyDetail(propId) {
    const prop = AUREVIA_DATA.properties.find(p => p.id === propId);
    if (!prop) return;

    const agent = AUREVIA_DATA.agents.find(a => a.id === prop.agentId) || AUREVIA_DATA.agents[0];
    const isFavorited = state.favorites.has(prop.id);

    // Prepare Lightbox State
    state.lightbox.images = prop.images;
    state.lightbox.currentIndex = 0;
    state.lightbox.title = prop.title;

    DOM.modalPropertyBody.innerHTML = `
      <div class="detail-gallery-wrap">
        <div class="detail-main-img-wrap" id="detail-main-trigger">
          <img src="${prop.images[0]}" alt="${prop.title}" class="detail-main-img" id="detail-main-img">
          <div class="lightbox-hint">
            <i class="fa-solid fa-expand"></i>
            <span>Click for Fullscreen Lightbox (${prop.images.length} Photos)</span>
          </div>
        </div>
        <div class="detail-thumbnails-strip" id="detail-thumbnails-strip">
          ${prop.images.map((img, idx) => `
            <div class="thumb-item ${idx === 0 ? 'active' : ''}" data-thumb-idx="${idx}">
              <img src="${img}" alt="Thumbnail ${idx + 1}" loading="lazy">
            </div>
          `).join('')}
        </div>
      </div>

      <div class="detail-content-wrap">
        <div class="detail-header-row">
          <div>
            <div class="section-tag">${prop.status === 'for-sale' ? 'Acquisition Opportunity' : 'Prime Rental'} &bull; ${prop.type}</div>
            <h2 class="detail-title">${prop.title}</h2>
            <div class="detail-tagline">“${prop.tagline}”</div>
            <div class="card-location" style="margin-top: 0.65rem;">
              <i class="fa-solid fa-location-dot"></i>
              <span>${prop.location} &bull; Built in ${prop.yearBuilt}</span>
            </div>
          </div>
          <div class="detail-price-box">
            <div class="detail-price">${prop.formattedPrice}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Confidential Escrow &bull; Certified Title</div>
          </div>
        </div>

        <div class="detail-specs-grid">
          <div class="detail-spec-box">
            <span class="detail-spec-val">${prop.bedrooms} Master Suites</span>
            <span class="detail-spec-lbl">Accommodations</span>
          </div>
          <div class="detail-spec-box">
            <span class="detail-spec-val">${prop.bathrooms} Bathrooms</span>
            <span class="detail-spec-lbl">Spa En-Suites</span>
          </div>
          <div class="detail-spec-box">
            <span class="detail-spec-val">${prop.area.toLocaleString()} sq ft</span>
            <span class="detail-spec-lbl">Internal Living Area</span>
          </div>
          <div class="detail-spec-box">
            <span class="detail-spec-val">${prop.lotSize}</span>
            <span class="detail-spec-lbl">Grounds & Acreage</span>
          </div>
        </div>

        <div class="detail-section-title">Architectural Overview</div>
        <p class="detail-description">${prop.description}</p>

        <div class="detail-section-title">Notable Estate Features</div>
        <div class="detail-features-grid">
          ${prop.features.map(f => `
            <div class="detail-feature-item">
              <i class="fa-solid fa-check"></i>
              <span>${f}</span>
            </div>
          `).join('')}
        </div>

        <div class="detail-section-title">Exclusive Amenities</div>
        <div class="amenities-tag-cloud" style="margin-bottom: 2.5rem;">
          ${prop.amenities.map(a => `
            <div class="amenity-chip selected" style="cursor: default;">
              <span><i class="fa-solid fa-gem"></i> ${a}</span>
            </div>
          `).join('')}
        </div>

        <div class="detail-agent-box">
          <div class="detail-agent-profile">
            <img src="${agent.image}" alt="${agent.name}" class="detail-agent-img">
            <div class="detail-agent-info">
              <h4>${agent.name}</h4>
              <p>${agent.title}</p>
              <div style="font-size: 0.8rem; color: rgba(255,255,255,0.7); margin-top: 2px;">
                Direct: ${agent.phone}
              </div>
            </div>
          </div>
          <button class="btn btn-outline-gold btn-sm btn-inquire-direct" data-agent-email="${agent.email}" data-prop-name="${prop.title}">
            <i class="fa-solid fa-paper-plane"></i>
            <span>Inquire Directly</span>
          </button>
        </div>

        <div class="detail-actions-bar">
          <button class="btn btn-primary btn-lg" id="detail-btn-schedule-tour" data-prop-title="${prop.title}">
            <i class="fa-solid fa-calendar-check"></i>
            <span>Schedule Private Viewing</span>
          </button>
          <button class="btn btn-outline btn-lg" id="detail-btn-favorite" data-favorite-id="${prop.id}">
            <i class="${isFavorited ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}" style="${isFavorited ? 'color: #E53935;' : ''}"></i>
            <span>${isFavorited ? 'Saved in Portfolio' : 'Save Property'}</span>
          </button>
          <button class="btn btn-outline btn-lg" id="detail-btn-share" data-prop-title="${prop.title}">
            <i class="fa-solid fa-arrow-up-from-bracket"></i>
            <span>Share Estate</span>
          </button>
        </div>
      </div>
    `;

    // Hook up Gallery Thumbnail Clicks
    const mainImg = document.getElementById('detail-main-img');
    const thumbItems = document.querySelectorAll('.thumb-item');
    thumbItems.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const idx = parseInt(thumb.getAttribute('data-thumb-idx'), 10);
        state.lightbox.currentIndex = idx;
        if (mainImg) mainImg.src = prop.images[idx];
        thumbItems.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });

    // Hook up Main Image Lightbox Trigger
    const mainTrigger = document.getElementById('detail-main-trigger');
    if (mainTrigger) {
      mainTrigger.addEventListener('click', () => {
        openLightbox();
      });
    }

    // Hook up Direct Inquire
    const inquireBtn = DOM.modalPropertyBody.querySelector('.btn-inquire-direct');
    if (inquireBtn) {
      inquireBtn.addEventListener('click', () => {
        closeModal(DOM.propertyDetailModal);
        const contactSubj = document.getElementById('contact-subject');
        const contactMsg = document.getElementById('contact-message');
        if (contactSubj) contactSubj.value = 'Property Acquisition';
        if (contactMsg) contactMsg.value = `I am inquiring regarding ${prop.title} (${prop.formattedPrice}) in ${prop.location}. Please connect me with listing partner ${agent.name}.`;
        window.location.hash = '#contact';
      });
    }

    // Hook up Schedule Tour
    const scheduleBtn = document.getElementById('detail-btn-schedule-tour');
    if (scheduleBtn) {
      scheduleBtn.addEventListener('click', () => {
        closeModal(DOM.propertyDetailModal);
        openScheduleModal(prop.title);
      });
    }

    // Hook up Favorite Toggle Inside Modal
    const favBtn = document.getElementById('detail-btn-favorite');
    if (favBtn) {
      favBtn.addEventListener('click', (e) => {
        toggleFavorite(prop.id, e);
        const isFav = state.favorites.has(prop.id);
        const icon = favBtn.querySelector('i');
        const span = favBtn.querySelector('span');
        if (icon) {
          icon.className = isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
          icon.style.color = isFav ? '#E53935' : '';
        }
        if (span) span.textContent = isFav ? 'Saved in Portfolio' : 'Save Property';
      });
    }

    // Hook up Share Button (Web Share API + Clipboard Copy Fallback)
    const shareBtn = document.getElementById('detail-btn-share');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const shareData = {
          title: prop.title,
          text: `${prop.title} – ${prop.tagline}. View this extraordinary residence at Aurevia Estates.`,
          url: window.location.href.split('#')[0] + '#properties'
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
          navigator.share(shareData).catch(() => {});
        } else {
          // Fallback: Copy to Clipboard
          if (navigator.clipboard) {
            navigator.clipboard.writeText(`${prop.title} | ${window.location.href}`).then(() => {
              showToast('Link Copied', 'Private estate link copied to your clipboard.', 'fa-solid fa-link');
            }).catch(() => {
              showToast('Share Ready', `${prop.title} (${prop.formattedPrice})`, 'fa-solid fa-share-nodes');
            });
          } else {
            showToast('Share Ready', `${prop.title} (${prop.formattedPrice})`, 'fa-solid fa-share-nodes');
          }
        }
      });
    }

    openModal(DOM.propertyDetailModal);
  }

  // ---------------------------------------------------------------------------
  // 9. FULLSCREEN LIGHTBOX VIEWER
  // ---------------------------------------------------------------------------
  function openLightbox() {
    if (!DOM.lightboxOverlay || state.lightbox.images.length === 0) return;
    updateLightboxImage();
    DOM.lightboxOverlay.classList.add('is-active');
    DOM.lightboxOverlay.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    if (!DOM.lightboxOverlay) return;
    DOM.lightboxOverlay.classList.remove('is-active');
    DOM.lightboxOverlay.setAttribute('aria-hidden', 'true');
  }

  function updateLightboxImage() {
    if (DOM.lightboxActiveImg) {
      DOM.lightboxActiveImg.src = state.lightbox.images[state.lightbox.currentIndex];
    }
  }

  function nextLightboxImage() {
    if (state.lightbox.images.length === 0) return;
    state.lightbox.currentIndex = (state.lightbox.currentIndex + 1) % state.lightbox.images.length;
    updateLightboxImage();
  }

  function prevLightboxImage() {
    if (state.lightbox.images.length === 0) return;
    state.lightbox.currentIndex = (state.lightbox.currentIndex - 1 + state.lightbox.images.length) % state.lightbox.images.length;
    updateLightboxImage();
  }

  // ---------------------------------------------------------------------------
  // 10. MODAL CONTROLLER & ACCESSIBILITY
  // ---------------------------------------------------------------------------
  function openModal(modalEl) {
    if (!modalEl) return;
    state.activeModal = modalEl;
    modalEl.classList.add('is-open');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('is-open');
    modalEl.setAttribute('aria-hidden', 'true');
    state.activeModal = null;
    document.body.style.overflow = '';
  }

  function openScheduleModal(propTitle = '') {
    const titleEl = document.getElementById('schedule-modal-prop-title');
    if (titleEl) {
      titleEl.textContent = propTitle ? `Private Tour: ${propTitle}` : 'Schedule a Viewing';
    }
    const notesEl = document.getElementById('tour-notes');
    if (notesEl && propTitle) {
      notesEl.value = `Requesting viewing arrangements for ${propTitle}.`;
    }
    // Set default date to 2 days from today
    const dateInput = document.getElementById('tour-date');
    if (dateInput) {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      dateInput.value = d.toISOString().split('T')[0];
    }
    openModal(DOM.scheduleTourModal);
  }

  function openServiceModal(srvId) {
    const srv = AUREVIA_DATA.services.find(s => s.id === srvId);
    if (!srv || !DOM.serviceModalBody) return;

    DOM.serviceModalBody.innerHTML = `
      <div class="service-icon-box" style="margin-bottom: 1.25rem;">
        <i class="fa-solid ${srv.icon || 'fa-gem'}"></i>
      </div>
      <div class="section-tag">Aurevia Private Advisory</div>
      <h3 style="font-size: 2rem; margin-bottom: 0.5rem;">${srv.title}</h3>
      <p style="color: var(--gold-dark); font-weight: 600; margin-bottom: 1.25rem;">${srv.tagline}</p>
      <p style="color: var(--text-secondary); line-height: 1.7; margin-bottom: 1.5rem;">${srv.description}</p>

      <div class="detail-section-title">Core Service Deliverables</div>
      <div class="detail-features-grid" style="margin-bottom: 2rem;">
        ${srv.features.map(f => `
          <div class="detail-feature-item">
            <i class="fa-solid fa-circle-check"></i>
            <span>${f}</span>
          </div>
        `).join('')}
      </div>

      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <button class="btn btn-primary btn-lg" id="btn-service-inquire">
          <span>Inquire Regarding Service</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    `;

    const srvInquireBtn = document.getElementById('btn-service-inquire');
    if (srvInquireBtn) {
      srvInquireBtn.addEventListener('click', () => {
        closeModal(DOM.serviceModal);
        const contactSubj = document.getElementById('contact-subject');
        const contactMsg = document.getElementById('contact-message');
        if (contactSubj) contactSubj.value = 'Off-Market Sourcing';
        if (contactMsg) contactMsg.value = `I would like to arrange a private consultation regarding ${srv.title}.`;
        window.location.hash = '#contact';
      });
    }

    openModal(DOM.serviceModal);
  }

  // ---------------------------------------------------------------------------
  // 11. MORTGAGE & INVESTMENT CALCULATOR (REAL-TIME ENGINE)
  // ---------------------------------------------------------------------------
  function updateMortgageCalculator() {
    if (!DOM.calcPriceSlider) return;

    const price = parseFloat(DOM.calcPriceSlider.value);
    const downPercent = parseFloat(DOM.calcDownSlider.value);
    const ratePercent = parseFloat(DOM.calcInterestSlider.value);
    const termYears = parseFloat(DOM.calcTermSlider.value);

    const downAmount = price * (downPercent / 100);
    const loanAmount = price - downAmount;

    // Monthly Interest Rate & Total Payments
    const monthlyRate = (ratePercent / 100) / 12;
    const totalMonths = termYears * 12;

    // Monthly Principal & Interest Formula: M = P * [ r(1+r)^n ] / [ (1+r)^n – 1 ]
    let monthlyPI = 0;
    if (monthlyRate > 0) {
      monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else {
      monthlyPI = loanAmount / totalMonths;
    }

    // Estimated monthly property tax (approx 1.1% / yr) & Insurance (approx 0.2% / yr)
    const monthlyTax = (price * 0.011) / 12;
    const monthlyInsurance = (price * 0.002) / 12;
    const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance;

    // Update UI Displays
    if (DOM.calcPriceDisplay) DOM.calcPriceDisplay.textContent = '$' + price.toLocaleString();
    if (DOM.calcDownDisplay) DOM.calcDownDisplay.textContent = `${downPercent}% ($${Math.round(downAmount).toLocaleString()})`;
    if (DOM.calcInterestDisplay) DOM.calcInterestDisplay.textContent = ratePercent.toFixed(2) + '%';
    if (DOM.calcTermDisplay) DOM.calcTermDisplay.textContent = `${termYears} Years Fixed`;

    if (DOM.calcMonthlyPayment) DOM.calcMonthlyPayment.textContent = '$' + Math.round(totalMonthly).toLocaleString();
    if (DOM.calcBreakdownPi) DOM.calcBreakdownPi.textContent = '$' + Math.round(monthlyPI).toLocaleString() + ' / mo';
    if (DOM.calcBreakdownLoan) DOM.calcBreakdownLoan.textContent = '$' + Math.round(loanAmount).toLocaleString();
    if (DOM.calcBreakdownTax) DOM.calcBreakdownTax.textContent = '$' + Math.round(monthlyTax).toLocaleString() + ' / mo';
    if (DOM.calcBreakdownInsurance) DOM.calcBreakdownInsurance.textContent = '$' + Math.round(monthlyInsurance).toLocaleString() + ' / mo';
  }

  // ---------------------------------------------------------------------------
  // 12. FORMS & VALIDATION (ZERO SCREEN-FREEZE, BUTTON LOADING ONLY)
  // ---------------------------------------------------------------------------
  function setupFormHandlers() {
    // A. General Contact Form
    if (DOM.generalContactForm) {
      DOM.generalContactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const banner = document.getElementById('contact-form-banner');
        const submitBtn = document.getElementById('btn-submit-contact');

        const nameInput = document.getElementById('contact-name');
        const emailInput = document.getElementById('contact-email');
        const phoneInput = document.getElementById('contact-phone');
        const messageInput = document.getElementById('contact-message');

        let isValid = true;

        // Reset errors
        document.querySelectorAll('#general-contact-form .field-error-msg').forEach(el => el.classList.remove('visible'));
        document.querySelectorAll('#general-contact-form .form-control').forEach(el => el.classList.remove('is-invalid'));

        if (!nameInput.value.trim()) {
          document.getElementById('contact-name-error').classList.add('visible');
          nameInput.classList.add('is-invalid');
          isValid = false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value.trim())) {
          document.getElementById('contact-email-error').classList.add('visible');
          emailInput.classList.add('is-invalid');
          isValid = false;
        }

        if (!phoneInput.value.trim()) {
          document.getElementById('contact-phone-error').classList.add('visible');
          phoneInput.classList.add('is-invalid');
          isValid = false;
        }

        if (!messageInput.value.trim()) {
          document.getElementById('contact-message-error').classList.add('visible');
          messageInput.classList.add('is-invalid');
          isValid = false;
        }

        if (!isValid) return;

        // Button-only loading state
        submitBtn.classList.add('is-loading');

        // Fast simulated network call (zero freeze)
        setTimeout(() => {
          submitBtn.classList.remove('is-loading');
          DOM.generalContactForm.reset();

          if (banner) {
            banner.className = 'form-banner is-success';
            banner.innerHTML = '<i class="fa-solid fa-check-circle"></i><span>Your confidential inquiry has been routed to our Senior Partners. Expect a discreet response within 2 hours.</span>';
            setTimeout(() => {
              banner.className = 'form-banner';
            }, 6000);
          }

          showToast('Inquiry Transmitted', 'Our private concierge desk has received your acquisition brief.', 'fa-solid fa-envelope-circle-check');
        }, 600);
      });
    }

    // B. Sell Estate Form
    if (DOM.sellEstateForm) {
      DOM.sellEstateForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const banner = document.getElementById('sell-form-banner');
        const submitBtn = document.getElementById('btn-submit-sell');

        const nameInput = document.getElementById('sell-name');
        const emailInput = document.getElementById('sell-email');
        const phoneInput = document.getElementById('sell-phone');
        const addressInput = document.getElementById('sell-address');
        const typeSelect = document.getElementById('sell-type');
        const priceInput = document.getElementById('sell-price');
        const descInput = document.getElementById('sell-desc');

        let isValid = true;

        document.querySelectorAll('#sell-estate-form .field-error-msg').forEach(el => el.classList.remove('visible'));
        document.querySelectorAll('#sell-estate-form .form-control').forEach(el => el.classList.remove('is-invalid'));

        if (!nameInput.value.trim()) {
          document.getElementById('sell-name-error').classList.add('visible');
          nameInput.classList.add('is-invalid');
          isValid = false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value.trim())) {
          document.getElementById('sell-email-error').classList.add('visible');
          emailInput.classList.add('is-invalid');
          isValid = false;
        }

        if (!phoneInput.value.trim()) {
          document.getElementById('sell-phone-error').classList.add('visible');
          phoneInput.classList.add('is-invalid');
          isValid = false;
        }

        if (!addressInput.value.trim()) {
          document.getElementById('sell-address-error').classList.add('visible');
          addressInput.classList.add('is-invalid');
          isValid = false;
        }

        if (!typeSelect.value) {
          document.getElementById('sell-type-error').classList.add('visible');
          typeSelect.classList.add('is-invalid');
          isValid = false;
        }

        if (!priceInput.value || parseFloat(priceInput.value) <= 0) {
          document.getElementById('sell-price-error').classList.add('visible');
          priceInput.classList.add('is-invalid');
          isValid = false;
        }

        if (!descInput.value.trim()) {
          document.getElementById('sell-desc-error').classList.add('visible');
          descInput.classList.add('is-invalid');
          isValid = false;
        }

        if (!isValid) return;

        submitBtn.classList.add('is-loading');

        setTimeout(() => {
          submitBtn.classList.remove('is-loading');
          DOM.sellEstateForm.reset();

          if (banner) {
            banner.className = 'form-banner is-success';
            banner.innerHTML = '<i class="fa-solid fa-check-circle"></i><span>Valuation dossier request registered. Our Private Capital & Listings team will contact you under standard non-disclosure agreement.</span>';
            setTimeout(() => {
              banner.className = 'form-banner';
            }, 6000);
          }

          showToast('Dossier Commissioned', 'Your estate marketing valuation request has been received.', 'fa-solid fa-handshake');
        }, 600);
      });
    }

    // C. Schedule Tour Form
    if (DOM.scheduleTourForm) {
      DOM.scheduleTourForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const banner = document.getElementById('tour-form-banner');
        const submitBtn = document.getElementById('btn-submit-tour');

        const nameInput = document.getElementById('tour-name');
        const emailInput = document.getElementById('tour-email');
        const phoneInput = document.getElementById('tour-phone');
        const dateInput = document.getElementById('tour-date');
        const timeInput = document.getElementById('tour-time');

        let isValid = true;

        document.querySelectorAll('#schedule-tour-form .field-error-msg').forEach(el => el.classList.remove('visible'));
        document.querySelectorAll('#schedule-tour-form .form-control').forEach(el => el.classList.remove('is-invalid'));

        if (!nameInput.value.trim()) {
          document.getElementById('tour-name-error').classList.add('visible');
          nameInput.classList.add('is-invalid');
          isValid = false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value.trim())) {
          document.getElementById('tour-email-error').classList.add('visible');
          emailInput.classList.add('is-invalid');
          isValid = false;
        }

        if (!phoneInput.value.trim()) {
          document.getElementById('tour-phone-error').classList.add('visible');
          phoneInput.classList.add('is-invalid');
          isValid = false;
        }

        if (!dateInput.value) {
          document.getElementById('tour-date-error').classList.add('visible');
          dateInput.classList.add('is-invalid');
          isValid = false;
        }

        if (!timeInput.value) {
          document.getElementById('tour-time-error').classList.add('visible');
          timeInput.classList.add('is-invalid');
          isValid = false;
        }

        if (!isValid) return;

        submitBtn.classList.add('is-loading');

        setTimeout(() => {
          submitBtn.classList.remove('is-loading');
          DOM.scheduleTourForm.reset();

          if (banner) {
            banner.className = 'form-banner is-success';
            banner.innerHTML = '<i class="fa-solid fa-check-circle"></i><span>Private viewing reserved. A personal security liaison will confirm flight/transport details.</span>';
          }

          showToast('Tour Reserved', 'Private viewing request successfully scheduled.', 'fa-solid fa-calendar-check');

          setTimeout(() => {
            closeModal(DOM.scheduleTourModal);
            if (banner) banner.className = 'form-banner';
          }, 1800);
        }, 600);
      });
    }

    // D. Newsletter Form
    if (DOM.newsletterForm) {
      DOM.newsletterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = DOM.newsletterForm.querySelector('input');
        if (input && input.value) {
          DOM.newsletterForm.reset();
          showToast('Subscription Confirmed', 'You have been enrolled into the Aurevia Private Intelligence journal.', 'fa-solid fa-award');
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 13. ROUTER & HASH-BASED NAVIGATION
  // ---------------------------------------------------------------------------
  function handleHashNavigation() {
    const hash = window.location.hash.toLowerCase() || '#home';

    // Update active state in desktop & mobile navigation
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    navLinks.forEach(link => {
      const linkHash = link.getAttribute('href').toLowerCase();
      if (linkHash === hash || (hash === '#home' && linkHash === '#home')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close Mobile Drawer if open
    closeMobileDrawer();

    // Specific Route Handlers
    if (hash === '#favorites') {
      if (DOM.favoritesSection) {
        DOM.favoritesSection.classList.add('is-active-view');
        renderFavoritesView();
        DOM.favoritesSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      if (DOM.favoritesSection) {
        DOM.favoritesSection.classList.remove('is-active-view');
      }

      if (hash === '#buy') {
        state.filters.status = 'for-sale';
        if (DOM.filterStatusSelect) DOM.filterStatusSelect.value = 'for-sale';
        filterProperties();
        const el = document.getElementById('properties');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (hash === '#rent') {
        state.filters.status = 'for-rent';
        if (DOM.filterStatusSelect) DOM.filterStatusSelect.value = 'for-rent';
        filterProperties();
        const el = document.getElementById('properties');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (hash === '#properties') {
        const el = document.getElementById('properties');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  // Mobile Drawer Toggle
  function openMobileDrawer() {
    if (DOM.mobileDrawer) DOM.mobileDrawer.classList.add('is-open');
    if (DOM.drawerBackdrop) DOM.drawerBackdrop.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (DOM.mobileDrawer) DOM.mobileDrawer.classList.remove('is-open');
    if (DOM.drawerBackdrop) DOM.drawerBackdrop.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  // ---------------------------------------------------------------------------
  // 14. EVENT LISTENERS SETUP
  // ---------------------------------------------------------------------------
  function attachEventListeners() {
    // Sticky Header Scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        DOM.siteHeader.classList.add('scrolled');
      } else {
        DOM.siteHeader.classList.remove('scrolled');
      }
    }, { passive: true });

    // Mobile Drawer Triggers
    if (DOM.mobileToggle) DOM.mobileToggle.addEventListener('click', openMobileDrawer);
    if (DOM.drawerCloseBtn) DOM.drawerCloseBtn.addEventListener('click', closeMobileDrawer);
    if (DOM.drawerBackdrop) DOM.drawerBackdrop.addEventListener('click', closeMobileDrawer);

    // Hash Change
    window.addEventListener('hashchange', handleHashNavigation);

    // Favorites Header Button
    if (DOM.headerFavoritesBtn) {
      DOM.headerFavoritesBtn.addEventListener('click', () => {
        window.location.hash = '#favorites';
      });
    }

    // Clear All Favorites Button
    if (DOM.btnClearFavorites) {
      DOM.btnClearFavorites.addEventListener('click', () => {
        if (state.favorites.size === 0) return;
        state.favorites.clear();
        saveFavorites();
        renderFavoritesView();
        // Update all visible cards
        document.querySelectorAll('.card-favorite-btn').forEach(btn => {
          btn.classList.remove('is-favorited');
          const icon = btn.querySelector('i');
          if (icon) icon.className = 'fa-regular fa-heart';
        });
        showToast('Portfolio Cleared', 'All saved residences removed from your list.', 'fa-solid fa-trash-can');
      });
    }

    // Advanced Filters Toggle Button
    if (DOM.btnToggleFilters && DOM.advancedFiltersPanel) {
      DOM.btnToggleFilters.addEventListener('click', () => {
        const isExpanded = DOM.advancedFiltersPanel.classList.toggle('is-expanded');
        DOM.btnToggleFilters.classList.toggle('active', isExpanded);
      });
    }

    // Keyword Search Input (Debounced)
    if (DOM.filterKeywordInput) {
      DOM.filterKeywordInput.addEventListener('input', handleKeywordInput);
    }

    // Sort Select
    if (DOM.sortSelect) {
      DOM.sortSelect.addEventListener('change', (e) => {
        state.filters.sort = e.target.value;
        filterProperties();
      });
    }

    // Filter Dropdowns
    if (DOM.filterStatusSelect) {
      DOM.filterStatusSelect.addEventListener('change', (e) => {
        state.filters.status = e.target.value;
        filterProperties();
      });
    }

    if (DOM.filterTypeSelect) {
      DOM.filterTypeSelect.addEventListener('change', (e) => {
        state.filters.type = e.target.value;
        filterProperties();
      });
    }

    if (DOM.filterBathsSelect) {
      DOM.filterBathsSelect.addEventListener('change', (e) => {
        state.filters.bathrooms = e.target.value;
        filterProperties();
      });
    }

    if (DOM.filterAreaSelect) {
      DOM.filterAreaSelect.addEventListener('change', (e) => {
        state.filters.minArea = e.target.value;
        filterProperties();
      });
    }

    // Clear Filters Button
    if (DOM.btnClearFilters) {
      DOM.btnClearFilters.addEventListener('click', resetAllFilters);
    }

    // Amenity Chips
    if (DOM.amenitiesTagCloud) {
      DOM.amenitiesTagCloud.addEventListener('change', (e) => {
        if (e.target && e.target.type === 'checkbox') {
          const val = e.target.value;
          const chip = e.target.closest('.amenity-chip');
          if (e.target.checked) {
            state.filters.amenities.add(val);
            if (chip) chip.classList.add('selected');
          } else {
            state.filters.amenities.delete(val);
            if (chip) chip.classList.remove('selected');
          }
          filterProperties();
        }
      });
    }

    // Hero Search Tabs
    if (DOM.tabHeroAll && DOM.tabHeroBuy && DOM.tabHeroRent) {
      [DOM.tabHeroAll, DOM.tabHeroBuy, DOM.tabHeroRent].forEach(tab => {
        tab.addEventListener('click', () => {
          [DOM.tabHeroAll, DOM.tabHeroBuy, DOM.tabHeroRent].forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          state.filters.status = tab.getAttribute('data-status');
          if (DOM.filterStatusSelect) DOM.filterStatusSelect.value = state.filters.status;
        });
      });
    }

    // Hero Search Button
    if (DOM.heroSearchBtn) {
      DOM.heroSearchBtn.addEventListener('click', () => {
        if (DOM.heroLocationSelect) state.filters.location = DOM.heroLocationSelect.value;
        if (DOM.heroTypeSelect) {
          state.filters.type = DOM.heroTypeSelect.value;
          if (DOM.filterTypeSelect) DOM.filterTypeSelect.value = DOM.heroTypeSelect.value;
        }
        if (DOM.heroPriceSelect) state.filters.priceRange = DOM.heroPriceSelect.value;
        if (DOM.heroBedsSelect) state.filters.bedrooms = DOM.heroBedsSelect.value;

        filterProperties();
        const catalogEl = document.getElementById('properties');
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Global Delegated Click Handler for Dynamic Property Cards & Modals
    document.addEventListener('click', (e) => {
      // Favorite Button Click
      const favBtn = e.target.closest('[data-favorite-id]');
      if (favBtn && !favBtn.id.includes('detail-btn')) {
        const id = favBtn.getAttribute('data-favorite-id');
        toggleFavorite(id, e);
        return;
      }

      // View Details Button or Card Click
      const detailBtn = e.target.closest('[data-detail-id]');
      if (detailBtn) {
        e.preventDefault();
        const id = detailBtn.getAttribute('data-detail-id');
        openPropertyDetail(id);
        return;
      }

      // Quick Schedule Tour Button on Card
      const tourBtn = e.target.closest('[data-tour-id]');
      if (tourBtn) {
        e.preventDefault();
        const id = tourBtn.getAttribute('data-tour-id');
        const prop = AUREVIA_DATA.properties.find(p => p.id === id);
        openScheduleModal(prop ? prop.title : '');
        return;
      }

      // Learn Service Button
      const learnSrvBtn = e.target.closest('[data-learn-service]');
      if (learnSrvBtn) {
        e.preventDefault();
        const srvId = learnSrvBtn.getAttribute('data-learn-service');
        openServiceModal(srvId);
        return;
      }

      // Inquire with Agent Button
      const agentInquireBtn = e.target.closest('.btn-inquire-agent');
      if (agentInquireBtn) {
        e.preventDefault();
        const agentId = agentInquireBtn.getAttribute('data-agent-id');
        const agent = AUREVIA_DATA.agents.find(a => a.id === agentId);
        const contactSubj = document.getElementById('contact-subject');
        const contactMsg = document.getElementById('contact-message');
        if (contactSubj) contactSubj.value = 'Off-Market Sourcing';
        if (contactMsg && agent) {
          contactMsg.value = `I would like to arrange a private briefing with ${agent.name} (${agent.title}).`;
        }
        window.location.hash = '#contact';
        return;
      }
    });

    // Close Modals on Overlay or Close Button
    if (DOM.detailModalClose) DOM.detailModalClose.addEventListener('click', () => closeModal(DOM.propertyDetailModal));
    if (DOM.tourModalClose) DOM.tourModalClose.addEventListener('click', () => closeModal(DOM.scheduleTourModal));
    if (DOM.serviceModalClose) DOM.serviceModalClose.addEventListener('click', () => closeModal(DOM.serviceModal));

    [DOM.propertyDetailModal, DOM.scheduleTourModal, DOM.serviceModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) closeModal(modal);
        });
      }
    });

    // Lightbox Navigation
    if (DOM.lightboxClose) DOM.lightboxClose.addEventListener('click', closeLightbox);
    if (DOM.lightboxNext) DOM.lightboxNext.addEventListener('click', nextLightboxImage);
    if (DOM.lightboxPrev) DOM.lightboxPrev.addEventListener('click', prevLightboxImage);

    if (DOM.lightboxOverlay) {
      DOM.lightboxOverlay.addEventListener('click', (e) => {
        if (e.target === DOM.lightboxOverlay) closeLightbox();
      });
    }

    // Keyboard Accessibility (Esc to close modals, Arrow keys for lightbox)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (DOM.lightboxOverlay && DOM.lightboxOverlay.classList.contains('is-active')) {
          closeLightbox();
        } else if (state.activeModal) {
          closeModal(state.activeModal);
        } else {
          closeMobileDrawer();
        }
      } else if (DOM.lightboxOverlay && DOM.lightboxOverlay.classList.contains('is-active')) {
        if (e.key === 'ArrowRight') nextLightboxImage();
        if (e.key === 'ArrowLeft') prevLightboxImage();
      }
    });

    // Calculator Sliders (Real-time updates)
    [DOM.calcPriceSlider, DOM.calcDownSlider, DOM.calcInterestSlider, DOM.calcTermSlider].forEach(slider => {
      if (slider) {
        slider.addEventListener('input', updateMortgageCalculator);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 15. INITIALIZATION
  // ---------------------------------------------------------------------------
  function init() {
    loadFavorites();
    renderAgencyData();
    filterProperties();
    updateMortgageCalculator();
    setupFormHandlers();
    attachEventListeners();
    handleHashNavigation();
  }

  // Fire on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
