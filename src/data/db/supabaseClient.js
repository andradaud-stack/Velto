import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('xyzcompany')
);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Sign in with Google via Supabase OAuth
 */
export async function signInWithGoogle() {
  if (!isSupabaseConfigured) {
    // Mock Google sign in for local offline / demo environment
    const mockUser = {
      id: 'usr_andra_' + Date.now(),
      email: 'andra.syahdan@gmail.com',
      user_metadata: {
        full_name: 'Andra Syahdan',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andra'
      }
    };
    localStorage.setItem('velto_cloud_session', JSON.stringify({ user: mockUser, isMock: true }));
    return { data: { user: mockUser }, error: null };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });

  return { data, error };
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmailPassword(email, password) {
  if (!isSupabaseConfigured) {
    // Local / offline mock login
    const savedUserStr = localStorage.getItem('velto_registered_user');
    let registeredUser = null;
    if (savedUserStr) {
      try {
        registeredUser = JSON.parse(savedUserStr);
      } catch (e) {
        console.warn('Parse error', e);
      }
    }

    // Default accepted demo account if none registered
    if (!registeredUser) {
      registeredUser = {
        email: 'andra.syahdan@gmail.com',
        password: 'password123',
        fullName: 'Andra Syahdan'
      };
    }

    if (email.toLowerCase().trim() === registeredUser.email.toLowerCase().trim()) {
      if (password === registeredUser.password) {
        const userObj = {
          id: 'usr_' + Date.now(),
          email: registeredUser.email,
          user_metadata: {
            full_name: registeredUser.fullName || 'Andra Syahdan',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andra'
          }
        };
        localStorage.setItem('velto_cloud_session', JSON.stringify({ user: userObj, isMock: true }));
        return { data: { user: userObj }, error: null };
      } else {
        return { data: null, error: new Error('Password yang Anda masukkan salah!') };
      }
    } else {
      // Allow seamless login for demo
      const userObj = {
        id: 'usr_' + Date.now(),
        email: email,
        user_metadata: {
          full_name: email.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        }
      };
      localStorage.setItem('velto_cloud_session', JSON.stringify({ user: userObj, isMock: true }));
      return { data: { user: userObj }, error: null };
    }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
}

/**
 * Sign up with Email and Password
 */
export async function signUpWithEmailPassword(email, password, fullName) {
  if (!isSupabaseConfigured) {
    // Save to local registration
    const regUser = {
      email: email.trim(),
      password: password,
      fullName: fullName || email.split('@')[0]
    };
    localStorage.setItem('velto_registered_user', JSON.stringify(regUser));

    const userObj = {
      id: 'usr_' + Date.now(),
      email: regUser.email,
      user_metadata: {
        full_name: regUser.fullName,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${regUser.fullName}`
      }
    };
    localStorage.setItem('velto_cloud_session', JSON.stringify({ user: userObj, isMock: true }));
    return { data: { user: userObj }, error: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split('@')[0]
      }
    }
  });
  return { data, error };
}

/**
 * Sign out
 */
export async function signOutCloud() {
  localStorage.removeItem('velto_cloud_session');
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
  return { success: true };
}
