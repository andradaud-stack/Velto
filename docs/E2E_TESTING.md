# Velto Finance — End-to-End (E2E) Testing Guide

## 1. Overview
Velto Finance implements end-to-end browser testing using **Playwright**. The E2E test suite validates real user interactions across Desktop and Mobile resolutions, ensuring visual consistency, zero React hook violations, seamless navigation, reliable offline-first database transactions (Dexie), and resilient fallback behavior.

---

## 2. Configuration & Architecture

* **Config file:** [`playwright.config.js`](file:///d:/Coding/Velto/playwright.config.js)
* **Test Directory:** [`e2e/`](file:///d:/Coding/Velto/e2e)
* **Target Browsers & Viewports:**
  - **Desktop Chrome:** 1280 × 800 (FinBank Desktop Grid layout)
  - **Mobile Chrome (Pixel 5 emulation):** 393 × 851 (EasyPay Mobile view)
* **Web Server:** Automatically launches Vite local server on `http://localhost:5173`.

---

## 3. Test Suites Catalog

| Spec File | Area Tested | Verified Scenarios |
|---|---|---|
| `e2e/01-auth-session.spec.js` | Autentikasi & Sesi | Halaman login, mode offline instan, persistensi sesi saat refresh, dan logout aman |
| `e2e/02-navigation-responsive.spec.js` | Navigasi & Responsif | Navigasi 6 tab utama (Dashboard, Kantong, Parfum, Goals, Mutasi, Settings) & resize desktop/mobile tanpa error |
| `e2e/03-wallets-detail.spec.js` | Kantong Aset | Render seluruh kantong aset, buka detail kantong, dan tombol kembali |
| `e2e/04-transactions-crud.spec.js` | Riwayat Mutasi | Header mutasi, pencarian transaksi bebas crash, modal catat mutasi, dan penambahan mutasi pemasukan |
| `e2e/05-goals-savings.spec.js` | Target Tabungan | Kartu agregat impian, saving streak banner, dan modal tambah target baru |
| `e2e/06-parfum-fifo.spec.js` | Modul Parfum FIFO | Dashboard parfum tanpa white screen, sub-tab Restock, dan sub-tab Penjualan |
| `e2e/07-settings-profile.spec.js` | Setelan & Profil | Integrasi Google Spreadsheet & WhatsApp Bot, opsi biometrik, modal edit profil |
| `e2e/08-resilience-offline.spec.js` | Resiliensi Jaringan | Toleransi kegagalan API cloud HTTP 500, operasional offline-first, dan error boundary |

---

## 4. Running the E2E Tests

### Run All E2E Tests (Desktop + Mobile)
```bash
npm run test:e2e
```

### Run on Specific Browser Engine / Project
```bash
npx playwright test --project="Desktop Chrome"
npx playwright test --project="Mobile Chrome"
```

### Run with Interactive UI Mode
```bash
npx playwright test --ui
```

### View HTML Test Report
```bash
npx playwright show-report
```
