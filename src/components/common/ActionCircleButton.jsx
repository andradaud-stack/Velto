import React from 'react';
import { Plus, DollarSign, BarChart2, Scan, ArrowLeftRight } from 'lucide-react';

const ICON_MAP = {
  plus: Plus,
  estimate: DollarSign,
  options: BarChart2,
  scan: Scan,
  transfer: ArrowLeftRight
};

export default function ActionCircleButton({
  icon = 'plus',
  label,
  onClick,
  active = false
}) {
  const IconComponent = ICON_MAP[icon] || Plus;

  return (
    <button
      onClick={onClick}
      type="button"
      className="flex flex-col items-center group focus:outline-none transition-transform active:scale-95"
    >
      <div className="w-14 h-14 rounded-full bg-[#6633EE] hover:bg-[#5827DE] text-white flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(102,51,238,0.4)] group-hover:scale-105 transition-all">
        <IconComponent className="w-6 h-6 stroke-[2.2] text-white" />
      </div>
      <span className="mt-2 text-xs font-semibold text-[#1E1B2E] tracking-tight group-hover:text-[#6633EE] transition-colors">
        {label}
      </span>
    </button>
  );
}
