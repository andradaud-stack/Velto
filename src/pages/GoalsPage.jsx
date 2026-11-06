import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah, formatPercentage } from '../core/utils/currencyFormatter';
import SavingGoalCard from '../components/common/SavingGoalCard';
import DepositGoalModal from '../components/modals/DepositGoalModal';
import StreakBanner from '../components/common/StreakBanner';
import { calculateSavingStreak } from '../core/utils/streakCalculator';
import { Target, Plus, Wallet, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function GoalsPage({ onOpenEditGoal, onOpenNewGoal }) {
  const { goals, primaryGoal, walletMap, transactions, deleteSavingGoal } = useFinance();
  const [activeGoalTab, setActiveGoalTab] = useState('all');
  const [depositModal, setDepositModal] = useState({ isOpen: false, goal: null });

  const allGoals = goals && goals.length > 0 ? goals : (primaryGoal ? [primaryGoal] : []);

  // Hitung saving streak dinamis
  const streakInfo = useMemo(() => {
    return calculateSavingStreak(transactions, allGoals);
  }, [transactions, allGoals]);

  // Summary Metrics
  const totalTarget = allGoals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const totalSaved = allGoals.reduce((sum, g) => sum + (g.currentSaved || 0), 0);
  const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  const handleDelete = async (goalId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus target tabungan ini?')) {
      await deleteSavingGoal(goalId);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 px-5">
      {/* Top Banner & Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1E1B2E] tracking-tight">Goals & Impian</h1>
          <p className="text-xs text-[#7E7A9B] mt-1 font-medium">
            Pantau rencana tabungan, impian, & target masa depan
          </p>
        </div>
        <button
          onClick={onOpenNewGoal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#6633EE] text-white text-xs font-bold shadow-button active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Gamified Saving Streak Banner (Api Konsistensi Menabung) */}
      <StreakBanner 
        streakInfo={streakInfo} 
        onQuickSave={onOpenNewGoal} 
      />

      {/* Aggregate Overview Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1E1B2E] to-[#2D274A] text-white shadow-soft-card relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/10 rounded-xl">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </span>
            <span className="text-xs font-semibold text-white/80">Total Tabungan Impian</span>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white">
            {allGoals.length} Target Aktif
          </span>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-black tracking-tight">{formatRupiah(totalSaved)}</span>
            <span className="text-xs text-white/60 ml-2">/ {formatRupiah(totalTarget)}</span>
          </div>
          <span className="text-sm font-black text-[#BFA8FF]">{overallProgress}%</span>
        </div>

        <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-[#7C4DFF] transition-all duration-700 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#1E1B2E]">Daftar Target Tabungan</h3>
          <span className="text-xs text-[#7E7A9B] font-semibold">{allGoals.length} Target</span>
        </div>

        {allGoals.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-[#ECE8F6]">
            <Target className="w-12 h-12 text-[#BFA8FF] mx-auto mb-3" />
            <h4 className="font-bold text-sm text-[#1E1B2E]">Belum Ada Target</h4>
            <p className="text-xs text-[#7E7A9B] mt-1 max-w-xs mx-auto">
              Mulai wujudkan impianmu seperti beli gadget, biaya kuliah, atau liburan dengan menetapkan target baru!
            </p>
            <button
              onClick={onOpenNewGoal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6633EE] text-white text-xs font-bold shadow-button"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Target Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allGoals.map((g, idx) => (
              <SavingGoalCard
                key={g.id || idx}
                goal={g}
                isPrimary={idx === 0}
                onEdit={onOpenEditGoal}
                onDelete={allGoals.length > 1 ? handleDelete : null}
                onDeposit={(selectedGoal) => setDepositModal({ isOpen: true, goal: selectedGoal })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Live Connected Wallets Breakdown */}
      {primaryGoal && (
        <div className="bg-white rounded-3xl p-5 border border-[#ECE8F6] shadow-soft-card">
          <h4 className="font-bold text-xs text-[#1E1B2E] uppercase tracking-wider mb-3">
            Sumber Dana Utama Terhubung ({primaryGoal.title})
          </h4>
          <div className="space-y-2.5">
            {(primaryGoal?.connectedWalletIds || ['jago', 'bibit', 'emas']).map(id => {
              const w = walletMap[id];
              if (!w) return null;
              return (
                <div key={id} className="flex items-center justify-between p-3 rounded-2xl bg-[#F4F2FA]">
                  <div className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4 text-[#7C4DFF]" />
                    <div>
                      <span className="text-xs font-bold text-[#1E1B2E] block">{w.name}</span>
                      <span className="text-[10px] text-[#7E7A9B] uppercase font-semibold">{w.type}</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#1E1B2E]">
                    {formatRupiah(w.balance)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Deposit / Tarik Dana Modal */}
      <DepositGoalModal
        isOpen={depositModal.isOpen}
        goal={depositModal.goal}
        onClose={() => setDepositModal({ isOpen: false, goal: null })}
      />
    </div>
  );
}
