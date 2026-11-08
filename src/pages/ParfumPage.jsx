import React, { useState, useEffect, useCallback } from 'react';
import {
  Package, ShoppingBag, LayoutDashboard, TrendingUp, DollarSign,
  BarChart2, Star, AlertTriangle, Trash2, ChevronRight, Plus,
  RefreshCw, Boxes
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah } from '../core/utils/currencyFormatter';
import { getDashboardStats } from '../data/services/parfumFifoService';
import ParfumRestockModal from '../components/modals/ParfumRestockModal';
import ParfumSaleModal from '../components/modals/ParfumSaleModal';

// ─── Sub-tabs ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'restock', label: 'Restock', icon: Package },
  { id: 'penjualan', label: 'Penjualan', icon: ShoppingBag },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color = '#6633EE', bg = '#F3EEFF', sub }) {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-soft-card flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#7E7A9B] uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center`} style={{ backgroundColor: bg }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-lg font-black text-[#1E1B2E] leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-[#A09CB5] font-semibold">{sub}</p>}
    </div>
  );
}

function StockBadge({ qty }) {
  if (qty === 0) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">Habis</span>;
  if (qty <= 3) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-600">Menipis</span>;
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-600">Tersedia</span>;
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ stats, loading, onRefresh }) {
  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-[#6633EE] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!stats) return null;

  return (
    <div className="space-y-4">
      {/* Refresh button */}
      <div className="flex justify-end">
        <button onClick={onRefresh} className="flex items-center gap-1.5 text-xs font-bold text-[#6633EE] bg-[#F3EEFF] px-3 py-1.5 rounded-full">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {/* Financial stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Omzet"
          value={formatRupiah(stats.totalOmzet)}
          icon={DollarSign}
          color="#059669"
          bg="#ECFDF5"
          sub={`${stats.totalSalesCount} transaksi`}
        />
        <StatCard
          label="Total HPP"
          value={formatRupiah(stats.totalCogs)}
          icon={BarChart2}
          color="#F59E0B"
          bg="#FFFBEB"
          sub="Modal barang terjual"
        />
        <StatCard
          label="Biaya Operasional"
          value={formatRupiah(stats.totalBiayaOps)}
          icon={Package}
          color="#7C3AED"
          bg="#F3EEFF"
          sub="Packing, dll"
        />
        <StatCard
          label="Laba Bersih"
          value={formatRupiah(stats.totalLabaBersih)}
          icon={TrendingUp}
          color={stats.totalLabaBersih >= 0 ? '#059669' : '#EF4444'}
          bg={stats.totalLabaBersih >= 0 ? '#ECFDF5' : '#FEF2F2'}
          sub="Keuntungan bersih"
        />
      </div>

      {/* Nilai Aset Stok */}
      <div className="bg-gradient-to-r from-[#6633EE] to-[#8B5CF6] rounded-3xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Boxes className="w-5 h-5 opacity-80" />
          <span className="text-xs font-bold opacity-80 uppercase tracking-wide">Nilai Aset Stok</span>
        </div>
        <p className="text-2xl font-black">{formatRupiah(stats.nilaiStok)}</p>
        <p className="text-[11px] opacity-70 mt-1">Modal stok yang belum terjual</p>
      </div>

      {/* Best Seller */}
      {(stats?.bestSeller || []).length > 0 && (
        <div className="bg-white rounded-3xl p-4 shadow-soft-card">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-sm font-black text-[#1E1B2E]">Best Seller</h3>
          </div>
          <div className="space-y-2">
            {(stats.bestSeller || []).slice(0, 5).map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                  i === 0 ? 'bg-[#F59E0B] text-white' :
                  i === 1 ? 'bg-[#9CA3AF] text-white' :
                  i === 2 ? 'bg-[#B45309] text-white' :
                  'bg-[#F4F2FA] text-[#6B7280]'
                }`}>{i + 1}</span>
                <span className="flex-1 text-xs font-semibold text-[#1E1B2E] truncate">{item.name}</span>
                <span className="text-xs font-black text-[#6633EE]">{item.qty} botol</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock per variant */}
      {(stats?.stockPerVariant || []).length > 0 && (
        <div className="bg-white rounded-3xl p-4 shadow-soft-card">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-[#6633EE]" />
            <h3 className="text-sm font-black text-[#1E1B2E]">Monitoring Stok</h3>
          </div>
          <div className="space-y-2">
            {(stats.stockPerVariant || []).map(sv => (
              <div key={`${sv.brand}-${sv.variant}`} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1E1B2E] truncate">{sv.variant}</p>
                  <p className="text-[10px] text-[#A09CB5]">{sv.brand}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#1E1B2E]">{sv.qty} botol</span>
                  <StockBadge qty={sv.qty} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.totalSalesCount === 0 && stats.totalBatches === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[#F3EEFF] flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-[#6633EE]" />
          </div>
          <p className="font-bold text-[#1E1B2E] text-sm">Belum ada data parfum</p>
          <p className="text-[#A09CB5] text-xs mt-1">Mulai dengan menambahkan batch restock pertama</p>
        </div>
      )}
    </div>
  );
}

// ─── Restock Tab ──────────────────────────────────────────────────────────────
function RestockTab({ batches, walletMap, onAdd }) {
  const sortedBatches = [...(batches || [])].sort((a, b) =>
    new Date(b.dateRestocked) - new Date(a.dateRestocked)
  );

  return (
    <div className="space-y-3">
      <button
        onClick={onAdd}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-[#6633EE] text-[#6633EE] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#F3EEFF] transition-colors"
      >
        <Plus className="w-4 h-4" /> Tambah Batch Restock
      </button>

      {sortedBatches.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-bold text-[#1E1B2E] text-sm">Belum ada batch stok</p>
          <p className="text-[#A09CB5] text-xs mt-1">Klik tombol di atas untuk menambahkan</p>
        </div>
      ) : (
        sortedBatches.map(batch => {
          const isLow = batch.qtyRemaining > 0 && batch.qtyRemaining <= 3;
          const isEmpty = batch.qtyRemaining === 0;

          return (
            <div key={batch.id} className={`bg-white rounded-3xl p-4 shadow-soft-card border-l-4 ${
              isEmpty ? 'border-red-400 opacity-60' : isLow ? 'border-amber-400' : 'border-[#6633EE]'
            }`}>
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-[#6633EE] bg-[#F3EEFF] px-2 py-0.5 rounded-full">
                      {batch.brand}
                    </span>
                    <StockBadge qty={batch.qtyRemaining} />
                    {batch.sourceWalletId && walletMap && walletMap[batch.sourceWalletId] && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        💳 {walletMap[batch.sourceWalletId].name}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-[#1E1B2E] text-sm mt-1">{batch.variant}</p>
                  <p className="text-[10px] text-[#A09CB5] font-mono">{batch.batchCode}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-base font-black text-[#1E1B2E]">{batch.qtyRemaining}<span className="text-xs font-semibold text-[#A09CB5]">/{batch.qtyReceived}</span></p>
                  <p className="text-[10px] text-[#A09CB5]">botol tersisa</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#F4F2FA] grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-[#A09CB5] font-semibold">Modal / Botol</p>
                  <p className="text-xs font-black text-[#1E1B2E]">{formatRupiah(batch.costPerUnit)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#A09CB5] font-semibold">Total Modal</p>
                  <p className="text-xs font-black text-[#1E1B2E]">{formatRupiah(batch.totalModalBelanja)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-[#A09CB5] font-semibold">Tanggal Restock</p>
                  <p className="text-xs font-semibold text-[#1E1B2E]">
                    {new Date(batch.dateRestocked).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Penjualan Tab ────────────────────────────────────────────────────────────
function PenjualanTab({ sales, walletMap, onAdd, onDelete }) {
  const sortedSales = [...(sales || [])].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="space-y-3">
      <button
        onClick={onAdd}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-[#059669] text-[#059669] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#ECFDF5] transition-colors"
      >
        <Plus className="w-4 h-4" /> Catat Penjualan Baru
      </button>

      {sortedSales.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-bold text-[#1E1B2E] text-sm">Belum ada transaksi penjualan</p>
          <p className="text-[#A09CB5] text-xs mt-1">Klik tombol di atas untuk mencatat penjualan pertama</p>
        </div>
      ) : (
        sortedSales.map(sale => (
          <div key={sale.id} className="bg-white rounded-3xl p-4 shadow-soft-card">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                    {sale.brand}
                  </span>
                  <span className="text-[10px] text-[#A09CB5]">
                    {new Date(sale.dateSold).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {sale.destinationWalletId && walletMap && walletMap[sale.destinationWalletId] && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      💰 Masuk ke {walletMap[sale.destinationWalletId].name}
                    </span>
                  )}
                </div>
                <p className="font-bold text-[#1E1B2E] text-sm mt-1">{sale.variant}</p>
                <p className="text-[11px] text-[#7E7A9B]">{sale.qtySold} botol × {formatRupiah(sale.hargaJualPerBottle)}</p>
              </div>
              <div className="text-right ml-3">
                <p className={`text-sm font-black ${sale.labaBersih >= 0 ? 'text-[#059669]' : 'text-red-500'}`}>
                  +{formatRupiah(sale.labaBersih)}
                </p>
                <p className="text-[10px] text-[#A09CB5]">laba bersih</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#F4F2FA] grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] text-[#A09CB5] font-semibold">Omzet</p>
                <p className="text-xs font-black text-[#1E1B2E]">{formatRupiah(sale.omzet)}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#A09CB5] font-semibold">HPP</p>
                <p className="text-xs font-black text-[#1E1B2E]">{formatRupiah(sale.cogs)}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#A09CB5] font-semibold">Ops</p>
                <p className="text-xs font-black text-[#1E1B2E]">{formatRupiah(sale.biayaOperasional)}</p>
              </div>
            </div>

            {/* Delete button */}
            <button
              onClick={() => {
                if (window.confirm(`Hapus penjualan ini? Stok ${sale.qtySold} botol ${sale.variant} akan dikembalikan.`)) {
                  onDelete(sale.id);
                }
              }}
              className="mt-3 w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-red-500 hover:bg-red-50 py-1.5 rounded-xl transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Batalkan & Rollback Stok
            </button>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Main ParfumPage ──────────────────────────────────────────────────────────
export default function ParfumPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [saleModalOpen, setSaleModalOpen] = useState(false);

  const { parfumBatches, parfumSalesLive, deleteParfumSale, getParfumDashboard, walletMap } = useFinance();

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    const s = await getParfumDashboard();
    setStats(s);
    setStatsLoading(false);
  }, [getParfumDashboard]);

  // Load stats on mount and when data changes
  useEffect(() => {
    loadStats();
  }, [parfumBatches, parfumSalesLive]);

  const handleDeleteSale = async (saleId) => {
    await deleteParfumSale(saleId);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-[#6633EE] to-[#8B5CF6] rounded-3xl p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <span className="text-2xl">🌸</span>
          </div>
          <div>
            <h1 className="font-black text-xl leading-tight">Parfum FIFO</h1>
            <p className="text-white/70 text-xs mt-0.5">Manajemen stok & laba real-time</p>
          </div>
        </div>
        {stats && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-2xl p-2.5 text-center">
              <p className="text-xs font-bold opacity-70">Laba Bersih</p>
              <p className="text-sm font-black">{formatRupiah(stats.totalLabaBersih)}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5 text-center">
              <p className="text-xs font-bold opacity-70">Total Batch</p>
              <p className="text-sm font-black">{stats.totalBatches}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5 text-center">
              <p className="text-xs font-bold opacity-70">Transaksi</p>
              <p className="text-sm font-black">{stats.totalSalesCount}</p>
            </div>
          </div>
        )}
      </div>

      {/* Sub-tab switcher */}
      <div className="flex bg-[#F4F2FA] rounded-2xl p-1 gap-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive ? 'bg-white text-[#6633EE] shadow-sm' : 'text-[#7E7A9B] hover:text-[#1E1B2E]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <DashboardTab stats={stats} loading={statsLoading} onRefresh={loadStats} />
      )}
      {activeTab === 'restock' && (
        <RestockTab
          batches={parfumBatches}
          walletMap={walletMap}
          onAdd={() => setRestockModalOpen(true)}
        />
      )}
      {activeTab === 'penjualan' && (
        <PenjualanTab
          sales={parfumSalesLive}
          walletMap={walletMap}
          onAdd={() => setSaleModalOpen(true)}
          onDelete={handleDeleteSale}
        />
      )}

      {/* Modals */}
      <ParfumRestockModal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
      />
      <ParfumSaleModal
        isOpen={saleModalOpen}
        onClose={() => setSaleModalOpen(false)}
      />
    </div>
  );
}
