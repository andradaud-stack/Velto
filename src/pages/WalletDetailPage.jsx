import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Coins, 
  CreditCard, 
  Banknote, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Calendar,
  Lock,
  RefreshCw,
  Plus,
  PlusCircle,
  Package,
  Pencil
} from 'lucide-react';
import { WALLET_META } from '../core/constants/appColors';
import { formatRupiah, formatGoldGrams, formatPercentage, formatDateTimeIndo } from '../core/utils/currencyFormatter';
import TransactionTile from '../components/common/TransactionTile';
import GoldPriceChart from '../components/common/GoldPriceChart';

const ICONS = {
  CreditCard,
  Banknote,
  Coins,
  TrendingUp,
  Sparkles
};

export default function WalletDetailPage({ 
  wallet, 
  transactions = [], 
  totalNetWorth = 0,
  goldMarketInfo,
  onBack, 
  onEditWallet,
  onOpenTopUp,
  onOpenMarketSync,
  onOpenTransfer,
  onOpenBuyGold,
  onOpenParfum,
  onRefreshGold 
}) {
  if (!wallet) return null;

  const isBibit = wallet.id === 'bibit';
  const isJago = wallet.id === 'jago';
  const isMandiri = wallet.id === 'mandiri';
  const isDana = wallet.id === 'dana';
  const isParfum = wallet.id === 'parfum';
  const isEmas = wallet.id === 'emas';
  const isCash = wallet.id === 'cash';

  const defaultMeta = WALLET_META[wallet.id] || {
    name: wallet.name,
    badge: wallet.type,
    color: '#7C4DFF',
    bgColor: '#F3EEFF',
    icon: 'CreditCard',
    description: 'Kantong Aset Pribadi'
  };

  const meta = {
    ...defaultMeta,
    name: wallet.name || defaultMeta.name,
    badge: wallet.type || defaultMeta.badge,
    color: wallet.color || defaultMeta.color,
    bgColor: wallet.bgColor || (wallet.color ? `${wallet.color}15` : defaultMeta.bgColor),
    icon: wallet.icon || defaultMeta.icon,
    description: defaultMeta.description
  };

  const IconComp = ICONS[meta.icon] || CreditCard;
  const isInvestment = wallet.type === 'investment';

  const capitalGain = isInvestment ? (wallet.balance - wallet.investedCapital) : 0;
  const gainPercent = isInvestment && wallet.investedCapital > 0 
    ? (capitalGain / wallet.investedCapital) * 100 
    : 0;

  const allocationPercent = totalNetWorth > 0 
    ? ((wallet.balance / totalNetWorth) * 100).toFixed(1) 
    : '0';

  const walletTransactions = transactions.filter(tx => 
    tx.walletId === wallet.id || 
    tx.sourceWalletId === wallet.id || 
    tx.targetWalletId === wallet.id
  );

  return (
    <div className="space-y-5 pb-24 md:pb-8 px-5">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-[#ECE8F6] text-xs font-bold text-[#1E1B2E] hover:border-[#7C4DFF] shadow-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          {onEditWallet && (
            <button
              onClick={() => onEditWallet(wallet)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#F3EEFF] border border-[#ECE8F6] text-xs font-bold text-[#6633EE] hover:bg-[#6633EE] hover:text-white transition-all shadow-xs"
            >
              <Pencil className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Edit Kantong</span>
            </button>
          )}

          <span 
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: meta.bgColor, color: meta.color }}
          >
            {meta.badge}
          </span>
        </div>
      </div>

      {/* Main Hero Wallet Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#ECE8F6] shadow-soft-card relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div 
              className="w-14 h-14 min-w-[56px] max-w-[56px] min-h-[56px] max-h-[56px] rounded-2xl flex items-center justify-center shrink-0 overflow-hidden p-2 shadow-xs border border-black/5"
              style={{ 
                backgroundColor: '#FFFFFF', 
                color: meta.color 
              }}
            >
              {wallet.photoUrl ? (
                <img src={wallet.photoUrl} alt={wallet.name} className="w-full h-full object-contain" />
              ) : isBibit ? (
                <img src="/bibit-logo.png" alt="Bibit" className="w-10 h-10 max-w-[40px] max-h-[40px] object-contain" />
              ) : isJago ? (
                <img src="/jago-logo.png" alt="Jago Syariah" className="w-10 h-10 max-w-[40px] max-h-[40px] object-contain" />
              ) : isMandiri ? (
                <img src="/mandiri-logo.png" alt="Bank Mandiri" className="w-10 h-10 max-w-[40px] max-h-[40px] object-contain" />
              ) : isDana ? (
                <img src="/dana-logo.png" alt="DANA" className="w-10 h-10 max-w-[40px] max-h-[40px] object-contain" />
              ) : isParfum ? (
                <img src="/parfum-logo.png" alt="Parfum" className="w-10 h-10 max-w-[40px] max-h-[40px] object-contain" />
              ) : isEmas ? (
                <img src="/emas-logo.png" alt="DANA eMAS" className="w-10 h-10 max-w-[40px] max-h-[40px] object-contain" />
              ) : isCash ? (
                <img src="/cash-logo.png" alt="Dompet Cash" className="w-10 h-10 max-w-[40px] max-h-[40px] object-contain" />
              ) : (
                <IconComp className="w-6 h-6 stroke-[2.2]" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1E1B2E] tracking-tight">{wallet.name}</h2>
              <p className="text-xs text-[#7E7A9B] mt-0.5 font-medium">{meta.description}</p>
            </div>
          </div>
        </div>

        {/* Current Balance */}
        <div className="mt-5 pt-4 border-t border-[#F4F2FA]">
          <span className="text-xs font-bold text-[#7E7A9B] uppercase tracking-wider block">
            Saldo Saat Ini
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <h1 className="text-3xl sm:text-4xl font-black text-[#1E1B2E] tracking-tight">
              {formatRupiah(wallet.balance)}
            </h1>
          </div>
        </div>

        {/* Meta Stats Row */}
        <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-[#F4F2FA]">
          <div className="p-3 rounded-2xl bg-[#F4F2FA]">
            <span className="text-[10px] text-[#7E7A9B] font-bold uppercase block">Modal Pokok</span>
            <span className="text-sm font-extrabold text-[#1E1B2E] mt-0.5 block">
              {formatRupiah(wallet.investedCapital)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#F4F2FA]">
            <span className="text-[10px] text-[#7E7A9B] font-bold uppercase block">Alokasi Portofolio</span>
            <span className="text-sm font-extrabold text-[#1E1B2E] mt-0.5 block">
              {allocationPercent}%
            </span>
          </div>
        </div>

        {/* Capital Gain or Isolation Badge */}
        <div className="mt-3">
          {isInvestment ? (
            <div className={`p-3 rounded-2xl flex items-center justify-between text-xs font-bold ${
              capitalGain >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              <div className="flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4" />
                <span>Capital Gain (AC-03):</span>
              </div>
              <span className="font-extrabold">
                {capitalGain >= 0 ? '+' : ''}{formatRupiah(capitalGain)} ({formatPercentage(gainPercent)})
              </span>
            </div>
          ) : wallet.id === 'parfum' ? (
            <div className="p-3.5 rounded-2xl bg-[#F3EEFF] border border-[#ECE8F6] text-xs">
              <div className="flex items-center gap-2 text-[#6633EE] font-bold">
                <Package className="w-4 h-4" />
                <span>Manajemen Stok & Laba FIFO</span>
              </div>
              <p className="text-[11px] text-[#7E7A9B] mt-1">
                Uang fisik hasil penjualan otomatis masuk full ke DANA / rekening yang kamu pilih saat catat penjualan agar saldo kas riil selalu seimbang 1:1.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-[#F4F2FA] flex items-center gap-2 text-xs font-semibold text-[#7E7A9B]">
              <Lock className="w-3.5 h-3.5 text-[#7E7A9B]" />
              <span>Modal & Gain Terkunci pada Rp 0 (Non-Investasi)</span>
            </div>
          )}
        </div>

        {/* Special Emas Metrics */}
        {isEmas && wallet.goldGrams > 0 && (
          <div className="mt-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                Total Kepemilikan Emas
              </span>
              <span className="text-base font-black text-amber-900 mt-0.5 block">
                {formatGoldGrams(wallet.goldGrams)}
              </span>
            </div>
            {onRefreshGold && (
              <button
                onClick={onRefreshGold}
                disabled={goldMarketInfo?.isUpdating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-all shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${goldMarketInfo?.isUpdating ? 'animate-spin' : ''}`} />
                <span>Update Harga</span>
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {onOpenTopUp && (
            <button
              onClick={() => onOpenTopUp(wallet)}
              className="flex-1 min-w-[130px] py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#6633EE] to-[#8054F6] hover:from-[#5727D8] hover:to-[#6F3FF0] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-[0_6px_16px_-3px_rgba(102,51,238,0.4)] transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>+ Tambah Saldo</span>
            </button>
          )}

          {wallet.id === 'parfum' && onOpenParfum && (
            <button
              onClick={onOpenParfum}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-[#6633EE] hover:bg-[#5727D8] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Buka Parfum FIFO</span>
            </button>
          )}

          {isEmas && onOpenBuyGold && (
            <button
              onClick={onOpenBuyGold}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Beli Emas via DANA</span>
            </button>
          )}

          {isInvestment && onOpenMarketSync && (
            <button
              onClick={() => onOpenMarketSync(wallet)}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-[#7C4DFF] hover:bg-[#6A37FF] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-glow-primary transition-all"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Sync MTM Pasar</span>
            </button>
          )}

          {onOpenTransfer && (
            <button
              onClick={onOpenTransfer}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-[#F4F2FA] hover:bg-slate-100 border border-[#ECE8F6] text-xs font-bold text-[#1E1B2E] flex items-center justify-center gap-1.5 transition-all"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#7C4DFF]" />
              <span>Transfer Dana</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Gold Price Chart */}
      {isEmas && (
        <GoldPriceChart
          historyData={goldMarketInfo?.history}
          currentPrice={goldMarketInfo?.price}
          buybackPrice={goldMarketInfo?.buyback}
          lastUpdated={goldMarketInfo?.lastUpdated}
          sourceName={goldMarketInfo?.sourceName}
          fluctuation={goldMarketInfo?.fluctuation}
        />
      )}

      {/* Mutasi Terkait */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#1E1B2E] tracking-tight">
            Riwayat Mutasi {wallet.name}
          </h3>
          <span className="text-[11px] font-bold text-[#7E7A9B]">
            {walletTransactions.length} Transaksi
          </span>
        </div>

        <div className="space-y-2.5">
          {walletTransactions.length > 0 ? (
            walletTransactions.map(tx => (
              <TransactionTile key={tx.id} transaction={tx} />
            ))
          ) : (
            <div className="p-6 text-center text-xs text-[#7E7A9B] bg-white rounded-3xl border border-[#ECE8F6] shadow-soft-card">
              Belum ada mutasi tercatat khusus pada kantong ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
