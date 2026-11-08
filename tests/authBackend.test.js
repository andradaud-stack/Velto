import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';

describe('Auth & JWT Reliability', () => {
  const JWT_SECRET = 'velto_super_secure_jwt_secret_key_2026';

  it('generates and verifies 30-day session token correctly', () => {
    const payload = {
      id: 'owner_andra',
      email: 'andrasyahdand@gmail.com',
      name: 'Andra Syahdan Daud',
      role: 'owner'
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
    expect(typeof token).toBe('string');

    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.id).toBe('owner_andra');
    expect(decoded.email).toBe('andrasyahdand@gmail.com');
    expect(decoded.role).toBe('owner');
  });

  it('rejects tampered or invalid JWT tokens', () => {
    expect(() => jwt.verify('invalid.token.here', JWT_SECRET)).toThrow();
    expect(() => jwt.verify('', JWT_SECRET)).toThrow();
  });
});
