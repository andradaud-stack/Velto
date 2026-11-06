import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  HelpCircle, 
  Copy, 
  Check, 
  Wifi, 
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { googleSheetService } from '../../data/services/googleSheetService';
import { notificationService } from '../../data/services/notificationService';
import { formatDateTimeIndo } from '../../core/utils/currencyFormatter';

export default function GoogleSheetSyncCard() {
  const { wallets, transactions, goals, totalNetWorth } = useFinance();

  const [webhookUrl, setWebhookUrl] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    // Muat setting tersimpan
    googleSheetService.getWebhookUrl().then(url => setWebhookUrl(url || ''));
    googleSheetService.isAutoSyncEnabled().then(val => setAutoSync(val));
    // Muat waktu sync terakhir
    import('../../data/db/prefsHelper').then(({ prefsHelper }) => {
      prefsHelper.get('google_sheet_last_sync', null).then(time => setLastSyncTime(time));
    });
  }, []);

  const handleSaveUrl = async () => {
    await googleSheetService.saveWebhookUrl(webhookUrl);
    notificationService.success('URL Webhook Google Spreadsheet tersimpan!', 'Tersimpan');
  };

  const handleToggleAutoSync = async () => {
    const nextVal = !autoSync;
    setAutoSync(nextVal);
    await googleSheetService.setAutoSyncEnabled(nextVal);
    notificationService.info(
      nextVal ? 'Auto-sync aktif: Setiap transaksi baru langsung dikirim ke Sheet.' : 'Auto-sync dimatikan.',
      'Auto-Sync'
    );
  };

  const handleManualSync = async () => {
    if (!webhookUrl) {
      notificationService.error('Masukkan URL Webhook Google Apps Script terlebih dahulu.', 'URL Diperlukan');
      return;
    }
    setIsSyncing(true);
    try {
      const res = await googleSheetService.syncAllData({
        wallets,
        transactions,
        goals,
        totalNetWorth
      });
      if (res.success) {
        setLastSyncTime(res.timestamp);
      }
    } catch {
      // Error handled in service
    } finally {
      setIsSyncing(false);
    }
  };

  // Kode Google Apps Script siap pakai untuk pengguna
  const appsScriptCode = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Aksi: Append Transaksi Baru Real-Time
    if (data.action === "append_transaction") {
      var sheetMutasi = ss.getSheetByName("Mutasi Transaksi") || ss.insertSheet("Mutasi Transaksi");
      if (sheetMutasi.getLastRow() === 0) {
        sheetMutasi.appendRow(["ID Transaksi", "Waktu", "Tipe", "Judul / Catatan", "Nominal (Rp)", "Kategori", "Kantong / Sumber"]);
      }
      var tx = data.transaction;
      sheetMutasi.appendRow([tx.id, tx.date, tx.type, tx.title, tx.amount, tx.category, tx.walletName]);
    }

    // 2. Aksi: Sinkronisasi Total (Kantong & Saldo)
    if (data.action === "sync_all") {
      var sheetKantong = ss.getSheetByName("Saldo Kantong") || ss.insertSheet("Saldo Kantong");
      sheetKantong.clear();
      sheetKantong.appendRow(["ID", "Nama Kantong", "Tipe", "Saldo (Rp)", "Modal Investasi (Rp)", "Gram Emas", "Terakhir Update"]);
      data.wallets.forEach(function(w) {
        sheetKantong.appendRow([w.id, w.name, w.type, w.balance, w.investedCapital, w.goldGrams, w.updatedAt]);
      });

      var sheetMutasi = ss.getSheetByName("Mutasi Transaksi") || ss.insertSheet("Mutasi Transaksi");
      sheetMutasi.clear();
      sheetMutasi.appendRow(["ID Transaksi", "Waktu", "Tipe", "Judul Transaksi", "Nominal (Rp)", "Kategori", "Kantong"]);
      data.transactions.forEach(function(t) {
        sheetMutasi.appendRow([t.id, t.date, t.type, t.title, t.amount, t.category, t.walletId]);
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyScriptToClipboard = () => {
    navigator.clipboard?.writeText(appsScriptCode);
    setCopiedCode(true);
    notificationService.success('Kode Google Apps Script disalin ke clipboard!', 'Tersalin');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#ECE8F6] shadow-soft-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-[#1E1B2E] tracking-tight">
                Google Spreadsheet Cloud Sync
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                Real-Time
              </span>
            </div>
            <p className="text-xs text-[#7E7A9B] mt-0.5 font-medium">
              Otomatis cadangkan transaksi & saldo ke Google Sheet milikmu
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowTutorial(!showTutorial)}
          className="p-2 rounded-xl hover:bg-[#F4F2FA] text-[#7E7A9B] hover:text-[#6633EE] transition-all flex items-center gap-1 text-xs font-bold"
          title="Panduan Setup"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Cara Pasang</span>
        </button>
      </div>

      {/* Webhook Input Field */}
      <div className="space-y-2 pt-1">
        <label className="text-xs font-bold text-[#1E1B2E] block">
          URL Webhook Google Apps Script
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="flex-1 px-4 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] focus:border-[#7C4DFF] focus:bg-white text-xs font-semibold text-[#1E1B2E] outline-none transition-all"
          />
          <button
            type="button"
            onClick={handleSaveUrl}
            className="px-4 py-2.5 rounded-2xl bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold transition-all active:scale-95 shrink-0"
          >
            Simpan
          </button>
        </div>
      </div>

      {/* Action Buttons: Sync Now + Auto Sync Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#F4F2FA]">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#6633EE] hover:bg-[#5827DE] text-white text-xs font-bold shadow-button active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
          </button>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={handleToggleAutoSync}
              className="w-4 h-4 accent-[#6633EE] rounded cursor-pointer"
            />
            <span className="text-xs font-semibold text-[#1E1B2E]">Auto-Sync Realtime</span>
          </label>
        </div>

        {/* Last sync timestamp */}
        <div className="text-[11px] text-[#7E7A9B] font-medium text-right self-end sm:self-auto">
          {lastSyncTime ? (
            <span>Terakhir disinkron: <strong className="text-[#1E1B2E]">{formatDateTimeIndo(lastSyncTime)}</strong></span>
          ) : (
            <span className="text-amber-600 font-semibold">Belum pernah disinkron</span>
          )}
        </div>
      </div>

      {/* Tutorial Accordion & Copy Code */}
      {showTutorial && (
        <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#ECE8F6] space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#1E1B2E]">
              📋 Cara Menghubungkan Google Spreadsheet (Hanya 1 Menit):
            </h4>
            <button
              onClick={copyScriptToClipboard}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#ECE8F6] hover:border-[#6633EE] text-[11px] font-bold text-[#6633EE] transition-all shadow-xs"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Tersalin!' : 'Salin Script'}</span>
            </button>
          </div>

          <ol className="text-xs text-[#6B7280] space-y-1.5 list-decimal list-inside font-medium">
            <li>Buka <strong>Google Spreadsheet baru</strong> di browser.</li>
            <li>Klik menu <strong>Extensions (Ekstensi)</strong> &gt; pilih <strong>Apps Script</strong>.</li>
            <li>Hapus kode bawaan, lalu <strong>Tempel (Paste)</strong> kode yang kamu salin di atas.</li>
            <li>Klik tombol biru <strong>Deploy (Terapkan)</strong> di kanan atas &gt; pilih <strong>New deployment (Penerapan baru)</strong>.</li>
            <li>Pilih jenis <strong>Web app</strong>, ubah <em>Who has access</em> menjadi <strong>Anyone (Siapa saja)</strong>.</li>
            <li>Klik <strong>Deploy</strong>, lalu salin <strong>Web App URL</strong> yang dihasilkan dan tempelkan ke kolom input di atas!</li>
          </ol>
        </div>
      )}
    </div>
  );
}
