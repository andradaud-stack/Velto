import React, { useState } from 'react';
import { X, Coins, Sparkles, AlertCircle, ArrowRight, Wallet, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah, formatGoldGrams } from '../../core/utils/currencyFormatter';
import { notificationService } from '../../data/services/notificationService';

export default function BuyGoldModal({ isOpen, onClose }) {
  const { wallets, goldMarketInfo, transferBetweenWallets } = useFinance();
  const [amount, setAmount] = useState('15000'); // Default Rp 15.000 (sesuai kebiasaan rutin hari Rabu)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultPrice = goldMarketInfo?.price || 2415631;
  const [goldPriceInput, setGoldPriceInput] = useState(defaultPrice.toString());
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  if (!isOpen) return null;

  const danaWallet = wallets?.find(w => w.id === 'dana') || { name: 'DANA', balance: 0 };
  const emasWallet = wallets?.find(w => w.id === 'emas') || { name: 'DANA eMAS', balance: 0, goldGrams: 0 };

  const activePrice = Number(goldPriceInput) || defaultPrice;
  const numAmount = Number(amount) || 0;
  const estimatedGrams = numAmount > 0 ? (numAmount / activePrice) : 0;
  const isBalanceEnough = (danaWallet.balance || 0) >= numAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!numAmount || numAmount <= 0) {
      notificationService.error('Nominal pembelian emas harus lebih dari Rp 0.', 'Nominal Tidak Valid');
      return;
    }

    if (!isBalanceEnough) {
      notificationService.error(
        `Saldo DANA kamu (${formatRupiah(danaWallet.balance)}) tidak cukup untuk beli emas ${formatRupiah(numAmount)}.`,
        'Saldo DANA Kurang'
      );
      return;
    }

    setIsSubmitting(true);
    const res = await transferBetweenWallets({
      sourceWalletId: 'dana',
      targetWalletId: 'emas',
      amount: numAmount,
      customGoldPrice: activePrice,
      note: `Beli Emas Rutin Rp ${numAmount.toLocaleString('id-ID')} via Saldo DANA`
    });
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-hero-card relative overflow-hidden border border-[#ECE8F6]">
        {/* Soft gold glowing orb */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F2FA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Coins className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1E1B2E] tracking-tight">
                Beli DANA eMAS
              </h3>
              <p className="text-xs text-[#7E7A9B] font-medium">
                Dipotong otomatis dari Saldo DANA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-[#7E7A9B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Live Price Chip with Quick Adjustment for DANA eMAS */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Harga Emas per Gram:</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingPrice(!isEditingPrice)}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline"
              >
                {isEditingPrice ? 'Selesai' : 'Sesuaikan Harga DANA'}
              </button>
            </div>

            {isEditingPrice ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="font-bold text-amber-900">Rp</span>
                <input
                  type="number"
                  value={goldPriceInput}
                  onChange={(e) => setGoldPriceInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-amber-300 font-black text-amber-900 text-sm outline-none"
                  placeholder="2415631"
                  step="1"
                />
              </div>
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-base font-black text-amber-900">
                  {formatRupiah(activePrice)} / gram
                </span>
                <span className="text-[10px] text-amber-700 font-medium">
                  {isEditingPrice || goldPriceInput !== defaultPrice.toString() ? 'Manual / DANA' : (goldMarketInfo?.sourceName || 'Pasar Live')}
                </span>
              </div>
            )}
          </div>

          {/* Saldo DANA Saat Ini */}
          <div className="p-3 rounded-2xl bg-[#F4F2FA] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#0275D8]" />
              <span className="text-[#1E1B2E] font-semibold">Saldo Tersedia di DANA:</span>
            </div>
            <span className={`font-black ${isBalanceEnough ? 'text-[#0275D8]' : 'text-rose-600 font-extrabold'}`}>
              {formatRupiah(danaWallet.balance || 0)}
            </span>
          </div>

          {/* Input Nominal Pembelian */}
          <div>
            <label className="text-xs font-bold text-[#1E1B2E] block mb-1.5">
              Nominal Beli Emas (Rupiah)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#7E7A9B] text-sm">
                Rp
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="15000"
                min="1000"
                step="1000"
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] focus:border-amber-500 focus:bg-white text-base font-extrabold text-[#1E1B2E] outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Quick Choice Chips */}
          <div className="flex gap-2">
            {[10000, 15000, 25000, 50000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  amount === val.toString()
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-[#F4F2FA] text-[#7E7A9B] hover:text-[#1E1B2E]'
                }`}
              >
                {val === 15000 ? '15k (Rabu)' : `${val / 1000}k`}
              </button>
            ))}
          </div>

          {/* Kalkulasi Konversi Gram Emas Real-Time */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 block">
              Estimasi Gram Emas yang Kamu Dapatkan:
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black tracking-tight">
                +{estimatedGrams.toFixed(4)} gram
              </span>
              <span className="text-xs opacity-90 font-semibold">
                dari {formatRupiah(numAmount)}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-white/20 text-[11px] opacity-90 flex items-center justify-between">
              <span>Total Emas Kamu Nanti:</span>
              <span className="font-extrabold">
                {formatGoldGrams((emasWallet.goldGrams || 0) + estimatedGrams)}
              </span>
            </div>
          </div>

          {/* Warning jika saldo DANA kurang */}
          {!isBalanceEnough && (
            <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Saldo DANA tidak cukup. Silakan isi saldo DANA dulu via transfer.</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !isBalanceEnough}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Memproses Beli Emas...' : `Konfirmasi Beli Emas (${formatRupiah(numAmount)})`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
