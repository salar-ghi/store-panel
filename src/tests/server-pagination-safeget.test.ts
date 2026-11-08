import { describe, it, expect, vi, beforeEach } from 'bun:test';
import apiClient from '@/lib/api-client';
import { safeGet, FinanceService } from '@/services/finance-service';
import { UserService } from '@/services/user-service';
import { WarehouseService } from '@/services/warehouse-service';

describe('Server-side pagination and safeGet improvements', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('safeGet error logging and notification', () => {
    it('returns fallback and logs error on failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('Network error'));

      const result = await safeGet('/api/Finance/branches', [{ id: '1', name: 'Fallback Branch', code: 'FB', type: 'online', isActive: true }]);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Fallback Branch');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('returns normalized data when call succeeds', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: [{ id: 'branch-1', name: 'Tehran Central', code: 'TC', type: 'supermarket', isActive: true }],
      });

      const result = await FinanceService.getBranches();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Tehran Central');
    });
  });

  describe('FinanceService.getTransactions pagination', () => {
    it('passes pagination and filter parameters to API', async () => {
      let capturedConfig: any = null;
      vi.spyOn(apiClient, 'get').mockImplementationOnce(async (_url: string, config: any) => {
        capturedConfig = config;
        return {
          data: {
            items: [
              { id: 'tx-1', code: 'TX-001', type: 'sale', status: 'approved', amount: 50000, currency: 'IRR', method: 'card', accountId: 'acc1', branchId: 'b1', date: '2025-01-01' },
            ],
            totalCount: 42,
            pageIndex: 2,
            pageSize: 15,
          },
        };
      });

      const res = await FinanceService.getTransactions({
        pageIndex: 2,
        pageSize: 15,
        search: 'TX-001',
        sortBy: 'amount_desc',
        type: 'sale',
        status: 'approved',
        branchId: 'b1',
      });

      expect(capturedConfig?.params).toEqual({
        pageIndex: 2,
        pageSize: 15,
        search: 'TX-001',
        sortBy: 'amount_desc',
        type: 'sale',
        status: 'approved',
        branchId: 'b1',
      });
      expect(res.totalCount).toBe(42);
      expect(res.pageIndex).toBe(2);
      expect(res.pageSize).toBe(15);
      expect(res.items).toHaveLength(1);
    });

    it('handles plain array response fallback gracefully', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: [
          { id: 'tx-2', code: 'TX-002', type: 'expense', status: 'completed', amount: 20000, currency: 'IRR', method: 'cash', accountId: 'acc1', branchId: 'b1', date: '2025-01-01' },
        ],
      });

      const res = await FinanceService.getTransactions({ pageIndex: 1, pageSize: 10 });
      expect(res.items).toHaveLength(1);
      expect(res.totalCount).toBe(1);
      expect(res.pageIndex).toBe(1);
      expect(res.pageSize).toBe(10);
    });
  });

  describe('UserService.getPagedUsers', () => {
    it('passes pagination parameters and computes isAdmin', async () => {
      let capturedConfig: any = null;
      vi.spyOn(apiClient, 'get').mockImplementationOnce(async (_url: string, config: any) => {
        capturedConfig = config;
        return {
          data: {
            items: [
              { id: 'u1', username: 'admin_user', phoneNumber: '09120000000', roles: ['Manager'] },
              { id: 'u2', username: 'regular_user', phoneNumber: '09121111111', roles: ['User'] },
            ],
            totalCount: 100,
            pageIndex: 3,
            pageSize: 20,
          },
        };
      });

      const res = await UserService.getPagedUsers({
        pageIndex: 3,
        pageSize: 20,
        search: 'admin',
        sortBy: 'username_asc',
      });

      expect(capturedConfig?.params).toEqual({
        pageIndex: 3,
        pageSize: 20,
        search: 'admin',
        sortBy: 'username_asc',
      });
      expect(res.totalCount).toBe(100);
      expect(res.items[0].isAdmin).toBe(true);
      expect(res.items[1].isAdmin).toBe(false);
    });
  });

  describe('WarehouseService.getPaged', () => {
    it('sends pagination queries and returns paged result', async () => {
      let capturedConfig: any = null;
      vi.spyOn(apiClient, 'get').mockImplementationOnce(async (_url: string, config: any) => {
        capturedConfig = config;
        return {
          data: {
            items: [
              { id: 1, name: 'Warehouse A', address: 'Tehran', capacity: 5000, currentOccupancy: 200, isActive: true },
            ],
            totalCount: 15,
            pageIndex: 1,
            pageSize: 10,
          },
        };
      });

      const res = await WarehouseService.getPaged({
        pageIndex: 1,
        pageSize: 10,
        search: 'Warehouse A',
      });

      expect(capturedConfig?.params).toEqual({
        pageIndex: 1,
        pageSize: 10,
        search: 'Warehouse A',
      });
      expect(res.totalCount).toBe(15);
      expect(res.items).toHaveLength(1);
    });
  });
});
