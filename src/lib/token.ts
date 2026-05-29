// Token lifecycle helpers — 3 hour validity
export const TOKEN_TTL_MS = 3 * 60 * 60 * 1000;
const TOKEN_KEY = 'auth-token';
const EXPIRY_KEY = 'auth-token-expiry';

export function setToken(token: string, ttlMs: number = TOKEN_TTL_MS) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRY_KEY, String(Date.now() + ttlMs));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getTokenExpiry(): number | null {
  const raw = localStorage.getItem(EXPIRY_KEY);
  if (!raw) return null;
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
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
}

export function msUntilExpiry(): number {
  const expiry = getTokenExpiry();
  if (!expiry) return 0;
  return Math.max(0, expiry - Date.now());
}
