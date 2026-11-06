import React, { useState, useEffect } from 'react';
import { X, Package, ChevronDown, Wallet, AlertTriangle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah } from '../../core/utils/currencyFormatter';

const BRANDS = ['Mykonos', 'Velixir'];

export default function ParfumRestockModal({ isOpen, onClose }) {
  const { addParfumRestock, parfumBatches, wallets } = useFinance();

  const [brand, setBrand] = useState('Mykonos');
  const [customBrand, setCustomBrand] = useState('');
  const [variant, setVariant] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [qty, setQty] = useState('');
  const [totalModal, setTotalModal] = useState('');
  const [sourceWalletId, setSourceWalletId] = useState('none');
  const [dateRestocked, setDateRestocked] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // Available spending wallets (exclude emas)
  const paymentWallets = React.useMemo(() => {
    return (wallets || []).filter(w => w.id !== 'emas');
  }, [wallets]);

  // Selected wallet object
  const selectedWalletObj = paymentWallets.find(w => w.id === sourceWalletId);

  // Check if balance is less than total modal
  const rawModal = Number(totalModal.replace(/\./g, '')) || 0;
  const isInsufficient = selectedWalletObj && (selectedWalletObj.balance || 0) < rawModal;

  // Build autocomplete suggestions from existing batches
  const variantSuggestions = React.useMemo(() => {
    if (!parfumBatches) return [];
    const activeBrand = brand === 'Custom' ? customBrand : brand;
    const set = new Set();
    parfumBatches.forEach(b => {
      if (b.brand === activeBrand) set.add(b.variant);
    });
    return [...set];
  }, [parfumBatches, brand, customBrand]);

  const costPerUnit = qty && totalModal
    ? Math.round(Number(totalModal.replace(/\./g, '')) / Number(qty))
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const activeBrand = brand === 'Custom' ? customBrand.trim() : brand;
    const rawModal = Number(totalModal.replace(/\./g, ''));
    const rawQty = Number(qty);

    if (!activeBrand || !variant.trim() || !batchCode.trim() || !rawQty || !rawModal) return;

    setLoading(true);
    const result = await addParfumRestock({
      brand: activeBrand,
      variant: variant.trim(),
      batchCode: batchCode.trim(),
      qtyReceived: rawQty,
      totalModalBelanja: rawModal,
      dateRestocked,
      sourceWalletId
    });
    setLoading(false);

    if (result.success) {
      // Reset
      setVariant('');
      setBatchCode('');
      setQty('');
      setTotalModal('');
      setSourceWalletId('none');
      setDateRestocked(new Date().toISOString().split('T')[0]);
      onClose();
    }
  };

  const formatInput = (val) => {
    const num = val.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl p-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F3EEFF] flex items-center justify-center">
              <Package className="w-5 h-5 text-[#6633EE]" />
            </div>
            <div>
              <h2 className="font-black text-[#1E1B2E] text-base">Tambah Restock</h2>
              <p className="text-[11px] text-[#7E7A9B]">Input batch stok parfum baru</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F4F2FA] flex items-center justify-center">
            <X className="w-4 h-4 text-[#7E7A9B]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Brand */}
          <div>
            <label className="text-xs font-bold text-[#1E1B2E] mb-1.5 block">Brand Parfum</label>
            <div className="flex gap-2 flex-wrap">
              {[...BRANDS, 'Custom'].map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(b)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    brand === b
                      ? 'bg-[#6633EE] text-white border-[#6633EE]'
                      : 'bg-white text-[#6B7280] border-[#ECE8F6] hover:border-[#6633EE]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            {brand === 'Custom' && (
              <input
                type="text"
                placeholder="Nama brand custom..."
                value={customBrand}
                onChange={e => setCustomBrand(e.target.value)}
                className="mt-2 w-full border border-[#ECE8F6] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#6633EE] text-[#1E1B2E] bg-[#F9F8FF]"
              />
            )}
          </div>

          {/* Variant */}
          <div>
            <label className="text-xs font-bold text-[#1E1B2E] mb-1.5 block">Nama Varian</label>
            <input
              type="text"
              placeholder="Contoh: Elysian Rose, Ocean Breeze..."
              value={variant}
              onChange={e => setVariant(e.target.value)}
              list="variant-suggestions"
              className="w-full border border-[#ECE8F6] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#6633EE] text-[#1E1B2E] bg-[#F9F8FF]"
              required
            />
            {variantSuggestions.length > 0 && (
              <datalist id="variant-suggestions">
                {variantSuggestions.map(v => <option key={v} value={v} />)}
              </datalist>
            )}
          </div>

          {/* Batch Code */}
          <div>
            <label className="text-xs font-bold text-[#1E1B2E] mb-1.5 block">Kode Batch</label>
            <input
              type="text"
              placeholder="Contoh: MYK-OKT-01"
              value={batchCode}
              onChange={e => setBatchCode(e.target.value)}
              className="w-full border border-[#ECE8F6] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#6633EE] text-[#1E1B2E] bg-[#F9F8FF]"
              required
            />
          </div>

          {/* Qty & Modal in a row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#1E1B2E] mb-1.5 block">Jumlah Botol</label>
              <input
                type="number"
                placeholder="0"
                min="1"
                value={qty}
                onChange={e => setQty(e.target.value)}
                className="w-full border border-[#ECE8F6] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#6633EE] text-[#1E1B2E] bg-[#F9F8FF]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#1E1B2E] mb-1.5 block">Total Modal (Rp)</label>
              <input
                type="text"
                placeholder="0"
                value={totalModal}
                onChange={e => setTotalModal(formatInput(e.target.value))}
                className="w-full border border-[#ECE8F6] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#6633EE] text-[#1E1B2E] bg-[#F9F8FF]"
                required
              />
            </div>
          </div>

          {/* Cost per unit preview */}
          {costPerUnit > 0 && (
            <div className="bg-[#F3EEFF] rounded-2xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6633EE]">Modal / Botol (HPP)</span>
              <span className="text-sm font-black text-[#6633EE]">{formatRupiah(costPerUnit)}</span>
            </div>
          )}

          {/* Sumber Dana Pembayaran */}
          <div>
            <label className="text-xs font-bold text-[#1E1B2E] mb-1.5 flex items-center justify-between">
              <span>Bayar Pakai Kantong Mana?</span>
              <span className="text-[10px] text-[#7E7A9B] font-normal">Otomatis kurangi saldo</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSourceWalletId('none')}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  sourceWalletId === 'none'
                    ? 'border-[#6633EE] bg-[#F3EEFF] text-[#6633EE]'
                    : 'border-[#ECE8F6] bg-white text-[#6B7280] hover:border-[#6633EE]'
                }`}
              >
                <span className="text-xs font-bold block">Tanpa Potong</span>
                <span className="text-[10px] text-[#A09CB5] block">Hanya catat batch</span>
              </button>

              {paymentWallets.map(w => {
                const isSelected = sourceWalletId === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSourceWalletId(w.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#6633EE] bg-[#F3EEFF] text-[#6633EE]'
                        : 'border-[#ECE8F6] bg-white text-[#6B7280] hover:border-[#6633EE]'
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

            {isInsufficient && (
              <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2 text-xs text-amber-700">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Saldo {selectedWalletObj?.name} kurang dari total modal ({formatRupiah(selectedWalletObj?.balance)})</span>
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-bold text-[#1E1B2E] mb-1.5 block">Tanggal Restock</label>
            <input
              type="date"
              value={dateRestocked}
              onChange={e => setDateRestocked(e.target.value)}
              className="w-full border border-[#ECE8F6] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#6633EE] text-[#1E1B2E] bg-[#F9F8FF]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[#6633EE] text-white font-black text-sm shadow-glow-primary active:scale-95 transition-transform disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : '+ Tambah Batch Restock'}
          </button>
        </form>
      </div>
    </div>
  );
}
