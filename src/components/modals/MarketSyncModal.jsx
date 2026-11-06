import React, { useState, useEffect } from 'react';
import { X, TrendingUp, RefreshCw, ShieldAlert, ArrowUpRight, Coins } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah, formatGoldGrams, formatPercentage } from '../../core/utils/currencyFormatter';

export default function MarketSyncModal({ isOpen, onClose, targetWallet }) {
  const { 
    wallets, 
    syncMarketRevaluation, 
    goldMarketInfo, 
    refreshGoldPrice 
  } = useFinance();

  const [selectedWalletId, setSelectedWalletId] = useState(targetWallet?.id || 'bibit');
  const [newValue, setNewValue] = useState('');
  const [goldPriceInput, setGoldPriceInput] = useState(goldMarketInfo.price || 1300390);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wallet = wallets?.find(w => w.id === selectedWalletId) || wallets?.find(w => w.type === 'investment');

  useEffect(() => {
    if (targetWallet) {
      setSelectedWalletId(targetWallet.id);
    }
  }, [targetWallet]);

  useEffect(() => {
    if (wallet) {
      setNewValue(wallet.balance.toString());
    }
  }, [wallet]);

  if (!isOpen) return null;

  const currentBalance = wallet ? wallet.balance : 0;
  const investedCapital = wallet ? wallet.investedCapital : 0;
  const projectedValue = Number(newValue) || currentBalance;
  const projectedGain = projectedValue - investedCapital;
  const gainPercent = investedCapital > 0 ? (projectedGain / investedCapital) * 100 : 0;

  const handleSyncSubmit = async (e) => {
    e.preventDefault();
    if (!wallet) return;
    setIsSubmitting(true);
    const res = await syncMarketRevaluation({
      walletId: wallet.id,
      newMarketValue: projectedValue,
      goldPrice: wallet.id === 'emas' ? Number(goldPriceInput) : null
    });
    setIsSubmitting(false);
    if (res.success) onClose();
  };

  const handleFetchGold = async () => {
    const res = await refreshGoldPrice();
    if (res?.price) {
      setGoldPriceInput(res.price);
      if (wallet?.id === 'emas' && wallet.goldGrams > 0) {
        const calculatedVal = Math.round(wallet.goldGrams * res.price);
        setNewValue(calculatedVal.toString());
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-[#ECE8F6] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-[#ECE8F6] rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-4 border-b border-[#F4F2FA]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1E1B2E]">Mark-to-Market (AC-03)</h3>
              <p className="text-[11px] text-[#7E7A9B] font-medium">Revaluasi Nilai Pasar & Capital Gain</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#F4F2FA] text-[#7E7A9B] hover:text-[#1E1B2E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSyncSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1">
              Pilih Kantong Investasi
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['bibit', 'emas'].map(id => {
                const w = wallets?.find(item => item.id === id);
                if (!w) return null;
                const isSelected = selectedWalletId === id;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => {
                      setSelectedWalletId(id);
                      setNewValue(w.balance.toString());
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected 
                        ? 'border-[#7C4DFF] bg-[#F3EEFF] text-[#7C4DFF]' 
                        : 'border-[#ECE8F6] bg-[#F4F2FA] text-[#1E1B2E]'
                    }`}
                  >
                    <span className="text-xs font-bold block">{w.name}</span>
                    <span className="text-[11px] text-[#7E7A9B] mt-0.5 block">{formatRupiah(w.balance)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gold Specific Live Price Fetcher */}
          {selectedWalletId === 'emas' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-600" /> Harga Emas Pasar Hari Ini
                </span>
                <button
                  type="button"
                  onClick={handleFetchGold}
                  disabled={goldMarketInfo.isUpdating}
                  className="flex items-center gap-1 text-[11px] text-[#7C4DFF] hover:underline font-bold"
                >
                  <RefreshCw className={`w-3 h-3 ${goldMarketInfo.isUpdating ? 'animate-spin' : ''}`} />
                  Cek Online
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={goldPriceInput}
                  onChange={e => {
                    const price = Number(e.target.value);
                    setGoldPriceInput(price);
                    if (wallet?.goldGrams > 0) {
                      setNewValue(Math.round(wallet.goldGrams * price).toString());
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs font-bold text-[#1E1B2E] outline-none"
                  placeholder="Harga per gram (Rp)"
                />
              </div>
              <p className="text-[10px] text-amber-700">
                Gramatur tersimpan: <strong>{formatGoldGrams(wallet?.goldGrams || 0.1538)}</strong>. Nilai baru otomatis disesuaikan!
              </p>
            </div>
          )}

          {/* New Market Value Input */}
          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1">
              Nilai Pasar Terkini (Current Balance Rupiah)
            </label>
            <input
              type="number"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              placeholder="Contoh: 518000"
              className="w-full px-4 py-3 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] focus:border-[#7C4DFF] focus:bg-white text-base font-extrabold text-[#1E1B2E] outline-none"
              required
            />
          </div>

          {/* AC-03 Compliance Banner Card */}
          <div className="p-3.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span>Modal Pokok Terinvestasi (Invested Capital):</span>
              <span className="font-bold text-[#1E1B2E]">{formatRupiah(investedCapital)}</span>
            </div>
            <div className="flex items-center justify-between text-[#6B7280]">
              <span>Proyeksi Capital Gain:</span>
              <span className={`font-extrabold ${projectedGain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {projectedGain >= 0 ? '+' : ''}{formatRupiah(projectedGain)} ({formatPercentage(gainPercent)})
              </span>
            </div>
            <div className="pt-2 border-t border-[#ECE8F6] flex items-center gap-1.5 text-[10px] text-[#7E7A9B] font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-[#7C4DFF] shrink-0" />
              <span>Aturan AC-03: Modal pokok tetap diisolasi, hanya saldo pasar yang diperbarui.</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-[#7C4DFF] hover:bg-[#6A37FF] text-white font-bold text-sm shadow-glow-primary active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            {isSubmitting ? 'Memperbarui...' : 'Simpan Revaluasi Pasar'}
          </button>
        </form>
      </div>
    </div>
  );
}
