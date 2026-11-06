import React, { useState } from 'react';
import { 
  CreditCard, 
  Banknote, 
  Coins, 
  TrendingUp, 
  Sparkles, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ShieldCheck 
} from 'lucide-react';
import { formatRupiah, formatGoldGrams } from '../../core/utils/currencyFormatter';
import { useAuth } from '../../context/AuthContext';

export default function BankJagoHeroCard({ wallet }) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showNumber, setShowNumber] = useState(false);

  if (!wallet) return null;

  const cardThemes = {
    jago: {
      gradient: 'from-[#100C1A] via-[#1A0B2E] to-[#0A0514]',
      network: 'VISA',
      customLogo: null,
      bgImage: '/jago-syariah-card.png',
      isVertical: true,
      chip: false,
      cardLabel: 'JAGO SYARIAH • WADIAH DEBIT',
      number: '2343 3333 •••• 1099',
      fullNumber: '2343 3333 8812 1099',
      holderName: 'ANDRA SYAHDAN DAUD',
      exp: '08/28',
      typeBadge: 'Syariah'
    },
    mandiri: {
      gradient: 'from-[#1A1208] via-[#2A1D0D] to-[#120D05]',
      network: 'VISA',
      customLogo: null,
      bgImage: '/mandiri-card-bg.jpg',
      chip: true,
      cardLabel: 'MANDIRI DEBIT GOLD • WAYANG NUSANTARA',
      number: '1420 0188 •••• 9210',
      fullNumber: '1420 0188 5634 9210',
      holderName: 'ANDRA SYAHDAN DAUD',
      exp: '11/29',
      typeBadge: 'Debit Gold'
    },
    dana: {
      gradient: 'from-[#0275D8] via-[#118EEA] to-[#38A9FF]',
      network: 'DANA',
      customLogo: '/dana-logo.png',
      chip: false,
      cardLabel: '',
      number: '0813 2609 ••••',
      fullNumber: '0813 2609 2219',
      holderName: 'ANDRA SYAHDAN DAUD',
      exp: 'Saldo',
      typeBadge: null
    },
    emas: {
      gradient: 'from-[#D97706] via-[#F59E0B] to-[#FBBF24]',
      network: 'eMAS',
      customLogo: '/emas-logo.png',
      chip: false,
      cardLabel: '',
      number: 'DANA eMAS',
      fullNumber: wallet.goldGrams > 0 ? `${formatGoldGrams(wallet.goldGrams)}` : '0 gr',
      holderName: 'ANDRA SYAHDAN DAUD',
      exp: 'Antam',
      typeBadge: null
    },
    bibit: {
      gradient: 'from-[#059669] via-[#10B981] to-[#047857]',
      network: 'BIBIT',
      customLogo: '/bibit-logo.png',
      chip: false,
      cardLabel: '',
      number: 'Pasar Uang',
      fullNumber: 'Investasi Bibit',
      holderName: 'ANDRA SYAHDAN DAUD',
      exp: 'OJK',
      typeBadge: null
    },
    cash: {
      gradient: 'from-[#E05A47] via-[#EA580C] to-[#F97316]',
      network: 'CASH',
      customLogo: '/cash-logo.png',
      chip: false,
      cardLabel: '',
      number: 'Uang Fisik Dompet',
      fullNumber: 'Uang Cash',
      holderName: 'ANDRA SYAHDAN DAUD',
      exp: 'Cash',
      typeBadge: null
    },
    parfum: {
      gradient: 'from-[#1E1B2E] via-[#2A2440] to-[#4338CA]',
      network: 'PARFUM',
      customLogo: '/parfum-logo.png',
      chip: false,
      cardLabel: '',
      number: 'Laba Bisnis',
      fullNumber: 'Profit Parfum',
      holderName: 'ANDRA SYAHDAN DAUD',
      exp: 'Bisnis',
      typeBadge: null
    }
  };

  const theme = cardThemes[wallet.id] || {
    gradient: 'from-[#6633EE] via-[#7440FA] to-[#8A5CF6]',
    network: (wallet.type || 'Velto').toUpperCase(),
    customLogo: wallet.photoUrl || null,
    chip: true,
    cardLabel: `KANTONG • ${(wallet.name || '').toUpperCase()}`,
    number: wallet.name,
    fullNumber: wallet.name,
    holderName: 'ANDRA SYAHDAN DAUD',
    exp: 'Active',
    typeBadge: 'Aktif'
  };

  if (wallet.photoUrl) {
    theme.customLogo = wallet.photoUrl;
  }

  const copyCardNumber = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(theme.fullNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMandiriCard = wallet.id === 'mandiri';
  const isJagoCard = wallet.id === 'jago';
  const holderNameDisplay = theme.holderName || (user?.user_metadata?.full_name ? (user.user_metadata.full_name.toLowerCase().includes('andra') ? 'ANDRA SYAHDAN DAUD' : user.user_metadata.full_name.toUpperCase()) : 'ANDRA SYAHDAN DAUD');

  // Jago Syariah special vertical card display
  if (isJagoCard) {
    return (
      <div className="w-full flex justify-center">
        <div className="relative w-full max-w-[280px] rounded-[30px] overflow-hidden p-6 text-white shadow-hero-card aspect-[0.654/1] min-h-[380px] flex flex-col justify-between select-none group transition-all duration-300">
          {/* Real Jago Syariah Card Artwork (Pure Card Image without external border or overlapping bottom text) */}
          <img 
            src="/jago-syariah-card.png" 
            alt="Jago Syariah Debit" 
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none" 
          />

          {/* Top Header with clean live balance badge */}
          <div className="relative z-10 flex items-center justify-end">
            <div className="text-right bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 shadow-xs">
              <span className="text-[9px] font-semibold text-white/75 block uppercase tracking-wider leading-tight">Saldo</span>
              <span className="text-sm font-black text-white tracking-tight drop-shadow-md leading-tight">
                {formatRupiah(wallet.balance)}
              </span>
            </div>
          </div>

          {/* Center Graphic Spacer */}
          <div className="flex-1" />

          {/* Bottom section: Keep card artwork 100% clean and unobscured (clean authentic Jago Syariah card view) */}
        </div>
      </div>
    );
  }

  return (
    <div 
      style={wallet.color && !theme.bgImage ? { backgroundColor: wallet.color } : {}}
      className={`relative w-full rounded-[28px] overflow-hidden p-5 sm:p-6 text-white shadow-hero-card ${theme.bgImage ? '' : (!wallet.color ? `bg-gradient-to-tr ${theme.gradient}` : '')} transition-all duration-300 aspect-[1.586/1] min-h-[205px] flex flex-col justify-between select-none border border-black/10`}
    >
      {/* Background image if provided (e.g. Mandiri Batik Wayang Card) */}
      {theme.bgImage && (
        <>
          <img 
            src={theme.bgImage} 
            alt="Card Background" 
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none" 
          />
          {/* Subtle gradient vignette at bottom so account number and name remain crisp */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
        </>
      )}

      {/* Decorative Card Shapes for regular cards */}
      {!theme.bgImage && (
        <>
          <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-36 h-36 rounded-full bg-black/20 blur-lg pointer-events-none" />
        </>
      )}

      {/* Top Header of Card (Hidden on Mandiri Wayang because chip, logo 'mandiri debit gold', and VISA are already embedded on the card) */}
      {!isMandiriCard ? (
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme.customLogo ? (
              <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center shadow-xs">
                <img src={theme.customLogo} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-8 h-6.5 rounded-md bg-gradient-to-tr from-amber-200 to-amber-400 border border-amber-300/60 shadow-inner flex items-center justify-center">
                <div className="w-4.5 h-3.5 border border-amber-600/40 rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
                  <div className="bg-amber-600/30 rounded-2xs"></div>
                  <div className="bg-amber-600/30 rounded-2xs"></div>
                </div>
              </div>
            )}
            <span className="text-[11px] font-black tracking-widest text-white/95 uppercase">
              {wallet.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {theme.typeBadge && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                {theme.typeBadge}
              </span>
            )}
            <span className="text-xl font-black italic tracking-wider text-white">
              {theme.network}
            </span>
          </div>
        </div>
      ) : (
        /* Top spacer for Mandiri Wayang card to keep layout aligned */
        <div className="relative z-10 h-10" />
      )}

      {/* Subtitle & Balance Display */}
      <div className="relative z-10 mt-auto pt-2">
        {!isMandiriCard && (
          <p className="text-[10px] tracking-wider text-white/80 uppercase font-bold">
            {theme.cardLabel}
          </p>
        )}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md text-white">
            {formatRupiah(wallet.balance)}
          </span>
        </div>
      </div>

      {/* Card Number Masked & Copy */}
      <div className="relative z-10 mt-2 flex items-center justify-between pt-2 border-t border-white/20">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm tracking-widest text-white font-semibold drop-shadow-sm">
            {showNumber ? theme.fullNumber : theme.number}
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowNumber(!showNumber);
            }}
            className="p-1 rounded hover:bg-white/20 text-white/90 hover:text-white transition-colors"
            title="Tampilkan detail"
          >
            {showNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={copyCardNumber}
            className="p-1 rounded hover:bg-white/20 text-white/90 hover:text-white transition-colors"
            title="Salin"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="text-right">
          <span className="text-[9px] text-white/70 uppercase block font-medium">Valid Thru</span>
          <span className="text-xs font-bold tracking-wider text-white">{theme.exp}</span>
        </div>
      </div>

      {/* Card Holder Name & Terintegrasi - Diberi spacing simetris dan pas tidak mepet atas/bawah */}
      <div className="relative z-10 mt-1 flex items-center justify-between text-[11px] text-white/95">
        <span className="font-bold tracking-wider uppercase drop-shadow-sm">{holderNameDisplay}</span>
        <span className="text-[10px] text-white/85 flex items-center gap-1 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Terintegrasi
        </span>
      </div>
    </div>
  );
}
