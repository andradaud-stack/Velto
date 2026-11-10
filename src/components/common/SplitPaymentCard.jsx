import React from 'react';
import { 
  CreditCard, 
  Coins, 
  Sparkles, 
  Banknote,
  Building2,
  Smartphone,
  Package,
  Shield,
  Heart,
  MoreVertical,
  Pencil,
  Plus
} from 'lucide-react';
import { formatRupiah, formatGoldGrams } from '../../core/utils/currencyFormatter';

const ICONS = {
  CreditCard,
  Building2,
  Smartphone,
  Banknote,
  Coins,
  Sparkles,
  Package,
  Shield,
  Heart
};

export default function SplitPaymentCard({ wallet, onClick, onEdit, onTopUp }) {
  if (!wallet) return null;

  const splitStyles = {
    mandiri: {
      gradient: 'from-[#002D62] via-[#003D79] to-[#0A58CA]',
      sub: 'Livin by Mandiri • Debit',
      subRight: 'Rekening Bank',
      customIcon: '/mandiri-logo.png'
    },
    dana: {
      gradient: 'from-[#0275D8] via-[#118EEA] to-[#38A9FF]',
      sub: 'E-Wallet • Dompet Digital',
      subRight: 'Dompet Digital',
      customIcon: '/dana-logo.png'
    },
    emas: {
      gradient: 'from-[#D97706] via-[#F59E0B] to-[#FBBF24]',
      sub: wallet.goldGrams > 0 ? `${formatGoldGrams(wallet.goldGrams)} • Logam Mulia` : 'Investasi Emas',
      subRight: 'Emas Murni',
      customIcon: '/emas-logo.png'
    },
    bibit: {
      gradient: 'from-[#059669] via-[#10B981] to-[#047857]',
      sub: 'Investasi Pasar Uang',
      subRight: 'Investasi',
      customIcon: '/bibit-logo.png'
    },
    jago: {
      gradient: 'from-[#1E1B2E] via-[#2A1848] to-[#4C1D95]',
      sub: 'Kantong Utama • Wadiah',
      subRight: 'Bank Syariah',
      customIcon: '/jago-logo.png'
    },
    cash: {
      gradient: 'from-[#E05A47] via-[#EA580C] to-[#F97316]',
      sub: 'Kas Fisik Harian',
      subRight: 'Uang Tunai',
      customIcon: '/cash-logo.png'
    },
    parfum: {
      gradient: 'from-[#1E1B2E] via-[#2A2440] to-[#4338CA]',
      sub: 'Laba Bersih Side Hustle',
      subRight: 'Kas Bisnis',
      customIcon: '/parfum-logo.png'
    }
  };

  const defaultStyle = splitStyles[wallet.id] || {
    gradient: 'from-[#6633EE] to-[#8054F6]',
    sub: wallet.type || 'Kantong Aset',
    subRight: 'Aset',
    customIcon: null
  };

  const IconComp = ICONS[wallet.icon] || CreditCard;
  const iconSrc = wallet.photoUrl || defaultStyle.customIcon;
  const customBg = wallet.color ? { backgroundColor: wallet.color } : null;

  return (
    <div
      onClick={onClick}
      style={customBg}
      className={`w-full rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white ${
        !wallet.color ? `bg-gradient-to-r ${defaultStyle.gradient}` : ''
      } shadow-[0_6px_20px_-3px_rgba(0,0,0,0.12)] flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98] select-none group relative overflow-hidden`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-white/25 shadow-xs overflow-hidden p-1.5">
          {iconSrc ? (
            <img 
              src={iconSrc} 
              alt={wallet.name} 
              className="w-full h-full object-contain drop-shadow-xs" 
            />
          ) : (
            <IconComp className="w-6 h-6 stroke-[2.2] text-[#6633EE]" style={{ color: wallet.color || '#6633EE' }} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold tracking-tight text-white truncate">
              {wallet.name}
            </h4>
          </div>
          <p className="text-xs text-white/80 font-medium truncate mt-0.5">
            {defaultStyle.sub}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 pl-3">
        <div className="text-right">
          <span className="text-base sm:text-lg font-black tracking-tight text-white block">
            {formatRupiah(wallet.balance)}
          </span>
          <span className="text-[11px] text-white/80 font-medium block mt-0.5">
            {defaultStyle.subRight}
          </span>
        </div>

        {onTopUp && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTopUp(wallet);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/35 text-white text-xs font-black flex items-center gap-1 backdrop-blur-md border border-white/25 transition-all active:scale-95 cursor-pointer ml-1"
            title="Tambah Saldo"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Saldo</span>
          </button>
        )}

        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(wallet);
            }}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/30 text-white transition-all ml-1"
            title="Edit / Ganti Kantong"
          >
            <Pencil className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
}
