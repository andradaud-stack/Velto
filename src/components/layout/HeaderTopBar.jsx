import React, { useState, useEffect } from 'react';
import { ChevronLeft, Bell, Moon, Sun } from 'lucide-react';
import { prefsHelper } from '../../data/db/prefsHelper';
import { notificationService } from '../../data/services/notificationService';
import { useTheme } from '../../context/ThemeContext';

export default function HeaderTopBar({ 
  title = 'Velto', 
  showBack = false, 
  onBack,
  onOpenProfile,
  onOpenNotifications 
}) {
  const { isDark, toggleTheme } = useTheme();
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [studentName, setStudentName] = useState('Andra');

  useEffect(() => {
    // Read profile photo and name from IndexedDB
    prefsHelper.get('user_profile_photo', null).then(photo => {
      setProfilePhoto(photo);
    });
    prefsHelper.get('user_profile_name', 'Velto User').then(name => {
      setStudentName(name);
    });
  }, []);

  const handleNotificationClick = () => {
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      notificationService.info('Tidak ada notifikasi baru saat ini.', 'Pemberitahuan');
    }
  };

  return (
    <div className="w-full bg-[#F4F2FA]">
      {/* Mobile Top Bar (< 768px) */}
      <div className="flex md:hidden items-center justify-between px-6 pt-4 pb-2">
        {showBack ? (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/90 border border-[#ECE8F6] text-[#7C4DFF] hover:bg-white flex items-center justify-center shadow-xs transition-transform active:scale-95"
            title="Kembali"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.4]" />
          </button>
        ) : (
          <button
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-full bg-white/90 border border-[#ECE8F6] text-[#7C4DFF] flex items-center justify-center font-bold text-xs shadow-xs hover:border-[#6633EE] transition-all overflow-hidden p-0.5 active:scale-95"
            title="Buka Profil Saya"
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profil" className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#6633EE] to-[#8054F6] text-white flex items-center justify-center font-black">
                AS
              </div>
            )}
          </button>
        )}

        <div className="text-center">
          <h2 className="text-base sm:text-lg font-black text-[#1E1B2E] tracking-tight">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            title={isDark ? "Light Mode" : "Dark Mode"}
            className="w-10 h-10 rounded-full bg-white/90 border border-[#ECE8F6] text-[#7C4DFF] hover:bg-white flex items-center justify-center shadow-xs transition-transform active:scale-95"
          >
            {isDark ? (
              <Sun className="w-4.5 h-4.5 stroke-[2.2] text-amber-400" />
            ) : (
              <Moon className="w-4.5 h-4.5 stroke-[2.2]" />
            )}
          </button>

          <button
            onClick={handleNotificationClick}
            title="Notifikasi"
            className="w-10 h-10 rounded-full bg-white/90 border border-[#ECE8F6] text-[#7C4DFF] hover:bg-white flex items-center justify-center shadow-xs transition-transform active:scale-95 relative"
          >
            <Bell className="w-4.5 h-4.5 stroke-[2.2]" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#EF4444] rounded-full border border-white"></span>
          </button>
        </div>
      </div>

      {/* Desktop Header Banner (>= 768px) FinBank Style */}
      <div className="hidden md:flex items-center justify-between pb-6 pt-1">
        <div>
          <h1 className="text-2xl font-black text-[#1E1B2E] tracking-tight">
            Welcome to Velto
          </h1>
          <p className="text-xs text-[#7E7A9B] mt-0.5 font-medium">
            Hi, {studentName}. Welcome Back to your financial dashboard.
          </p>
        </div>

        {/* Right Desktop Controls (Mode, Bell, Profile Avatar) */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-2xl bg-white border border-[#ECE8F6] text-[#7E7A9B] hover:text-[#6633EE] flex items-center justify-center shadow-xs transition-all active:scale-95"
            title={isDark ? "Beralih ke Light Mode" : "Beralih ke Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-4.5 h-4.5 stroke-[2] text-amber-400" />
            ) : (
              <Moon className="w-4.5 h-4.5 stroke-[2]" />
            )}
          </button>

          <button
            onClick={handleNotificationClick}
            className="w-10 h-10 rounded-2xl bg-white border border-[#ECE8F6] text-[#7E7A9B] hover:text-[#6633EE] flex items-center justify-center shadow-xs transition-all active:scale-95 relative"
            title="Notifikasi"
          >
            <Bell className="w-4.5 h-4.5 stroke-[2]" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>

          <div 
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 pl-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#6633EE] text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden border border-[#ECE8F6] group-hover:scale-105 transition-all">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span>AS</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
