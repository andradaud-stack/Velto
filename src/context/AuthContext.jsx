import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { prefsHelper } from '../data/db/prefsHelper';
import { notificationService } from '../data/services/notificationService';
import { cloudSyncService } from '../data/services/cloudSyncService';

export const GOOGLE_CLIENT_ID = '104560933562-fq59domirr6lj1dee565l92d7a7ib86b.apps.googleusercontent.com';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 1. SINKRON: Baca session tersimpan langsung saat inisialisasi awal.
  // Ini mencegah user ter-logout otomatis atau ada kedipan login saat refresh / restart browser!
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('velto_cloud_session');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      return parsed?.user || null;
    } catch {
      return null;
    }
  });

  const [isCloudAuthenticated, setIsCloudAuthenticated] = useState(() => {
    try {
      const saved = localStorage.getItem('velto_cloud_session');
      return Boolean(saved);
    } catch {
      return false;
    }
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLocalLocked, setIsLocalLocked] = useState(false);
  const [syncStatus, setSyncStatus] = useState(() => {
    return localStorage.getItem('velto_cloud_session') ? 'synced' : 'offline';
  });

  // Background hydration & sync verification
  useEffect(() => {
    let mounted = true;

    async function verifyAndSync() {
      try {
        const savedSession = localStorage.getItem('velto_cloud_session');
        const token = cloudSyncService.getToken();

        if (savedSession && token) {
          // Sync data dari cloud TiDB di background tanpa mengganggu tampilan
          cloudSyncService.pullFromCloud().catch((err) => {
            console.warn('[Cloud Sync Background Notice]', err);
          });
        }

        // Cek PIN / biometric lock status
        const pinEnabled = await prefsHelper.isPinEnabled();
        const biometricEnabled = await prefsHelper.isBiometricEnabled();
        if (mounted) {
          setIsLocalLocked(pinEnabled || biometricEnabled);
        }
      } catch (err) {
        console.warn('[Auth verification background warn]', err);
      }
    }

    verifyAndSync();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Helper untuk menyimpan sesi ke localStorage & state
   */
  const saveSession = (userData, token) => {
    if (token) {
      cloudSyncService.setToken(token);
    }
    localStorage.setItem(
      'velto_cloud_session',
      JSON.stringify({ user: userData, token: token || null, timestamp: Date.now() })
    );
    setUser(userData);
    setIsCloudAuthenticated(true);
    setSyncStatus('synced');
  };

  /**
   * Pendaftaran akun via TiDB backend
   */
  const registerWithEmail = async (email, password, fullName) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, isRegister: true })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Pendaftaran gagal');
      }

      saveSession(data.user, data.token);
      cloudSyncService.pullFromCloud().catch(console.warn);
      notificationService.success(`Selamat datang di Velto, ${data.user.name}!`, 'Pendaftaran Berhasil');
      return { data: { user: data.user }, error: null };
    } catch (err) {
      console.error('[Register Error]', err);
      notificationService.error(err.message || 'Pendaftaran gagal', 'Gagal Daftar');
      return { data: null, error: err };
    }
  };

  /**
   * Login via Email & Password ke TiDB backend
   */
  const loginWithEmail = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Email atau password salah');
      }

      saveSession(data.user, data.token);
      cloudSyncService.pullFromCloud().catch(console.warn);
      notificationService.success(`Selamat datang kembali, ${data.user.name}!`, 'Login Berhasil');
      return { data: { user: data.user }, error: null };
    } catch (err) {
      console.error('[Login Error]', err);
      notificationService.error(err.message || 'Login gagal', 'Gagal Masuk');
      return { data: null, error: err };
    }
  };

  /**
   * Handle token credential dari Google Sign-In (ID Token atau Access Token)
   */
  const handleGoogleAuthResponse = useCallback(async ({ idToken, accessToken }) => {
    try {
      const authRes = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, accessToken })
      });

      const authData = await authRes.json();
      if (!authRes.ok || !authData.success || !authData.user) {
        throw new Error(authData.error || 'Autentikasi gagal pada server TiDB.');
      }

      saveSession(authData.user, authData.token);
      await cloudSyncService.pullFromCloud().catch(console.warn);

      notificationService.success(`Selamat datang, ${authData.user.name}!`, 'Login Google Berhasil');
      return { data: { user: authData.user }, error: null };
    } catch (err) {
      console.error('[Google Auth Response Error]', err);
      notificationService.error(err.message || 'Gagal Login Google', 'Error Autentikasi');
      return { data: null, error: err };
    }
  }, []);

  /**
   * Login Google Resmi via Google Identity Services (Sinkron tanpa popup blocker)
   */
  const loginWithGoogle = async () => {
    try {
      if (!window.google?.accounts?.oauth2) {
        // Jika belum siap, beri tahu user
        throw new Error('Google Sign-In sedang disiapkan. Silakan coba 2 detik lagi.');
      }

      const googleToken = await new Promise((resolve, reject) => {
        try {
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile openid',
            callback: (resp) => {
              if (resp.error) {
                reject(new Error(resp.error_description || resp.error));
              } else if (resp.access_token) {
                resolve(resp.access_token);
              } else {
                reject(new Error('Gagal mendapatkan akses dari Google.'));
              }
            },
            error_callback: (err) => {
              reject(new Error(err.message || 'Popup Google ditutup oleh pengguna.'));
            }
          });
          // Dipanggil sinkron langsung dari touch/click pengguna
          tokenClient.requestAccessToken({ prompt: 'select_account' });
        } catch (sdkErr) {
          reject(sdkErr);
        }
      });

      return await handleGoogleAuthResponse({ accessToken: googleToken });
    } catch (err) {
      console.error('[Google Auth Error]', err);
      notificationService.error(err.message || 'Gagal Login Google', 'Error Autentikasi');
      return { data: null, error: err };
    }
  };

  const loginOfflineDirect = () => {
    const offlineUser = {
      id: 'owner_andra',
      email: 'andrasyahdand@gmail.com',
      name: 'Andra Syahdan Daud',
      role: 'owner',
      user_metadata: {
        full_name: 'Andra Syahdan Daud',
        avatar_url: ''
      }
    };
    saveSession(offlineUser, null);
    notificationService.info('Masuk dalam mode offline (Data tersimpan di perangkat ini).', 'Mode Offline');
  };

  const logout = async () => {
    cloudSyncService.setToken(null);
    localStorage.removeItem('velto_cloud_session');
    localStorage.removeItem('velto_auth_token');
    setUser(null);
    setIsCloudAuthenticated(false);
    setIsLocalLocked(false);
    setSyncStatus('offline');
    notificationService.info('Anda telah keluar dari akun.', 'Sampai Jumpa');
  };

  const unlockApp = () => {
    setIsLocalLocked(false);
  };

  const value = {
    user,
    isLoadingAuth,
    isCloudAuthenticated,
    isLocalLocked,
    syncStatus,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    handleGoogleAuthResponse,
    loginOfflineDirect,
    logout,
    unlockApp
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
