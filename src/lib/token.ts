// Token lifecycle helpers — 3 hour validity
export const TOKEN_TTL_MS = 3 * 60 * 60 * 1000;
const TOKEN_KEY = 'auth-token';
const EXPIRY_KEY = 'auth-token-expiry';

/**
 * Safely extract expiry timestamp (in milliseconds) from a JWT token's 'exp' claim.
 * Returns null if token is malformed, not a JWT, or missing the exp claim.
 */
export function parseJwtExpiry(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    if (typeof parsed.exp === 'number') {
      return parsed.exp * 1000;
    }
    return null;
  } catch {
    return null;
  }
}

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    return (globalThis as any).localStorage;
  }
  return null;
}

export function setToken(token: string, ttlMs: number = TOKEN_TTL_MS) {
  const storage = getStorage();
  const jwtExpiry = parseJwtExpiry(token);
  const expiry = jwtExpiry ?? (Date.now() + ttlMs);
  if (storage) {
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(EXPIRY_KEY, String(expiry));
  }
}

export function getToken(): string | null {
  const storage = getStorage();
  return storage ? storage.getItem(TOKEN_KEY) : null;
}

export function getTokenExpiry(): number | null {
  const storage = getStorage();
  if (!storage) return null;
  const raw = storage.getItem(EXPIRY_KEY);
  if (!raw) {
    const token = getToken();
    if (token) {
      const exp = parseJwtExpiry(token);
      if (exp) {
        storage.setItem(EXPIRY_KEY, String(exp));
        return exp;
      }
    }
    return null;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) return false;
  const expiry = getTokenExpiry();
  // Legacy tokens without expiry — treat as expired to force re-login
  if (!expiry) return false;
  return Date.now() < expiry;
}

export function clearToken() {
  const storage = getStorage();
  if (storage) {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(EXPIRY_KEY);
  }
}

export function msUntilExpiry(): number {
  const expiry = getTokenExpiry();
  if (!expiry) return 0;
  return Math.max(0, expiry - Date.now());
}
