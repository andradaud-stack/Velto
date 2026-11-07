import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight
} from 'lucide-react';
import { useAuth, GOOGLE_CLIENT_ID } from '../context/AuthContext';
import { notificationService } from '../data/services/notificationService';

export default function LoginPage({ onLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const googleBtnRef = useRef(null);

  const { 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle, 
    handleGoogleAuthResponse, 
    loginOfflineDirect 
  } = useAuth();

  // Mount Google Identity Services Button for native mobile & desktop support
  useEffect(() => {
    let checkCount = 0;
    const interval = setInterval(() => {
      checkCount++;
      if (window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
              if (response.credential) {
                setIsSubmitting(true);
                try {
                  const res = await handleGoogleAuthResponse({ idToken: response.credential });
                  if (!res.error && res.data?.user) {
                    onLoginSuccess?.();
                  }
                } finally {
                  setIsSubmitting(false);
                }
              }
            }
          });

          // Render official button directly
          window.google.accounts.id.renderButton(
            googleBtnRef.current,
            {
              theme: 'outline',
              size: 'large',
              shape: 'pill',
              width: 280,
              text: 'continue_with',
              logo_alignment: 'left'
            }
          );
          clearInterval(interval);
        } catch (e) {
          console.warn('[GSI Render Warn]', e);
        }
      }

      if (checkCount > 15) {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [handleGoogleAuthResponse, onLoginSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      notificationService.error('Silakan isi email Anda.', 'Data Belum Lengkap');
      return;
    }

    if (isRegisterMode && !fullName) {
      notificationService.error('Silakan isi nama lengkap Anda.', 'Nama Diperlukan');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegisterMode) {
        const res = await registerWithEmail(email, password, fullName);
        if (!res.error && res.data?.user) {
          onLoginSuccess?.();
        }
      } else {
        const res = await loginWithEmail(email, password);
        if (!res.error && res.data?.user) {
          onLoginSuccess?.();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (!res.error && res.data?.user) {
        onLoginSuccess?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOfflineDirect = () => {
    loginOfflineDirect();
    onLoginSuccess?.();
  };

  return (
    /* Full Viewport 100vw x 100vh tanpa rounded pinggir / tanpa margin */
    <div className="w-screen min-h-screen bg-[#F0F4FC] relative overflow-x-hidden overflow-y-auto select-none font-sans flex flex-col justify-center">
      
      {/* Background Gambar Desktop Asli 100% Persis Desain (Ultra Sharp 2K) */}
      <img 
        src="/velto-bg-full-2k.png" 
        alt="Velto Finance Background Desktop" 
        className="hidden md:block absolute inset-0 w-full h-full object-cover object-left-top pointer-events-none z-0"
      />

      {/* Background Gambar Mobile Asli 100% Persis Desain (Ultra Sharp 2K) */}
      <img 
        src="/velto-bg-mobile-2k.png" 
        alt="Velto Finance Background Mobile" 
        className="block md:hidden absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
      />

      {/* Floating Interactive Form Card positioned on the right (desktop) or center (mobile) */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center md:justify-end p-4 sm:p-8 lg:p-14 xl:pr-24 my-auto py-8">
        
        {/* The White Login / Sign-up Card */}
        <div className="w-full max-w-[430px] bg-white/95 md:bg-white backdrop-blur-md md:backdrop-blur-none rounded-[36px] p-6 sm:p-8 md:p-9 shadow-[0_20px_50px_rgba(8,112,184,0.18)] md:shadow-[0_20px_50px_rgba(8,112,184,0.12)] border border-slate-100/90 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Top-Right Yellow/Orange Curved Corner Accent */}
          <div 
            className="absolute top-0 right-0 w-32 h-32 pointer-events-none z-0"
            style={{
              background: 'radial-gradient(circle at 100% 0%, #FFB703 0%, #FBBF24 50%, #FDE68A 75%, transparent 100%)',
              borderBottomLeftRadius: '110px'
            }}
          />

          {/* Header Brand */}
          <div className="relative z-10 mb-6">
            <div className="flex items-center gap-2 mb-2">
              {/* Velto Logo Graphic */}
              <div className="flex items-center gap-1.5">
                <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                  <path d="M6 10L16 32L26 10" stroke="#003566" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 18L28 32L36 14" stroke="#FFB703" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-2xl font-black tracking-tight text-[#0B1536]">Velto</span>
              </div>
            </div>
            <p className="text-xs text-[#64748B] font-medium">Manage your finance, live smarter.</p>
          </div>

          {/* Form Title & Subtitle */}
          <div className="relative z-10 mb-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1536] tracking-tight">
              {isRegisterMode ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-xs text-[#64748B] mt-1 font-medium">
              {isRegisterMode 
                ? 'Sign up to start tracking your assets and goals.' 
                : 'Log in to your Velto account to continue.'}
            </p>
          </div>

          {/* Main Input Form */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-3.5">
            
            {/* Full Name field (Register mode only) */}
            {isRegisterMode && (
              <div className="space-y-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-[#E2E8F0] text-sm font-semibold text-[#0B1536] placeholder-[#94A3B8] outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 transition-all"
                    required={isRegisterMode}
                  />
                </div>
              </div>
            )}

            {/* Email Address field */}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-[#E2E8F0] text-sm font-semibold text-[#0B1536] placeholder-[#94A3B8] outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-11 pr-11 py-3 rounded-2xl bg-white border border-[#E2E8F0] text-sm font-semibold text-[#0B1536] placeholder-[#94A3B8] outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94A3B8] hover:text-[#0B1536] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password (Login mode only) */}
            {!isRegisterMode && (
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-[#64748B] font-medium select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#0B1536] focus:ring-0 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => notificationService.info('Silakan login dengan Google Account atau gunakan password.', 'Info Login')}
                  className="font-semibold text-[#2563EB] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Main Submit Button (Dark Navy Rounded Pill) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#0B1333] hover:bg-[#121E4E] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all mt-3 disabled:opacity-60 cursor-pointer"
            >
              <span>{isSubmitting ? 'Memproses...' : (isRegisterMode ? 'Sign Up' : 'Login')}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Social Sign-in Divider */}
          <div className="relative my-4 text-center z-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-medium text-[#94A3B8]">
              or continue with
            </span>
          </div>

          {/* Social OAuth Icons (Google Sign-In) */}
          <div className="flex flex-col items-center justify-center relative z-10 gap-2.5">
            {/* Native Official Google GSI Button (Ultra reliable on Mobile & Desktop) */}
            <div ref={googleBtnRef} className="flex justify-center w-full min-h-[40px]"></div>

            {/* Fallback button if Google script is taking time or blocked */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              className="w-full max-w-[280px] py-2.5 px-4 rounded-full border border-[#E2E8F0] hover:border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center gap-2.5 shadow-xs active:scale-95 transition-all text-xs font-bold text-[#0B1536] cursor-pointer"
              title="Masuk dengan Google"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google Account</span>
            </button>
          </div>

          {/* Toggle Sign up / Login Switch */}
          <div className="mt-4 text-center text-xs text-[#64748B] relative z-10">
            <span>{isRegisterMode ? 'Already have an account? ' : "Don't have an account? "}</span>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setEmail('');
                setPassword('');
                setFullName('');
              }}
              className="font-bold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1 ml-1 hover:underline transition-colors"
            >
              <span>{isRegisterMode ? 'Log in' : 'Sign up'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Direct Offline Access Link */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-center relative z-10">
            <button
              type="button"
              onClick={handleOfflineDirect}
              className="text-[11px] font-semibold text-[#94A3B8] hover:text-[#0B1536] transition-colors cursor-pointer"
            >
              Buka Langsung Mode Offline (Tanpa Akun) &rarr;
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
