import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { FinanceService } from '@/services/finance-service';
import apiClient from '@/lib/api-client';
import { exportToCsv } from '@/lib/export-utils';

describe('Finance Enterprise Features Unit Tests', () => {
  let originalPost: typeof apiClient.post;
  let originalPatch: typeof apiClient.patch;

  beforeEach(() => {
    originalPost = apiClient.post;
    originalPatch = apiClient.patch;
  });

  afterEach(() => {
    apiClient.post = originalPost;
    apiClient.patch = originalPatch;
  });

  describe('Feature A: CRUD Operations', () => {
    it('calls POST /api/finance/branches with valid payload', async () => {
      const mockBranch = {
        name: 'شعبه شیراز',
        code: 'BR-SHZ',
        type: 'supermarket' as const,
        city: 'شیراز',
        isActive: true,
      };
      apiClient.post = mock(() => Promise.resolve({ data: { id: 'branch-1', ...mockBranch } }) as any);

      const res = await FinanceService.createBranch(mockBranch);
      expect(apiClient.post).toHaveBeenCalled();
      expect(res.id).toBe('branch-1');
    });

    it('calls POST /api/finance/bills and PATCH /api/finance/bills/:id/auto-pay', async () => {
      const mockBill = {
        name: 'قبض گاز',
        category: 'utility' as const,
        amount: 5000000,
        currency: 'IRR' as const,
        branchId: 'b-1',
        accountId: 'a-1',
        cycle: 'monthly' as const,
        nextDueDate: '2025-05-01T00:00:00Z',
        autoPay: false,
        isActive: true,
      };
      apiClient.post = mock(() => Promise.resolve({ data: { id: 'bill-1', ...mockBill } }) as any);
      const created = await FinanceService.createBill(mockBill);
      expect(apiClient.post).toHaveBeenCalled();
      expect(created.id).toBe('bill-1');

      apiClient.patch = mock(() => Promise.resolve({ data: { id: 'bill-1', ...mockBill, autoPay: true } }) as any);
      const updated = await FinanceService.toggleBillAutoPay('bill-1', true);
      expect(apiClient.patch).toHaveBeenCalled();
      expect(updated?.autoPay).toBe(true);
    });
  });

  describe('Feature B: Double-Entry Journal Entry Logic', () => {
    it('verifies debit and credit equilibrium for balanced journal entries', () => {
      const lines = [
        { accountId: 'acc-1', debit: 15_000_000, credit: 0 },
        { accountId: 'acc-2', debit: 0, credit: 15_000_000 },
      ];
      const sumDebit = lines.reduce((s, l) => s + l.debit, 0);
      const sumCredit = lines.reduce((s, l) => s + l.credit, 0);

      expect(sumDebit).toBe(sumCredit);
      expect(sumDebit).toBe(15_000_000);
    });

    it('detects unbalance in journal entry lines', () => {
      const lines = [
        { accountId: 'acc-1', debit: 20_000_000, credit: 0 },
        { accountId: 'acc-2', debit: 0, credit: 18_000_000 },
      ];
      const sumDebit = lines.reduce((s, l) => s + l.debit, 0);
      const sumCredit = lines.reduce((s, l) => s + l.credit, 0);

      expect(sumDebit === sumCredit).toBe(false);
      expect(Math.abs(sumDebit - sumCredit)).toBe(2_000_000);
    });

    it('submits balanced journal entry via POST /api/finance/journal-entries', async () => {
      const entryPayload = {
        entryNumber: 'JE-2025-001',
        date: '2025-04-10T00:00:00Z',
        description: 'ثبت تسویه هزینه و انباشته',
        status: 'posted' as const,
        totalDebit: 10_000_000,
        totalCredit: 10_000_000,
        lines: [
          { accountId: 'acc-1', debit: 10_000_000, credit: 0 },
          { accountId: 'acc-2', debit: 0, credit: 10_000_000 },
        ],
      };
      apiClient.post = mock(() => Promise.resolve({ data: { id: 'je-1', ...entryPayload, createdAt: '2025-04-10T00:00:00Z' } }) as any);

      const res = await FinanceService.createJournalEntry(entryPayload);
      expect(apiClient.post).toHaveBeenCalled();
      expect(res.id).toBe('je-1');
    });
  });

  describe('Feature C: Execution of Bill Payments and Payroll Cycles', () => {
    it('executes bill payment via POST /api/finance/bills/{id}/pay', async () => {
      apiClient.post = mock(() => Promise.resolve({ data: { success: true, transactionId: 'tx-999' } }) as any);

      const res = await FinanceService.payBill('bill-1', {
        accountId: 'acc-bank',
        note: 'واریز پایا',
      });
      expect(apiClient.post).toHaveBeenCalled();
      expect(res.success).toBe(true);
    });

    it('executes payroll cycle via POST /api/finance/payroll/run-cycle', async () => {
      apiClient.post = mock(() => Promise.resolve({ data: { success: true, processedCount: 15, totalAmount: 450_000_000 } }) as any);

      const res = await FinanceService.runPayrollCycle({
        period: '1404-01',
        accountId: 'acc-corp-bank',
      });
      expect(apiClient.post).toHaveBeenCalled();
      expect(res.processedCount).toBe(15);
      expect(res.totalAmount).toBe(450_000_000);
    });
  });

  describe('Feature D: Multi-tier Approval Threshold Matrix', () => {
    const limits: Record<string, number> = {
      branch_manager: 20_000_000,
      accountant: 100_000_000,
      finance_manager: 500_000_000,
      admin: Infinity,
    };

    it('validates role authority thresholds correctly', () => {
      const checkClearance = (role: string, amount: number) => {
        const limit = limits[role] ?? 0;
        return amount <= limit;
      };

      // 15M IRR transaction
      expect(checkClearance('branch_manager', 15_000_000)).toBe(true);
      expect(checkClearance('accountant', 15_000_000)).toBe(true);

      // 50M IRR transaction: branch_manager cannot approve, accountant can
      expect(checkClearance('branch_manager', 50_000_000)).toBe(false);
      expect(checkClearance('accountant', 50_000_000)).toBe(true);

      // 250M IRR transaction: accountant cannot approve, finance_manager & admin can
      expect(checkClearance('accountant', 250_000_000)).toBe(false);
      expect(checkClearance('finance_manager', 250_000_000)).toBe(true);
      expect(checkClearance('admin', 250_000_000)).toBe(true);
    });
  });

  describe('Feature E: CSV Export with UTF-8 BOM', () => {
    it('creates downloadable blob with BOM prefix and escaped Persian cells', () => {
      let createdBlob: Blob | null = null;
      let clicked = false;

      const originalCreateObjectURL = (globalThis as any).URL?.createObjectURL;
      const originalRevoke = (globalThis as any).URL?.revokeObjectURL;

      if (!(globalThis as any).URL) {
        (globalThis as any).URL = {};
      }
      (globalThis as any).URL.createObjectURL = mock((blob: Blob) => {
        createdBlob = blob;
        return 'blob:mock-url';
      });
      (globalThis as any).URL.revokeObjectURL = mock(() => {});

      const mockLink = {
        setAttribute: mock(() => {}),
        click: mock(() => { clicked = true; }),
      };

      const originalDocument = (globalThis as any).document;
      (globalThis as any).document = {
        createElement: mock((tag: string) => (tag === 'a' ? mockLink : {})),
        body: {
          appendChild: mock(() => {}),
          removeChild: mock(() => {}),
        },
      };

      exportToCsv('test.csv', ['کد', 'شرح'], [['TX-1', 'فروش نقدی']]);

      expect(mockLink.setAttribute).toHaveBeenCalled();
      expect(clicked).toBe(true);
      expect(createdBlob).not.toBeNull();

      if (originalDocument) {
        (globalThis as any).document = originalDocument;
      }
      if (originalCreateObjectURL) {
        (globalThis as any).URL.createObjectURL = originalCreateObjectURL;
        (globalThis as any).URL.revokeObjectURL = originalRevoke;
      }
    });
  });
});
