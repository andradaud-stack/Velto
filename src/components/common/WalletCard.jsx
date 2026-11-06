import React from 'react';
import { 
  CreditCard, 
  Banknote, 
  Coins, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { WALLET_META } from '../../core/constants/appColors';
import { formatRupiah, formatGoldGrams, formatPercentage } from '../../core/utils/currencyFormatter';

const ICONS = {
  CreditCard,
  Banknote,
  Coins,
  TrendingUp,
  Sparkles
};

export default function WalletCard({ 
  wallet, 
  totalNetWorth, 
  onActionClick, 
  onSyncClick,
  compact = false 
}) {
  const meta = WALLET_META[wallet.id] || {
    name: wallet.name,
    badge: wallet.type,
    color: '#7C4DFF',
    bgColor: '#F3EEFF',
    icon: 'CreditCard'
  };

  const IconComp = ICONS[meta.icon] || CreditCard;
  const isInvestment = wallet.type === 'investment';
  
  // AC-03 Capital Gain Isolation: ONLY for investment wallets.
  const capitalGain = isInvestment ? (wallet.balance - wallet.investedCapital) : 0;
  const gainPercent = (isInvestment && wallet.investedCapital > 0) 
    ? (capitalGain / wallet.investedCapital) * 100 
    : 0;

  // Portfolio allocation
  const allocationPercent = totalNetWorth > 0 
    ? ((wallet.balance / totalNetWorth) * 100).toFixed(1) 
    : '0';

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#ECE8F6] shadow-soft-card hover:border-[#7C4DFF]/30 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon & Title */}
        <div className="flex items-center gap-3">
          <div 
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: meta.bgColor, color: meta.color }}
          >
            <IconComp className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-[#1E1B2E] tracking-tight">{wallet.name}</h4>
              <span 
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: meta.bgColor, color: meta.color }}
              >
                {meta.badge}
              </span>
            </div>
            <p className="text-[11px] text-[#7E7A9B] mt-0.5 flex items-center gap-1.5 font-medium">
              <span>Alokasi: {allocationPercent}%</span>
              {wallet.id === 'emas' && wallet.goldGrams > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-[#A19DB8]"></span>
                  <span className="text-amber-600 font-semibold">{formatGoldGrams(wallet.goldGrams)}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right: Balance */}
        <div className="text-right">
          <span className="text-xs text-[#7E7A9B] block font-medium">Saldo</span>
          <span className="text-base sm:text-lg font-extrabold text-[#1E1B2E] tracking-tight">
            {formatRupiah(wallet.balance)}
          </span>
        </div>
      </div>

      {/* Split Sub-Pill / Metadata Footer */}
      <div className="mt-3.5 pt-3 border-t border-[#F4F2FA] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#6B7280]">
          <span className="text-[11px] text-[#7E7A9B]">Modal:</span>
          <span className="font-semibold text-[#1E1B2E] text-[11px]">{formatRupiah(wallet.investedCapital)}</span>
        </div>

        {isInvestment ? (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              capitalGain >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <ArrowUpRight className={`w-3 h-3 ${capitalGain < 0 ? 'rotate-90' : ''}`} />
              {capitalGain >= 0 ? '+' : ''}{formatRupiah(capitalGain)} ({formatPercentage(gainPercent)})
            </span>
            {onSyncClick && (
              <button
                onClick={() => onSyncClick(wallet)}
                className="text-[10px] font-bold text-[#7C4DFF] hover:underline px-1 py-0.5 ml-1"
                type="button"
              >
                Sync MTM
              </button>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] text-[#7E7A9B] font-medium bg-[#F4F2FA] px-2 py-0.5 rounded-full">
            <Lock className="w-2.5 h-2.5 text-[#7E7A9B]" /> Gain Rp 0 (Terkunci)
          </span>
        )}
      </div>
    </div>
  );
}
