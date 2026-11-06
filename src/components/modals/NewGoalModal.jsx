import React, { useState, useRef } from 'react';
import { X, Target, Upload, Camera, Trash2, Calendar, Check, Wallet } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { notificationService } from '../../data/services/notificationService';

export default function NewGoalModal({ isOpen, onClose }) {
  const { addNewSavingGoal, wallets } = useFinance();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('2027-06-30');
  const [goalMode, setGoalMode] = useState('manual'); // 'manual' (setor fleksibel) vs 'connected' (auto-link)
  const [connectedIds, setConnectedIds] = useState([]);
  const [initialDeposit, setInitialDeposit] = useState('');
  const [depositWalletId, setDepositWalletId] = useState('');
  const [goalImage, setGoalImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        notificationService.error('Ukuran gambar maksimal 2MB', 'Gambar Terlalu Besar');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setGoalImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleWallet = (id) => {
    if (connectedIds.includes(id)) {
      setConnectedIds(connectedIds.filter(item => item !== id));
    } else {
      setConnectedIds([...connectedIds, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount || Number(targetAmount) <= 0) return;

    setIsSubmitting(true);
    const res = await addNewSavingGoal({
      title: title.trim(),
      targetAmount: Number(targetAmount),
      mode: goalMode,
      connectedWalletIds: goalMode === 'connected' ? connectedIds : [],
      initialDeposit: goalMode === 'manual' ? Number(initialDeposit) || 0 : 0,
      initialWalletId: goalMode === 'manual' ? (depositWalletId || wallets?.[0]?.id) : null,
      deadline,
      description: description.trim(),
      image: goalImage
    });
    setIsSubmitting(false);

    if (res.success) {
      setTitle('');
      setTargetAmount('');
      setDescription('');
      setGoalImage(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-[#ECE8F6] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-[#ECE8F6] rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-4 border-b border-[#F4F2FA]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[#6633EE]/10 text-[#6633EE] flex items-center justify-center font-bold">
              <Target className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1E1B2E]">Tambah Target Tabungan</h3>
              <p className="text-[11px] text-[#7E7A9B] font-medium">Wujudkan impian & rencana finansial Anda</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#F4F2FA] text-[#7E7A9B] hover:text-[#1E1B2E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Goal Image Upload Preview */}
          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1.5">
              Foto Target / Impian (Opsional)
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-36 rounded-2xl border-2 border-dashed border-[#ECE8F6] hover:border-[#6633EE] bg-[#F4F2FA] flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition-all"
            >
              {goalImage ? (
                <>
                  <img src={goalImage} alt="Goal" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1.5 transition-opacity">
                    <Camera className="w-4 h-4" /> Ganti Gambar
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-[#7E7A9B]">
                  <Upload className="w-6 h-6 stroke-[1.8] text-[#6633EE]" />
                  <span className="text-xs font-bold text-[#1E1B2E]">Klik untuk unggah foto impian</span>
                  <span className="text-[10px] text-[#A19DB8]">Maksimal ukuran 2MB</span>
                </div>
              )}
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />

            {goalImage && (
              <button
                type="button"
                onClick={() => setGoalImage(null)}
                className="text-xs text-rose-500 font-semibold hover:underline mt-1.5 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Foto
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1">Nama Target / Goal</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Beli Laptop Baru / Dana Skripsi"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-sm font-bold text-[#1E1B2E] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1">Target Nominal (Rp)</label>
            <input
              type="number"
              value={targetAmount}
              onChange={e => setTargetAmount(e.target.value)}
              placeholder="Contoh: 3000000"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-base font-extrabold text-[#1E1B2E] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1">Keterangan / Motivasi</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tuliskan catatan target Anda..."
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-xs text-[#1E1B2E] outline-none"
            />
          </div>

          {/* Mode Tabungan: Nabung Manual vs Otomatis Hubungkan Kantong */}
          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1.5">Metode Pengumpulan Dana</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F4F2FA] rounded-2xl">
              <button
                type="button"
                onClick={() => setGoalMode('manual')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                  goalMode === 'manual' 
                    ? 'bg-white text-[#6633EE] shadow-xs' 
                    : 'text-[#7E7A9B] hover:text-[#1E1B2E]'
                }`}
              >
                Setor Manual (Bebas)
              </button>
              <button
                type="button"
                onClick={() => setGoalMode('connected')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                  goalMode === 'connected' 
                    ? 'bg-white text-[#6633EE] shadow-xs' 
                    : 'text-[#7E7A9B] hover:text-[#1E1B2E]'
                }`}
              >
                Hubungkan Kantong
              </button>
            </div>
            <p className="text-[11px] text-[#7E7A9B] mt-1.5">
              {goalMode === 'manual' 
                ? '💡 Dana disetor kapan saja (misal Rp 10.000) dan dipotong dari kantong pilihan.'
                : '💡 Target membaca total saldo kantong-kantong yang Anda pilih secara otomatis.'
              }
            </p>
          </div>

          {/* Opsi Mode Terhubung: Pilih Kantong Sumber */}
          {goalMode === 'connected' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#1E1B2E]">Hubungkan Kantong Sumber Tabungan</label>
                <button
                  type="button"
                  onClick={() => setConnectedIds([])}
                  className="text-[11px] text-[#7E7A9B] hover:text-rose-500 font-semibold"
                >
                  Pilih Nanti (Kosongkan)
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(wallets || []).map(w => {
                  const isChecked = connectedIds.includes(w.id);
                  return (
                    <button
                      type="button"
                      key={w.id}
                      onClick={() => toggleWallet(w.id)}
                      className={`p-2.5 rounded-2xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                        isChecked ? 'border-[#6633EE] bg-[#F3EEFF] text-[#6633EE]' : 'border-[#ECE8F6] bg-[#F4F2FA] text-[#1E1B2E]'
                      }`}
                    >
                      <span className="truncate">{w.name}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Opsi Mode Manual: Setoran Awal (Opsional) */}
          {goalMode === 'manual' && (
            <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#ECE8F6] space-y-2.5">
              <span className="text-xs font-bold text-[#1E1B2E] block">
                Setoran Awal Pertama (Opsional)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#7E7A9B] font-semibold block mb-1">Ambil dari Kantong</label>
                  <select
                    value={depositWalletId || (wallets?.[0]?.id || '')}
                    onChange={e => setDepositWalletId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#ECE8F6] text-xs font-bold text-[#1E1B2E] outline-none"
                  >
                    {(wallets || []).map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} (Rp {new Intl.NumberFormat('id-ID').format(w.balance)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#7E7A9B] font-semibold block mb-1">Nominal Setor (Rp)</label>
                  <input
                    type="number"
                    value={initialDeposit}
                    onChange={e => setInitialDeposit(e.target.value)}
                    placeholder="Contoh: 10000"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#ECE8F6] text-xs font-bold text-[#1E1B2E] outline-none"
                  />
                </div>
              </div>
              <span className="text-[10px] text-[#7E7A9B] block">
                *Bisa dikosongkan jika baru mau setor nanti lewat tombol "+ Setor / Nabung"
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1">Target Tanggal Tercapai</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] text-xs font-semibold text-[#1E1B2E] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-[#6633EE] hover:bg-[#5827DE] text-white font-bold text-sm shadow-[0_8px_20px_-4px_rgba(102,51,238,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            {isSubmitting ? 'Menyimpan...' : 'Buat Target Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
}
