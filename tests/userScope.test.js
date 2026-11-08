import { describe, it, expect } from 'vitest';
import { isAndraUser, getUserScopeId } from '../src/core/utils/userScope';

describe('userScope Multi-Tenant Utility', () => {
  it('identifies owner accounts accurately', () => {
    expect(isAndraUser({ id: 'owner_andra', email: 'andrasyahdand@gmail.com' })).toBe(true);
    expect(isAndraUser({ id: 'local_andra' })).toBe(true);
    expect(isAndraUser({ id: 'andra' })).toBe(true);
    expect(isAndraUser({ email: 'andra@velto.finance' })).toBe(true);
    expect(isAndraUser({ name: 'Andra Syahdan Daud' })).toBe(true);
  });

  it('correctly isolates non-owner accounts', () => {
    expect(isAndraUser({ id: 'user_123', email: 'budi@gmail.com' })).toBe(false);
    expect(isAndraUser({ id: 'user_456', email: 'siti@company.id' })).toBe(false);
    expect(isAndraUser(null)).toBe(false);
    expect(isAndraUser(undefined)).toBe(false);
  });

  it('assigns correct scope ID for storage isolation', () => {
    expect(getUserScopeId({ id: 'owner_andra', email: 'andrasyahdand@gmail.com' })).toBe('owner_andra');
    expect(getUserScopeId({ id: 'user_xyz', email: 'user@test.com' })).toBe('user_xyz');
    expect(getUserScopeId(null)).toBe('new_user');
  });
});
