import { prefsHelper } from '../db/prefsHelper';
import { notificationService } from './notificationService';

/**
 * Service untuk Sinkronisasi Real-Time Velto ke Google Spreadsheet
 * Menggunakan Google Apps Script Webhook (POST Request)
 */

export const googleSheetService = {
  /**
   * Mengambil URL Webhook Google Sheet yang tersimpan di IndexedDB
   */
  async getWebhookUrl() {
    return await prefsHelper.get('google_sheet_webhook_url', '');
  },

  /**
   * Menyimpan URL Webhook Google Sheet
   */
  async saveWebhookUrl(url) {
    const trimmed = (url || '').trim();
    await prefsHelper.set('google_sheet_webhook_url', trimmed);
    return trimmed;
  },

  /**
   * Mengambil status auto-sync (apakah sinkron otomatis setiap ada transaksi)
   */
  async isAutoSyncEnabled() {
    return await prefsHelper.get('google_sheet_auto_sync', true);
  },

  /**
   * Mengubah status auto-sync
   */
  async setAutoSyncEnabled(enabled) {
    await prefsHelper.set('google_sheet_auto_sync', Boolean(enabled));
  },

  /**
   * Mengirim seluruh data saldo kantong dan mutasi ke Google Spreadsheet
   */
  async syncAllData({ wallets = [], transactions = [], goals = [], totalNetWorth = 0 }) {
    const webhookUrl = await this.getWebhookUrl();
    if (!webhookUrl) {
      throw new Error('URL Webhook Google Spreadsheet belum disetel.');
    }

    const studentName = await prefsHelper.get('user_profile_name', 'Velto User');

    const payload = {
      action: 'sync_all',
      timestamp: new Date().toISOString(),
      studentName,
      totalNetWorth,
      wallets: wallets.map(w => ({
        id: w.id,
        name: w.name,
        type: w.type,
        balance: w.balance || 0,
        investedCapital: w.investedCapital || 0,
        goldGrams: w.goldGrams || 0,
        updatedAt: w.updatedAt || new Date().toISOString()
      })),
      transactions: transactions.map(t => ({
        id: t.id,
        date: t.date,
        type: t.type,
        title: t.title,
        amount: t.amount,
        category: t.category || '-',
        walletId: t.walletId || t.sourceWalletId || '-',
        details: t.details || ''
      })),
      goals: goals.map(g => ({
        title: g.title,
        targetAmount: g.targetAmount,
        currentSaved: g.currentSaved || 0,
        progress: `${g.progressPercent || 0}%`
      }))
    };

    try {
      // mode: 'no-cors' digunakan untuk request ke Google Apps Script tanpa hambatan CORS browser
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const now = new Date().toISOString();
      await prefsHelper.set('google_sheet_last_sync', now);

      notificationService.success(
        'Data Velto berhasil dikirim ke Google Spreadsheet secara real-time!',
        'Spreadsheet Terupdate'
      );
      return { success: true, timestamp: now };
    } catch (err) {
      console.error('[GoogleSheetSync] Error:', err);
      notificationService.error(
        'Gagal mengirim data ke Google Spreadsheet. Periksa koneksi internet atau URL webhook.',
        'Gagal Sinkronisasi'
      );
      throw err;
    }
  },

  /**
   * Mengirim satu transaksi baru secara real-time begitu dicatat di aplikasi
   */
  async appendTransaction(transaction, walletName = 'Kantong') {
    const webhookUrl = await this.getWebhookUrl();
    const autoSync = await this.isAutoSyncEnabled();

    if (!webhookUrl || !autoSync) return;

    const payload = {
      action: 'append_transaction',
      timestamp: new Date().toISOString(),
      transaction: {
        id: transaction.id,
        date: transaction.date || new Date().toISOString(),
        type: transaction.type,
        title: transaction.title,
        amount: transaction.amount,
        category: transaction.category || 'Umum',
        walletName: walletName,
        details: transaction.details || ''
      }
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      console.log('[GoogleSheetSync] Live transaction appended to Sheet:', transaction.title);
    } catch (err) {
      console.warn('[GoogleSheetSync] Background append error:', err);
    }
  }
};
