/**
 * Helper untuk menghitung Streak Tabungan Pengguna secara Real-Time
 * Menghitung streak berdasarkan:
 * 1. Setoran ke Goals (transaksi dengan category: 'Tabungan Target' atau title mengandung 'Nabung')
 * 2. Transaksi tabungan rutin / alokasi dana (allowance_in / investasi emas & bibit)
 * 3. Log lastDepositDate pada target goals
 */

function formatLocalDate(dateObj) {
  if (!dateObj) return null;
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateSavingStreak(transactions = [], goals = []) {
  const now = new Date();
  const todayStr = formatLocalDate(now);
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);

  // Ambil semua tanggal transaksi yang bernilai "menabung" / alokasi dana
  const savingTxDates = [];
  
  (transactions || []).forEach(t => {
    const isGoalDeposit = t.category === 'Tabungan Target' || (t.title && t.title.toLowerCase().includes('nabung'));
    const isSavingAllocation = t.type === 'allowance' || t.type === 'allowance_in' || (t.category && (t.category.toLowerCase().includes('investasi') || t.category.toLowerCase().includes('tabungan')));
    if (isGoalDeposit || isSavingAllocation) {
      const dStr = formatLocalDate(t.date);
      if (dStr) savingTxDates.push(dStr);
    }
  });

  // Tambahkan juga tanggal lastDepositDate dari goals aktif
  (goals || []).forEach(g => {
    if (g.lastDepositDate) {
      const dStr = formatLocalDate(g.lastDepositDate);
      if (dStr) savingTxDates.push(dStr);
    }
  });

  // Hapus duplikat tanggal & urutkan descending (terbaru ke terlama)
  const uniqueDates = Array.from(new Set(savingTxDates)).sort((a, b) => new Date(b) - new Date(a));

  // Cek apakah ada aksi menabung hari ini
  const savedToday = uniqueDates.includes(todayStr);

  // Jika TIDAK ADA riwayat menabung sama sekali (misal setelah reset)
  if (uniqueDates.length === 0) {
    return {
      currentStreak: 0,
      savedToday: false,
      longestStreak: 0,
      lastSavedDate: null,
      recentDays: generateRecentDays(todayStr, [])
    };
  }

  // Hitung streak berurutan ke belakang
  let currentStreak = 0;
  let checkDate = new Date(now);

  if (!savedToday) {
    const mostRecentDate = uniqueDates[0];
    if (mostRecentDate !== yesterdayStr) {
      // Terputus lebih dari 1 hari yang lalu
      currentStreak = 0;
    } else {
      checkDate = yesterday;
    }
  }

  if (savedToday || uniqueDates[0] === yesterdayStr) {
    for (let i = 0; i < 365; i++) {
      const dStr = formatLocalDate(checkDate);
      if (uniqueDates.includes(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    savedToday,
    longestStreak: currentStreak,
    lastSavedDate: uniqueDates[0] || todayStr,
    recentDays: generateRecentDays(todayStr, uniqueDates)
  };
}

function generateRecentDays(todayStr, uniqueDates = []) {
  // 7 Hari Terakhir (trailing 7 hari sampai hari ini)
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const days = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = formatLocalDate(d);
    const isToday = (dateStr === todayStr);
    const isSaved = uniqueDates.includes(dateStr);

    days.push({
      dateStr,
      dayName: dayNames[d.getDay()],
      dayNumber: d.getDate(),
      isToday,
      isSaved
    });
  }

  return days;
}
