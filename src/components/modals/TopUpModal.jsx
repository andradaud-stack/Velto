import React, { useState, useEffect } from 'react';
import { X, Plus, PlusCircle, Check, ArrowRight, Wallet, Sparkles } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah } from '../../core/utils/currencyFormatter';

export default function TopUpModal({ isOpen, onClose, targetWallet }) {
  const { wallets, topUpWallet } = useFinance();

  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isDirectSet, setIsDirectSet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (targetWallet) {
      setSelectedWalletId(targetWallet.id);
    } else if (wallets && wallets.length > 0) {
      setSelectedWalletId(wallets[0].id);
    }
    setAmount('');
    setNote('');
    setIsDirectSet(false);
  }, [targetWallet, isOpen, wallets]);

  if (!isOpen) return null;

  const currentWallet = (wallets || []).find(w => w.id === selectedWalletId) || targetWallet;
  const currentBalance = Number(currentWallet?.balance || 0);
  const inputAmount = Number(amount) || 0;
  const newBalancePreview = isDirectSet ? inputAmount : currentBalance + inputAmount;

  const quickAmounts = [50000, 100000, 250000, 500000, 1000000, 5000000];

  const handleQuickAdd = (val) => {
    if (isDirectSet) {
      setAmount(String(val));
    } else {
      setAmount(String(inputAmount + val));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWalletId) return;
    if (inputAmount <= 0 && !isDirectSet) return;

    setIsSubmitting(true);
    const res = await topUpWallet({
      walletId: selectedWalletId,
      amount: inputAmount,
      isDirectSet,
      note: note.trim()
    });
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-[#ECE8F6] max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-[#ECE8F6] rounded-full mx-auto mb-4 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F4F2FA]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[#F3EEFF] text-[#6633EE] flex items-center justify-center">
              <PlusCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1E1B2E]">Isi Saldo Kartu</h3>
              <p className="text-[11px] text-[#7E7A9B]">Tambah atau atur saldo pada kantong aset</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#F4F2FA] text-[#7E7A9B] hover:text-[#1E1B2E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Target Wallet Card Info */}
          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1.5">Pilih Kantong Aset</label>
            <select
              value={selectedWalletId}
              onChange={e => setSelectedWalletId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-sm font-bold text-[#1E1B2E] outline-none focus:border-[#6633EE] transition-all"
            >
              {(wallets || []).map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({formatRupiah(w.balance)})
                </option>
              ))}
            </select>
          </div>

          {/* Mode Tabs: Tambah (+) vs Atur Saldo Langsung (=) */}
          <div className="flex p-1 bg-[#F4F2FA] rounded-2xl">
            <button
              type="button"
              onClick={() => setIsDirectSet(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                !isDirectSet ? 'bg-white text-[#6633EE] shadow-xs' : 'text-[#7E7A9B]'
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Tambah Saldo</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDirectSet(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                isDirectSet ? 'bg-white text-[#6633EE] shadow-xs' : 'text-[#7E7A9B]'
              }`}
            >
              <span>= Atur Saldo Langsung</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1.5">
              {isDirectSet ? 'Nominal Saldo Sekarang (Rp)' : 'Nominal Tambah Saldo (Rp)'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-sm font-black text-[#7E7A9B] pointer-events-none">
                Rp
              </span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={isDirectSet ? 'Contoh: 1500000' : 'Contoh: 500000'}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-lg font-black text-[#1E1B2E] outline-none focus:border-[#6633EE] transition-all"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E7A9B] block mb-1.5">
              Pilihan Cepat
            </span>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  className="py-1.5 px-2 rounded-xl bg-[#F4F2FA] hover:bg-[#F3EEFF] border border-[#ECE8F6] hover:border-[#6633EE]/40 text-[11px] font-bold text-[#1E1B2E] hover:text-[#6633EE] transition-all active:scale-95"
                >
                  +{formatRupiah(val).replace('Rp\u00a0', '').replace(',00', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Balance Preview Card */}
          <div className="p-3.5 rounded-2xl bg-[#F3EEFF] border border-[#ECE8F6]/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#7E7A9B] uppercase block">Saldo Saat Ini</span>
              <span className="font-extrabold text-[#1E1B2E] text-xs">
                {formatRupiah(currentBalance)}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#6633EE]" />
            <div className="text-right">
              <span className="text-[10px] font-bold text-[#6633EE] uppercase block">Saldo Baru</span>
              <span className="font-black text-[#6633EE] text-sm">
                {formatRupiah(newBalancePreview)}
              </span>
            </div>
          </div>

          {/* Optional Note / Source */}
          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1">
              Catatan / Sumber Dana <span className="text-[10px] font-normal text-[#7E7A9B]">(Opsional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Contoh: Gaji Bulanan / Setor Tunai / Saldo Awal"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-xs text-[#1E1B2E] font-medium outline-none focus:border-[#6633EE] transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || (inputAmount <= 0 && !isDirectSet)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6633EE] to-[#8054F6] hover:from-[#5727D8] hover:to-[#6F3FF0] text-white font-extrabold text-sm shadow-[0_8px_20px_-4px_rgba(102,51,238,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan & Tambah Saldo'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
