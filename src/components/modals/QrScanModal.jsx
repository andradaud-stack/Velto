import React, { useState } from 'react';
import { X, QrCode, ScanLine, Camera, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah } from '../../core/utils/currencyFormatter';

export default function QrScanModal({ isOpen, onClose }) {
  const { walletMap } = useFinance();
  const [activeMode, setActiveMode] = useState('my_qr'); // 'my_qr' | 'scan_camera'

  if (!isOpen) return null;

  const jagoWallet = walletMap['jago'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-[#ECE8F6] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-[#ECE8F6] rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-4 border-b border-[#F4F2FA]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[#6633EE]/10 text-[#6633EE] flex items-center justify-center font-bold">
              <ScanLine className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1E1B2E]">Scan & QR Bayar</h3>
              <p className="text-[11px] text-[#7E7A9B] font-medium">QRIS & Terima Pembayaran</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#F4F2FA] text-[#7E7A9B] hover:text-[#1E1B2E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex p-1 bg-[#F4F2FA] rounded-2xl my-4">
          <button
            onClick={() => setActiveMode('my_qr')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeMode === 'my_qr' ? 'bg-white text-[#6633EE] shadow-xs' : 'text-[#7E7A9B]'
            }`}
          >
            QR Terima Dana
          </button>
          <button
            onClick={() => setActiveMode('scan_camera')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeMode === 'scan_camera' ? 'bg-white text-[#6633EE] shadow-xs' : 'text-[#7E7A9B]'
            }`}
          >
            Kamera Scanner
          </button>
        </div>

        {activeMode === 'my_qr' ? (
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="p-4 bg-white border-2 border-dashed border-[#6633EE]/40 rounded-3xl shadow-sm text-center">
              {/* Simulated QR Code SVG pattern */}
              <div className="w-48 h-48 bg-[#1E1B2E] rounded-2xl p-3 flex flex-col justify-between mx-auto relative overflow-hidden">
                <div className="flex justify-between">
                  <div className="w-12 h-12 border-4 border-white rounded-md p-1.5 flex items-center justify-center">
                    <div className="w-full h-full bg-white rounded-xs"></div>
                  </div>
                  <div className="w-12 h-12 border-4 border-white rounded-md p-1.5 flex items-center justify-center">
                    <div className="w-full h-full bg-white rounded-xs"></div>
                  </div>
                </div>
                
                <div className="w-10 h-10 rounded-xl bg-[#6633EE] text-white flex items-center justify-center font-black text-xs mx-auto">
                  AF
                </div>

                <div className="flex justify-between items-end">
                  <div className="w-12 h-12 border-4 border-white rounded-md p-1.5 flex items-center justify-center">
                    <div className="w-full h-full bg-white rounded-xs"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 w-12 h-12">
                    <div className="bg-white rounded-2xs"></div>
                    <div className="bg-white rounded-2xs"></div>
                    <div className="bg-white rounded-2xs"></div>
                    <div className="bg-white rounded-2xs"></div>
                    <div className="bg-white rounded-2xs"></div>
                    <div className="bg-white rounded-2xs"></div>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-xs font-bold text-[#1E1B2E] block">QRIS Bank Jago</span>
                <span className="text-[11px] text-[#7E7A9B]">Andra Syahdan • 2343 3333 •••• 1099</span>
              </div>
            </div>

            <p className="text-[11px] text-center text-[#7E7A9B] px-6">
              Pindai QR ini melalui aplikasi e-wallet atau mobile banking apa pun untuk menerima transfer saldo ke Bank Jago.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="w-56 h-56 rounded-3xl bg-[#1E1B2E] relative flex items-center justify-center text-white overflow-hidden shadow-inner">
              <Camera className="w-10 h-10 text-white/40" />
              {/* Animated Scan Line */}
              <div className="absolute left-4 right-4 h-0.5 bg-[#6633EE] animate-bounce shadow-[0_0_12px_#6633EE]"></div>
            </div>
            <p className="text-xs text-[#7E7A9B] text-center font-medium">
              Arahkan kamera ke kode QRIS merchant untuk membayar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
