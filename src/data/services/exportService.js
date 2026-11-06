import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatRupiah, formatDateTimeIndo } from '../../core/utils/currencyFormatter';

/**
 * Client-side PDF export with modern design & clean summary tables.
 */
export function exportToPDF({ wallets, transactions, totalNetWorth, totalGain }) {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Header Banner
  doc.setFillColor(124, 77, 255); // #7C4DFF
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('VELTO FINANCE', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Laporan Ringkasan Portofolio & Mutasi Keuangan Pribadi', 14, 25);
  doc.text(`Dicetak: ${dateStr}`, 14, 30);

  // Summary KPI Cards
  doc.setTextColor(30, 27, 46); // #1E1B2E
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Ringkasan Total Kekayaan Bersih (Net Worth)', 14, 48);

  const kpiData = [
    ['Total Net Worth', formatRupiah(totalNetWorth)],
    ['Total Capital Gain (Investasi)', formatRupiah(totalGain)],
    ['Status Basis Data', 'IndexedDB PWA Offline-First (AC-01/02/03 Compliant)']
  ];

  autoTable(doc, {
    startY: 52,
    head: [['Metrik', 'Nilai']],
    body: kpiData,
    theme: 'grid',
    headStyles: { fillColor: [124, 77, 255], textColor: [255, 255, 255] },
    styles: { fontSize: 9 }
  });

  // Wallets Table
  const finalY1 = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Rincian 5 Kantong Aset', 14, finalY1);

  const walletRows = (wallets || []).map(w => {
    const isInvest = w.type === 'investment';
    const gain = isInvest ? (w.balance - w.investedCapital) : 0;
    return [
      w.name,
      w.type.toUpperCase(),
      formatRupiah(w.balance),
      formatRupiah(w.investedCapital),
      isInvest ? formatRupiah(gain) : 'Rp 0 (Terkunci)',
      w.goldGrams > 0 ? `${w.goldGrams} gr` : '-'
    ];
  });

  autoTable(doc, {
    startY: finalY1 + 4,
    head: [['Kantong', 'Tipe', 'Saldo Saat Ini', 'Modal Invested', 'Capital Gain', 'Gramatur']],
    body: walletRows,
    theme: 'striped',
    headStyles: { fillColor: [102, 51, 238], textColor: [255, 255, 255] },
    styles: { fontSize: 8.5 }
  });

  // Transactions Table
  const finalY2 = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Riwayat Mutasi Terkini', 14, finalY2);

  const txRows = (transactions || []).slice(0, 15).map(tx => [
    formatDateTimeIndo(tx.date),
    tx.title,
    tx.category || tx.type,
    formatRupiah(tx.amount),
    tx.details || '-'
  ]);

  autoTable(doc, {
    startY: finalY2 + 4,
    head: [['Tanggal', 'Judul Mutasi', 'Kategori', 'Nominal', 'Keterangan']],
    body: txRows.length > 0 ? txRows : [['-', 'Belum ada transaksi', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [124, 77, 255], textColor: [255, 255, 255] },
    styles: { fontSize: 8 }
  });

  // Footer Note
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Velto Finance v2.4 • Halaman ${i} dari ${pageCount}`, 14, 290);
  }

  doc.save(`Velto_Finance_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Client-side Excel export using SheetJS XLSX.
 */
export function exportToExcel({ wallets, transactions, totalNetWorth, totalGain }) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Wallets & Net Worth
  const walletData = (wallets || []).map(w => ({
    'ID Kantong': w.id,
    'Nama Kantong': w.name,
    'Tipe Akun': w.type,
    'Saldo Saat Ini (Rp)': w.balance,
    'Modal Terinvestasi (Rp)': w.investedCapital,
    'Capital Gain (Rp)': w.type === 'investment' ? (w.balance - w.investedCapital) : 0,
    'Gramatur Emas (gr)': w.goldGrams || 0,
    'Terakhir Diperbarui': w.updatedAt
  }));

  walletData.push({
    'ID Kantong': 'TOTAL',
    'Nama Kantong': 'Total Net Worth',
    'Tipe Akun': 'ALL',
    'Saldo Saat Ini (Rp)': totalNetWorth,
    'Modal Terinvestasi (Rp)': wallets.reduce((s, w) => s + (w.investedCapital || 0), 0),
    'Capital Gain (Rp)': totalGain,
    'Gramatur Emas (gr)': 0,
    'Terakhir Diperbarui': new Date().toISOString()
  });

  const wsWallets = XLSX.utils.json_to_sheet(walletData);
  XLSX.utils.book_append_sheet(wb, wsWallets, 'Kantong Aset');

  // Sheet 2: Transactions
  const txData = (transactions || []).map(tx => ({
    'ID Mutasi': tx.id,
    'Tanggal': tx.date,
    'Tipe': tx.type,
    'Kategori': tx.category,
    'Deskripsi': tx.title,
    'Nominal (Rp)': tx.amount,
    'Kantong Terkait': tx.walletId || tx.sourceWalletId || '-',
    'Keterangan Tambahan': tx.details || ''
  }));

  const wsTx = XLSX.utils.json_to_sheet(txData);
  XLSX.utils.book_append_sheet(wb, wsTx, 'Riwayat Mutasi');

  // Write file
  XLSX.writeFile(wb, `Velto_Finance_Backup_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
