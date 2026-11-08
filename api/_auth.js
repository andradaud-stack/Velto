import jwt from 'jsonwebtoken';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      throw new Error('JWT_SECRET environment variable is required in production.');
    }
    // Fallback for isolated local test runs only
    return 'development_only_secret_key_velto_finance_local';
  }
  return secret.trim();
}

export function signToken(payload, expiresIn = '30d') {
  return jwt.sign(payload, getJwtSecret(), {
    algorithm: 'HS256',
    expiresIn
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256']
    });
  } catch (err) {
    return null;
  }
}
