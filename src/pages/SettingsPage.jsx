import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import GoogleSheetSyncCard from '../components/common/GoogleSheetSyncCard';
import WhatsAppNotificationCard from '../components/common/WhatsAppNotificationCard';
import ProfileModal from '../components/modals/ProfileModal';
import { 
  CheckCircle, 
  Fingerprint, 
  Edit3
} from 'lucide-react';
import { biometricService } from '../data/services/biometricService';
import { prefsHelper } from '../data/db/prefsHelper';
import { notificationService } from '../data/services/notificationService';

export default function SettingsPage() {
  const { user } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState('Velto User');
  const [profilePhoto, setProfilePhoto] = useState(null);

  // Biometric state in Settings
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isProcessingBiometric, setIsProcessingBiometric] = useState(false);

  useEffect(() => {
    // Load profile
    prefsHelper.get('user_profile_name', user?.user_metadata?.full_name || 'Andra Syahdan Daud').then(val => {
      if (val === 'Andra Syahdan') {
        prefsHelper.set('user_profile_name', 'Andra Syahdan Daud');
        setProfileName('Andra Syahdan Daud');
      } else {
        setProfileName(val || 'Andra Syahdan Daud');
      }
    });
    prefsHelper.get('user_profile_photo', null).then(val => {
      setProfilePhoto(val);
    });

    // Check biometric hardware support and preference
    biometricService.isAvailable().then(avail => {
      setBiometricAvailable(Boolean(avail));
      if (avail) {
        prefsHelper.get('biometric_login_enabled', false).then(enabled => {
          setBiometricEnabled(Boolean(enabled));
        });
      }
    });
  }, [user]);

  const handleToggleBiometric = async () => {
    if (isProcessingBiometric) return;
    setIsProcessingBiometric(true);

    try {
      if (!biometricEnabled) {
        // Enrolling and activating biometric
        notificationService.info('Silakan sentuh sensor sidik jari / Windows Hello...', 'Daftarkan Biometrik');
        const regRes = await biometricService.registerBiometric(profileName);
        if (regRes.success) {
          await prefsHelper.set('biometric_login_enabled', true);
          setBiometricEnabled(true);
          notificationService.success('Login Sidik Jari / Biometrik Berhasil Diaktifkan!', 'Biometrik Aktif');
        }
      } else {
        // Disabling biometric
        await prefsHelper.set('biometric_login_enabled', false);
        setBiometricEnabled(false);
        notificationService.info('Login Biometrik telah dinonaktifkan.', 'Biometrik Nonaktif');
      }
    } catch (err) {
      console.warn('Biometric toggle error:', err);
      notificationService.error(err.message || 'Gagal mengatur biometrik.', 'Biometrik Gagal');
    } finally {
      setIsProcessingBiometric(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 px-5">
      <div>
        <h1 className="text-2xl font-black text-[#1E1B2E] tracking-tight">Pengaturan & Sistem</h1>
        <p className="text-xs text-[#7E7A9B] mt-1 font-medium">
          Konfigurasi Velto Finance, profil pengguna, dan keamanan biometrik
        </p>
      </div>

      {/* Profile Card with Edit Action */}
      <div className="bg-white rounded-3xl p-5 border border-[#ECE8F6] shadow-soft-card flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {profilePhoto ? (
            <img 
              src={profilePhoto} 
              alt="Profile" 
              className="w-14 h-14 rounded-2xl object-cover border border-[#ECE8F6] shadow-hero-card"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6633EE] to-[#8054F6] text-white flex items-center justify-center font-extrabold text-lg shadow-hero-card">
              {profileName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-extrabold text-base text-[#1E1B2E]">{profileName}</h3>
            <p className="text-xs text-[#7E7A9B] font-medium mt-0.5">
              {user?.email || 'Personal Asset Tracker'}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-emerald-50 px-2 py-0.5 rounded-full mt-2">
              <CheckCircle className="w-3 h-3" /> PWA Standalone Ready
            </span>
          </div>
        </div>

        <button
          onClick={() => setProfileModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#F4F2FA] hover:bg-[#EAE2FF] text-[#6633EE] text-xs font-bold transition-all active:scale-95"
          title="Ubah Profil"
        >
          <Edit3 className="w-4 h-4" />
          <span className="hidden sm:inline">Ubah Profil</span>
        </button>
      </div>

      {/* Biometric Security Setting Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#ECE8F6] shadow-soft-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              biometricEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-[#F4F2FA] text-[#7E7A9B]'
            }`}>
              <Fingerprint className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[#1E1B2E]">
                Biometrik untuk Login
              </h4>
              <p className="text-xs text-[#7E7A9B] mt-0.5 font-medium">
                Gunakan Sidik Jari / Face ID / Windows Hello untuk masuk cepat
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={handleToggleBiometric}
            disabled={isProcessingBiometric || !biometricAvailable}
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out relative flex items-center ${
              !biometricAvailable 
                ? 'bg-slate-200 opacity-60 cursor-not-allowed'
                : biometricEnabled ? 'bg-[#10B981]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                biometricEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {!biometricAvailable && (
          <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
            ⚠️ Sensor biometrik (Fingerprint/Windows Hello) tidak terdeteksi pada perangkat atau browser ini.
          </p>
        )}
      </div>

      {/* Real-Time Google Spreadsheet Cloud Backup & Sync */}
      <GoogleSheetSyncCard />

      {/* Real-Time WhatsApp Bot Notification */}
      <WhatsAppNotificationCard />

      {/* App Footer info */}
      <div className="text-center text-[11px] text-[#7E7A9B] pt-2">
        <p className="font-bold text-[#1E1B2E]">Velto Finance v2.4 (EasyPay Edition)</p>
        <p className="mt-0.5">PWA Offline-First • IndexedDB ACID Storage</p>
      </div>

      {/* Profile Edit Modal */}
      <ProfileModal 
        isOpen={profileModalOpen} 
        onClose={() => {
          setProfileModalOpen(false);
          // Refresh profile data
          prefsHelper.get('user_profile_name', 'Velto User').then(val => setProfileName(val));
          prefsHelper.get('user_profile_photo', null).then(val => setProfilePhoto(val));
        }} 
      />
    </div>
  );
}
