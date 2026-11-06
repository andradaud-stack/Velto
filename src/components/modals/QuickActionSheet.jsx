import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Banknote, 
  Coins, 
  AlertCircle 
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah, formatGoldGrams } from '../../core/utils/currencyFormatter';

export default function QuickActionSheet({ isOpen, onClose, defaultTab = 'saku' }) {
  const { 
    executeWeeklyAllowance, 
    recordParfumProfit, 
    transferBetweenWallets, 
    wallets,
    goldMarketInfo 
  } = useFinance();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parfum state
  const [parfumAmount, setParfumAmount] = useState('65000');
  const [parfumNote, setParfumNote] = useState('Penjualan parfum 30ml Vanilla');

  // Transfer state
  const [transferSource, setTransferSource] = useState('jago');
  const [transferTarget, setTransferTarget] = useState('cash');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');

  if (!isOpen) return null;

  // Handle Weekly Allowance
  const handleAllowanceSubmit = async () => {
    setIsSubmitting(true);
    await executeWeeklyAllowance();
    setIsSubmitting(false);
    onClose();
  };

  // Handle Parfum Profit
  const handleParfumSubmit = async (e) => {
    e.preventDefault();
    if (!parfumAmount || Number(parfumAmount) <= 0) return;
    setIsSubmitting(true);
    await recordParfumProfit({
      amount: parfumAmount,
      note: parfumNote,
      targetWalletId: 'parfum'
    });
    setIsSubmitting(false);
    onClose();
  };

  // Handle Transfer
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferAmount || Number(transferAmount) <= 0) return;
    setIsSubmitting(true);
    const res = await transferBetweenWallets({
      sourceWalletId: transferSource,
      targetWalletId: transferTarget,
      amount: transferAmount,
      note: transferNote
    });
    setIsSubmitting(false);
    if (res.success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-[#ECE8F6] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Handlebar (Mobile) */}
        <div className="w-12 h-1.5 bg-[#ECE8F6] rounded-full mx-auto mb-4 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F4F2FA]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-violet-100 text-[#7C4DFF] flex items-center justify-center">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="font-bold text-base text-[#1E1B2E]">Aksi Cepat Keuangan</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#F4F2FA] text-[#7E7A9B] hover:text-[#1E1B2E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1 bg-[#F4F2FA] rounded-2xl my-4">
          <button
            onClick={() => setActiveTab('saku')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'saku' ? 'bg-white text-[#7C4DFF] shadow-xs' : 'text-[#7E7A9B]'
            }`}
          >
            + Uang Saku
          </button>
          <button
            onClick={() => setActiveTab('parfum')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'parfum' ? 'bg-white text-[#7C4DFF] shadow-xs' : 'text-[#7E7A9B]'
            }`}
          >
            + Parfum
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'transfer' ? 'bg-white text-[#7C4DFF] shadow-xs' : 'text-[#7E7A9B]'
            }`}
          >
            Transfer
          </button>
        </div>

        {/* TAB 1: Uang Saku (+Rp 100.000) */}
        {activeTab === 'saku' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#F3EEFF] border border-violet-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7C4DFF] uppercase tracking-wider">
                  UANG SAKU MINGGUAN
                </span>
                <span className="text-sm font-black text-[#1E1B2E]">Rp 100.000</span>
              </div>
              <p className="text-xs text-[#6B7280] mt-1">
                Penerimaan uang saku mingguan penuh ke Dompet Cash. Pengeluaran dicatat mandiri & fleksibel:
              </p>

              <div className="mt-3 space-y-2 pt-2 border-t border-violet-200/60 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#1E1B2E] font-semibold">
                    <Banknote className="w-3.5 h-3.5 text-emerald-500" /> Dompet Cash (Kas Masuk)
                  </span>
                  <span className="font-extrabold text-emerald-600">+Rp 100.000</span>
                </div>
                <div className="flex items-center justify-between text-[#7E7A9B]">
                  <span>Pengeluaran Harian</span>
                  <span className="font-semibold text-[#1E1B2E]">Dicatat Manual Sesuai Belanja</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleAllowanceSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-[#7C4DFF] hover:bg-[#6A37FF] text-white font-bold text-sm shadow-glow-primary active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Memproses Transaksi...' : 'Tambah Uang Saku (+Rp 100.000)'}
            </button>
          </div>
        )}

        {/* TAB 2: Profit Parfum */}
        {activeTab === 'parfum' && (
          <form onSubmit={handleParfumSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1E1B2E] mb-1">
                Nominal Keuntungan Parfum (Rp)
              </label>
              <input
                type="number"
                value={parfumAmount}
                onChange={e => setParfumAmount(e.target.value)}
                placeholder="Contoh: 65000"
                className="w-full px-4 py-3 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] focus:border-[#7C4DFF] focus:bg-white text-sm font-bold text-[#1E1B2E] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1B2E] mb-1">
                Keterangan Penjualan
              </label>
              <input
                type="text"
                value={parfumNote}
                onChange={e => setParfumNote(e.target.value)}
                placeholder="Varian parfum / nama pembeli"
                className="w-full px-4 py-3 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] focus:border-[#7C4DFF] focus:bg-white text-sm text-[#1E1B2E] outline-none"
              />
            </div>

            <div className="p-3 rounded-2xl bg-pink-50 border border-pink-100 text-xs text-pink-700">
              Dana akan otomatis ditambahkan ke saldo dan modal kantong <strong>Profit Parfum</strong>.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-[#EC4899] hover:bg-[#DB2777] text-white font-bold text-sm shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan...' : 'Catat Laba Parfum'}
            </button>
          </form>
        )}

        {/* TAB 3: Transfer Antar Kantong */}
        {activeTab === 'transfer' && (
          <form onSubmit={handleTransferSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1E1B2E] mb-1">
                  Dari Kantong
                </label>
                <select
                  value={transferSource}
                  onChange={e => setTransferSource(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-xs font-bold text-[#1E1B2E] outline-none"
                >
                  {(wallets || []).map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatRupiah(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E1B2E] mb-1">
                  Ke Kantong
                </label>
                <select
                  value={transferTarget}
                  onChange={e => setTransferTarget(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-xs font-bold text-[#1E1B2E] outline-none"
                >
                  {(wallets || []).map(w => (
                    <option key={w.id} value={w.id} disabled={w.id === transferSource}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1B2E] mb-1">
                Nominal Transfer (Rp)
              </label>
              <input
                type="number"
                value={transferAmount}
                onChange={e => setTransferAmount(e.target.value)}
                placeholder="Contoh: 25000"
                className="w-full px-4 py-3 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] focus:border-[#7C4DFF] focus:bg-white text-sm font-bold text-[#1E1B2E] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1B2E] mb-1">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                value={transferNote}
                onChange={e => setTransferNote(e.target.value)}
                placeholder="Keperluan transfer"
                className="w-full px-4 py-3 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] focus:border-[#7C4DFF] focus:bg-white text-sm text-[#1E1B2E] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-[#7C4DFF] hover:bg-[#6A37FF] text-white font-bold text-sm shadow-glow-primary active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              {isSubmitting ? 'Mentransfer...' : 'Kirim Transfer Sekarang'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
