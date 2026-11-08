import { describe, it, expect, vi, beforeEach } from 'bun:test';
import apiClient from '@/lib/api-client';
import { FinanceService } from '@/services/finance-service';
import {
  setToken,
  getToken,
  clearToken,
  isTokenValid,
  parseJwtExpiry,
  getTokenExpiry,
  msUntilExpiry,
} from '@/lib/token';

describe('Auth Lifecycle and Route Casing', () => {
  // Mock localStorage for test environment
  const mockStorage: Record<string, string> = {};
  beforeEach(() => {
    vi.restoreAllMocks();
    for (const key of Object.keys(mockStorage)) {
      delete mockStorage[key];
    }
    (globalThis as any).localStorage = {
      getItem: (k: string) => mockStorage[k] ?? null,
      setItem: (k: string, v: string) => { mockStorage[k] = String(v); },
      removeItem: (k: string) => { delete mockStorage[k]; },
      clear: () => {
        for (const k of Object.keys(mockStorage)) delete mockStorage[k];
      },
    };
    clearToken();
  });

  describe('Route Casing', () => {
    it('uses lowercase /api/finance endpoints in FinanceService', async () => {
      let requestedUrl = '';
      vi.spyOn(apiClient, 'get').mockImplementationOnce(async (url: string) => {
        requestedUrl = url;
        return { data: [] };
      });

      await FinanceService.getBranches();
      expect(requestedUrl).toBe('/api/finance/branches');
      expect(requestedUrl.includes('/api/Finance')).toBe(false);
    });

    it('uses lowercase /api/finance for summary and cashflow', async () => {
      let summaryUrl = '';
      vi.spyOn(apiClient, 'get').mockImplementationOnce(async (url: string) => {
        summaryUrl = url;
        return { data: {} };
      });

      await FinanceService.getSummary();
      expect(summaryUrl).toBe('/api/finance/summary');
    });
  });

  describe('apiClient Configuration', () => {
    it('has withCredentials enabled for HttpOnly cookie support', () => {
      expect(apiClient.defaults.withCredentials).toBe(true);
    });
  });

  describe('Token Helpers and JWT Expiry Parsing', () => {
    function createMockJwt(expSeconds: number): string {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ sub: '12345', exp: expSeconds, username: 'admin' }));
      const signature = 'mockSignature';
      return `${header}.${payload}.${signature}`;
    }

    it('extracts exp claim in milliseconds correctly from JWT', () => {
      const expSec = Math.floor(Date.now() / 1000) + 3600;
      const token = createMockJwt(expSec);

      const expMs = parseJwtExpiry(token);
      expect(expMs).toBe(expSec * 1000);
    });

    it('returns null for non-JWT or invalid format tokens', () => {
      expect(parseJwtExpiry('dev-token')).toBeNull();
      expect(parseJwtExpiry('not.a.valid.jwt.string')).toBeNull();
    });

    it('sets authoritative expiry from JWT exp claim', () => {
      const expSec = Math.floor(Date.now() / 1000) + 1200;
      const token = createMockJwt(expSec);

      setToken(token);
      expect(getToken()).toBe(token);
      expect(getTokenExpiry()).toBe(expSec * 1000);
      expect(isTokenValid()).toBe(true);
      expect(msUntilExpiry()).toBeGreaterThan(0);
    });

    it('detects expired JWT correctly', () => {
      const pastSec = Math.floor(Date.now() / 1000) - 60; // 1 minute ago
      const token = createMockJwt(pastSec);

      setToken(token);
      expect(isTokenValid()).toBe(false);
      expect(msUntilExpiry()).toBe(0);
    });
  });
});
