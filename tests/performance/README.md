# VELTO FINANCE — GRAFANA k6 PERFORMANCE & LOAD TESTING FRAMEWORK

Panduan komprehensif implementasi pengujian performa, kapasitas, dan kestabilan (*capacity & stability testing*) untuk aplikasi **Velto Finance** menggunakan **Grafana k6**.

---

## 1. Arsitektur Aplikasi & Analisis Infrastruktur

| Komponen | Arsitektur Aktual | Batasan Infrastruktur & Karakteristik |
|---|---|---|
| **Frontend** | React 18 SPA + Vite + Tailwind CSS | Dikompilasi menjadi aset statis (`dist/`). Dilayani melalui Global CDN Vercel Edge Cache. Beban VUs pada aset statis sangat ringan dan terdistribusi. |
| **Backend** | Vercel Serverless Functions (`/api/*`) | Serverless Node.js runtime. Memiliki batas *concurrency* (100 concurrent execution pada Hobby tier, hingga 1.000 pada Pro tier). Cold start berkisar antara 250–800 ms. Timeout eksekusi 10s (Hobby) / 300s (Pro). |
| **Database** | TiDB Cloud Serverless (MySQL HTAP) | Serverless distributed database. Terhubung melalui `@tidbcloud/serverless` HTTP driver. Memiliki batas konsumsi Request Units (RU) dan batas koneksi simultan gateway. |
| **Autentikasi** | Google Identity Services + JWT (`_auth.js`) | Autentikasi stateless menggunakan signed JWT token (30 hari). Verifikasi token dilakukan in-memory pada backend serverless tanpa perlu query database setiap request. |
| **Client Storage** | Dexie IndexedDB (Offline-first) | Pada klien nyata, manipulasi data dilakukan lokal di IndexedDB lalu disinkronkan ke server melalui polling/push interval (`/api/sync`). |

### Daftar API Endpoint Aktual (Verified)
* `GET /api/sync` — Mengambil seluruh data pengguna terisolasi (*wallets, transactions, goals, parfumBatches, parfumSales, settings*). Ini adalah endpoint pembacaan data utama (*read-heavy*).
* `POST /api/sync` — Melakukan mutasi data (*batch_sync, save, update, delete, reset_to_zero*).
* `POST /api/auth/login` — Autentikasi email & kata sandi serta pendaftaran user staging.
* `POST /api/auth/google` — Autentikasi Google OAuth token.
* `GET /api/init-db` — Inisialisasi skema tabel database (terproteksi `ADMIN_KEY` / token owner).
* `/manifest.webmanifest` & `index.html` — Pengujian edge asset & static shell healthcheck.

---

## 2. Aturan Keselamatan Pengujian (Safety Rules)

> [!CAUTION]
> **DILARANG KERAS MENJALANKAN LOAD TESTING KE URL PRODUKSI (`velto-pearl.vercel.app`)!**
> Pengujian dengan beban tinggi pada produksi dapat menghabiskan kuota Vercel/TiDB dan mengganggu integritas data pengguna asli.

1. **Staging Environment Only**: Semua pengujian wajib diarahkan ke URL staging terisolasi atau instance lokal (contoh: `http://localhost:5173` atau `https://velto-staging.vercel.app`).
2. **Database Terpisah**: Staging wajib menggunakan database atau cluster TiDB terpisah dari produksi.
3. **Automated Production Guard**: Seluruh script k6 telah dilengkapi `enforceSafetyGuard()`. Eksekusi akan **langsung dibatalkan secara otomatis** jika URL target mengandung domain produksi.
4. **Proteksi High-Load (>100 VUs)**: Beban di atas 100 VUs wajib menyertakan flag konfirmasi eksplisit `-e ALLOW_HIGH_LOAD=true`.
5. **Operasi Read-Only**: Skenario uji kapasitas utama difokuskan pada alur pembacaan data (`GET /api/sync` dan aset statis) untuk mencegah pengisian data sampah finansial (*destructive write operations*).

---

## 3. Instalasi Grafana k6

### Windows
```powershell
# Menggunakan winget
winget install k6 --source winget

# Atau menggunakan Chocolatey
choco install k6

# Atau menggunakan Scoop
scoop install k6
```

### Linux (Ubuntu / Debian)
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### macOS
```bash
brew install k6
```

### Docker
```bash
docker pull grafana/k6:latest
```

---

## 4. Struktur Test Suite

```
tests/performance/
├── config.js           # Konfigurasi bersama, safety guard, SLO thresholds, dan custom reporter
├── smoke-test.js       # Uji kelayakan awal (1–5 VUs, 1 menit)
├── baseline-test.js    # Uji patokan performa normal (10–20 VUs, 3 menit)
├── capacity-test.js    # Uji kapasitas bertahap (10 -> 50 -> 100 -> 250 -> 500 -> 1k -> 2k -> 3.5k -> 5k VUs)
├── stress-test.js      # Uji titik jenuh sistem & breaking point (hingga 3.000 VUs)
├── spike-test.js       # Uji lonjakan trafik mendadak (15 detik ke 1.500 VUs)
├── soak-test.js        # Uji kestabilan jangka panjang (sustained load 30m - 2h)
└── reports/            # Folder otomatis penyimpanan laporan (.md & .json)
```

---

## 5. Cara Menjalankan Pengujian

### Langkah Persiapan: Mendapatkan Token Staging
Jalankan request registrasi atau login pada staging backend untuk mendapatkan token JWT staging:
```bash
curl -X POST https://your-staging-url.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testing-k6@velto.test","password":"PasswordStaging123!","fullName":"K6 Staging Tester","isRegister":true}'
```
Salin nilai `token` yang dikembalikan untuk dimasukkan ke variabel `STAGING_TOKEN`.

---

### Skenario 1: Smoke Test (Sanity Check)
Memastikan endpoint staging menyala, otorisasi berfungsi, dan response contract sesuai:
```powershell
k6 run tests/performance/smoke-test.js `
  -e BASE_URL="https://your-staging-url.vercel.app" `
  -e STAGING_TOKEN="your_staging_jwt_token_here"
```

---

### Skenario 2: Baseline Benchmark
Menetapkan patokan performa (*golden baseline*) pada beban normal (10–20 VUs):
```powershell
k6 run tests/performance/baseline-test.js `
  -e BASE_URL="https://your-staging-url.vercel.app" `
  -e STAGING_TOKEN="your_staging_jwt_token_here"
```

---

### Skenario 3: Progressive Capacity Test (Hingga 5.000 VUs)
Menguji eskalasi kapasitas bertahap:
`10 -> 50 -> 100 -> 250 -> 500 -> 1,000 -> 2,000 -> 3,500 -> 5,000 VUs`.

> [!IMPORTANT]
> Membutuhkan `-e ALLOW_HIGH_LOAD=true` untuk membuka proteksi di atas 100 VUs.
```powershell
k6 run tests/performance/capacity-test.js `
  -e BASE_URL="https://your-staging-url.vercel.app" `
  -e STAGING_TOKEN="your_staging_jwt_token_here" `
  -e ALLOW_HIGH_LOAD=true
```

---

### Skenario 4: Stress Test (Breaking Point)
Mencari batas kapasitas maksimal di mana server mulai mengalami degradasi:
```powershell
k6 run tests/performance/stress-test.js `
  -e BASE_URL="https://your-staging-url.vercel.app" `
  -e STAGING_TOKEN="your_staging_jwt_token_here" `
  -e ALLOW_HIGH_LOAD=true
```

---

### Skenario 5: Spike Test (Elasticity Check)
Menguji lonjakan drastis dari 20 VUs ke 1.500 VUs dalam 15 detik:
```powershell
k6 run tests/performance/spike-test.js `
  -e BASE_URL="https://your-staging-url.vercel.app" `
  -e STAGING_TOKEN="your_staging_jwt_token_here" `
  -e ALLOW_HIGH_LOAD=true
```

---

### Skenario 6: Soak Stability Test (Long-duration)
Menguji kestabilan sistem selama 30 menit hingga 2 jam pada 70–80% kapasitas stabil:
```powershell
k6 run tests/performance/soak-test.js `
  -e BASE_URL="https://your-staging-url.vercel.app" `
  -e STAGING_TOKEN="your_staging_jwt_token_here" `
  -e SOAK_VUS=250 `
  -e SOAK_DURATION="30m" `
  -e ALLOW_HIGH_LOAD=true
```

---

## 6. Ambang Batas Performa (SLO Thresholds)

| Metrik | Target Optimal | Batas Toleransi Staging | Kriteria Kegagalan |
|---|---|---|---|
| **HTTP Failure Rate** | `< 0.1%` | `< 1.0%` | `> 5.0%` |
| **P50 Latency (Median)** | `< 250 ms` | `< 500 ms` | `> 1.000 ms` |
| **P95 Latency** | `< 600 ms` | `< 1.000 ms` | `> 2.500 ms` |
| **P99 Latency** | `< 1.200 ms` | `< 2.500 ms` | `> 5.000 ms` |
| **Checks Passed** | `100%` | `> 98%` | `< 92%` |

---

## 7. Prosedur Distributed Load Testing (5.000 Concurrent VUs)

Menjalankan 5.000 concurrent Virtual Users dari 1 laptop/mesin lokal memiliki risiko tinggi terjadi **generator bottleneck** (kehabisan file descriptor OS, ephemeral port exhaustion, atau CPU throttling), sehingga hasil pengujian menjadi tidak valid karena kelambatan terjadi di laptop tester, bukan di server Velto.

### A. Persyaratan Mesin Load Generator
Untuk menjalankan 5.000 VUs murni:
* Dibutuhkan minimal **3 hingga 5 instance Load Generator terdistribusi** (masing-masing menangani 1.000–1.500 VUs).
* Setiap node generator minimal: **4 vCPU, 8 GB RAM, 1 Gbps Network**.

### B. Tuning Kernel OS pada Node Load Generator (Linux)
Sebelum menjalankan k6 pada generator node, lakukan optimasi network socket:
```bash
# Naikkan batas file descriptor (open files)
ulimit -n 65535

# Optimasi rentang port TCP ephemeral & reuse
sudo sysctl -w net.ipv4.ip_local_port_range="1024 65535"
sudo sysctl -w net.ipv4.tcp_tw_reuse=1
sudo sysctl -w net.ipv4.tcp_fin_timeout=15
sudo sysctl -w net.core.somaxconn=4096
```

### C. Eksekusi Terdistribusi Menggunakan k6 Execution Partitioning
Gunakan opsi `--execution-segment` k6 untuk membagi beban 5.000 VUs ke beberapa generator:

* **Generator Node 1 (0% – 33% = ~1.666 VUs)**:
  ```bash
  k6 run --execution-segment "0:1/3" tests/performance/capacity-test.js -e ALLOW_HIGH_LOAD=true ...
  ```
* **Generator Node 2 (33% – 66% = ~1.666 VUs)**:
  ```bash
  k6 run --execution-segment "1/3:2/3" tests/performance/capacity-test.js -e ALLOW_HIGH_LOAD=true ...
  ```
* **Generator Node 3 (66% – 100% = ~1.666 VUs)**:
  ```bash
  k6 run --execution-segment "2/3:1" tests/performance/capacity-test.js -e ALLOW_HIGH_LOAD=true ...
  ```

---

## 8. Laporan & Diagnosa Masalah

Setiap eksekusi test suite secara otomatis mencetak ringkasan ke console dan menyimpan file laporan ke:
* `tests/performance/reports/<test-name>-report.md`
* `tests/performance/reports/<test-name>-data.json`

### Indikator Masalah Umum & Tindakan Remediasi:
1. **HTTP 429 Too Many Requests**: Terjadi pembatasan *rate limiting* atau *concurrency limit* Vercel Serverless Function telah terlampaui. Perlu upgrade batas concurrency Vercel atau penyesuaian cache policy.
2. **HTTP 504 Gateway Timeout**: Fungsi serverless mengalami timeout (>10 detik) saat menunggu koneksi database TiDB. Periksa TiDB Serverless connection pooling dan optimasi query indeks `(user_id, id)`.
3. **P95 Latency Melonjak Cepat**: Terjadi antrian request pada backend. Bandingkan latensi pada 100 VUs vs 500 VUs vs 1.000 VUs untuk menentukan batas kapasitas aman operasional saat ini.
