import React, { useState } from 'react';
import { X, PlusCircle, MinusCircle, Wallet, ArrowDownRight, ArrowUpRight, Check } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah } from '../../core/utils/currencyFormatter';

export default function DepositGoalModal({ isOpen, onClose, goal }) {
  const { wallets, depositToGoal } = useFinance();
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [actionType, setActionType] = useState('deposit'); // 'deposit' (nabung) or 'withdraw' (tarik)
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !goal) return null;

  const activeWallets = wallets || [];
  const currentWallet = activeWallets.find(w => w.id === (selectedWalletId || activeWallets[0]?.id));
  const effectiveWalletId = selectedWalletId || activeWallets[0]?.id;

  const quickAmounts = [10000, 20000, 50000, 100000, 200000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) return;

    setIsSubmitting(true);
    const res = await depositToGoal({
      goalId: goal.id,
      walletId: effectiveWalletId,
      amount: num,
      type: actionType,
      note: note || (actionType === 'deposit' ? `Tabungan ${goal.title}` : `Tarik dana ${goal.title}`)
    });
    setIsSubmitting(false);

    if (res.success) {
      setAmount('');
      setNote('');
      onClose();
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
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              actionType === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {actionType === 'deposit' ? (
                <ArrowDownRight className="w-5 h-5 stroke-[2.4]" />
              ) : (
                <ArrowUpRight className="w-5 h-5 stroke-[2.4]" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1E1B2E]">
                {actionType === 'deposit' ? 'Setor Dana Tabungan' : 'Tarik Dana dari Target'}
              </h3>
              <p className="text-xs text-[#7E7A9B] font-medium">Target: {goal.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#F4F2FA] text-[#7E7A9B] hover:text-[#1E1B2E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Setor (Nabung) vs Tarik */}
        <div className="flex p-1 bg-[#F4F2FA] rounded-2xl mt-4">
          <button
            type="button"
            onClick={() => setActionType('deposit')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              actionType === 'deposit' 
                ? 'bg-white text-[#6633EE] shadow-xs' 
                : 'text-[#7E7A9B] hover:text-[#1E1B2E]'
            }`}
          >
            + Setor / Nabung
          </button>
          <button
            type="button"
            onClick={() => setActionType('withdraw')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              actionType === 'withdraw' 
                ? 'bg-white text-rose-600 shadow-xs' 
                : 'text-[#7E7A9B] hover:text-[#1E1B2E]'
            }`}
          >
            - Tarik Dana
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Pilih Kantong Sumber / Tujuan */}
          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1.5">
              {actionType === 'deposit' ? 'Diambil dari Kantong Mana?' : 'Kembalikan ke Kantong Mana?'}
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto no-scrollbar">
              {activeWallets.map(w => {
                const isSelected = effectiveWalletId === w.id;
                return (
                  <button
                    type="button"
                    key={w.id}
                    onClick={() => setSelectedWalletId(w.id)}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between text-xs transition-all ${
                      isSelected 
                        ? 'border-[#6633EE] bg-[#F3EEFF] text-[#6633EE] shadow-xs' 
                        : 'border-[#ECE8F6] bg-[#F8F7FC] text-[#1E1B2E] hover:bg-slate-100/60'
                    }`}
                  >
                    <span className="font-bold truncate">{w.name}</span>
                    <span className="text-[10px] opacity-75 mt-0.5">{formatRupiah(w.balance)}</span>
                  </button>
                );
              })}
            </div>
            {currentWallet && (
              <span className="text-[11px] text-[#7E7A9B] block mt-1.5 font-medium">
                Saldo tersedia di {currentWallet.name}: <strong>{formatRupiah(currentWallet.balance)}</strong>
              </span>
            )}
          </div>

          {/* Nominal */}
          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1">
              Nominal {actionType === 'deposit' ? 'Tabungan' : 'Penarikan'} (Rp)
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Contoh: 10000"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-lg font-black text-[#1E1B2E] outline-none focus:border-[#6633EE] focus:bg-white transition-all"
              required
            />

            {/* Quick chips (10k, 20k, 50k, 100k, 200k) */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-1">
              {quickAmounts.map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(val.toString())}
                  className="px-2.5 py-1 rounded-xl bg-[#F4F2FA] hover:bg-[#F3EEFF] hover:text-[#6633EE] text-[11px] font-bold text-[#7E7A9B] transition-all shrink-0"
                >
                  +{val / 1000}k
                </button>
              ))}
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1">Catatan (Opsional)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Contoh: Sisa uang jajan hari ini"
              className="w-full px-4 py-2 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-xs text-[#1E1B2E] outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-button active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
              actionType === 'deposit' 
                ? 'bg-[#6633EE] hover:bg-[#5827DE]' 
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isSubmitting 
                ? 'Memproses...' 
                : actionType === 'deposit' 
                  ? `Setor ${amount ? formatRupiah(amount) : ''} ke Target` 
                  : `Tarik ${amount ? formatRupiah(amount) : ''}`
              }
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}