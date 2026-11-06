import React, { useState } from 'react';
import { X, Target, Save, Check } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export default function EditGoalModal({ isOpen, onClose }) {
  const { primaryGoal, updateSavingGoal, wallets } = useFinance();

  const [title, setTitle] = useState(primaryGoal?.title || 'Dana Lulus SMK / Kuliah');
  const [targetAmount, setTargetAmount] = useState(primaryGoal?.targetAmount || 1500000);
  const [description, setDescription] = useState(primaryGoal?.description || '');
  const [deadline, setDeadline] = useState(primaryGoal?.deadline || '2027-06-30');
  const [connectedIds, setConnectedIds] = useState(primaryGoal?.connectedWalletIds || ['jago', 'bibit', 'emas']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleWallet = (id) => {
    if (connectedIds.includes(id)) {
      setConnectedIds(connectedIds.filter(item => item !== id));
    } else {
      setConnectedIds([...connectedIds, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await updateSavingGoal({
      id: primaryGoal?.id || 'kuliah_smk',
      title,
      targetAmount,
      description,
      deadline,
      connectedWalletIds: connectedIds
    });
    setIsSubmitting(false);
    onClose();
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
            <div className="w-9 h-9 rounded-xl bg-violet-100 text-[#7C4DFF] flex items-center justify-center">
              <Target className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="font-bold text-base text-[#1E1B2E]">Edit Saving Goal</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#F4F2FA] text-[#7E7A9B] hover:text-[#1E1B2E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1">Nama Target</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-sm font-bold text-[#1E1B2E] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1">Target Nominal (Rp)</label>
            <input
              type="number"
              value={targetAmount}
              onChange={e => setTargetAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-sm font-bold text-[#1E1B2E] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1">Hubungkan Kantong Sumber</label>
            <div className="grid grid-cols-2 gap-2">
              {(wallets || []).map(w => {
                const isChecked = connectedIds.includes(w.id);
                return (
                  <button
                    type="button"
                    key={w.id}
                    onClick={() => toggleWallet(w.id)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                      isChecked ? 'border-[#7C4DFF] bg-[#F3EEFF] text-[#7C4DFF]' : 'border-[#ECE8F6] bg-[#F4F2FA] text-[#1E1B2E]'
                    }`}
                  >
                    <span>{w.name}</span>
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1">Target Tanggal Kelulusan</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-sm text-[#1E1B2E] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-[#7C4DFF] hover:bg-[#6A37FF] text-white font-bold text-sm shadow-glow-primary active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan Target'}
          </button>
        </form>
      </div>
    </div>
  );
}
