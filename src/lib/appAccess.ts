const STORAGE_KEY = 'chez-verdi-access';

export const ACCESS_CODE = import.meta.env.VITE_APP_ACCESS_CODE?.trim() ?? '';

export function isAccessGateEnabled(): boolean {
  return ACCESS_CODE.length > 0;
}

export function hasStoredAccess(): boolean {
  if (!isAccessGateEnabled()) return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function grantAccess(code: string): boolean {
  if (!isAccessGateEnabled()) return true;
  if (code.trim() !== ACCESS_CODE) return false;
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Still allow entry for this session if storage is blocked.
  }
  return true;
}

export function revokeAccess(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
