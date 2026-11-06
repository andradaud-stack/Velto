import React, { useState } from 'react';
import { X, Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export default function TransactionFormModal({ isOpen, onClose }) {
  const { addTransaction, wallets } = useFinance();

  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState('cash');
  const [category, setCategory] = useState('Konsumsi');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !title.trim()) return;

    setIsSubmitting(true);
    const res = await addTransaction({
      type,
      title,
      amount,
      walletId,
      category,
      details
    });
    setIsSubmitting(false);
    if (res.success) {
      setTitle('');
      setAmount('');
      setDetails('');
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
          <h3 className="font-bold text-base text-[#1E1B2E]">Catat Mutasi Keuangan</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#F4F2FA] text-[#7E7A9B] hover:text-[#1E1B2E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Income vs Expense Selector */}
          <div className="flex p-1 bg-[#F4F2FA] rounded-2xl">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory('Konsumsi'); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                type === 'expense' ? 'bg-white text-rose-600 shadow-xs' : 'text-[#7E7A9B]'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" /> Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory('Pemasukan'); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                type === 'income' ? 'bg-white text-emerald-600 shadow-xs' : 'text-[#7E7A9B]'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" /> Pemasukan
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1">Judul Transaksi</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Makan Siang / Fotokopi Tugas"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-sm text-[#1E1B2E] font-medium outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1">Nominal (Rp)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Contoh: 15000"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-base font-extrabold text-[#1E1B2E] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1E1B2E] mb-1">Pilih Kantong</label>
              <select
                value={walletId}
                onChange={e => setWalletId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-xs font-bold text-[#1E1B2E] outline-none"
              >
                {(wallets || []).map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1B2E] mb-1">Kategori</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-xs font-bold text-[#1E1B2E] outline-none"
              >
                <option value="Konsumsi">Konsumsi</option>
                <option value="Transportasi">Transportasi</option>
                <option value="Pendidikan">Pendidikan</option>
                <option value="Pemasukan">Pemasukan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1">Keterangan Tambahan</label>
            <input
              type="text"
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Opsional"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-xs text-[#1E1B2E] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-[#7C4DFF] hover:bg-[#6A37FF] text-white font-bold text-sm shadow-glow-primary active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>
    </div>
  );
}
