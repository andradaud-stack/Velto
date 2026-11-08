import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { signToken, verifyToken, getJwtSecret } from '../api/_auth.js';
import { getDb } from '../api/_db.js';

describe('Auth & JWT Reliability', () => {
  it('generates and verifies 30-day session token correctly via _auth helper', () => {
    const payload = {
      id: 'owner_andra',
      email: 'andrasyahdand@gmail.com',
      name: 'Andra Syahdan Daud',
      role: 'owner'
    };

    const token = signToken(payload);
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded.id).toBe('owner_andra');
    expect(decoded.email).toBe('andrasyahdand@gmail.com');
    expect(decoded.role).toBe('owner');
  });

  it('rejects tampered or invalid JWT tokens safely without throwing', () => {
    expect(verifyToken('invalid.token.here')).toBeNull();
    expect(verifyToken('')).toBeNull();
    expect(verifyToken(null)).toBeNull();
  });

  it('enforces secure handling when TIDB environment variables are absent', () => {
    const originalUrl = process.env.DATABASE_URL;
    const originalUser = process.env.TIDB_USER;
    const originalPass = process.env.TIDB_PASSWORD;

    delete process.env.DATABASE_URL;
    delete process.env.TIDB_USER;
    delete process.env.TIDB_PASSWORD;

    expect(() => getDb()).toThrow(/Database authentication credentials missing/);

    // Restore
    if (originalUrl) process.env.DATABASE_URL = originalUrl;
    if (originalUser) process.env.TIDB_USER = originalUser;
    if (originalPass) process.env.TIDB_PASSWORD = originalPass;
  });
});
