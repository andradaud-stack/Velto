import { describe, it, expect } from 'vitest';
import { calculateSavingStreak } from '../src/core/utils/streakCalculator';

describe('streakCalculator Gamification Engine', () => {
  it('returns 0 streak for empty transactions and goals', () => {
    const res = calculateSavingStreak([], []);
    expect(res.currentStreak).toBe(0);
    expect(res.savedToday).toBe(false);
    expect(res.lastSavedDate).toBe(null);
  });

  it('handles null / undefined parameters safely without throwing', () => {
    const res = calculateSavingStreak(null, null);
    expect(res.currentStreak).toBe(0);
    expect(res.savedToday).toBe(false);
  });

  it('detects a deposit made today', () => {
    const today = new Date().toISOString();
    const txs = [
      { id: 'tx_1', category: 'Tabungan Target', amount: 50000, date: today }
    ];
    const res = calculateSavingStreak(txs, []);
    expect(res.savedToday).toBe(true);
    expect(res.currentStreak).toBeGreaterThanOrEqual(1);
  });
});
