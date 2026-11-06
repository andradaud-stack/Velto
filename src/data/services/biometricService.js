import { prefsHelper } from '../db/prefsHelper';
import { notificationService } from './notificationService';

/**
 * WebAuthn Biometric Service
 * Mendukung Windows Hello (Fingerprint / PIN / Face) & Android/iOS Biometric (Fingerprint/TouchID/FaceID)
 * Sesuai standar W3C Web Authentication API (FIDO2)
 */

// Helper konversi ArrayBuffer <-> Base64
function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export const biometricService = {
  /**
   * Cek apakah perangkat mendukung autentikator platform (Fingerprint / Windows Hello / Touch ID / Face ID)
   */
  async isAvailable() {
    try {
      if (!window.PublicKeyCredential) return false;
      if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== 'function') {
        return false;
      }
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (err) {
      console.warn('[WebAuthn] Check available error:', err);
      return false;
    }
  },

  /**
   * Cek apakah pengguna sudah pernah mendaftarkan sidik jari di perangkat ini
   */
  async isEnrolled() {
    const credId = await prefsHelper.get('biometric_credential_id', null);
    return Boolean(credId);
  },

  /**
   * Mendaftarkan Sidik Jari baru ke perangkat (Laptop Windows Hello / HP Fingerprint)
   */
  async registerBiometric(username = 'Andra Syahdan') {
    if (!navigator.credentials || !navigator.credentials.create) {
      throw new Error('Web Authentication API tidak didukung pada browser ini.');
    }

    // Challenge random 32-byte
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // User ID random 16-byte
    const userId = new Uint8Array(16);
    window.crypto.getRandomValues(userId);

    const createCredentialOptions = {
      publicKey: {
        challenge,
        rp: {
          name: 'Velto Financial',
          id: window.location.hostname
        },
        user: {
          id: userId,
          name: username,
          displayName: username
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },  // ES256
          { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Menggunakan sensor bawaan (Laptop / HP)
          userVerification: 'required',        // Wajib sidik jari / face / PIN perangkat
          residentKey: 'preferred'
        },
        timeout: 60000,
        attestation: 'none'
      }
    };

    try {
      const credential = await navigator.credentials.create(createCredentialOptions);
      if (!credential) {
        throw new Error('Pendaftaran biometrik dibatalkan.');
      }

      // Simpan Credential ID ke IndexedDB agar bisa diverifikasi saat login
      const credIdBase64 = bufferToBase64(credential.rawId);
      await prefsHelper.set('biometric_credential_id', credIdBase64);
      await prefsHelper.set('biometric_enrolled_at', new Date().toISOString());

      return {
        success: true,
        credentialId: credIdBase64
      };
    } catch (err) {
      console.error('[WebAuthn] Registration error:', err);
      // Tangani pesan error yang ramah pengguna
      if (err.name === 'NotAllowedError') {
        throw new Error('Pindai sidik jari dibatalkan atau ditolak perangkat.');
      }
      throw err;
    }
  },

  /**
   * Verifikasi Sidik Jari untuk Masuk / Buka Kunci
   */
  async verifyBiometric() {
    if (!navigator.credentials || !navigator.credentials.get) {
      throw new Error('Web Authentication API tidak didukung pada browser ini.');
    }

    const savedCredId = await prefsHelper.get('biometric_credential_id', null);

    // Jika belum terdaftar, daftarkan terlebih dahulu sidik jarinya secara otomatis
    if (!savedCredId) {
      const regResult = await this.registerBiometric();
      return regResult;
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const getCredentialOptions = {
      publicKey: {
        challenge,
        rpId: window.location.hostname,
        allowCredentials: [
          {
            id: base64ToBuffer(savedCredId),
            type: 'public-key',
            transports: ['internal']
          }
        ],
        userVerification: 'required',
        timeout: 60000
      }
    };

    try {
      const assertion = await navigator.credentials.get(getCredentialOptions);
      if (!assertion) {
        throw new Error('Verifikasi sidik jari tidak menghasilkan kredensial.');
      }

      return {
        success: true,
        signature: bufferToBase64(assertion.response.signature)
      };
    } catch (err) {
      console.error('[WebAuthn] Verification error:', err);
      if (err.name === 'NotAllowedError') {
        throw new Error('Pindai sidik jari dibatalkan.');
      }
      throw err;
    }
  },

  /**
   * Reset / Hapus pendaftaran biometrik
   */
  async clearBiometric() {
    await prefsHelper.set('biometric_credential_id', null);
    await prefsHelper.set('biometric_enrolled_at', null);
  }
};
