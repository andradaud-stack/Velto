import { describe, it, expect } from 'vitest';
import { 
  formatRupiah, 
  formatGoldGrams, 
  formatPercentage, 
  formatDateIndo, 
  formatDateTimeIndo 
} from '../src/core/utils/currencyFormatter';

describe('currencyFormatter Utility', () => {
  it('formats positive Rupiah amounts correctly', () => {
    expect(formatRupiah(400000)).toBe('Rp 400.000');
    expect(formatRupiah(12750000)).toBe('Rp 12.750.000');
    expect(formatRupiah(1000)).toBe('Rp 1.000');
  });

  it('formats zero correctly as Rp 0', () => {
    expect(formatRupiah(0)).toBe('Rp 0');
    expect(formatRupiah(0, false)).toBe('0');
  });

  it('handles null, undefined, and NaN gracefully without crashing', () => {
    expect(formatRupiah(null)).toBe('Rp 0');
    expect(formatRupiah(undefined)).toBe('Rp 0');
    expect(formatRupiah(NaN)).toBe('Rp 0');
    expect(formatRupiah(null, false)).toBe('0');
  });

  it('formats negative amounts with a minus sign', () => {
    expect(formatRupiah(-50000)).toBe('-Rp 50.000');
    expect(formatRupiah(-50000, false)).toBe('-50.000');
  });

  it('formats gold grams correctly', () => {
    expect(formatGoldGrams(0.1234)).toBe('0.1234 gr');
    expect(formatGoldGrams(0)).toBe('0.0000 gr');
    expect(formatGoldGrams(null)).toBe('0 gr');
    expect(formatGoldGrams(undefined)).toBe('0 gr');
    expect(formatGoldGrams(NaN)).toBe('0 gr');
  });

  it('formats percentages correctly', () => {
    expect(formatPercentage(5.2)).toBe('+5.2%');
    expect(formatPercentage(-3.1)).toBe('-3.1%');
    expect(formatPercentage(0)).toBe('0.0%');
    expect(formatPercentage(null)).toBe('0.0%');
    expect(formatPercentage(undefined)).toBe('0.0%');
  });

  it('handles invalid dates gracefully without throwing', () => {
    expect(formatDateIndo('')).toBe('');
    expect(formatDateIndo(null)).toBe('');
    expect(formatDateIndo('invalid-date')).toBe('');
    expect(formatDateTimeIndo('')).toBe('');
    expect(formatDateTimeIndo(null)).toBe('');
    expect(formatDateTimeIndo('invalid-date')).toBe('');
  });
});
