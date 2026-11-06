import React from 'react';
import { Plus, Wallet } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import SplitPaymentCard from '../components/common/SplitPaymentCard';

export default function WalletsPage({ onSelectWallet, onOpenNewWallet, onEditWallet }) {
  const { wallets } = useFinance();
  const walletList = wallets || [];

  return (
    <div className="space-y-6 pb-24 md:pb-8 px-5">
      {/* Header bar with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#1E1B2E] tracking-tight">
            Kantong Aset ({walletList.length})
          </h2>
          <p className="text-xs text-[#7E7A9B] font-medium mt-0.5">
            Kelola alokasi saldo, kartu, dan kantong finansial Anda
          </p>
        </div>

        {onOpenNewWallet && (
          <button
            onClick={onOpenNewWallet}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#6633EE] hover:bg-[#5827DE] text-white text-xs font-bold shadow-[0_6px_16px_-3px_rgba(102,51,238,0.35)] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah</span>
          </button>
        )}
      </div>

      {/* Wallets List or Empty State */}
      {walletList.length > 0 ? (
        <div className="space-y-3">
          {walletList.map(wallet => (
            <SplitPaymentCard
              key={wallet.id}
              wallet={wallet}
              onClick={() => onSelectWallet && onSelectWallet(wallet)}
              onEdit={onEditWallet}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-[#DDD7F2] text-center flex flex-col items-center justify-center shadow-soft-card mt-4">
          <div className="w-16 h-16 rounded-3xl bg-[#F3EEFF] text-[#6633EE] flex items-center justify-center mb-3 shadow-xs">
            <Wallet className="w-8 h-8 stroke-[2]" />
          </div>
          <h3 className="font-extrabold text-base text-[#1E1B2E]">Belum Ada Kantong Aset</h3>
          <p className="text-xs text-[#7E7A9B] mt-1.5 max-w-sm leading-relaxed">
            Akun Anda belum memiliki kantong aset. Tambahkan kantong rekening bank, e-wallet, atau kas fisik pertama Anda untuk mulai mencatat keuangan.
          </p>
          {onOpenNewWallet && (
            <button
              onClick={onOpenNewWallet}
              className="mt-5 px-5 py-2.5 rounded-2xl bg-[#6633EE] hover:bg-[#5827DE] text-white text-xs font-bold flex items-center gap-2 shadow-[0_8px_20px_-4px_rgba(102,51,238,0.4)] transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Buat Kantong Pertama</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
