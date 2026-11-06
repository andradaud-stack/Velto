import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Check, 
  HelpCircle, 
  ShieldCheck, 
  Sparkles,
  Smartphone,
  ExternalLink,
  KeyRound
} from 'lucide-react';
import { waNotificationService } from '../../data/services/waNotificationService';
import { notificationService } from '../../data/services/notificationService';

export default function WhatsAppNotificationCard() {
  const [token, setToken] = useState('');
  const [phone, setPhone] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    waNotificationService.getToken().then(t => setToken(t || ''));
    waNotificationService.getTargetPhone().then(p => setPhone(p || ''));
    waNotificationService.isEnabled().then(val => setEnabled(val));
  }, []);

  const handleSaveSettings = async () => {
    if (!token.trim()) {
      notificationService.error('Masukkan Token Fonnte terlebih dahulu.', 'Token Diperlukan');
      return;
    }
    if (!phone.trim()) {
      notificationService.error('Masukkan Nomor WhatsApp tujuan.', 'Nomor Diperlukan');
      return;
    }

    await waNotificationService.saveToken(token);
    const cleanedPhone = await waNotificationService.saveTargetPhone(phone);
    await waNotificationService.setEnabled(enabled);
    setPhone(cleanedPhone);

    notificationService.success('Pengaturan Notifikasi WhatsApp berhasil disimpan!', 'Tersimpan');
  };

  const handleToggleEnabled = async () => {
    const nextVal = !enabled;
    setEnabled(nextVal);
    await waNotificationService.setEnabled(nextVal);
    notificationService.info(
      nextVal ? 'Notifikasi otomatis WhatsApp diaktifkan.' : 'Notifikasi otomatis WhatsApp dimatikan.',
      'WhatsApp Bot'
    );
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    try {
      await waNotificationService.saveToken(token);
      await waNotificationService.saveTargetPhone(phone);
      await waNotificationService.sendTestMessage();
      notificationService.success('Pesan tes berhasil dikirim ke nomor WhatsApp kamu! Cek WhatsApp-mu sekarang.', 'Tes Berhasil');
    } catch (err) {
      notificationService.error(err.message || 'Gagal mengirim pesan tes. Pastikan token dan nomor WA valid.', 'Gagal Kirim');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#ECE8F6] shadow-soft-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-[#1E1B2E] tracking-tight">
                Notifikasi Otomatis WhatsApp Bot
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {enabled ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            <p className="text-xs text-[#7E7A9B] mt-0.5 font-medium">
              Kirim struk pengeluaran, pemasukan, & tabungan otomatis ke nomor WA
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="p-2 rounded-xl hover:bg-[#F4F2FA] text-[#7E7A9B] hover:text-[#6633EE] transition-all flex items-center gap-1 text-xs font-bold"
          title="Panduan Token Gratis"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Panduan</span>
        </button>
      </div>

      {/* Input Fields: Token & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="text-xs font-bold text-[#1E1B2E] block mb-1">
            Nomor WhatsApp Tujuan
          </label>
          <div className="relative">
            <Smartphone className="w-4 h-4 text-[#7E7A9B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="081234567890 atau 628..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] focus:border-[#7C4DFF] focus:bg-white text-xs font-semibold text-[#1E1B2E] outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#1E1B2E] block mb-1">
            API Token Fonnte (Gratis)
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-[#7E7A9B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Masukkan Token Fonnte..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] focus:border-[#7C4DFF] focus:bg-white text-xs font-semibold text-[#1E1B2E] outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Actions Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#F4F2FA]">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enabled}
              onChange={handleToggleEnabled}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
            <span className="text-xs font-semibold text-[#1E1B2E]">Kirim Otomatis Tiap Transaksi</span>
          </label>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleSendTest}
            disabled={isSendingTest}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#F4F2FA] hover:bg-[#EAE4F8] text-[#1E1B2E] text-xs font-bold transition-all disabled:opacity-50"
          >
            <Send className={`w-3.5 h-3.5 ${isSendingTest ? 'animate-pulse' : ''}`} />
            <span>{isSendingTest ? 'Mengirim...' : 'Tes Kirim WA'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-2xl bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold transition-all active:scale-95"
          >
            Simpan
          </button>
        </div>
      </div>

      {/* Tutorial Guide */}
      {showGuide && (
        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2.5 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-emerald-900">
              📲 Cara Mendapatkan API Token Fonnte (100% Gratis & Resmi):
            </h4>
            <a
              href="https://fonnte.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline"
            >
              <span>Buka Fonnte.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <ol className="text-[#4B5563] space-y-1 list-decimal list-inside font-medium">
            <li>Daftar akun gratis di <strong>fonnte.com</strong>.</li>
            <li>Di dashboard Fonnte, scan QR Code WhatsApp kamu satu kali.</li>
            <li>Salin <strong>Token</strong> yang ada di halaman utama Fonnte.</li>
            <li>Tempelkan ke kolom <em>API Token Fonnte</em> di atas dan masukkan nomor WA-mu.</li>
            <li>Klik <strong>Simpan</strong> lalu tekan <strong>Tes Kirim WA</strong>!</li>
          </ol>
        </div>
      )}
    </div>
  );
}
