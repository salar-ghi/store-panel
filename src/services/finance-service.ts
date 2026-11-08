// Finance service — talks to /api/Finance/* endpoints on the backend.
// Every read degrades gracefully with safeGet while notifying users on failure.

import apiClient from '@/lib/api-client';
import { safeGet, PagedResult, PaginationParams } from '@/lib/safe-api';
import {
  Branch,
  CashFlowPoint,
  FinanceSummary,
  FinancialAccount,
  PayrollEntry,
  RecurringBill,
  Transaction,
  BranchPerformance,
  ChartOfAccount,
} from '@/types/finance';

const BASE = '/api/Finance';

export interface ApprovalLog {
  transactionId: string;
  approver: string;
  action: 'approved' | 'rejected';
  note?: string;
  date: string;
}

export interface TransactionFilterParams extends PaginationParams {
  branchId?: string;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
}

export const FinanceService = {
  getBranches: () => safeGet<Branch[]>(`${BASE}/branches`, [], undefined, 'دریافت شعب ناموفق بود'),
  createBranch: async (branch: Omit<Branch, 'id'>): Promise<Branch> => {
    try {
      const { data } = await apiClient.post<Branch>(`${BASE}/branches`, branch);
      return data;
    } catch {
      return { id: `branch-${Date.now()}`, ...branch };
    }
  },

  getAccounts: (branchId?: string) =>
    safeGet<FinancialAccount[]>(
      `${BASE}/accounts`,
      [],
      branchId ? { branchId } : undefined,
      'دریافت حساب‌های مالی ناموفق بود'
    ),
  createAccount: async (acc: Omit<FinancialAccount, 'id'>): Promise<FinancialAccount> => {
    try {
      const { data } = await apiClient.post<FinancialAccount>(`${BASE}/accounts`, acc);
      return data;
    } catch {
      return { id: `acc-${Date.now()}`, ...acc };
    }
  },

  getChartOfAccounts: () =>
    safeGet<ChartOfAccount[]>(`${BASE}/chart-of-accounts`, [], undefined, 'دریافت سرفصل حساب‌ها ناموفق بود'),

  /** Returns all transactions (for reports, overview, and approval counters) */
  getAllTransactions: () =>
    safeGet<Transaction[]>(`${BASE}/transactions`, [], undefined, 'دریافت تراکنش‌ها ناموفق بود'),

  /** Supports paginated query with server filtering for large datasets */
  getTransactions: async (params?: TransactionFilterParams): Promise<PagedResult<Transaction>> => {
    const rawParams: Record<string, unknown> = {
      ...(params?.branchId && params.branchId !== 'all' ? { branchId: params.branchId } : {}),
      ...(params?.status && params.status !== 'all' ? { status: params.status } : {}),
      ...(params?.type && params.type !== 'all' ? { type: params.type } : {}),
      ...(params?.search ? { search: params.search } : {}),
      pageIndex: params?.pageIndex ?? 1,
      pageSize: params?.pageSize ?? 10,
    };

    const result = await safeGet<any>(`${BASE}/transactions`, [], rawParams, 'دریافت تراکنش‌های مالی ناموفق بود');

    if (Array.isArray(result)) {
      // Backend returned flat array — slice into paginated envelope
      const pageIndex = (params?.pageIndex ?? 1);
      const pageSize = (params?.pageSize ?? 10);
      const totalCount = result.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const start = (pageIndex - 1) * pageSize;
      const items = result.slice(start, start + pageSize);

      return {
        items,
        totalCount,
        pageIndex,
        pageSize,
        totalPages,
        hasPreviousPage: pageIndex > 1,
        hasNextPage: pageIndex < totalPages,
      };
    }

    if (result && Array.isArray(result.items)) {
      return result as PagedResult<Transaction>;
    }

    return {
      items: [],
      totalCount: 0,
      pageIndex: 1,
      pageSize: params?.pageSize ?? 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  },

  getBills: () => safeGet<RecurringBill[]>(`${BASE}/bills`, [], undefined, 'دریافت قبوض ناموفق بود'),
  createBill: async (bill: Omit<RecurringBill, 'id'>): Promise<RecurringBill> => {
    try {
      const { data } = await apiClient.post<RecurringBill>(`${BASE}/bills`, bill);
      return data;
    } catch {
      return { id: `bill-${Date.now()}`, ...bill };
    }
  },
  payBillManually: async (bill: RecurringBill): Promise<Transaction> => {
    const txData: Omit<Transaction, 'id' | 'code'> = {
      type: 'bill',
      status: 'completed',
      amount: bill.amount,
      currency: bill.currency,
      method: 'bank_transfer',
      accountId: bill.accountId,
      branchId: bill.branchId,
      category: 'قبوض',
      reference: bill.name,
      counterparty: bill.vendor || 'سازمان مربوطه',
      description: `پرداخت دستی قبض: ${bill.name}`,
      date: new Date().toISOString(),
    };
    return await FinanceService.createTransaction(txData);
  },

  getPayroll: () => safeGet<PayrollEntry[]>(`${BASE}/payroll`, [], undefined, 'دریافت لیست حقوق ناموفق بود'),
  createPayrollLine: async (line: Omit<PayrollEntry, 'id'>): Promise<PayrollEntry> => {
    try {
      const { data } = await apiClient.post<PayrollEntry>(`${BASE}/payroll`, line);
      return data;
    } catch {
      return { id: `pay-${Date.now()}`, ...line };
    }
  },
  payPayrollLine: async (line: PayrollEntry, accountId: string): Promise<Transaction> => {
    const txData: Omit<Transaction, 'id' | 'code'> = {
      type: 'salary',
      status: 'completed',
      amount: line.netPay,
      currency: line.currency,
      method: 'bank_transfer',
      accountId,
      branchId: line.branchId,
      category: 'حقوق و دستمزد',
      reference: `PR-${line.period}-${line.employeeId}`,
      counterparty: line.employeeName,
      description: `تسویه حقوق دوره ${line.period} برای ${line.employeeName}`,
      date: new Date().toISOString(),
    };
    return await FinanceService.createTransaction(txData);
  },

  getApprovalLogs: () =>
    safeGet<ApprovalLog[]>(`${BASE}/approvals/logs`, [], undefined, 'دریافت لاگ تاییدات ناموفق بود'),

  createTransaction: async (input: Omit<Transaction, 'id' | 'code'>): Promise<Transaction> => {
    try {
      const { data } = await apiClient.post<Transaction>(`${BASE}/transactions`, input);
      return data;
    } catch {
      return {
        id: `tx-${Date.now()}`,
        code: `TX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        ...input,
      };
    }
  },

  updateTransaction: async (id: string, patch: Partial<Transaction>): Promise<Transaction | null> => {
    try {
      const { data } = await apiClient.put<Transaction>(`${BASE}/transactions/${id}`, patch);
      return data;
    } catch {
      return null;
    }
  },

  approveTransaction: async (id: string, approver: string, note?: string): Promise<Transaction | null> => {
    try {
      const { data } = await apiClient.post<Transaction>(`${BASE}/transactions/${id}/approve`, { approver, note });
      return data;
    } catch {
      return null;
    }
  },

  rejectTransaction: async (id: string, approver: string, note?: string): Promise<Transaction | null> => {
    try {
      const { data } = await apiClient.post<Transaction>(`${BASE}/transactions/${id}/reject`, { approver, note });
      return data;
    } catch {
      return null;
    }
  },

  getSummary: (branchId?: string, from?: string, to?: string) =>
    safeGet<FinanceSummary>(
      `${BASE}/summary`,
      {
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0,
        cashOnHand: 0,
        pendingApprovals: 0,
        scheduledPayments: 0,
        branchCount: 0,
        currency: 'IRR',
      },
      {
        ...(branchId ? { branchId } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      },
      'دریافت خلاصه داشبورد مالی ناموفق بود'
    ),

  getCashFlow: (days = 14) =>
    safeGet<CashFlowPoint[]>(`${BASE}/cashflow`, [], { days }, 'دریافت جریان نقدینگی ناموفق بود'),

  getBranchPerformance: (from?: string, to?: string) =>
    safeGet<BranchPerformance[]>(
      `${BASE}/branch-performance`,
      [],
      {
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      },
      'دریافت عملکرد شعب ناموفق بود'
    ),
};

export const formatCurrency = (n: number, currency = 'IRR') => {
  if (currency === 'IRR') {
    return new Intl.NumberFormat('fa-IR').format(n) + ' ﷼';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
};

export const formatCompact = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
};
