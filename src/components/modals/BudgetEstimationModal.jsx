import React, { useState } from 'react';
import { X, Sparkles, Send, Coins, Tag, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah } from '../../core/utils/currencyFormatter';

export default function BudgetEstimationModal({ isOpen, onClose }) {
  const { totalNetWorth, primaryGoal } = useFinance();

  const [weeklySavings, setWeeklySavings] = useState('50000');
  const [weeksEstimate, setWeeksEstimate] = useState('12');

  if (!isOpen) return null;

  const targetAmount = primaryGoal?.targetAmount || 1500000;
  const currentSaved = primaryGoal?.currentSaved || 0;
  const remaining = Math.max(0, targetAmount - currentSaved);

  const projectedSavings = Number(weeklySavings) * Number(weeksEstimate);
  const remainingAfterEstimate = Math.max(0, remaining - projectedSavings);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-[#ECE8F6] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-[#ECE8F6] rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-4 border-b border-[#F4F2FA]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[#6633EE]/10 text-[#6633EE] flex items-center justify-center font-bold">
              $
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1E1B2E]">Estimasi Tabungan & Target</h3>
              <p className="text-[11px] text-[#7E7A9B] font-medium">Kalkulasi proyeksi dana masa depan</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#F4F2FA] text-[#7E7A9B] hover:text-[#1E1B2E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="p-4 rounded-2xl bg-[#F3EEFF] border border-violet-100">
            <span className="text-[10px] font-bold text-[#6633EE] uppercase tracking-wider block">
              Target Kelulusan ({primaryGoal?.title || 'Dana SMK / Kuliah'})
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-black text-[#1E1B2E]">
                {formatRupiah(targetAmount)}
              </span>
              <span className="text-xs font-semibold text-[#7E7A9B]">
                Sisa: {formatRupiah(remaining)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1.5">
              Rencana Tabungan per Minggu (Rp)
            </label>
            <input
              type="number"
              value={weeklySavings}
              onChange={e => setWeeklySavings(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] focus:border-[#6633EE] text-sm font-bold text-[#1E1B2E] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1.5">
              Durasi Minggu yang Diestimasi
            </label>
            <input
              type="number"
              value={weeksEstimate}
              onChange={e => setWeeksEstimate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] focus:border-[#6633EE] text-sm font-bold text-[#1E1B2E] outline-none"
            />
          </div>

          {/* Result Calculation */}
          <div className="p-4 rounded-2xl bg-white border border-[#ECE8F6] shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span>Akumulasi Tabungan Baru:</span>
              <span className="font-extrabold text-emerald-600">+{formatRupiah(projectedSavings)}</span>
            </div>
            <div className="flex items-center justify-between text-[#6B7280]">
              <span>Sisa Target yang Harus Dipenuhi:</span>
              <span className="font-bold text-[#1E1B2E]">{formatRupiah(remainingAfterEstimate)}</span>
            </div>
            {remainingAfterEstimate === 0 && (
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px] pt-1 border-t border-[#F4F2FA]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Target Anda terpenuhi sepenuhnya dengan skema ini! 🎉</span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-[#6633EE] hover:bg-[#5827DE] text-white font-bold text-sm shadow-[0_8px_20px_-4px_rgba(102,51,238,0.4)] active:scale-[0.98] transition-all"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
