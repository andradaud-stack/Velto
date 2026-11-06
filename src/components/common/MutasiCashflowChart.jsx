import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, BarChart2, Calendar, Sparkles } from 'lucide-react';
import { formatRupiah } from '../../core/utils/currencyFormatter';

export default function MutasiCashflowChart({ transactions = [] }) {
  const [activeTab, setActiveTab] = useState('Month'); // 'Week' | 'Month'

  const cashflowStats = useMemo(() => {
    const txList = transactions || [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 - 11

    // Filter pemasukan & pengeluaran riil
    const isIncomeTx = (t) => t.type === 'income' || t.type === 'allowance_in' || t.type === 'business';
    const isExpenseTx = (t) => t.type === 'expense';

    const incomeTxs = txList.filter(isIncomeTx);
    const expenseTxs = txList.filter(isExpenseTx);

    const totalIncome = incomeTxs.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpense = expenseTxs.reduce((sum, t) => sum + (t.amount || 0), 0);
    const netCashflow = totalIncome - totalExpense;

    // Rata-rata pengeluaran per hari (dihitung dari awal bulan ini s/d hari ini, atau riwayat transaksi)
    const dayOfMonth = Math.max(1, now.getDate());
    const avgDailyExpense = Math.round(totalExpense / dayOfMonth);
    const avgTxExpense = expenseTxs.length > 0 ? Math.round(totalExpense / expenseTxs.length) : 0;

    let chartBars = [];

    if (activeTab === 'Week') {
      const shortDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
      // Hitung awal minggu ini (Senin)
      const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
      const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);

      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dYear = d.getFullYear();
        const dMonth = d.getMonth();
        const dDate = d.getDate();
        const isCurrent = (dYear === currentYear && dMonth === currentMonth && dDate === now.getDate());

        // Transaksi riil pada tanggal ini
        const dayTxs = txList.filter(t => {
          if (!t.date) return false;
          const txDate = new Date(t.date);
          return (
            txDate.getFullYear() === dYear &&
            txDate.getMonth() === dMonth &&
            txDate.getDate() === dDate
          );
        });

        const inc = dayTxs.filter(isIncomeTx).reduce((sum, t) => sum + (t.amount || 0), 0);
        const exp = dayTxs.filter(isExpenseTx).reduce((sum, t) => sum + (t.amount || 0), 0);

        days.push({
          label: shortDays[i],
          subLabel: dDate,
          income: inc,
          expense: exp,
          isCurrent
        });
      }
      chartBars = days;
    } else {
      // 6 Bulan Terakhir secara dinamis dari bulan saat ini (Real-Time)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const months = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const label = monthNames[m];
        const isCurrent = (y === currentYear && m === currentMonth);

        // Filter transaksi riil yang berada di bulan dan tahun ini
        const monthTxs = txList.filter(t => {
          if (!t.date) return false;
          const txDate = new Date(t.date);
          return txDate.getFullYear() === y && txDate.getMonth() === m;
        });

        const inc = monthTxs.filter(isIncomeTx).reduce((sum, t) => sum + (t.amount || 0), 0);
        const exp = monthTxs.filter(isExpenseTx).reduce((sum, t) => sum + (t.amount || 0), 0);

        months.push({
          label,
          year: y,
          monthIndex: m,
          income: inc,
          expense: exp,
          isCurrent
        });
      }
      chartBars = months;
    }

    const maxVal = Math.max(
      ...chartBars.map(b => Math.max(b.income, b.expense)),
      100000
    ) * 1.15;

    return {
      totalIncome,
      totalExpense,
      netCashflow,
      avgDailyExpense,
      avgTxExpense,
      chartBars,
      maxVal
    };
  }, [transactions, activeTab]);

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#ECE8F6] shadow-soft-card space-y-4">
      {/* Top Header & Range Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#F3EEFF] text-[#6633EE]">
              <BarChart2 className="w-4 h-4 stroke-[2.2]" />
            </span>
            <h3 className="text-sm font-bold text-[#1E1B2E] tracking-tight">
              Arus Kas & Rata-Rata Mutasi
            </h3>
          </div>
          <p className="text-[11px] text-[#7E7A9B] mt-0.5 font-medium">
            Komparasi Pemasukan vs Pengeluaran riil keuanganmu
          </p>
        </div>

        {/* Tab Selector: Week vs Month */}
        <div className="flex p-1 bg-[#F4F2FA] rounded-full self-start sm:self-auto border border-[#ECE8F6]">
          {['Week', 'Month'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                activeTab === tab
                  ? 'bg-[#6633EE] text-white shadow-xs'
                  : 'text-[#7E7A9B] hover:text-[#1E1B2E]'
              }`}
            >
              {tab === 'Week' ? 'Mingguan' : 'Bulanan'}
            </button>
          ))}
        </div>
      </div>

      {/* Rata-Rata & Highlight Metrics 3-Col Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Rata-Rata Pengeluaran */}
        <div className="p-3 rounded-2xl bg-[#FAF8FF] border border-[#ECE8F6]">
          <span className="text-[10px] font-bold text-[#7E7A9B] uppercase tracking-wider block">
            Rata-Rata Pengeluaran
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-base font-black text-[#1E1B2E]">
              {formatRupiah(cashflowStats.avgDailyExpense)}
            </span>
            <span className="text-[10px] text-[#7E7A9B] font-semibold">/hari</span>
          </div>
        </div>

        {/* Total Pemasukan */}
        <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              Total Pemasukan
            </span>
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-base font-black text-emerald-700 mt-1 block">
            +{formatRupiah(cashflowStats.totalIncome)}
          </span>
        </div>

        {/* Total Pengeluaran */}
        <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
              Total Pengeluaran
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <span className="text-base font-black text-rose-700 mt-1 block">
            -{formatRupiah(cashflowStats.totalExpense)}
          </span>
        </div>
      </div>

      {/* Dual Bar Comparison Chart (Hijau Pemasukan vs Rose Pengeluaran) */}
      <div className="pt-2">
        {/* Legend */}
        <div className="flex items-center justify-end gap-4 text-[11px] font-bold mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[#6B7280]">Pemasukan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span className="text-[#6B7280]">Pengeluaran</span>
          </div>
        </div>

        {/* Visual Dual Bars */}
        <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 border-b border-[#ECE8F6]">
          {cashflowStats.chartBars.map((bar, idx) => {
            // Hanya muncul bar jika ada nominal (> 0), jika 0 tetap bersih
            const incHeight = bar.income > 0 ? Math.min(100, Math.max(8, (bar.income / cashflowStats.maxVal) * 100)) : 0;
            const expHeight = bar.expense > 0 ? Math.min(100, Math.max(8, (bar.expense / cashflowStats.maxVal) * 100)) : 0;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="flex items-end gap-1.5 h-full w-full justify-center">
                  {/* Income Bar (Emerald) */}
                  {incHeight > 0 ? (
                    <div
                      className="w-3 sm:w-4 rounded-t-lg bg-emerald-500 group-hover:bg-emerald-400 transition-all shadow-xs"
                      style={{ height: `${incHeight}%` }}
                      title={`${bar.label} - Pemasukan: ${formatRupiah(bar.income)}`}
                    />
                  ) : (
                    <div className="w-3 sm:w-4 h-1 rounded-full bg-slate-100" />
                  )}

                  {/* Expense Bar (Rose/Red) */}
                  {expHeight > 0 ? (
                    <div
                      className="w-3 sm:w-4 rounded-t-lg bg-rose-500 group-hover:bg-rose-400 transition-all shadow-xs"
                      style={{ height: `${expHeight}%` }}
                      title={`${bar.label} - Pengeluaran: ${formatRupiah(bar.expense)}`}
                    />
                  ) : (
                    <div className="w-3 sm:w-4 h-1 rounded-full bg-slate-100" />
                  )}
                </div>

                <div className="flex flex-col items-center">
                  <span className={`text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded-md transition-all ${
                    bar.isCurrent 
                      ? 'bg-[#6633EE] text-white shadow-xs font-black' 
                      : 'text-[#7E7A9B]'
                  }`}>
                    {bar.label}
                  </span>
                  {bar.subLabel && (
                    <span className="text-[9px] text-[#A5A1BE] font-medium">
                      {bar.subLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Surplus / Deficit Cashflow Callout Footer */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-[#7E7A9B] font-medium">
            Status Arus Kas:
          </span>
          <span className={`font-black px-2.5 py-0.5 rounded-full ${
            cashflowStats.netCashflow >= 0
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-rose-100 text-rose-700'
          }`}>
            {cashflowStats.netCashflow >= 0 ? `Surplus +${formatRupiah(cashflowStats.netCashflow)} (Hemat)` : `Defisit -${formatRupiah(Math.abs(cashflowStats.netCashflow))}`}
          </span>
        </div>
      </div>
    </div>
  );
}
