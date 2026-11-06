import React from 'react';
import { Target, Sparkles, Calendar, Edit3, Trash2, ArrowRight, PlusCircle, ArrowDownRight, Flame } from 'lucide-react';
import { formatRupiah, formatPercentage } from '../../core/utils/currencyFormatter';

export default function SavingGoalCard({ goal, onEdit, onDelete, onDeposit, isPrimary = false }) {
  if (!goal) return null;

  const isManual = goal.mode === 'manual' || !goal.connectedWalletIds || goal.connectedWalletIds.length === 0;

  return (
    <div className="bg-gradient-to-br from-white to-[#FAF8FF] rounded-3xl border border-[#ECE8F6] shadow-soft-card relative overflow-hidden flex flex-col">
      {/* Background soft glowing orb */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-soft rounded-full filter blur-2xl opacity-60 pointer-events-none" />

      {/* Goal Image banner if available */}
      {goal.image && (
        <div className="w-full h-36 relative overflow-hidden bg-slate-100">
          <img 
            src={goal.image} 
            alt={goal.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between text-white">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md">
              {goal.category || 'Target Impian'}
            </span>
            {goal.deadline && (
              <span className="text-[11px] font-medium opacity-90">
                Deadline: {goal.deadline}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            {!goal.image && (
              <div className="w-10 h-10 rounded-2xl bg-[#7C4DFF]/10 text-[#7C4DFF] flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 stroke-[2.2]" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-[#1E1B2E] tracking-tight">{goal.title}</h4>
                {isPrimary && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-[#7C4DFF]">
                    Prioritas Utama
                  </span>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isManual ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {isManual ? 'Setor Bebas' : 'Auto Terhubung'}
                </span>
                {goal.streak && goal.streak > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                    <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                    {goal.streak} Hari
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#7E7A9B] mt-0.5 font-medium line-clamp-1">
                {goal.description || 'Target tabungan Velto'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(goal)}
                className="p-1.5 rounded-xl hover:bg-[#F3EEFF] text-[#7E7A9B] hover:text-[#7C4DFF] transition-colors"
                title="Edit Target"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(goal.id)}
                className="p-1.5 rounded-xl hover:bg-rose-50 text-[#7E7A9B] hover:text-rose-500 transition-colors"
                title="Hapus Target"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Metric */}
        <div className="mt-4 relative z-10">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] text-[#7E7A9B] font-semibold uppercase tracking-wider block">Terkumpul</span>
              <span className="text-lg font-black text-[#1E1B2E]">
                {formatRupiah(goal.currentSaved)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#7E7A9B] font-semibold uppercase tracking-wider block">Target</span>
              <span className="text-sm font-bold text-[#6B7280]">
                {formatRupiah(goal.targetAmount)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#ECE8F6] h-3 rounded-full mt-2.5 overflow-hidden p-0.5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#6633EE] to-[#8054F6] transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
            />
          </div>

          {/* Stats Row */}
          <div className="mt-3 flex items-center justify-between text-xs font-semibold">
            <span className="text-[#7C4DFF] font-bold">
              {formatPercentage(goal.progressPercent, false)} Tercapai
            </span>
            <span className="text-[#7E7A9B]">
              Kurang {formatRupiah(goal.remaining)}
            </span>
          </div>

          {/* Estimation info chip */}
          <div className="mt-3.5 p-2.5 bg-white rounded-2xl border border-[#ECE8F6] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-[#6B7280]">
              <Calendar className="w-3.5 h-3.5 text-[#7C4DFF]" />
              <span>Estimasi (@Rp50k/mgg):</span>
            </div>
            <span className="font-bold text-[#1E1B2E]">
              ~{goal.estimatedWeeksLeft} Minggu Lagi
            </span>
          </div>

          {/* Action button khusus Setor/Nabung Langsung dari Kantong */}
          {onDeposit && (
            <div className="mt-3 pt-2.5 border-t border-[#F4F2FA]">
              <button
                type="button"
                onClick={() => onDeposit(goal)}
                className="w-full py-2 px-3 rounded-xl bg-[#6633EE] hover:bg-[#5827DE] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.2]" />
                <span>Setor / Tarik Dana dari Kantong</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
