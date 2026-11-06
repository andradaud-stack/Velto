import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  supabase, 
  isSupabaseConfigured, 
  signInWithEmailPassword, 
  signUpWithEmailPassword, 
  signOutCloud 
} from '../data/db/supabaseClient';
import { prefsHelper } from '../data/db/prefsHelper';
import { notificationService } from '../data/services/notificationService';
import { cloudSyncService } from '../data/services/cloudSyncService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isCloudAuthenticated, setIsCloudAuthenticated] = useState(false);
  const [isLocalLocked, setIsLocalLocked] = useState(true);
  const [syncStatus, setSyncStatus] = useState('offline'); // 'synced' | 'syncing' | 'offline'

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        // 1. Cek sesi cloud TiDB / JWT lokal terlebih dahulu
        const token = cloudSyncService.getToken();
        const savedSession = localStorage.getItem('velto_cloud_session');

        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            if (mounted && parsed?.user) {
              setUser(parsed.user);
              setIsCloudAuthenticated(true);
              setSyncStatus('synced');
              // Lakukan background pull dari TiDB
              if (token) {
                cloudSyncService.pullFromCloud().catch(console.warn);
              }
            }
          } catch (e) {
            console.warn('[Session parse error]', e);
          }
        } else if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (mounted && session?.user) {
            setUser(session.user);
            setIsCloudAuthenticated(true);
            setSyncStatus('synced');
          }
        }

        // Cek PIN / biometric lock status
        const pinEnabled = await prefsHelper.isPinEnabled();
        const biometricEnabled = await prefsHelper.isBiometricEnabled();
        if (mounted) {
          setIsLocalLocked(pinEnabled || biometricEnabled);
        }
      } catch (err) {
        console.error('Failed to initialize auth state:', err);
      } finally {
        if (mounted) setIsLoadingAuth(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const registerWithEmail = async (email, password, fullName) => {
    try {
      const res = await signUpWithEmailPassword(email, password, fullName);
      if (res.error) {
        notificationService.error(res.error.message || 'Pendaftaran gagal', 'Gagal Daftar');
        return res;
      }
      if (res.data?.user) {
        setUser(res.data.user);
        setIsCloudAuthenticated(true);
        notificationService.success(`Akun berhasil dibuat! Selamat datang di Velto, ${res.data.user.user_metadata?.full_name || fullName}!`, 'Registrasi Berhasil');
      }
      return res;
    } catch (err) {
      notificationService.error(err.message, 'Gagal Registrasi');
      return { error: err };
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const res = await signInWithEmailPassword(email, password);
      if (res.error) {
        notificationService.error(res.error.message || 'Email atau password salah', 'Gagal Masuk');
        return res;
      }
      if (res.data?.user) {
        setUser(res.data.user);
        setIsCloudAuthenticated(true);
        notificationService.success(`Selamat datang kembali!`, 'Login Berhasil');
      }
      return res;
    } catch (err) {
      notificationService.error(err.message, 'Gagal Masuk');
      return { error: err };
    }
  };

  /**
   * Login Google Resmi via Google Identity Services & TiDB Cloud Backend
   */
  const loginWithGoogle = async () => {
    try {
      // 1. Ambil Google Client ID
      let clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId || clientId.includes('undefined')) {
        try {
          const cfgRes = await fetch('/api/auth/config');
          if (cfgRes.ok) {
            const cfg = await cfgRes.json();
            clientId = cfg.clientId;
          }
        } catch (e) {
          // fallback
        }
      }

      if (!clientId) {
        clientId = '104560933562-fq59domirr6lj1dee565l92d7a7ib86b.apps.googleusercontent.com';
      }

      // 2. Tunggu SDK Google siap dimuat (hingga 4 detik)
      let googleSdkReady = Boolean(window.google?.accounts?.oauth2);
      if (!googleSdkReady) {
        for (let i = 0; i < 20; i++) {
          await new Promise(r => setTimeout(r, 200));
          if (window.google?.accounts?.oauth2) {
            googleSdkReady = true;
            break;
          }
        }
      }

      // Jika script belum ada, inject dinamis
      if (!googleSdkReady && !window.google?.accounts?.oauth2) {
        await new Promise((resolve) => {
          const s = document.createElement('script');
          s.src = 'https://accounts.google.com/gsi/client';
          s.async = true;
          s.defer = true;
          s.onload = () => resolve(true);
          s.onerror = () => resolve(false);
          document.head.appendChild(s);
          setTimeout(() => resolve(false), 3000);
        });
      }

      if (!window.google?.accounts?.oauth2) {
        throw new Error('Google Sign-In SDK belum siap atau terhalang browser (misal Brave Shields). Silakan nonaktifkan shield/adblocker sementara lalu coba lagi.');
      }

      // 3. Buka Google OAuth Popup resmi
      const googleToken = await new Promise((resolve, reject) => {
        try {
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'email profile openid',
            callback: (resp) => {
              if (resp.error) {
                reject(new Error(resp.error_description || resp.error));
              } else if (resp.access_token) {
                resolve(resp.access_token);
              } else {
                reject(new Error('Gagal mendapatkan token dari Google.'));
              }
            },
            error_callback: (err) => {
              reject(new Error(err.message || 'Popup Google ditutup oleh pengguna.'));
            }
          });
          tokenClient.requestAccessToken({ prompt: 'select_account' });
        } catch (sdkErr) {
          reject(sdkErr);
        }
      });

      // 4. Verifikasi ke backend TiDB Cloud
      const authRes = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: googleToken })
      });

      if (!authRes.ok) {
        const errJson = await authRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Autentikasi gagal pada server TiDB.');
      }

      const authData = await authRes.json();
      if (!authData.success || !authData.user) {
        throw new Error(authData.error || 'Gagal login Google');
      }

      // 5. Simpan token & user
      cloudSyncService.setToken(authData.token);
      localStorage.setItem('velto_cloud_session', JSON.stringify({ user: authData.user, token: authData.token }));
      setUser(authData.user);
      setIsCloudAuthenticated(true);
      setSyncStatus('synced');

      // 6. Tarik data dari TiDB ke Dexie
      await cloudSyncService.pullFromCloud();

      notificationService.success(`Selamat datang, ${authData.user.name}!`, 'Login Google Berhasil');
      return { data: { user: authData.user }, error: null };
    } catch (err) {
      console.error('[Google Auth Error]', err);
      notificationService.error(err.message || 'Gagal Login Google', 'Error Autentikasi');
      return { data: null, error: err };
    }
  };

  const loginOfflineDirect = () => {
    const offlineUser = {
      id: 'local_andra',
      email: 'andra@velto.finance',
      user_metadata: {
        full_name: 'Andra Syahdan Daud',
        avatar_url: ''
      }
    };
    localStorage.setItem('velto_cloud_session', JSON.stringify({ user: offlineUser, isOfflineMode: true }));
    setUser(offlineUser);
    setIsCloudAuthenticated(true);
  };

  const logout = async () => {
    cloudSyncService.setToken(null);
    localStorage.removeItem('velto_cloud_session');
    setUser(null);
    setIsCloudAuthenticated(false);
    setIsLocalLocked(true);
    setSyncStatus('offline');
    if (isSupabaseConfigured) {
      await signOutCloud().catch(() => {});
    }
    notificationService.info('Anda telah keluar.', 'Logout Selesai');
  };

  const unlockLocal = () => {
    setIsLocalLocked(false);
  };

  const lockLocal = () => {
    setIsLocalLocked(true);
  };

  const value = {
    user,
    isLoadingAuth,
    isCloudAuthenticated,
    isLocalLocked,
    syncStatus,
    isSupabaseConfigured,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginOfflineDirect,
    logout,
    unlockLocal,
    lockLocal
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
