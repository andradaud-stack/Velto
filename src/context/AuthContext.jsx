import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  supabase, 
  isSupabaseConfigured, 
  signInWithGoogle, 
  signInWithEmailPassword, 
  signUpWithEmailPassword, 
  signOutCloud 
} from '../data/db/supabaseClient';
import { prefsHelper } from '../data/db/prefsHelper';
import { notificationService } from '../data/services/notificationService';

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
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (mounted && session?.user) {
            setUser(session.user);
            setIsCloudAuthenticated(true);
            setSyncStatus('synced');
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
              if (session?.user) {
                setUser(session.user);
                setIsCloudAuthenticated(true);
                setSyncStatus('synced');
              } else {
                setUser(null);
                setIsCloudAuthenticated(false);
                setSyncStatus('offline');
              }
            }
          });

          return () => subscription.unsubscribe();
        } else {
          // Check local offline cloud session
          const savedSession = localStorage.getItem('velto_cloud_session');
          if (savedSession) {
            try {
              const parsed = JSON.parse(savedSession);
              if (mounted && parsed?.user) {
                if (parsed.user.user_metadata?.full_name === 'Andra Syahdan') {
                  parsed.user.user_metadata.full_name = 'Andra Syahdan Daud';
                  localStorage.setItem('velto_cloud_session', JSON.stringify(parsed));
                }
                setUser(parsed.user);
                setIsCloudAuthenticated(true);
                setSyncStatus('offline');
              }
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Auth init error:', err);
      } finally {
        if (mounted) setIsLoadingAuth(false);
      }
    }

    initAuth();
    return () => { mounted = false; };
  }, []);

  const loginWithEmail = async (email, password) => {
    try {
      const res = await signInWithEmailPassword(email, password);
      if (res.error) {
        notificationService.error(res.error.message || 'Login gagal', 'Autentikasi Gagal');
        return res;
      }
      if (res.data?.user) {
        setUser(res.data.user);
        setIsCloudAuthenticated(true);
        notificationService.success(`Selamat datang kembali, ${res.data.user.user_metadata?.full_name || res.data.user.email}!`, 'Login Berhasil');
      }
      return res;
    } catch (err) {
      notificationService.error(err.message, 'Gagal Login');
      return { error: err };
    }
  };

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

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithGoogle();
      if (res.data?.user) {
        setUser(res.data.user);
        setIsCloudAuthenticated(true);
        notificationService.success('Login Google Berhasil!', 'Cloud Connected');
      }
      return res;
    } catch (err) {
      notificationService.error(err.message, 'Gagal Login Google');
      return { error: err };
    }
  };

  const loginOfflineDirect = () => {
    // Mode offline-first tanpa akun cloud
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
    await signOutCloud();
    setUser(null);
    setIsCloudAuthenticated(false);
    setIsLocalLocked(true);
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
