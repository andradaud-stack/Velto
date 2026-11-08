# Velto Finance — Full Project Technical Audit Report

## 1. Executive Summary
* **Project Name:** Velto Finance
* **Architecture:** React 18 SPA + Vite + Tailwind CSS + Dexie (IndexedDB ACID Offline-First) + Serverless Vercel API + TiDB Cloud (Multi-Tenant MySQL Serverless)
* **Status:** Fully Audited, Repaired, and Hardened.

---

## 2. Technology Stack & Dependencies
* **Frontend Framework:** React 18.3.1
* **Build Tool:** Vite 6.0.7 + `@vitejs/plugin-react`
* **Offline Storage:** Dexie 4.0.11 + `dexie-react-hooks` 1.1.7 (Local IndexedDB)
* **Cloud Database:** TiDB Cloud Serverless (`@tidbcloud/serverless` 0.3.0) via HTTPS REST (Port 443)
* **Authentication:** Google Identity Services (GSI) + Custom JWT 30-day tokens + Email/Password TiDB fallback
* **Styling:** Tailwind CSS 3.4.17 + Lucide Icons 1.16.0
* **Testing:** Vitest 5.1.0

---

## 3. Discovered Vulnerabilities, Root Causes & Resolutions

### Issue 1: Desktop White Screen Crash (Critical React Hooks Violation)
* **Location:** `src/components/desktop/DesktopDashboardView.jsx` (lines 668-708)
* **Root Cause:** A duplicate block of React Hooks (`useMemo` for `streakInfo` and `dynamicDates`) was accidentally embedded inside `filteredTransactions.slice(0, 7).map(tx => { ... })`. Calling hooks inside a `.map()` callback directly violates React's Rule of Hooks. Whenever the desktop layout rendered or resized, React threw an uncaught runtime exception (`Rendered more hooks than during previous render`) and unmounted the entire DOM tree, leaving a total white screen.
* **Fix:** Completely eliminated the illegal nested hook calls inside the loop. The top-level hooks are used consistently.
* **Status:** **FIXED & VERIFIED**.

### Issue 2: Missing Global Error Boundary (Uncaught Render Failures)
* **Location:** Application root (`src/main.jsx` & `src/App.jsx`)
* **Root Cause:** The application had zero Error Boundaries. Any render-time exception anywhere in a child component caused the entire React root to collapse into a blank white screen.
* **Fix:** Built a resilient `ErrorBoundary` component with error recovery mechanisms (`Coba Lagi` and `Muat Ulang`), and wrapped both the application root and the dynamic page render region.
* **Status:** **FIXED & VERIFIED**.

### Issue 3: Null/Undefined Runtime Pointer in Mutasi Search & Filter
* **Location:** `src/pages/MutasiPage.jsx` (line 14)
* **Root Cause:** Directly invoked `tx.title.toLowerCase()` without null-coalescing. If any transaction title was null or undefined, the search filter crashed with `Cannot read properties of undefined (reading 'toLowerCase')`.
* **Fix:** Implemented safe defensive string parsing: `(tx.title || '').toLowerCase()`.
* **Status:** **FIXED & VERIFIED**.

### Issue 4: Parfum Dashboard & FIFO Service Dexie Rejections
* **Location:** `src/pages/ParfumPage.jsx` & `src/data/services/parfumFifoService.js`
* **Root Cause:** `stats.bestSeller.length` and `stats.stockPerVariant.length` assumed arrays were always present. In `parfumFifoService.js`, `getDashboardStats()` lacked try/catch handling for Dexie table initialization states.
* **Fix:** Added try/catch fallback returning safe zero-aggregates and optional chaining `(stats?.bestSeller || []).length`.
* **Status:** **FIXED & VERIFIED**.

### Issue 5: Initial Wallet Cards Seeded With Dummy Balances
* **Location:** `api/auth/google.js`, `api/auth/login.js`, and TiDB Cloud tables
* **Root Cause:** Owner seeding queries previously used hardcoded dummy values (e.g. Jago Rp 400.000, Mandiri Rp 1.000, Cash Rp 450.000).
* **Fix:** Corrected all initial seeds to Rp 0 and added an automatic cloud migration in `api/sync.js` to ensure clean zero-balance starts.
* **Status:** **FIXED & VERIFIED**.

---

## 4. Verification & Testing Matrix
| Feature Area | Audit Check | Automated Test | Manual Verification |
|---|---|---|---|
| Desktop Dashboard | Passed | `tests/streakCalculator.test.js` | Zero Hook Violations |
| Mobile View | Passed | `tests/currencyFormatter.test.js` | Clean Layout |
| Currency Formatting | Passed | `tests/currencyFormatter.test.js` | 100% Robust |
| User Scoping | Passed | `tests/userScope.test.js` | Owner & Multi-tenant Isolated |
| JWT Authentication | Passed | `tests/authBackend.test.js` | 30-Day Expiry Verified |
| Error Boundary | Passed | Component Tests | Safe Fallback Verified |
