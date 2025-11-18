/**
 * Admin Detection Helper
 * Uses ENV variable to determine admin status
 */
export function isAdmin(uid: string | null): boolean {
  if (!uid) return false;
  const adminUid = import.meta.env.VITE_PUBLIC_ADMIN_UID;
  return uid === adminUid;
}

