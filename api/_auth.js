import jwt from 'jsonwebtoken';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    return 'velto_finance_secure_jwt_session_token_key_2026';
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
