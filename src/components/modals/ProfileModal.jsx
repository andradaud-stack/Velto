import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, User, Check, Upload, Trash2 } from 'lucide-react';
import { prefsHelper } from '../../data/db/prefsHelper';
import { notificationService } from '../../data/services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../data/db/supabaseClient';

export default function ProfileModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const defaultDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Velto User';
  const [name, setName] = useState(defaultDisplayName);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      prefsHelper.get('user_profile_name', defaultDisplayName).then(val => setName(val));
      prefsHelper.get('user_profile_photo', user?.user_metadata?.avatar_url || null).then(val => setProfilePhoto(val));
    }
  }, [isOpen, defaultDisplayName, user]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        notificationService.error('Ukuran foto maksimal 2MB', 'Foto Terlalu Besar');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await prefsHelper.set('user_profile_name', name);
    if (profilePhoto) {
      await prefsHelper.set('user_profile_photo', profilePhoto);
    } else {
      await prefsHelper.set('user_profile_photo', null);
    }

    // If connected to Supabase cloud, sync metadata to cloud
    if (isSupabaseConfigured && supabase?.auth) {
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: name,
            avatar_url: profilePhoto || ''
          }
        });
      } catch (err) {
        console.warn('[ProfileModal] Cloud profile sync warning:', err);
      }
    }

    setIsSaving(false);
    notificationService.success('Profil dan foto berhasil diperbarui!', 'Tersimpan');
    onClose();
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
  };

  const initials = (name || 'VU').trim().slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-[#ECE8F6] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-[#ECE8F6] rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-4 border-b border-[#F4F2FA]">
          <h3 className="font-bold text-base text-[#1E1B2E]">Edit Profil Pengguna</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#F4F2FA] text-[#7E7A9B] hover:text-[#1E1B2E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          {/* Avatar Upload Container */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-hero-card bg-gradient-to-tr from-[#6633EE] to-[#8054F6] flex items-center justify-center text-white overflow-hidden text-2xl font-black">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              {/* Camera Trigger Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-[#6633EE] hover:bg-[#5827DE] text-white shadow-md active:scale-95 transition-all"
                title="Ganti Foto Profil"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-[#6633EE] hover:underline"
              >
                Unggah Foto Baru
              </button>
              {profilePhoto && (
                <>
                  <span className="text-[#ECE8F6]">•</span>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus Foto
                  </button>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B2E] mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#F4F2FA] border border-[#ECE8F6] focus:border-[#6633EE] focus:bg-white text-sm font-semibold text-[#1E1B2E] outline-none"
              required
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F4F2FA] text-xs text-[#7E7A9B] space-y-1">
            <span className="font-bold text-[#1E1B2E] block">Identitas Akun</span>
            <p>Foto dan nama ini disimpan secara lokal di peramban Anda (IndexedDB Offline-First).</p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 rounded-2xl bg-[#6633EE] hover:bg-[#5827DE] text-white font-bold text-sm shadow-[0_8px_20px_-4px_rgba(102,51,238,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
}
