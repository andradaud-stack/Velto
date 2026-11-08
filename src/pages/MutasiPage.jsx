import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah } from '../core/utils/currencyFormatter';
import TransactionTile from '../components/common/TransactionTile';
import MutasiCashflowChart from '../components/common/MutasiCashflowChart';
import { Search, Filter, Plus, ArrowUpDown } from 'lucide-react';

export default function MutasiPage({ onOpenNewTransaction }) {
  const { transactions } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTransactions = (transactions || []).filter(tx => {
    if (!tx) return false;
    const query = (searchTerm || '').toLowerCase().trim();
    const matchesSearch = !query ||
                          (tx.title || '').toLowerCase().includes(query) ||
                          (tx.details || '').toLowerCase().includes(query) ||
                          (tx.category || '').toLowerCase().includes(query);
    
    if (!matchesSearch) return false;
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'income') return tx.type === 'income' || tx.type === 'allowance_in' || tx.type === 'business';
    if (selectedCategory === 'expense') return tx.type === 'expense';
    if (selectedCategory === 'transfer') return tx.type === 'transfer';
    if (selectedCategory === 'mtm') return tx.type === 'mtm_sync';
    return true;
  });

  return (
    <div className="space-y-5 pb-24 md:pb-8 px-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1E1B2E] tracking-tight">Riwayat Mutasi</h1>
          <p className="text-xs text-[#7E7A9B] mt-1 font-medium">
            Arsip lengkap seluruh transaksi & mutasi keuangan
          </p>
        </div>
        <button
          onClick={onOpenNewTransaction}
          className="p-2.5 rounded-2xl bg-[#7C4DFF] hover:bg-[#6A37FF] text-white shadow-glow-primary active:scale-95 transition-all"
          title="Tambah Transaksi Manual"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Arus Kas & Rata-Rata Mutasi (Pemasukan vs Pengeluaran Dual Chart) */}
      <MutasiCashflowChart transactions={transactions} />

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#7E7A9B] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Cari transaksi, toko, atau catatan..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#ECE8F6] focus:border-[#7C4DFF] text-xs font-semibold text-[#1E1B2E] outline-none shadow-soft-card"
        />
      </div>

      {/* Category Pills */}
      <div className="flex p-1 bg-[#F4F2FA] rounded-2xl overflow-x-auto no-scrollbar gap-1">
        {[
          { id: 'all', label: 'Semua' },
          { id: 'income', label: 'Pemasukan' },
          { id: 'expense', label: 'Pengeluaran' },
          { id: 'transfer', label: 'Transfer' },
          { id: 'mtm', label: 'Revaluasi MTM' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === cat.id ? 'bg-white text-[#7C4DFF] shadow-xs' : 'text-[#7E7A9B]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-[#ECE8F6]">
            <p className="text-xs text-[#7E7A9B] font-medium">Tidak ada transaksi yang cocok.</p>
          </div>
        ) : (
          filteredTransactions.map(tx => (
            <TransactionTile
              key={tx.id}
              transaction={tx}
            />
          ))
        )}
      </div>
    </div>
  );
}
