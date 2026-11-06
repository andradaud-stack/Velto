import { prefsHelper } from '../db/prefsHelper';
import { notificationService } from './notificationService';
import { formatRupiah, formatDateTimeIndo } from '../../core/utils/currencyFormatter';

/**
 * WhatsApp Notification Service
 * Menggunakan Fonnte API Gateway (Resmi, Cepat, Gratis Free-Tier, Tanpa Server Sendiri)
 * Mendukung notifikasi real-time ke nomor WhatsApp pengguna saat:
 * 1. Transaksi baru dicatat (pengeluaran / pemasukan)
 * 2. Setoran ke Target Saving Goals
 * 3. Otomasi Uang Saku Rutin cair
 */

export const waNotificationService = {
  /**
   * Ambil token API Fonnte dari IndexedDB
   */
  async getToken() {
    return await prefsHelper.get('wa_fonnte_token', '');
  },

  /**
   * Simpan token API Fonnte
   */
  async saveToken(token) {
    const trimmed = (token || '').trim();
    await prefsHelper.set('wa_fonnte_token', trimmed);
    return trimmed;
  },

  /**
   * Ambil nomor WhatsApp tujuan (format 08xx atau 628xx)
   */
  async getTargetPhone() {
    return await prefsHelper.get('wa_target_phone', '');
  },

  /**
   * Simpan nomor WhatsApp tujuan
   */
  async saveTargetPhone(phone) {
    let clean = (phone || '').replace(/[^0-9]/g, '');
    // Konversi format 08xx -> 628xx agar sesuai standar WhatsApp API internasional
    if (clean.startsWith('08')) {
      clean = '628' + clean.slice(2);
    }
    await prefsHelper.set('wa_target_phone', clean);
    return clean;
  },

  /**
   * Cek apakah notifikasi otomatis WA aktif
   */
  async isEnabled() {
    return await prefsHelper.get('wa_notifications_enabled', false);
  },

  /**
   * Aktifkan / Matikan notifikasi otomatis WA
   */
  async setEnabled(enabled) {
    await prefsHelper.set('wa_notifications_enabled', Boolean(enabled));
  },

  /**
   * Kirim pesan teks mentah ke nomor WhatsApp
   */
  async sendMessage(messageText) {
    const token = await this.getToken();
    const target = await this.getTargetPhone();
    const isEnabled = await this.isEnabled();

    if (!token || !target) {
      console.warn('[WhatsApp] Token Fonnte atau Nomor WhatsApp belum disetel.');
      return { success: false, error: 'Token atau Nomor WA belum disetel.' };
    }

    try {
      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target: target,
          message: messageText,
          countryCode: '62'
        })
      });

      const result = await response.json();
      if (result.status === true) {
        console.log('[WhatsApp] Notifikasi WA berhasil terkirim ke:', target);
        return { success: true, result };
      } else {
        console.warn('[WhatsApp] Fonnte API response false:', result);
        return { success: false, error: result.reason || 'Gagal mengirim pesan via Fonnte.' };
      }
    } catch (err) {
      console.error('[WhatsApp] Send message network error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Notifikasi Otomatis: Transaksi Baru (Pemasukan / Pengeluaran)
   */
  async notifyNewTransaction({ type, title, amount, walletName, category, newBalance }) {
    const isEnabled = await this.isEnabled();
    if (!isEnabled) return;

    const isIncome = type === 'income' || type === 'business' || type === 'allowance_in';
    const emoji = isIncome ? '🟢 PEMASUKAN BARU' : '🔴 PENGELUARAN BARU';
    const sign = isIncome ? '+' : '-';

    const text = `🔔 *NOTIFIKASI VELTO FINANCE*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `*${emoji}*\n\n` +
      `📌 *Judul:* ${title}\n` +
      `💰 *Nominal:* ${sign}${formatRupiah(amount)}\n` +
      `📁 *Kategori:* ${category || 'Umum'}\n` +
      `💳 *Kantong:* ${walletName || 'Utama'}\n` +
      `⏱️ *Waktu:* ${formatDateTimeIndo(new Date().toISOString())}\n\n` +
      `_Tercatat otomatis di aplikasi Velto & tersinkronisasi offline-first._`;

    return await this.sendMessage(text);
  },

  /**
   * Notifikasi Otomatis: Setoran / Nabung ke Saving Goals
   */
  async notifyGoalDeposit({ goalTitle, amount, walletName, currentSaved, targetAmount, progressPercent }) {
    const isEnabled = await this.isEnabled();
    if (!isEnabled) return;

    const text = `🎯 *UPDATE SAVING GOAL VELTO*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🔥 *Nabung Berhasil! Api Streak Tetap Menyala!*\n\n` +
      `🎯 *Target:* ${goalTitle}\n` +
      `💵 *Setoran:* +${formatRupiah(amount)} (dari ${walletName})\n` +
      `📊 *Terkumpul:* ${formatRupiah(currentSaved)} / ${formatRupiah(targetAmount)}\n` +
      `📈 *Progres:* ${progressPercent}%\n` +
      `⏱️ *Waktu:* ${formatDateTimeIndo(new Date().toISOString())}\n\n` +
      `_Terus pertahankan konsistensi menabungmu! 💪_`;

    return await this.sendMessage(text);
  },

  /**
   * Tes Kirim Pesan Verifikasi Koneksi
   */
  async sendTestMessage() {
    const target = await this.getTargetPhone();
    const token = await this.getToken();

    if (!token) throw new Error('Token Fonnte belum diisi.');
    if (!target) throw new Error('Nomor WhatsApp tujuan belum diisi.');

    const testText = `✅ *KONEKSI WHATSAPP VELTO BERHASIL!*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `Halo Andra! Nomor WhatsApp kamu telah sukses terhubung dengan sistem notifikasi otomatis *Velto Financial Platform*.\n\n` +
      `Setiap ada transaksi baru atau uang tabungan yang disetor, notifikasi real-time akan dikirimkan otomatis ke chat ini. 🚀`;

    const res = await this.sendMessage(testText);
    if (!res.success) {
      throw new Error(res.error || 'Gagal mengirim pesan tes.');
    }
    return res;
  }
};
