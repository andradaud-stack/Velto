/**
 * Format number to Indonesian Rupiah currency format.
 * Example: 861000 => 'Rp 861.000'
 */
export function formatRupiah(amount, showPrefix = true) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return showPrefix ? 'Rp 0' : '0';
  }
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('id-ID').format(Math.abs(rounded));
  const sign = rounded < 0 ? '-' : '';
  return showPrefix ? `${sign}Rp ${formatted}` : `${sign}${formatted}`;
}

/**
 * Format decimal gold grams
 * Example: 0.1538 => '0.1538 gr'
 */
export function formatGoldGrams(grams, digits = 4) {
  if (grams === undefined || grams === null || isNaN(grams)) {
    return '0 gr';
  }
  return `${Number(grams).toFixed(digits)} gr`;
}

/**
 * Format percentage
 * Example: 0.052 => '+5.2%'
 */
export function formatPercentage(value, showSign = true) {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.0%';
  }
  const num = Number(value);
  const sign = showSign && num > 0 ? '+' : '';
  return `${sign}${num.toFixed(1)}%`;
}

/**
 * Format date to standard Indonesian date
 */
export function formatDateIndo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format timestamp to Indonesian relative/time
 */
export function formatDateTimeIndo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
