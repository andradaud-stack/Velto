import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  Building2, 
  Banknote, 
  Coins, 
  Smartphone, 
  Sparkles, 
  Check, 
  Upload, 
  Image as ImageIcon 
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { notificationService } from '../../data/services/notificationService';

const PRESET_COLORS = [
  { hex: '#6633EE', label: 'Royal Violet' },
  { hex: '#002D62', label: 'Mandiri Navy' },
  { hex: '#118EEA', label: 'DANA Sky' },
  { hex: '#059669', label: 'Emerald' },
  { hex: '#D97706', label: 'Amber Gold' },
  { hex: '#E05A47', label: 'Coral Red' },
  { hex: '#E11D48', label: 'Rose' },
  { hex: '#0284C7', label: 'Ocean' },
];

export default function NewWalletModal({ isOpen, onClose }) {
  const { createNewWallet } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [initialBalance, setInitialBalance] = useState('');
  const [color, setColor] = useState('#6633EE');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

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
        setPhotoUrl(canvas.toDataURL('image/png', 0.9));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const balanceNum = Number(initialBalance) || 0;
    const res = await createNewWallet({
      name: name.trim(),
      type,
      initialBalance: balanceNum,
      color,
      photoUrl
    });
    setIsSubmitting(false);

    if (res.success) {
      setName('');
      setInitialBalance('');
      setPhotoUrl('');
      setColor('#6633EE');
      onClose();
    }
  };

  const walletTypes = [
    { id: 'bank', label: 'Bank / Rekening', icon: Building2, desc: 'Rekening bank (Mandiri, BCA, Jago, dll)' },
    { id: 'ewallet', label: 'Dompet Digital', icon: Smartphone, desc: 'E-Wallet (DANA, GoPay, OVO, ShopeePay)' },
    { id: 'liquid', label: 'Dompet Tunai', icon: Banknote, desc: 'Uang kas fisik sehari-hari' },
    { id: 'investment', label: 'Investasi', icon: Coins, desc: 'Reksadana, saham, emas' },
    { id: 'business', label: 'Kas Bisnis', icon: Sparkles, desc: 'Laba dagang / side hustle' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-[#ECE8F6] max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-[#ECE8F6] rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-4 border-b border-[#F4F2FA]">
          <div className="flex items-center gap-2">
            <div 
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold shadow-xs"
              style={{ backgroundColor: color }}
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1E1B2E]">Tambah Kantong Baru</h3>
              <p className="text-[11px] text-[#7E7A9B] font-medium">Buka kantong simpanan atau alokasi baru</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#F4F2FA] text-[#7E7A9B] hover:text-[#1E1B2E] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1.5">
              Nama Kantong
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: SeaBank / Dana Darurat"
              className="w-full px-4 py-3 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] focus:border-[#6633EE] focus:bg-white text-sm font-semibold text-[#1E1B2E] outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1.5">
              Jenis Kantong
            </label>
            <div className="grid grid-cols-2 gap-2">
              {walletTypes.map(t => {
                const Icon = t.icon;
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
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="text-xs font-bold block">{t.label}</span>
                    <span className="text-[10px] text-[#7E7A9B] mt-0.5 block leading-tight">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#1E1B2E]">
                Warna Kantong
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-5 h-5 rounded-full border-0 cursor-pointer p-0 bg-transparent"
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
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-xs ${
                      isSelected ? 'ring-2 ring-offset-2 ring-[#6633EE] scale-110' : ''
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Photo/Logo Upload */}
          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1.5">
              Foto / Logo Kantong (Opsional)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#F4F2FA] border border-[#ECE8F6] flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                {photoUrl ? (
                  <img src={photoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-[#7E7A9B]" />
                )}
              </div>
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
                <span>{photoUrl ? 'Ganti Foto' : 'Unggah Foto / Logo'}</span>
              </button>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => { setPhotoUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1.5">
              Saldo Awal (Rp)
            </label>
            <input
              type="number"
              value={initialBalance}
              onChange={e => setInitialBalance(e.target.value)}
              placeholder="0 (atau masukkan saldo awal)"
              className="w-full px-4 py-3 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] focus:border-[#6633EE] focus:bg-white text-base font-extrabold text-[#1E1B2E] outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-[#6633EE] hover:bg-[#5827DE] text-white font-bold text-sm shadow-[0_8px_20px_-4px_rgba(102,51,238,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            {isSubmitting ? 'Menyimpan...' : 'Buat Kantong Aset'}
          </button>
        </form>
      </div>
    </div>
  );
}
