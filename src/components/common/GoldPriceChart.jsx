import React, { useState } from 'react';
import { formatRupiah } from '../../core/utils/currencyFormatter';

export default function GoldPriceChart({ 
  historyData = [], 
  currentPrice, 
  buybackPrice, 
  lastUpdated, 
  sourceName = 'DANA x Treasury (Real-Time)', 
  fluctuation 
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!historyData || historyData.length === 0) return null;

  const prices = historyData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // Chart coordinate mapping
  const width = 360;
  const height = 150;
  const paddingX = 16;
  const paddingTop = 20;
  const paddingBottom = 28;

  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - (paddingX * 2);

  const points = historyData.map((d, index) => {
    const x = paddingX + (index / (historyData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.price - minPrice) / priceRange) * chartHeight;
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    // Smooth bezier curve
    const prev = points[idx - 1];
    const cx1 = prev.x + (pt.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (pt.x - prev.x) / 2;
    const cy2 = pt.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
  }, '');

  // Fill gradient area path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  const activePoint = hoveredPoint || points[points.length - 1];

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#ECE8F6] shadow-soft-card space-y-3">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
              {sourceName}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-[#1E1B2E]">
              {formatRupiah(activePoint.price)}
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              {activePoint.date}
            </span>
            {fluctuation !== undefined && fluctuation !== null && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${Number(fluctuation) >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                {Number(fluctuation) >= 0 ? `+${fluctuation}%` : `${fluctuation}%`}
              </span>
            )}
          </div>
        </div>

        {buybackPrice && (
          <div className="text-right">
            <span className="text-[10px] text-[#7E7A9B] block font-semibold">Harga Jual / Buyback</span>
            <span className="text-xs sm:text-sm font-bold text-[#1E1B2E]">
              {formatRupiah(buybackPrice)}
            </span>
            {lastUpdated && (
              <span className="text-[9px] text-slate-400 block mt-0.5">
                {String(lastUpdated).includes('T') ? new Date(lastUpdated).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : String(lastUpdated).slice(-8)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke="#F4F2FA"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={paddingTop + chartHeight / 2}
            x2={width - paddingX}
            y2={paddingTop + chartHeight / 2}
            stroke="#F4F2FA"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="#ECE8F6"
            strokeWidth="1"
          />

          {/* Area under curve */}
          <path d={areaD} fill="url(#goldGradient)" />

          {/* Main Gold Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Interactive Points */}
          {points.map((pt, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint(pt)}
              onClick={() => setHoveredPoint(pt)}
            >
              {/* Invisible touch/click hit area */}
              <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

              {/* Visible dot on active */}
              {activePoint.date === pt.date && (
                <>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="6"
                    fill="#F59E0B"
                    fillOpacity="0.25"
                    className="animate-ping"
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#FFFFFF"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                  />
                </>
              )}

              {/* Bottom Date Labels */}
              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="9"
                fontWeight={activePoint.date === pt.date ? "bold" : "normal"}
                fill={activePoint.date === pt.date ? "#D97706" : "#A19DB8"}
              >
                {pt.date}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] text-[#7E7A9B] pt-1">
        <span>Rentang: {formatRupiah(minPrice)} - {formatRupiah(maxPrice)}</span>
        <span className="font-semibold text-amber-700">Sentuh / hover titik grafik untuk melihat pergerakan</span>
      </div>
    </div>
  );
}
