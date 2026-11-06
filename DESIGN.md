---
name: Velto
description: Personal Finance & Asset Operating System (Mobile-First PWA)
colors:
  canvas: "#F4F2FA"
  surface: "#FFFFFF"
  surface-border: "#ECE8F6"
  primary: "#7C4DFF"
  primary-dark: "#6633EE"
  primary-light: "#8054F6"
  primary-soft: "#F3EEFF"
  primary-hover: "#6A37FF"
  neutral-heading: "#1E1B2E"
  neutral-body: "#595574"
  neutral-muted: "#7E7A9B"
  gain: "#10B981"
  gain-soft: "#ECFDF5"
  loss: "#EF4444"
  loss-soft: "#FEF2F2"
  warning: "#F59E0B"
  warning-soft: "#FEF3C7"
  gold: "#EAB308"
  gold-soft: "#FEF9C3"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  card-surface:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

## Overview

Velto menghadirkan estetika **Modern Fintech (EasyPay Soft Lavender)** yang menggabungkan kemewahan violet royal dengan kanvas lembut lavender. Visual dirancang *mobile-first*, memprioritaskan keterbacaan angka finansial yang tajam, hierarki kartu aset yang modular, serta interaksi mikro yang presisi dan percaya diri.

- **Vibe:** Modern, teratur, aman, dan intuitif.
- **Audience:** Pelajar dan wirausahawan muda yang menginginkan kecepatan pencatatan tanpa kompleksitas software akuntansi konvensional.
- **Operating Mode:** Operate (kecepatan pencarian informasi, scanability saldo, dan integritas transaksi 1:1).

## Colors

Palet Velto dirancang dengan diferensiasi tegas antara kanvas latar, permukaan kartu, dan aksen interaktif:

- **Canvas (`#F4F2FA`):** Latar belakang lembut lavender yang mereduksi ketegangan mata dibanding putih murni.
- **Surface (`#FFFFFF`):** Kartu putih bersih yang menonjol di atas kanvas dengan garis tepi halus (`#ECE8F6`).
- **Primary Violet Brand:**
  - Royal Violet (`#7C4DFF`): Warna aksen utama untuk tombol penting dan indikator aktif.
  - Deep Purple (`#6633EE`): Aksen hero pada kartu Bank Jago dan tombol aksi transaksi.
  - Soft Lavender Pill (`#F3EEFF`): Latar belakang chip varian dan status badge.
- **Tipografi Netral:**
  - Deep Slate (`#1E1B2E`): Teks judul, nominal rupiah, dan label utama.
  - Body Slate (`#595574`): Teks narasi, mutasi, dan informasi pendukung berkontras tinggi (memenuhi WCAG AA 4.5:1).
  - Muted Slate (`#7E7A9B`): Label metadata sekunder dan tanggal.
- **Status Finansial:**
  - Keuntungan / Pemasukan: Emerald Green (`#10B981`) di atas `#ECFDF5`.
  - Kerugian / Pengeluaran: Rose Red (`#EF4444`) di atas `#FEF2F2`.
  - Peringatan / Stok Kritis: Amber Orange (`#F59E0B`) di atas `#FEF3C7`.
  - Tabungan Emas: Treasury Gold (`#EAB308` / `#F59E0B`) di atas `#FEF9C3`.

## Typography

Tipografi dibangun di atas **Plus Jakarta Sans** dengan fallback ke **Inter** dan system-ui.

- **Display (32px / font-extrabold):** Dipakai eksklusif untuk ringkasan total Net Worth dan nominal utama.
- **Headline (24px / font-bold):** Judul halaman dan saldo kartu hero utama.
- **Title (18px / font-bold):** Judul modal, nama kantong, dan judul bagian.
- **Body (14px / font-normal & font-medium):** Deskripsi transaksi, mutasi, dan isi form input.
- **Label / Micro (12px / font-semibold):** Kategori mutasi, persentase perubahan, dan badge stok (tidak boleh menggunakan teks fungsional di bawah 11px).

## Layout

- **Mobile Viewport:** Berpusat pada kontainer `max-w-[420px] mx-auto min-h-screen` dengan bantalan sisi `p-4` atau `p-5`.
- **Desktop Adaptation:** Tetap menjaga ritme portrait yang rapi dengan panel samping opsional untuk navigasi dan export tools pada layar lebar (`>= 768px`).
- **Spacing Scale:** Berbasis kelipatan 4px/8px (`gap-2`, `gap-3`, `gap-4`, `space-y-3`, `space-y-4`).
- **Safe Area:** Memperhitungkan bottom bar terapung setinggi 72px dengan padding bawah halaman minimal `pb-28`.

## Elevation & Depth

Velto mengadopsi prinsip *tonal layering* daripada shadow yang gelap dan kotor:

- **Soft Card Shadow:** `0 4px 20px -2px rgba(124, 77, 255, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)` memberikan efek melayang lembut tanpa bayangan hitam kasar.
- **Hero Card Glow:** `0 12px 32px -4px rgba(124, 77, 255, 0.35)` menciptakan kesan premium kartu debit Bank Jago.
- **Floating Bottom Bar:** `0 -4px 24px rgba(0, 0, 0, 0.08)` dengan latar putih/blur backdrop.

## Shapes

- **Radius Kartu Utama:** `rounded-3xl` (`24px` / `28px`) untuk semua kartu kontainer utama.
- **Radius Tombol & Input:** `rounded-2xl` (`16px`) untuk kenyamanan jempol saat tap pada layar sentuh.
- **Pill & Chip:** `rounded-full` (`9999px`) untuk badge status, tag varian parfum, dan chip kategori.
- **Border Treatment:** Border penuh tipis 1px (`border border-[#ECE8F6]`). Tidak menggunakan border tebal sebelah sisi (*side-tab*).

## Components

### Buttons
- **Primary:** `bg-[#6633EE]` atau `bg-[#7C4DFF]`, teks putih, `rounded-2xl`, bantalan `py-3 px-4`, font-bold.
- **Secondary / Subtle:** `bg-[#F4F2FA]`, teks `#1E1B2E`, border tipis `#ECE8F6`.
- **Action Circle:** Lingkaran 48px `w-12 h-12 rounded-2xl` dengan ikon terpusat dan label di bawahnya.

### Cards / Containers
- **Struktur:** Kartu putih berlatar `#FFFFFF`, radius `rounded-3xl`, bantalan `p-4` atau `p-5`, border `border-[#ECE8F6]`.
- **Hero Card:** Gradien ungu violet `#6633EE` → `#8054F6`, teks putih, nomor kartu disamarkan (`•••• 1099`).

### Inputs / Fields
- **Field:** Background putih, border `border-[#ECE8F6]`, radius `rounded-2xl`, tinggi minimal 44px untuk aksesibilitas tap target.
- **Focus:** Ring fokus halus `focus:ring-2 focus:ring-[#7C4DFF]/30 focus:border-[#7C4DFF]`.

### Navigation
- **Floating Bottom Nav:** 4 tab utama (Overview, Wallets, Mutasi, Settings) berlatar belakang putih dengan blur lembut, ikon aktif beraksen ungu violet `#7C4DFF`.

## Do's and Don'ts

### Do:
- **Do** gunakan kanvas `#F4F2FA` dan kartu `#FFFFFF` dengan border `#ECE8F6` untuk menjaga hierarki bersih.
- **Do** sediakan fitur penyembunyian saldo (*Privacy Eye Toggle*) pada semua nominal kekayaan bersih.
- **Do** pastikan seluruh teks interaktif memiliki ukuran minimal 11px dan memenuhi rasio kontras 4.5:1.
- **Do** pisahkan secara tegas antara mutasi riil (uang masuk/keluar) dengan dashboard evaluasi stok parfum (FIFO).

### Don't:
- **Don't** gunakan aksen border tebal sebelah sisi (`border-l-4`) pada kartu rounded.
- **Don't** gunakan animasi bounce kaku (`animate-bounce`); gunakan transisi halus atau pulse halus.
- **Don't** gunakan shadow hitam legam buram yang merusak tone modern lavender.
- **Don't** mencampuradukkan saldo profit parfum langsung ke dalam kekayaan bersih secara ganda (*double-counting*).
