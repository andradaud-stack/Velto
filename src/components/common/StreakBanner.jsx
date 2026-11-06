import React from 'react';
import { Flame, Sparkles, Trophy, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StreakBanner({ streakInfo, onQuickSave }) {
  const { currentStreak = 0, savedToday = false, longestStreak = 0, recentDays = [] } = streakInfo || {};
  const hasStreak = currentStreak > 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1B2E] via-[#2A1E4A] to-[#1E1B2E] border border-amber-500/25 p-5 text-white shadow-soft-card select-none">
      {/* Background glow orbs */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#6633EE]/30 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Streak Counter & Fire Badge */}
        <div className="flex items-center gap-3.5">
          <div className={`relative w-14 h-14 rounded-2xl p-0.5 flex items-center justify-center shrink-0 shadow-lg ${
            hasStreak 
              ? 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-orange-500/30' 
              : 'bg-white/10 shadow-none'
          }`}>
            <div className="w-full h-full rounded-[14px] bg-[#1E1B2E] flex flex-col items-center justify-center">
              <Flame className={`w-7 h-7 ${
                hasStreak 
                  ? 'text-amber-400 fill-amber-400 animate-bounce' 
                  : 'text-white/40'
              }`} />
            </div>
            {/* Small fire spark badge if active */}
            {hasStreak && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] font-black items-center justify-center text-white">🔥</span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white">
                {currentStreak} Hari
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                hasStreak
                  ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300'
                  : 'bg-white/10 border border-white/10 text-white/60'
              }`}>
                Saving Streak
              </span>
            </div>
            <p className="text-xs text-[#A5A1BE] mt-0.5 font-medium">
              {hasStreak
                ? (savedToday 
                    ? '🔥 Keren! Kamu sudah konsisten menabung hari ini!' 
                    : '⚡ Nabung sekarang untuk pertahankan api konsistensimu!')
                : 'Nabung sekarang untuk mulai menyalakan api konsistensimu!'}
            </p>
          </div>
        </div>

        {/* Right: Quick motivators / Longest streak */}
        <div className="flex items-center gap-2.5 sm:self-center">
          <div className="px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-white/60 block leading-tight">Rekor Terbaik</span>
              <span className="font-extrabold text-amber-300">{longestStreak} Hari</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Streak Timeline Tracker (Duolingo style) */}
      <div className="mt-4 pt-3.5 border-t border-white/10">
        <div className="flex items-center justify-between gap-1.5">
          {recentDays.map((day, idx) => (
            <div 
              key={idx} 
              className={`flex-1 flex flex-col items-center py-2 px-1 rounded-2xl transition-all ${
                day.isToday
                  ? day.isSaved
                    ? 'bg-amber-500/25 border border-amber-400 shadow-sm'
                    : 'bg-white/10 border border-white/20 ring-2 ring-amber-400/50'
                  : day.isSaved
                  ? 'bg-emerald-500/20 border border-emerald-500/30'
                  : 'bg-white/5 border border-white/5 opacity-60'
              }`}
            >
              <span className="text-[10px] font-semibold text-[#A5A1BE]">
                {day.dayName}
              </span>
              <div className="my-1">
                {day.isSaved ? (
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                ) : day.isToday ? (
                  <div className="w-4 h-4 rounded-full border-2 border-dashed border-amber-300 animate-spin" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full bg-white/10" />
                )}
              </div>
              <span className={`text-[10px] font-bold ${day.isToday ? 'text-amber-300' : 'text-white/80'}`}>
                {day.dayNumber}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
