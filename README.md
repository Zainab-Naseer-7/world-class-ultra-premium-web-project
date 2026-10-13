# AUREVIA ESTATES
> **“Exceptional Properties. Extraordinary Living.”**

A world-class, ultra-premium, cinematic real-estate platform designed to represent a $50,000+ luxury agency aesthetic. Built with vanilla HTML5, CSS3, and ES6+ JavaScript.

---

## 🌟 Key Features

### 1. Cinematic Luxury Aesthetics
- **Color Palette:** Warm ivory (`#FBF9F5`), Off-white, Charcoal Obsidian (`#0C0E12`), and Muted Champagne/Gold (`#C5A880`).
- **Typography:** Refined editorial serif (`Cinzel`, `Playfair Display`) paired with clean modern sans-serif (`Plus Jakarta Sans`).
- **Zero Heavy Frameworks:** Ultra-lightweight, zero bundle lag, zero screen freezing.

### 2. Verified 24+ Luxury Property Dataset (`data.js`)
- 24 unique global trophy residences across Beverly Hills, Manhattan, Palm Jumeirah, Lake Como, London, Monaco, Cap d'Antibes, Aspen, St. Moritz, Tokyo, and Zurich.
- Complete metadata: High-definition 5-photo galleries, square footage, acreages, bedrooms, bathrooms, luxury amenities checklist, ratings, and listing partners.

### 3. Reactive Search & Advanced Filter Engine
- **Instant Search:** Debounced 150ms keyword filtering across titles, locations, and architectural styles.
- **Multi-Facet Filters:** Buy vs. Lease transactions, Property Types (Villa, Penthouse, Waterfront, Mansion, Chalet, Apartment), Price Ranges, Bedroom/Bathroom requirements, and Minimum Square Footage.
- **Amenities Filter:** Real-time filtering by Infinity Pool, Superyacht Dock, Helipad, Wine Vault, Spa, Dolby Cinema, and more.
- **Dynamic Sorting:** Featured First, Price Low-to-High, Price High-to-Low, Popularity, and Newest.
- **Dynamic Counter:** Real-time feedback with instant "Clear All Filters" restoration.

### 4. Interactive Property Details & Fullscreen Lightbox
- Dynamic detail modal showing full estate description, architectural specifications, and bespoke amenities.
- Clickable multi-image thumbnail strip.
- Fullscreen Lightbox Viewer with keyboard navigation (Esc to close, Left/Right arrow keys to cycle).
- "Schedule Private Tour" modal pre-filled with estate credentials.
- "Share Property" with native Web Share API and one-click Clipboard copy toast fallback.

### 5. Persistent Favorites System (`localStorage`)
- Save and remove residences with instant heart icon micro-interactions.
- Synchronized badge counters in the navigation header and mobile drawer.
- Dedicated `#favorites` portfolio view showing all saved estates.
- Data persists across browser sessions.

### 6. Interactive Financial & Mortgage Calculator
- Real-time loan modeling for ultra-high-net-worth acquisitions ($5M to $60M).
- Adjust property valuation, down payment %, interest rate, and term length.
- Instant breakdown of Principal & Interest, Estimated Property Taxes, and Comprehensive Insurance.

### 7. Zero-Freeze Forms with Micro-Loading States
- **Confidential Inquiries Form:** Direct acquisition and off-market sourcing briefs.
- **Valuation Dossier Form:** Full seller appraisal submission with asset metadata.
- **Schedule Viewing Form:** Calendar date and time window selector for in-person or confidential virtual tours.
- Button-only loading indicators (`.is-loading`), preventing whole-screen freezing.
- Real-time inline field validation and auto-dismissing success banners.

### 8. Full Mobile & Responsive Design
- Slide-in luxury mobile drawer navigation.
- Touch-friendly controls with zero horizontal overflow.
- `@media (prefers-reduced-motion: reduce)` accessibility compliance.

---

## 🚀 How to Run

No node commands, servers, or build tools are required!
Simply open `index.html` in any modern web browser:

```bash
# Double click index.html or open via browser:
index.html
```

---

## 📁 File Structure

```
├── index.html        # Main semantic HTML structure & modals
├── styles.css        # Luxury design system, CSS variables & responsive layout
├── data.js           # 24+ realistic properties, 6 agents, 8 services, stats & reviews
├── app.js            # Reactive filter engine, modal manager, favorites & calculator
└── README.md         # Documentation & feature overview
```

---

&copy; 2026 Aurevia Estates International Realty LLC. All Rights Reserved.
