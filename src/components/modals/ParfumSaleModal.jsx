import React, { useState, useEffect, useMemo } from 'react';
import { X, ShoppingBag, AlertTriangle, Wallet } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah } from '../../core/utils/currencyFormatter';
import { getAvailableStock } from '../../data/services/parfumFifoService';

export default function ParfumSaleModal({ isOpen, onClose }) {
  const { recordParfumSale, parfumBatches, wallets } = useFinance();

  const [brand, setBrand] = useState('');
  const [variant, setVariant] = useState('');
  const [qty, setQty] = useState('');
  const [hargaJual, setHargaJual] = useState('');
  const [biayaOps, setBiayaOps] = useState('');
  const [destinationWalletId, setDestinationWalletId] = useState('dana');
  const [dateSold, setDateSold] = useState(new Date().toISOString().split('T')[0]);
  const [availableStock, setAvailableStock] = useState(0);
  const [stockError, setStockError] = useState('');
  const [loading, setLoading] = useState(false);

  // Available receiving wallets (cash, ewallet, bank - exclude emas & parfum)
  const receivingWallets = useMemo(() => {
    return (wallets || []).filter(w => w.id !== 'emas' && w.id !== 'parfum');
  }, [wallets]);

  // Set default to 'dana' or first available
  useEffect(() => {
    if (receivingWallets.length > 0 && !receivingWallets.find(w => w.id === destinationWalletId)) {
      setDestinationWalletId(receivingWallets[0].id);
    }
  }, [receivingWallets]);

  const selectedWalletObj = receivingWallets.find(w => w.id === destinationWalletId) || receivingWallets[0];

  // Build unique brand+variant list from batches
  const variantOptions = useMemo(() => {
    if (!parfumBatches) return [];
    const seen = new Set();
    return parfumBatches
      .filter(b => b.qtyRemaining > 0)
      .filter(b => {
        const k = `${b.brand}||${b.variant}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .map(b => ({ brand: b.brand, variant: b.variant }));
  }, [parfumBatches]);

  const brandOptions = useMemo(() => {
    const set = new Set(variantOptions.map(v => v.brand));
    return [...set];
  }, [variantOptions]);

  const variantsForBrand = useMemo(() => {
    return variantOptions.filter(v => v.brand === brand).map(v => v.variant);
  }, [variantOptions, brand]);

  // Fetch available stock when brand+variant changes
  useEffect(() => {
    if (brand && variant) {
      getAvailableStock(brand, variant).then(setAvailableStock);
    } else {
      setAvailableStock(0);
    }
    setStockError('');
  }, [brand, variant, parfumBatches]);

  const formatInput = (val) => {
    const num = val.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const rawHarga = Number(hargaJual.replace(/\./g, ''));
  const rawBiaya = Number(biayaOps.replace(/\./g, '')) || 0;
  const rawQty = Number(qty) || 0;
  const previewOmzet = rawQty * rawHarga;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brand || !variant || !rawQty || !rawHarga) return;

    if (rawQty > availableStock) {
      setStockError(`Stok tidak cukup! Tersedia: ${availableStock} botol`);
      return;
    }

    setLoading(true);
    const result = await recordParfumSale({
      brand,
      variant,
      qtySold: rawQty,
      hargaJualPerBottle: rawHarga,
      biayaOperasional: rawBiaya,
      destinationWalletId,
      dateSold
    });
    setLoading(false);

    if (result.success) {
      setBrand('');
      setVariant('');
      setQty('');
      setHargaJual('');
      setBiayaOps('');
      setDateSold(new Date().toISOString().split('T')[0]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl p-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#059669]" />
            </div>
            <div>
              <h2 className="font-black text-[#1E1B2E] text-base">Catat Penjualan</h2>
              <p className="text-[11px] text-[#7E7A9B]">Pemotongan stok FIFO otomatis</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F4F2FA] flex items-center justify-center">
            <X className="w-4 h-4 text-[#7E7A9B]" />
          </button>
        </div>

        {variantOptions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-[#7E7A9B] text-sm font-semibold">Belum ada stok tersedia.</p>
            <p className="text-[#A09CB5] text-xs mt-1">Tambahkan batch restock terlebih dahulu.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Brand */}
            <div>
              <label className="text-xs font-bold text-[#1E1B2E] mb-1.5 block">Brand</label>
              <div className="flex gap-2 flex-wrap">
                {brandOptions.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => { setBrand(b); setVariant(''); }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      brand === b
                        ? 'bg-[#059669] text-white border-[#059669]'
                        : 'bg-white text-[#6B7280] border-[#ECE8F6] hover:border-[#059669]'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Variant */}
            {brand && (
              <div>
                <label className="text-xs font-bold text-[#1E1B2E] mb-1.5 block">Varian</label>
                <div className="flex gap-2 flex-wrap">
                  {variantsForBrand.map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVariant(v)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        variant === v
                          ? 'bg-[#6633EE] text-white border-[#6633EE]'
                          : 'bg-white text-[#6B7280] border-[#ECE8F6] hover:border-[#6633EE]'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                {variant && (
                  <p className={`text-xs mt-1.5 font-semibold ${availableStock <= 3 ? 'text-[#F59E0B]' : 'text-[#059669]'}`}>
                    Stok tersedia: {availableStock} botol
                    {availableStock <= 3 && availableStock > 0 && ' ⚠️ Segera restock!'}
                    {availableStock === 0 && ' — Habis!'}
                  </p>
                )}
              </div>
            )}

            {/* Stock error */}
            {stockError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-2.5">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs text-red-600 font-semibold">{stockError}</p>
              </div>
            )}

            {/* Qty & Harga */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#1E1B2E] mb-1.5 block">Jumlah Terjual</label>
                <input
                  type="number"
                  placeholder="0"
                  min="1"
                  value={qty}
                  onChange={e => { setQty(e.target.value); setStockError(''); }}
                  className="w-full border border-[#ECE8F6] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#6633EE] text-[#1E1B2E] bg-[#F9F8FF]"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#1E1B2E] mb-1.5 block">Harga Jual / Botol</label>
                <input
                  type="text"
                  placeholder="0"
                  value={hargaJual}
                  onChange={e => setHargaJual(formatInput(e.target.value))}
                  className="w-full border border-[#ECE8F6] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#6633EE] text-[#1E1B2E] bg-[#F9F8FF]"
                  required
                />
              </div>
            </div>

            {/* Biaya Operasional */}
            <div>
              <label className="text-xs font-bold text-[#1E1B2E] mb-1.5 block">
                Biaya Operasional <span className="font-normal text-[#A09CB5]">(packing, bubble wrap, dll)</span>
              </label>
              <input
                type="text"
                placeholder="0"
                value={biayaOps}
                onChange={e => setBiayaOps(formatInput(e.target.value))}
                className="w-full border border-[#ECE8F6] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#6633EE] text-[#1E1B2E] bg-[#F9F8FF]"
              />
            </div>

            {/* Uang Pembeli Masuk ke Mana? */}
            <div>
              <label className="text-xs font-bold text-[#1E1B2E] mb-1.5 flex items-center justify-between">
                <span>Uang Pembeli Masuk ke Mana?</span>
                <span className="text-[10px] text-[#7E7A9B] font-normal">Pilih dompet penampung</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {receivingWallets.map(w => {
                  const isSelected = destinationWalletId === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setDestinationWalletId(w.id)}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#059669] bg-[#ECFDF5] text-[#059669]'
                          : 'border-[#ECE8F6] bg-white text-[#6B7280] hover:border-[#059669]'
                      }`}
                    >
                      <span className="text-xs font-bold block truncate">{w.name}</span>
                      <span className="text-[10px] text-[#A09CB5] block font-mono">
                        {formatRupiah(w.balance)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Omzet preview */}
            {previewOmzet > 0 && (
              <div className="bg-[#ECFDF5] border border-emerald-200 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#059669]">Uang Masuk ke {selectedWalletObj?.name || 'DANA'}</span>
                  <span className="text-base font-black text-[#059669]">{formatRupiah(previewOmzet)}</span>
                </div>
                <p className="text-[10px] text-emerald-700 font-medium">
                  💡 Seluruh {formatRupiah(previewOmzet)} langsung masuk ke saldo {selectedWalletObj?.name || 'DANA'} kamu. Keuntungan murni tetap otomatis terhitung di laporan Parfum FIFO.
                </p>
              </div>
            )}

            {/* Tanggal */}
            <div>
              <label className="text-xs font-bold text-[#1E1B2E] mb-1.5 block">Tanggal Penjualan</label>
              <input
                type="date"
                value={dateSold}
                onChange={e => setDateSold(e.target.value)}
                className="w-full border border-[#ECE8F6] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#6633EE] text-[#1E1B2E] bg-[#F9F8FF]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !brand || !variant}
              className="w-full py-3.5 rounded-2xl bg-[#059669] text-white font-black text-sm shadow-lg active:scale-95 transition-transform disabled:opacity-60"
            >
              {loading ? 'Memproses FIFO...' : '💰 Catat Penjualan'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
