/**
 * User Scoping Utility for Velto Finance
 * Handles account isolation between the primary user (Andra) and any new registered users.
 */

export function isAndraUser(user) {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  const id = (user.id || '').toLowerCase().trim();
  const name = (user.user_metadata?.full_name || user.name || '').toLowerCase().trim();

  return (
    id === 'local_andra' ||
    id === 'owner_andra' ||
    id === 'andra' ||
    email === 'andrasyahdand@gmail.com' ||
    email.includes('andra') ||
    email === 'andra@velto.finance' ||
    name.includes('andra')
  );
}

export function getUserScopeId(user) {
  if (isAndraUser(user)) {
    return 'owner_andra';
  }
  return user?.id || user?.email || 'new_user';
}
