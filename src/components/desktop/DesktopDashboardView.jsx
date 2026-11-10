import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah, formatDateTimeIndo } from '../../core/utils/currencyFormatter';
import { calculateSavingStreak } from '../../core/utils/streakCalculator';
import BankJagoHeroCard from '../common/BankJagoHeroCard';
import SavingGoalCard from '../common/SavingGoalCard';
import TransactionTile from '../common/TransactionTile';
import { 
  Plus, 
  Send, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  MoreHorizontal, 
  ChevronRight, 
  TrendingUp, 
  PieChart as PieIcon, 
  ShieldCheck, 
  Search,
  Filter,
  Download,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function DesktopDashboardView({
  onOpenNewWallet,
  onOpenEstimate,
  onOpenOptions,
  onOpenTransfer,
  onOpenNewTransaction,
  onSelectWallet,
  onOpenProfile,
  onOpenEditGoal,
  onTopUpWallet
}) {
  const {
    wallets,
    transactions,
    totalNetWorth,
    totalInvestedCapital,
    totalCapitalGain,
    primaryGoal,
    goldMarketInfo,
    executeWeeklyAllowance
  } = useFinance();

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [txFilter, setTxFilter] = useState('all'); // all, expense, income
  const [searchQuery, setSearchQuery] = useState('');
  const [waveRange, setWaveRange] = useState('Month'); // Day, Week, Month, Year

  const walletList = wallets && wallets.length > 0 ? wallets : [];
  const currentWallet = walletList[activeCardIndex] || walletList[0];

  // Calculate monthly spending vs income for gauge
  const expensesList = (transactions || []).filter(t => t.type === 'expense');
  const totalExpense = expensesList.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalIncome = (transactions || [])
    .filter(t => t.type === 'income' || t.type === 'allowance_in' || t.type === 'allowance' || t.type === 'business')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Budget expense gauge percentage (estimated standard allowance)
  const budgetRatio = totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 35;

  // Filtered transactions for recent activity
  const filteredTransactions = (transactions || []).filter(t => {
    if (txFilter === 'expense' && t.type !== 'expense') return false;
    if (txFilter === 'income' && !(t.type === 'income' || t.type === 'allowance_in' || t.type === 'allowance' || t.type === 'business')) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (t.title || '').toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q);
    }
    return true;
  });

  // Real-time dynamic dates and streak calculation
  const streakInfo = useMemo(() => {
    return calculateSavingStreak(transactions, primaryGoal ? [primaryGoal] : []);
  }, [transactions, primaryGoal]);

  const dynamicDates = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const shortDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const todayName = dayNames[now.getDay()];

    const months = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      months.push({
        label: monthNames[d.getMonth()],
        isCurrent: i === 0
      });
    }

    const years = [];
    for (let i = 4; i >= 0; i--) {
      const yr = (currentYear - i + 1).toString();
      years.push({
        label: yr,
        isCurrent: yr === currentYear.toString()
      });
    }

    return {
      todayName,
      months,
      years,
      shortDays
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* ROW 1: FinBank Desktop 2-Column Grid (Debit Card Accounts + Total Balance Card) */}
      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* Left: Debit Card Account (Stack / Carousel of Wallets + Add Wallet Card) */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl p-6 border border-[#ECE8F6] shadow-soft-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#1E1B2E] tracking-tight">
                Debit Card Account
              </h3>
              <p className="text-xs text-[#7E7A9B] mt-0.5">
                {walletList.length > 0 
                  ? `Pilih atau kelola ${walletList.length} kantong aset aktif Anda`
                  : 'Belum ada kantong aset. Tambahkan kantong pertama Anda'}
              </p>
            </div>
            {walletList.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#6633EE] bg-[#F3EEFF] px-2.5 py-1 rounded-full">
                  {activeCardIndex + 1} of {walletList.length}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* The Main Hero Card in FinBank Shape or Empty Prompt */}
            <div className="sm:col-span-8">
              {currentWallet ? (
                <div 
                  onClick={() => onSelectWallet && onSelectWallet(currentWallet)}
                  className="cursor-pointer transform hover:scale-[1.01] transition-all"
                >
                  <BankJagoHeroCard wallet={currentWallet} onTopUp={onTopUpWallet} />
                </div>
              ) : (
                <div 
                  onClick={onOpenNewWallet}
                  className="cursor-pointer p-6 rounded-3xl bg-[#FAF9FD] border-2 border-dashed border-[#DDD7F2] hover:border-[#6633EE] text-center flex flex-col items-center justify-center min-h-[190px] transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#F3EEFF] text-[#6633EE] flex items-center justify-center mb-2 shadow-xs">
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1E1B2E]">Belum Ada Kantong Aset</h4>
                  <p className="text-xs text-[#7E7A9B] mt-1 max-w-xs">
                    Klik di sini atau tombol di sebelah kanan untuk membuat kantong pertama kamu.
                  </p>
                </div>
              )}
            </div>

            {/* "Add Debit Card" style Box Button */}
            <div className="sm:col-span-4 h-full flex flex-col justify-center">
              <button
                onClick={onOpenNewWallet}
                className="w-full h-full min-h-[170px] rounded-3xl border-2 border-dashed border-[#DDD7F2] hover:border-[#6633EE] bg-[#FAF9FD] hover:bg-[#F3EEFF]/50 flex flex-col items-center justify-center p-4 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#ECE8F6] group-hover:bg-[#6633EE] group-hover:text-white text-[#6633EE] flex items-center justify-center shadow-xs transition-all">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold text-[#1E1B2E] mt-3 group-hover:text-[#6633EE] transition-colors">
                  Add Wallet Card
                </span>
                <span className="text-[10px] text-[#7E7A9B] mt-0.5">
                  Buat kantong baru
                </span>
              </button>
            </div>
          </div>

          {/* Quick Wallet Selector Chips */}
          {walletList.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#F4F2FA] flex items-center gap-2 overflow-x-auto no-scrollbar">
              {walletList.map((w, idx) => (
                <button
                  key={w.id}
                  onClick={() => setActiveCardIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    idx === activeCardIndex
                      ? 'bg-[#6633EE] text-white shadow-xs'
                      : 'bg-[#F4F2FA] text-[#7E7A9B] hover:text-[#1E1B2E]'
                  }`}
                >
                  <span>{w.name}</span>
                  <span className="text-[10px] opacity-80">({formatRupiah(w.balance)})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Your Total Balance Card (FinBank Big Number + Action Trio: Send/Transfer, Topup/Allowance, More) */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-6 border border-[#ECE8F6] shadow-soft-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7E7A9B] uppercase tracking-wider">
                Your Total Balance
              </span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Live Net Worth
              </span>
            </div>

            <div className="mt-3">
              <h2 className="text-3xl lg:text-4xl font-black text-[#1E1B2E] tracking-tight">
                {formatRupiah(totalNetWorth)}
              </h2>
              <p className="text-xs text-[#7E7A9B] mt-1 font-medium">
                {new Date().toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' })} • Realtime Dexie
              </p>
            </div>
          </div>

          {/* Mini Real-Time Gold Sparkline Chart Widget (Klik untuk langsung buka Kantong Emas) */}
          <div 
            onClick={() => {
              const emasWallet = walletList.find(w => w.id === 'emas');
              if (emasWallet && onSelectWallet) onSelectWallet(emasWallet);
            }}
            className="my-3 p-3 rounded-2xl bg-gradient-to-r from-amber-50/80 via-amber-50/40 to-transparent border border-amber-200/60 hover:border-amber-400/80 cursor-pointer transition-all group"
            title="Klik untuk membuka Kantong DANA eMAS & grafik lengkap"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[11px] font-bold text-amber-900 group-hover:text-amber-950 transition-colors">
                  Harga Emas Treasury Live
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                /gram
              </span>
            </div>

            <div className="mt-1.5 flex items-center justify-between">
              <div>
                <span className="text-base lg:text-lg font-black text-[#1E1B2E] tracking-tight">
                  {formatRupiah(goldMarketInfo?.price || 2450223)}
                </span>
                <span className={`text-[10px] font-bold ml-1.5 inline-flex items-center ${
                  (goldMarketInfo?.fluctuation || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {(goldMarketInfo?.fluctuation || 0) >= 0 ? '+' : ''}{goldMarketInfo?.fluctuation || -0.03}% hari ini
                </span>
              </div>

              {/* Mini SVG Sparkline */}
              <div className="w-24 h-7">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="goldMiniSpark" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,22 Q 20,25 35,16 T 65,12 T 85,6 T 100,4 L 100,30 L 0,30 Z"
                    fill="url(#goldMiniSpark)"
                  />
                  <path
                    d="M 0,22 Q 20,25 35,16 T 65,12 T 85,6 T 100,4"
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="4" r="3" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
            
            <div className="mt-1 flex items-center justify-between text-[9px] text-amber-800/70 font-medium">
              <span>Buka grafik penuh eMAS</span>
              <span className="text-amber-700 font-bold group-hover:translate-x-0.5 transition-transform">Lihat Detail →</span>
            </div>
          </div>

          {/* FinBank 3 Action Buttons (Send, Topup, More) */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-[#F4F2FA]">
            {/* 1. Send / Transfer */}
            <button
              onClick={onOpenTransfer}
              className="py-3 px-2 rounded-2xl bg-[#FAF9FD] hover:bg-[#F3EEFF] border border-[#ECE8F6] flex flex-col items-center justify-center text-center transition-all group active:scale-95"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-[#ECE8F6] text-[#6633EE] group-hover:bg-[#6633EE] group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                <Send className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1E1B2E] mt-2">Transfer</span>
              <span className="text-[9px] text-[#7E7A9B]">Antar kantong</span>
            </button>

            {/* 2. Topup / Uang Saku */}
            <button
              onClick={executeWeeklyAllowance}
              className="py-3 px-2 rounded-2xl bg-[#FAF9FD] hover:bg-[#F3EEFF] border border-[#ECE8F6] flex flex-col items-center justify-center text-center transition-all group active:scale-95"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-[#ECE8F6] text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-[#1E1B2E] mt-2">+ Uang Saku</span>
              <span className="text-[9px] text-[#7E7A9B]">+Rp100k masuk</span>
            </button>

            {/* 3. More / Estimate */}
            <button
              onClick={onOpenEstimate}
              className="py-3 px-2 rounded-2xl bg-[#FAF9FD] hover:bg-[#F3EEFF] border border-[#ECE8F6] flex flex-col items-center justify-center text-center transition-all group active:scale-95"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-[#ECE8F6] text-[#7C4DFF] group-hover:bg-[#7C4DFF] group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                <MoreHorizontal className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1E1B2E] mt-2">Estimate</span>
              <span className="text-[9px] text-[#7E7A9B]">Kalkulator target</span>
            </button>
          </div>
        </div>
      </div>

      {/* ROW 2: FinBank Middle Grid (Recent Transactions List + Expenses Semi-Circle Gauge) */}
      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* Left: Recent Transactions Container */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl p-6 border border-[#ECE8F6] shadow-soft-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#1E1B2E] tracking-tight">
                  Recent Transactions
                </h3>
                <p className="text-xs text-[#7E7A9B] mt-0.5">
                  Aktivitas mutasi terbaru di seluruh kantong
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-[#F4F2FA] p-1 rounded-2xl">
                <button
                  onClick={() => setTxFilter('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    txFilter === 'all' ? 'bg-white text-[#6633EE] shadow-xs' : 'text-[#7E7A9B]'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setTxFilter('expense')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    txFilter === 'expense' ? 'bg-white text-rose-600 shadow-xs' : 'text-[#7E7A9B]'
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  onClick={() => setTxFilter('income')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    txFilter === 'income' ? 'bg-white text-emerald-600 shadow-xs' : 'text-[#7E7A9B]'
                  }`}
                >
                  Pemasukan
                </button>
              </div>
            </div>

            {/* List of Transactions */}
            <div className="space-y-2.5">
              {filteredTransactions.slice(0, 4).map(tx => (
                <TransactionTile key={tx.id} transaction={tx} />
              ))}

              {filteredTransactions.length === 0 && (
                <div className="p-8 text-center text-[#7E7A9B] text-xs">
                  Belum ada transaksi pada kategori ini.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F4F2FA] flex items-center justify-between">
            <span className="text-xs text-[#7E7A9B] font-medium">
              Menampilkan {Math.min(4, filteredTransactions.length)} dari {transactions.length} mutasi
            </span>
            <button
              onClick={onOpenNewTransaction}
              className="text-xs font-bold text-[#6633EE] hover:underline flex items-center gap-1"
            >
              <span>+ Catat Transaksi Baru</span>
            </button>
          </div>
        </div>

        {/* Right: Modern Wave Chart + Plan Card (From Image 2 Design) */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-6 border border-[#ECE8F6] shadow-soft-card flex flex-col justify-between relative overflow-hidden">
          {/* Header with Saved This Month & Time Filter Tabs */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#7E7A9B] block">
                  {waveRange === 'Day' ? 'Saved Today' : waveRange === 'Week' ? 'Saved This Week' : waveRange === 'Year' ? 'Total Net Worth' : 'Saved This Month'}
                </span>
                <h3 className="text-2xl lg:text-3xl font-black text-[#1E1B2E] tracking-tight mt-0.5">
                  {formatRupiah(totalNetWorth || 0)}
                </h3>
              </div>
              <button 
                onClick={onOpenOptions}
                className="p-1.5 rounded-xl hover:bg-[#F4F2FA] text-[#7E7A9B] hover:text-[#1E1B2E] transition-colors"
                title="Opsi Grafik"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Time Filter Tabs (Day, Week, Month, Year) */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 text-xs font-bold">
              {['Day', 'Week', 'Month', 'Year'].map(range => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setWaveRange(range)}
                  className={`transition-all pb-0.5 cursor-pointer ${
                    waveRange === range
                      ? 'text-[#1E1B2E] font-black border-b-2 border-[#6633EE]'
                      : 'text-[#A09CB5] hover:text-[#1E1B2E]'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Smooth Continuous Curved Line Chart with Active Highlight Pointer & Gradient */}
          <div className="my-3 relative">
            <div className="w-full h-40 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 320 120" preserveAspectRatio="none">
                <defs>
                  {/* Velto Lavender Soft Gradient Fill */}
                  <linearGradient id="veltoWaveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6633EE" stopOpacity="0.25" />
                    <stop offset="60%" stopColor="#8054F6" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Shaded Area Under Curve */}
                <path
                  d={
                    waveRange === 'Day' 
                      ? "M 0,80 C 40,75 80,45 120,60 C 160,75 200,20 240,25 C 280,30 300,50 320,40 L 320,120 L 0,120 Z"
                      : waveRange === 'Week'
                      ? "M 0,85 C 30,70 70,50 110,65 C 160,80 200,30 240,20 C 270,15 295,40 320,30 L 320,120 L 0,120 Z"
                      : waveRange === 'Year'
                      ? "M 0,95 C 40,85 100,70 160,50 C 220,30 260,18 290,15 C 305,14 315,14 320,12 L 320,120 L 0,120 Z"
                      : "M 0,75 C 20,40 35,85 55,60 C 75,35 90,85 110,65 C 130,45 145,85 165,70 C 185,55 200,10 220,15 C 235,18 245,65 260,50 C 275,35 295,45 320,38 L 320,120 L 0,120 Z"
                  }
                  fill="url(#veltoWaveGradient)"
                />

                {/* Vertical active dashed guideline connecting to current highlight point */}
                <line 
                  x1={waveRange === 'Day' ? "240" : waveRange === 'Week' ? "240" : waveRange === 'Year' ? "290" : "220"} 
                  y1={waveRange === 'Day' ? "25" : waveRange === 'Week' ? "20" : waveRange === 'Year' ? "15" : "15"} 
                  x2={waveRange === 'Day' ? "240" : waveRange === 'Week' ? "240" : waveRange === 'Year' ? "290" : "220"} 
                  y2="115" 
                  stroke="#6633EE" 
                  strokeWidth="1.5" 
                  strokeDasharray="3 3" 
                  opacity="0.6"
                />

                {/* Bold Primary Curved Stroke */}
                <path
                  d={
                    waveRange === 'Day' 
                      ? "M 0,80 C 40,75 80,45 120,60 C 160,75 200,20 240,25 C 280,30 300,50 320,40"
                      : waveRange === 'Week'
                      ? "M 0,85 C 30,70 70,50 110,65 C 160,80 200,30 240,20 C 270,15 295,40 320,30"
                      : waveRange === 'Year'
                      ? "M 0,95 C 40,85 100,70 160,50 C 220,30 260,18 290,15 C 305,14 315,14 320,12"
                      : "M 0,75 C 20,40 35,85 55,60 C 75,35 90,85 110,65 C 130,45 145,85 165,70 C 185,55 200,10 220,15 C 235,18 245,65 260,50 C 275,35 295,45 320,38"
                  }
                  fill="none"
                  stroke="#1E1B2E"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Active Highlight Marker Dot on Peak */}
                <circle 
                  cx={waveRange === 'Day' ? "240" : waveRange === 'Week' ? "240" : waveRange === 'Year' ? "290" : "220"} 
                  cy={waveRange === 'Day' ? "25" : waveRange === 'Week' ? "20" : waveRange === 'Year' ? "15" : "15"} 
                  r="5" 
                  fill="#6633EE" 
                  stroke="#FFFFFF" 
                  strokeWidth="2.5" 
                  className="drop-shadow-sm" 
                />
              </svg>
            </div>

            {/* Labels along horizontal axis depending on selected range */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#8E8AAB] px-1 mt-1">
              {waveRange === 'Day' && (
                <>
                  <span>06:00</span>
                  <span>09:00</span>
                  <span>12:00</span>
                  <span>15:00</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#1E1B2E] text-white font-bold text-[10px] shadow-xs">
                    18:00
                  </span>
                  <span>21:00</span>
                  <span>00:00</span>
                </>
              )}
              {waveRange === 'Week' && (
                dynamicDates.shortDays.map(d => {
                  const isCurrent = d === dynamicDates.todayName || (dynamicDates.todayName === 'Min' && d === 'Min');
                  return isCurrent ? (
                    <span key={d} className="px-2 py-0.5 rounded-full bg-[#1E1B2E] text-white font-bold text-[10px] shadow-xs">
                      {d}
                    </span>
                  ) : (
                    <span key={d}>{d}</span>
                  );
                })
              )}
              {waveRange === 'Month' && (
                dynamicDates.months.map(m => (
                  m.isCurrent ? (
                    <span key={m.label} className="px-2 py-0.5 rounded-full bg-[#1E1B2E] text-white font-bold text-[10px] shadow-xs">
                      {m.label}
                    </span>
                  ) : (
                    <span key={m.label}>{m.label}</span>
                  )
                ))
              )}
              {waveRange === 'Year' && (
                dynamicDates.years.map(yr => (
                  yr.isCurrent ? (
                    <span key={yr.label} className="px-2 py-0.5 rounded-full bg-[#1E1B2E] text-white font-bold text-[10px] shadow-xs">
                      {yr.label}
                    </span>
                  ) : (
                    <span key={yr.label}>{yr.label}</span>
                  )
                ))
              )}
            </div>
          </div>

          {/* Bottom Modern Goal Progress Card (Follows the dark floating badge in Image 2) */}
          <div className="mt-2 p-4 rounded-3xl bg-[#1E1B2E] text-white flex items-center justify-between shadow-soft-card relative overflow-hidden group">
            <div className="z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/60 block">
                  {primaryGoal ? 'Target Tabungan' : `Plan for ${new Date().getFullYear()}`}
                </span>
                <span className={`inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${
                  streakInfo.currentStreak > 0
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                    : 'bg-white/10 text-white/60 border-white/10'
                }`}>
                  🔥 {streakInfo.currentStreak} Hari Streak
                </span>
              </div>
              <h4 className="text-sm font-black text-white mt-0.5">
                {primaryGoal ? primaryGoal.title : 'Belum Ada Target'}
              </h4>
              <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">
                {primaryGoal?.progressPercent || 0}% Completed
              </span>
            </div>

            {/* Circular Donut Ring on Dark Background */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center z-10">
              <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r="17"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="4.5"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="17"
                  fill="none"
                  stroke="#7C4DFF"
                  strokeWidth="4.5"
                  strokeDasharray="106.8"
                  strokeDashoffset={106.8 - (106.8 * ((primaryGoal?.progressPercent || 0) / 100))}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute text-[11px] font-black text-white">
                {primaryGoal?.progressPercent || 0}%
              </span>
            </div>

            {/* Subtle glow effect */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#6633EE]/30 rounded-full blur-xl pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ROW 3: FinBank Bottom Table (Activity / History Table) */}
      <div className="bg-white rounded-3xl p-6 border border-[#ECE8F6] shadow-soft-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#1E1B2E] tracking-tight">
              Activity & Mutasi Ledger
            </h3>
            <p className="text-xs text-[#7E7A9B] mt-0.5">
              Tabel lengkap riwayat transaksi dengan metadata offline IndexedDB
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[#7E7A9B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-2xl bg-[#F4F2FA] text-xs font-medium text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-[#6633EE]/20 border border-transparent focus:border-[#6633EE]"
              />
            </div>
          </div>
        </div>

        {/* FinBank Table Layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF9FD] text-[#8E8AAB] font-bold uppercase tracking-wider border-y border-[#ECE8F6]">
                <th className="py-3 px-4 rounded-l-2xl">Date & Time</th>
                <th className="py-3 px-4">Transaction / Notes</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right rounded-r-2xl">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F2FA]">
              {filteredTransactions.slice(0, 7).map(tx => {
                const isExpense = tx.type === 'expense';
                return (
                  <tr key={tx.id} className="hover:bg-[#FAF9FD]/80 transition-colors">
                    <td className="py-3 px-4 text-[#7E7A9B] whitespace-nowrap font-medium">
                      {formatDateTimeIndo(tx.date)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#1E1B2E] block">{tx.title}</span>
                      {tx.details && (
                        <span className="text-[10px] text-[#A09CB5] line-clamp-1">{tx.details}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-[#F4F2FA] text-[#7E7A9B] font-semibold text-[10px]">
                        {tx.category || 'Umum'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Success
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black whitespace-nowrap">
                      <span className={isExpense ? 'text-rose-600' : 'text-emerald-600'}>
                        {isExpense ? '-' : '+'}{formatRupiah(tx.amount)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}