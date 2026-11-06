import React, { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah } from '../core/utils/currencyFormatter';
import BankJagoHeroCard from '../components/common/BankJagoHeroCard';
import ActionCircleButton from '../components/common/ActionCircleButton';
import PaymentTrackerTimeline from '../components/common/PaymentTrackerTimeline';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function OverviewPage({ 
  onOpenNewWallet,
  onOpenEstimate,
  onOpenOptions,
  onSelectWallet 
}) {
  const { 
    wallets, 
    transactions, 
    totalNetWorth 
  } = useFinance();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('right');
  const [isAnimating, setIsAnimating] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const walletList = wallets && wallets.length > 0 ? wallets : [];
  const currentWallet = walletList[currentCardIndex] || walletList[0];
  const latestTx = (transactions || [])[0];

  const triggerSlide = (newIndex, direction) => {
    if (isAnimating || newIndex === currentCardIndex) return;
    setSlideDirection(direction);
    setIsAnimating(true);
    setCurrentCardIndex(newIndex);
    setTimeout(() => {
      setIsAnimating(false);
    }, 320);
  };

  const handleNextCard = () => {
    const nextIdx = (currentCardIndex + 1) % walletList.length;
    triggerSlide(nextIdx, 'right');
  };

  const handlePrevCard = () => {
    const prevIdx = (currentCardIndex - 1 + walletList.length) % walletList.length;
    triggerSlide(prevIdx, 'left');
  };

  // Swipe gesture handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      handleNextCard();
    } else if (diff < -45) {
      handlePrevCard();
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 overflow-hidden">
      {/* 1. Large Centered Net Worth Number */}
      <div className="px-5 text-center pt-2">
        <h1 className="text-4xl sm:text-5xl font-black text-[#1E1B2E] tracking-tight">
          {formatRupiah(totalNetWorth)}
        </h1>
        <span className="text-xs text-[#7E7A9B] font-semibold mt-1 block">
          Available balance
        </span>
      </div>

      {/* 2. Interactive Swipeable Hero Card Carousel or Empty State */}
      <div className="px-5 relative">
        {walletList.length > 0 ? (
          <div 
            className="relative overflow-hidden rounded-[28px]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              key={currentWallet?.id || currentCardIndex}
              onClick={() => onSelectWallet && currentWallet && onSelectWallet(currentWallet)}
              className={`cursor-pointer transition-all duration-300 ease-out transform ${
                slideDirection === 'right'
                  ? 'animate-in fade-in slide-in-from-right-12 duration-300'
                  : 'animate-in fade-in slide-in-from-left-12 duration-300'
              }`}
            >
              <BankJagoHeroCard wallet={currentWallet} />
            </div>
          </div>
        ) : (
          <div 
            onClick={onOpenNewWallet}
            className="cursor-pointer bg-white rounded-3xl p-6 border-2 border-dashed border-[#DDD7F2] hover:border-[#6633EE] flex flex-col items-center justify-center text-center shadow-soft-card transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#F3EEFF] text-[#6633EE] flex items-center justify-center mb-3 shadow-xs">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="font-extrabold text-base text-[#1E1B2E]">Tambah Kantong Pertamamu</h3>
            <p className="text-xs text-[#7E7A9B] mt-1 max-w-[260px]">
              Belum ada kantong aset. Buat kantong bank, e-wallet, atau kas tunai untuk mulai mencatat.
            </p>
            <button className="mt-4 px-4 py-2 rounded-xl bg-[#6633EE] text-white text-xs font-bold shadow-xs">
              + Buat Kantong Aset
            </button>
          </div>
        )}

        {/* Subtle desktop arrow navigation */}
        {walletList.length > 1 && (
          <div className="hidden sm:flex justify-between absolute top-1/2 -translate-y-1/2 left-2 right-2 pointer-events-none">
            <button
              onClick={(e) => { e.stopPropagation(); handlePrevCard(); }}
              className="p-1.5 rounded-full bg-white/90 border border-[#ECE8F6] text-[#7C4DFF] pointer-events-auto shadow-md hover:bg-white transition-all -ml-2 active:scale-90"
              title="Kantong sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNextCard(); }}
              className="p-1.5 rounded-full bg-white/90 border border-[#ECE8F6] text-[#7C4DFF] pointer-events-auto shadow-md hover:bg-white transition-all -mr-2 active:scale-90"
              title="Kantong berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Carousel Dots Navigation */}
      {walletList.length > 0 && (
        <div className="flex items-center justify-center gap-2 -mt-2">
          {walletList.map((w, index) => {
            const isActive = index === currentCardIndex;
            return (
              <button
                key={w.id || index}
                onClick={() => {
                  const dir = index > currentCardIndex ? 'right' : 'left';
                  triggerSlide(index, dir);
                }}
                className={`transition-all duration-300 rounded-full ${
                  isActive 
                    ? 'w-6 h-2 bg-[#6633EE] shadow-sm' 
                    : 'w-2 h-2 bg-[#D1D5DB] hover:bg-[#9CA3AF]'
                }`}
                title={w.name}
              />
            );
          })}
        </div>
      )}

      {/* 4. Action Buttons: 3 Tombol Utama yang Berguna & Presisi (New, Estimate, Options) */}
      <div className="px-5">
        <div className="flex items-center justify-around py-2 max-w-[340px] mx-auto">
          <ActionCircleButton
            icon="plus"
            label="New"
            onClick={onOpenNewWallet}
          />
          <ActionCircleButton
            icon="estimate"
            label="Estimate"
            onClick={onOpenEstimate}
          />
          <ActionCircleButton
            icon="options"
            label="Options"
            onClick={onOpenOptions}
          />
        </div>
      </div>

      {/* 5. Payments EasyPays Tracker */}
      <div className="px-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-[#1E1B2E] tracking-tight">
              Payments EasyPays
            </h3>
            <span className="w-4 h-4 rounded-full bg-[#6633EE] text-white flex items-center justify-center text-[10px] font-bold">
              8
            </span>
          </div>
        </div>

        <PaymentTrackerTimeline transaction={latestTx} />
      </div>
    </div>
  );
}
