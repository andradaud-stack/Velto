/**
 * User Scoping Utility for Velto Finance
 * Handles account isolation between the primary user (Andra) and any new registered users.
 */

export function isAndraUser(user) {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  const id = (user.id || '').toLowerCase().trim();
  const name = (user.user_metadata?.full_name || '').toLowerCase().trim();

  return (
    id === 'local_andra' ||
    email.includes('andra') ||
    email === 'andra@velto.finance' ||
    name.includes('andra')
  );
}

export function getUserScopeId(user) {
  if (isAndraUser(user)) {
    return 'andra';
  }
  return user?.id || user?.email || 'new_user';
}
