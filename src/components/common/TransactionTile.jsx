import React from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  PlusCircle, 
  Sparkles, 
  TrendingUp, 
  ShoppingBag
} from 'lucide-react';
import { formatRupiah, formatDateTimeIndo } from '../../core/utils/currencyFormatter';

export default function TransactionTile({ transaction }) {
  const isIncome = transaction.type === 'allowance_in' || 
                   transaction.type === 'allowance' || 
                   transaction.type === 'income' || 
                   transaction.type === 'business';

  const isExpense = transaction.type === 'expense';
  const isTransfer = transaction.type === 'transfer';
  const isMtm = transaction.type === 'mtm_sync';

  let icon = <PlusCircle className="w-4 h-4 text-emerald-600" />;
  let iconBg = 'bg-emerald-50';
  let amountClass = 'text-emerald-600';
  let prefix = '+';

  if (isExpense) {
    icon = <ArrowUpRight className="w-4 h-4 text-rose-600" />;
    iconBg = 'bg-rose-50';
    amountClass = 'text-rose-600';
    prefix = '-';
  } else if (isTransfer) {
    icon = <ArrowLeftRight className="w-4 h-4 text-indigo-600" />;
    iconBg = 'bg-indigo-50';
    amountClass = 'text-indigo-600';
    prefix = '';
  } else if (isMtm) {
    icon = <TrendingUp className="w-4 h-4 text-amber-600" />;
    iconBg = 'bg-amber-50';
    amountClass = 'text-amber-600';
    prefix = '±';
  } else if (transaction.type === 'business') {
    icon = <Sparkles className="w-4 h-4 text-pink-600" />;
    iconBg = 'bg-pink-50';
    amountClass = 'text-pink-600';
    prefix = '+';
  }

  return (
    <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#ECE8F6] hover:border-[#7C4DFF]/30 transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <h5 className="font-bold text-xs text-[#1E1B2E] truncate tracking-tight">
            {transaction.title}
          </h5>
          <p className="text-[11px] text-[#7E7A9B] truncate font-medium mt-0.5">
            {transaction.details || transaction.category || 'Mutasi'}
          </p>
          <span className="text-[10px] text-[#A19DB8] block mt-0.5 font-medium">
            {formatDateTimeIndo(transaction.date)}
          </span>
        </div>
      </div>

      <div className="text-right shrink-0 pl-3">
        <span className={`text-xs sm:text-sm font-extrabold ${amountClass} tracking-tight`}>
          {prefix}{formatRupiah(transaction.amount)}
        </span>
        <span className="block text-[10px] font-semibold text-[#7E7A9B] uppercase tracking-wider mt-0.5">
          {transaction.category || 'Selesai'}
        </span>
      </div>
    </div>
  );
}
