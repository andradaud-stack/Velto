import React, { useState, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { formatRupiah } from '../../core/utils/currencyFormatter';

export default function AnalyticsBarChart({ totalNetWorth = 0 }) {
  const [activeRange, setActiveRange] = useState('Month'); // 'Week' | 'Month' | 'Year'

  // Generate dynamic contextual chart data based on active totalNetWorth & Real-Time Date
  const chartData = useMemo(() => {
    const currentTotal = totalNetWorth || 0;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const shortDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const todayName = dayNames[now.getDay()];

    if (activeRange === 'Week') {
      const multipliers = [0.92, 0.94, 0.96, 0.97, 0.98, 0.99, 1.0];
      const maxVal = Math.max(...multipliers.map(m => currentTotal * m), 100000) * 1.15;

      return shortDays.map((day, idx) => ({
        label: day,
        value: Math.round(currentTotal * multipliers[idx]),
        max: maxVal,
        isHighlight: day === todayName || (todayName === 'Min' && day === 'Min')
      }));
    }

    if (activeRange === 'Year') {
      const years = [];
      for (let i = 3; i >= 0; i--) {
        years.push((currentYear - i).toString());
      }
      const multipliers = [0.35, 0.58, 0.82, 1.0];
      const maxVal = Math.max(currentTotal * 1.25, 1000000);

      return years.map((yr, idx) => ({
        label: yr,
        value: Math.round(currentTotal * multipliers[idx]),
        max: maxVal,
        isHighlight: yr === currentYear.toString()
      }));
    }

    // Default: 'Month' (7 bulan trailing sampai bulan saat ini secara real-time)
    const months = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      months.push({
        label: monthNames[d.getMonth()],
        isCurrent: i === 0
      });
    }

    const multipliers = [0.45, 0.60, 0.75, 0.84, 0.92, 0.97, 1.0];
    const maxVal = Math.max(currentTotal * 1.2, 1000000);

    return months.map((mObj, idx) => ({
      label: mObj.label,
      value: Math.round(currentTotal * multipliers[idx]),
      max: maxVal,
      isHighlight: mObj.isCurrent
    }));
  }, [activeRange, totalNetWorth]);

  // Determine dynamic Y-axis steps based on highest value
  const maxScale = chartData[0]?.max || 1000000;
  const yLabels = [
    { label: formatRupiah(maxScale), percent: 100 },
    { label: formatRupiah(maxScale * 0.75), percent: 75 },
    { label: formatRupiah(maxScale * 0.5), percent: 50 },
    { label: formatRupiah(maxScale * 0.25), percent: 25 },
    { label: 'Rp 0', percent: 0 }
  ];

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#ECE8F6] shadow-soft-card space-y-4">
      {/* Title & Filter Pills */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1E1B2E] tracking-tight">
              Analytics EasyPays
            </h3>
            <span className="text-[11px] text-[#7E7A9B] font-medium">
              Riwayat Total Saldo: <strong className="text-[#6633EE]">{formatRupiah(totalNetWorth || 0)}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1 bg-[#F4F2FA] p-0.5 rounded-full border border-[#ECE8F6]">
            <BarChart3 className="w-3.5 h-3.5 text-[#7C4DFF] ml-1.5" />
            <span className="w-4 h-4 rounded-full bg-[#7C4DFF] mr-0.5"></span>
          </div>
        </div>

        {/* Range Selector Pill Group */}
        <div className="flex p-1 bg-[#F4F2FA] rounded-full mt-3 w-fit">
          {['Week', 'Month', 'Year'].map(range => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-4 py-1 text-xs font-semibold rounded-full transition-all ${
                activeRange === range 
                  ? 'bg-[#6633EE] text-white shadow-xs' 
                  : 'text-[#7E7A9B] hover:text-[#1E1B2E]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Bar Chart Area in Indonesian Rupiah */}
      <div className="relative pt-2 pb-1">
        {/* Y Axis Grid Lines formatted in Rupiah */}
        <div className="space-y-4 text-[10px] text-[#A19DB8] font-medium">
          {yLabels.map((yl, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-20 text-right truncate">{yl.label}</span>
              <div className={`flex-1 h-px ${i === yLabels.length - 1 ? 'bg-[#ECE8F6]' : 'bg-[#F4F2FA]'}`}></div>
            </div>
          ))}
        </div>

        {/* Vertical Bars Overlay */}
        <div className="absolute inset-0 pl-24 pr-2 pt-2 pb-6 flex items-end justify-between">
          {chartData.map((bar, i) => {
            const heightPercent = bar.value > 0 ? Math.min(100, Math.max(10, (bar.value / bar.max) * 100)) : 0;
            const isHighlight = bar.isHighlight;

            return (
              <div 
                key={i} 
                className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer flex-1 px-1"
                title={`${bar.label}: ${formatRupiah(bar.value)}`}
              >
                <div 
                  className={`w-full max-w-[28px] rounded-t-xl transition-all shadow-[0_4px_12px_rgba(102,51,238,0.25)] ${
                    isHighlight
                      ? 'bg-gradient-to-t from-[#6633EE] to-[#9966FF] ring-2 ring-[#6633EE]/40'
                      : 'bg-gradient-to-t from-[#5928DF]/80 to-[#8857FF]/80 group-hover:from-[#6A37FF] group-hover:to-[#9B6CFF]'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span className={`text-[10px] font-semibold transition-colors ${
                  isHighlight ? 'text-[#6633EE] font-bold' : 'text-[#7E7A9B] group-hover:text-[#6633EE]'
                }`}>
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
