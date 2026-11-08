# Velto Finance — Browser Compatibility & Viewport Guidelines

## 1. Supported Browsers & Engines

| Browser Engine | Desktop | Mobile / Tablet | Compatibility Status |
|---|---|---|---|
| **Chromium** (Google Chrome, Microsoft Edge, Brave, Opera) | Version 110+ | Android Chrome 110+ | **Fully Supported & Verified via Playwright** |
| **WebKit** (Apple Safari) | Safari 16.4+ | iOS Safari 16.4+ (PWA Standalone Ready) | **Supported (IndexedDB + WebAuthn)** |
| **Gecko** (Mozilla Firefox) | Firefox 115+ | Firefox Android 115+ | **Supported** |

---

## 2. Viewport Breakpoints & Layout Matrix

| Breakpoint Range | Device Class | Layout Rendered | Key UI Characteristics |
|---|---|---|---|
| `< 768px` | Smartphone (Portrait) | **EasyPay Lavender Mobile View** | Fixed floating bottom navigation bar, single-column summary cards, touch-optimized modals |
| `768px - 1024px` | Tablet / iPad (Portrait/Landscape) | **Hybrid Responsive View** | Collapsible desktop sidebar, multi-column dashboard cards |
| `> 1024px` | Laptop & Desktop Monitors | **FinBank Grid Desktop View** | Sticky left navigation sidebar, dual-column analytics charts, gold price widget, quick-access action toolbar |

---

## 3. Storage & PWA Capabilities
* **Offline Storage:** IndexedDB via Dexie 4.x with automatic version schema migrations.
* **PWA Service Worker:** Auto-caching assets up to 14MB via Workbox, offline manifest, and standalone display support.
* **Hardware Biometrics:** WebAuthn API compatible for fingerprint / Face ID / Windows Hello login on supported devices.
