import React from 'react';
import { Check } from 'lucide-react';
import { formatRupiah, formatDateTimeIndo } from '../../core/utils/currencyFormatter';

export default function PaymentTrackerTimeline({ transaction }) {
  if (!transaction) {
    return (
      <div className="bg-white rounded-3xl p-5 border border-[#ECE8F6] shadow-soft-card text-center py-6">
        <p className="text-xs font-bold text-[#1E1B2E]">Belum Ada Aktivitas Pembayaran</p>
        <p className="text-[11px] text-[#7E7A9B] mt-1">Transaksi pengeluaran dan mutasi rutin akan tampil di sini.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#ECE8F6] shadow-soft-card space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1E1B2E] text-white flex items-center justify-center font-bold text-xs">
            a
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1E1B2E] tracking-tight">
              {transaction.title || 'Alokasi Terjadwal'}
            </h4>
            <span className="text-[10px] text-[#7E7A9B] block">
              {transaction.category || 'Rutinitas Mingguan'}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-sm font-extrabold text-[#1E1B2E]">
            {formatRupiah(transaction.amount)}
          </span>
        </div>
      </div>

      {/* 4 Step Timeline Dots like EasyPay UI */}
      <div className="relative pt-1 pb-1">
        {/* Horizontal Line connecting nodes */}
        <div className="absolute top-[18px] left-6 right-6 h-0.5 bg-[#ECE8F6] -translate-y-1/2 z-0" />

        <div className="relative z-10 flex items-center justify-between">
          {/* Step 1: Done */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#1E1B2E] text-white flex items-center justify-center shadow-xs">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-[10px] font-semibold text-[#1E1B2E] mt-1.5">Done</span>
          </div>

          {/* Step 2: Done */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#1E1B2E] text-white flex items-center justify-center shadow-xs">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-[10px] font-semibold text-[#1E1B2E] mt-1.5">Done</span>
          </div>

          {/* Step 3: Current Half-filled */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#1E1B2E] bg-white flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-[#1E1B2E] [clip-path:polygon(0_0,50%_0,50%_100%,0_100%)]"></div>
            </div>
            <span className="text-[10px] font-semibold text-[#6B7280] mt-1.5">Aktif</span>
          </div>

          {/* Step 4: Next Target */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#D1D5DB] bg-white flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-[#1E1B2E] [clip-path:polygon(0_0,25%_0,25%_100%,0_100%)]"></div>
            </div>
            <span className="text-[10px] font-semibold text-[#9CA3AF] mt-1.5">Berikutnya</span>
          </div>
        </div>
      </div>
    </div>
  );
}
