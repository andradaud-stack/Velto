# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Andra Syahdan (pelajar dan pemilik bisnis mikro di Indonesia) yang memerlukan satu tempat terpadu untuk mengelola arus kas harian, tabungan tujuan, investasi emas digital, serta operasional perdagangan parfum ritel.

## Product Purpose

Velto hadir untuk memadukan pelacakan kekayaan bersih (*personal net worth*), alokasi multi-kantong aset, investasi emas digital real-time (DANA eMAS x Treasury), dan manajemen persediaan bisnis parfum berbasis FIFO ke dalam sebuah aplikasi PWA *offline-first* yang cepat, aman, dan mencerminkan saldo fisik 1:1 tanpa selisih.

## Positioning

Sistem operasi finansial hibrida pertama yang menyatukan pencatatan keuangan pribadi dengan mesin pembukuan bisnis ritel mikro berbasis FIFO. Arus kas penjualan langsung masuk 1:1 ke dompet penerima (misal DANA) tanpa mendistorsi modal investasi atau menyebabkan *double counting* pada kekayaan bersih.

## Operating Context

- **Rutinitas Mingguan:** Alokasi uang saku berkala dan evaluasi pengeluaran harian.
- **Rutinitas Tabungan Emas:** Pembelian rutin mingguan di DANA eMAS dengan verifikasi harga pasar real-time langsung dari Treasury.
- **Siklus Bisnis Parfum:** Pembelian stok parfum per batch, pelacakan HPP dinamis dengan metode FIFO (*First-In, First-Out*), pencatatan penjualan unit, dan pemantauan laba bersih per varian.
- **Lingkungan Penggunaan:** Aplikasi diakses utamanya melalui smartphone dalam orientasi potret (*mobile-first PWA*), membutuhkan perlindungan privasi instan saat membuka di ruang publik (*masking saldo* dan proteksi PIN/Biometrik perangkat).

## Capabilities and Constraints

- **PWA Offline-First:** Menggunakan Dexie.js (IndexedDB) untuk transaksi instan tanpa ketergantungan jaringan internet.
- **Keamanan Perangkat (Local Device Lock):** Otentikasi 6-digit PIN (`200915`) dan sensor biometrik WebAuthn (*Fingerprint/Face ID*) dengan proteksi *rate-limiting* (lockout 5 menit setelah 3 kali gagal).
- **Cloud Sync Opsional:** Terhubung dengan Supabase Auth (Google Sign-In) untuk sinkronisasi cadangan awan.
- **7 Kantong Terintegrasi:** Dompet Cash, Bank Jago, Bank Mandiri, DANA, DANA eMAS (Investasi), Bibit Reksadana (Investasi), dan Profit Parfum (Dashboard Bisnis).
- **Harga Emas Real-Time:** Sinkronisasi langsung ke endpoint API resmi Treasury (`https://api.treasury.id/api/v1/gold/rate`) setiap 60 detik sebagai sumber resmi DANA eMAS.
- **Mesin FIFO Parfum:** Pencatatan restok batch, pencatatan penjualan dengan pemotongan stok otomatis dari batch terlama, kalkulasi HPP dan omzet, serta fitur *rollback* pembatalan transaksi.
- **Export & Backup:** Ekspor mutasi dan ringkasan ke format Excel (.xlsx) dan PDF (.pdf), sinkronisasi opsional ke Google Sheets, dan notifikasi transaksi WhatsApp gateway.
- **Bahasa Antarmuka:** Bahasa Indonesia formal dan bersahabat.

## Brand Commitments

- **Nama Brand:** Velto
- **Arah Identitas:** Modern Fintech & Personal Asset OS yang bersih, presisi, dan profesional.
- **Palet Warna Inti:** EasyPay Soft Lavender (`#F4F2FA`), Deep Slate Typography (`#1E1B2E`), Royal Violet Primary (`#6633EE` / `#7C4DFF`).

## Evidence on Hand

- Repositori dan kode sumber PWA aktif di `src/`.
- Tangkapan layar otentik aplikasi DANA eMAS yang membuktikan integrasi resmi Treasury ID.
- Panduan desain dan token antarmuka awal di `DESIGN1.md`.

## Product Principles

1. **Real-World Parity:** Nilai saldo setiap kantong di Velto harus mencerminkan saldo nyata di rekening bank atau e-wallet pengguna (1:1).
2. **Offline-First Resilience:** Semua transaksi, restok, dan mutasi dapat disimpan seketika di penyimpanan lokal perangkat tanpa pernah gagal akibat ketiadaan koneksi internet.
3. **Zero Double-Counting:** Pemisahan ketat antara aset likuid, aset investasi (*Mark-to-Market*), dan keuntungan bisnis parfum yang bersifat informatif (*tracking only*).
4. **Frictionless Action:** Form input transaksi harian, beli emas, dan penjualan parfum dapat diselesaikan dalam hitungan detik dengan masukan minimal dan kalkulasi otomatis.

## Accessibility & Inclusion

- Dukungan *tap target* minimal 44px untuk kenyamanan sentuhan pada layar smartphone.
- Fitur *Privacy Eye Masking* (`Rp ••••••••`) untuk melindungi privasi finansial di tempat umum.
- Teks berkontras tinggi dan label status yang jelas (badge visual + teks) untuk keterbacaan optimal.
