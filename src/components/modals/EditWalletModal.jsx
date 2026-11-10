import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Trash2, 
  Upload, 
  Check, 
  Wallet, 
  Building2, 
  Smartphone, 
  Banknote, 
  Coins, 
  CreditCard, 
  Sparkles, 
  Package, 
  Shield, 
  Heart,
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { notificationService } from '../../data/services/notificationService';

const AVAILABLE_ICONS = [
  { id: 'Wallet', icon: Wallet, label: 'Dompet' },
  { id: 'Building2', icon: Building2, label: 'Bank' },
  { id: 'Smartphone', icon: Smartphone, label: 'E-Wallet' },
  { id: 'Banknote', icon: Banknote, label: 'Tunai' },
  { id: 'Coins', icon: Coins, label: 'Koin / Emas' },
  { id: 'CreditCard', icon: CreditCard, label: 'Kartu' },
  { id: 'Sparkles', icon: Sparkles, label: 'Tabungan' },
  { id: 'Package', icon: Package, label: 'Bisnis' },
  { id: 'Shield', icon: Shield, label: 'Darurat' },
  { id: 'Heart', icon: Heart, label: 'Impian' },
];

const PRESET_COLORS = [
  { hex: '#6633EE', label: 'Royal Violet' },
  { hex: '#002D62', label: 'Mandiri Navy' },
  { hex: '#118EEA', label: 'DANA Sky' },
  { hex: '#059669', label: 'Emerald' },
  { hex: '#D97706', label: 'Amber Gold' },
  { hex: '#E05A47', label: 'Coral Red' },
  { hex: '#E11D48', label: 'Rose' },
  { hex: '#0284C7', label: 'Ocean' },
  { hex: '#1E1B2E', label: 'Midnight' },
  { hex: '#4F46E5', label: 'Indigo' },
];

const WALLET_TYPES = [
  { id: 'bank', label: 'Bank / Rekening', desc: 'Mandiri, BCA, Jago, dll' },
  { id: 'ewallet', label: 'Dompet Digital', desc: 'DANA, GoPay, OVO, Shopee' },
  { id: 'liquid', label: 'Dompet Tunai', desc: 'Uang kas fisik sehari-hari' },
  { id: 'investment', label: 'Investasi', desc: 'Emas, reksadana, pasar modal' },
  { id: 'business', label: 'Kas Bisnis', desc: 'Side hustle & penjualan' },
];

export default function EditWalletModal({ isOpen, onClose, wallet, onDeleteSuccess }) {
  const { updateWallet, deleteWallet } = useFinance();

  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState('bank');
  const [color, setColor] = useState('#6633EE');
  const [icon, setIcon] = useState('CreditCard');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (wallet) {
      setName(wallet.name || '');
      setBalance(wallet.balance != null ? String(wallet.balance) : '0');
      setType(wallet.type || 'bank');
      setColor(wallet.color || '#6633EE');
      setIcon(wallet.icon || 'CreditCard');
      setPhotoUrl(wallet.photoUrl || '');
      setShowConfirmDelete(false);
    }
  }, [wallet, isOpen]);

  if (!isOpen || !wallet) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      notificationService.error('Ukuran file maksimal 2MB', 'File Terlalu Besar');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 200;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/png', 0.9);
        setPhotoUrl(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const res = await updateWallet(wallet.id, {
      name: name.trim(),
      type,
      color,
      icon,
      photoUrl,
      balance: balance !== '' ? Number(balance) : wallet.balance
    });
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    const res = await deleteWallet(wallet.id);
    setIsSubmitting(false);

    if (res.success) {
      if (onDeleteSuccess) onDeleteSuccess(wallet.id);
      onClose();
    }
  };

  const SelectedIconComp = AVAILABLE_ICONS.find(i => i.id === icon)?.icon || CreditCard;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-[#ECE8F6] max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-[#ECE8F6] rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F4F2FA]">
          <div className="flex items-center gap-2">
            <div 
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold shadow-xs"
              style={{ backgroundColor: color }}
            >
              <Palette className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1E1B2E]">Edit Kantong Aset</h3>
              <p className="text-[11px] text-[#7E7A9B] font-medium">Ubah nama, warna, foto, atau hapus kantong</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#F4F2FA] text-[#7E7A9B] hover:text-[#1E1B2E] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="mt-4 p-4 rounded-2xl border border-[#ECE8F6] bg-[#FAF9FD]">
          <span className="text-[10px] font-bold text-[#7E7A9B] uppercase tracking-wider block mb-2">
            Live Preview Kartu
          </span>
          <div 
            className="rounded-2xl p-4 text-white shadow-md flex items-center justify-between transition-all"
            style={{ backgroundColor: color }}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/95 flex items-center justify-center p-1.5 shadow-xs overflow-hidden">
                {photoUrl ? (
                  <img src={photoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <SelectedIconComp className="w-6 h-6" style={{ color }} />
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white drop-shadow-xs">{name || 'Nama Kantong'}</h4>
                <span className="text-[10px] text-white/80 uppercase font-semibold">{type}</span>
              </div>
            </div>
            <span className="text-xs font-black bg-white/20 px-2.5 py-1 rounded-full text-white">
              Velto Card
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Nama Kantong */}
          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1.5">
              Nama Kantong
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: SeaBank / Tabungan Umroh"
              className="w-full px-4 py-3 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] focus:border-[#6633EE] focus:bg-white text-sm font-semibold text-[#1E1B2E] outline-none transition-all"
              required
            />
          </div>

          {/* Saldo Saat Ini (Langsung Ubah Saldo) */}
          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1.5">
              Saldo Saat Ini (Rp)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-sm font-black text-[#7E7A9B] pointer-events-none">
                Rp
              </span>
              <input
                type="number"
                value={balance}
                onChange={e => setBalance(e.target.value)}
                placeholder="0"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] focus:border-[#6633EE] focus:bg-white text-base font-black text-[#1E1B2E] outline-none transition-all"
              />
            </div>
            <p className="text-[11px] text-[#7E7A9B] mt-1 font-medium">
              Kamu bisa mengubah atau menetapkan saldo awal kartu ini secara langsung.
            </p>
          </div>

          {/* Ganti Foto / Logo */}
          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1.5">
              Foto / Logo Kantong
            </label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                {photoUrl ? (
                  <img src={photoUrl} alt="Logo Kantong" className="w-full h-full object-contain p-1" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-[#7E7A9B]" />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-white border border-[#ECE8F6] hover:border-[#6633EE] text-xs font-bold text-[#1E1B2E] flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-[#6633EE]" />
                  <span>{photoUrl ? 'Ganti Foto' : 'Unggah Foto'}</span>
                </button>

                {photoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-all"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>
            <p className="text-[10px] text-[#7E7A9B] mt-1.5">
              Format PNG, JPG, atau WebP (Maks 2MB). Foto akan disimpan langsung di kantong aset Anda.
            </p>
          </div>

          {/* Pilihan Ikon (jika tidak menggunakan foto) */}
          {!photoUrl && (
            <div>
              <label className="block text-xs font-bold text-[#1E1B2E] mb-1.5">
                Atau Pilih Ikon
              </label>
              <div className="grid grid-cols-5 gap-2">
                {AVAILABLE_ICONS.map(item => {
                  const ItemIcon = item.icon;
                  const isSelected = icon === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIcon(item.id)}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                        isSelected 
                          ? 'border-[#6633EE] bg-[#F3EEFF] text-[#6633EE]' 
                          : 'border-[#ECE8F6] bg-[#F4F2FA] text-[#7E7A9B] hover:text-[#1E1B2E]'
                      }`}
                    >
                      <ItemIcon className="w-5 h-5 mb-0.5" />
                      <span className="text-[9px] font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ganti Warna Kantong */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#1E1B2E]">
                Warna Tema Kantong
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-5 h-5 rounded-full border-0 cursor-pointer p-0 bg-transparent"
                  title="Pilih warna kustom"
                />
                <span className="text-[10px] text-[#7E7A9B] font-mono uppercase">{color}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => {
                const isSelected = color.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-xs ${
                      isSelected ? 'ring-2 ring-offset-2 ring-[#6633EE] scale-110' : ''
                    }`}
                    title={c.label}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Jenis Kantong */}
          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1.5">
              Jenis Kantong
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WALLET_TYPES.map(t => {
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected 
                        ? 'border-[#6633EE] bg-[#F3EEFF] text-[#6633EE]' 
                        : 'border-[#ECE8F6] bg-[#F4F2FA] text-[#1E1B2E] hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-bold block">{t.label}</span>
                    <span className="text-[10px] text-[#7E7A9B] mt-0.5 block leading-tight">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-2xl bg-[#6633EE] hover:bg-[#5827DE] text-white font-bold text-sm shadow-[0_8px_20px_-4px_rgba(102,51,238,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>

            {!showConfirmDelete ? (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all"
                title="Hapus Kantong Aset"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            ) : null}
          </div>

          {/* Confirm Delete Section */}
          {showConfirmDelete && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 animate-in fade-in duration-200 space-y-3">
              <div className="flex items-center gap-2 text-rose-800">
                <Trash2 className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold">Hapus Kantong "{wallet.name}"?</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Tindakan ini permanen. Semua mutasi dan alokasi yang tersambung pada kantong ini akan dihapus.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Sekarang'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-rose-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
