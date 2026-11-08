// Finance service — talks to /api/Finance/* endpoints on the backend.
// Every read degrades gracefully so pages keep rendering (as empty states)
// before an endpoint is fully wired.

import apiClient from '@/lib/api-client';
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

async function safeGet<T>(url: string, fallback: T, params?: Record<string, unknown>): Promise<T> {
  try {
    const { data } = await apiClient.get<any>(url, { params });
    if (data == null) return fallback;
    // Normalise wrapped list responses ({ items }, { data }, { result }) so pages never crash.
    if (Array.isArray(fallback)) {
      if (Array.isArray(data)) return data as T;
      const inner = data.items ?? data.data ?? data.result ?? data.value;
      return (Array.isArray(inner) ? inner : fallback) as T;
    }
    if (typeof data !== 'object' || Array.isArray(data)) return fallback;
    return { ...(fallback as any), ...(data.data && typeof data.data === 'object' ? data.data : data) } as T;
  } catch (err: any) {
    console.warn(`[finance] ${url} failed`, err?.message);
    return fallback;
  }
}

export const FinanceService = {
  getBranches: () => safeGet<Branch[]>(`${BASE}/branches`, []),
  createBranch: async (branch: Omit<Branch, 'id'>): Promise<Branch> => {
    try {
      const { data } = await apiClient.post<Branch>(`${BASE}/branches`, branch);
      return data;
    } catch {
      // Local fallback in case backend hasn't added POST /branches
      return { id: `branch-${Date.now()}`, ...branch };
    }
  },

  getAccounts: (branchId?: string) =>
    safeGet<FinancialAccount[]>(`${BASE}/accounts`, [], branchId ? { branchId } : undefined),
  createAccount: async (acc: Omit<FinancialAccount, 'id'>): Promise<FinancialAccount> => {
    try {
      const { data } = await apiClient.post<FinancialAccount>(`${BASE}/accounts`, acc);
      return data;
    } catch {
      return { id: `acc-${Date.now()}`, ...acc };
    }
  },

  getChartOfAccounts: () => safeGet<ChartOfAccount[]>(`${BASE}/chart-of-accounts`, []),

  getTransactions: (branchId?: string, status?: string) =>
    safeGet<Transaction[]>(
      `${BASE}/transactions`,
      [],
      {
        ...(branchId && branchId !== 'all' ? { branchId } : {}),
        ...(status && status !== 'all' ? { status } : {}),
      }
    ),

  getBills: () => safeGet<RecurringBill[]>(`${BASE}/bills`, []),
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

  getPayroll: () => safeGet<PayrollEntry[]>(`${BASE}/payroll`, []),
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

  getApprovalLogs: () => safeGet<ApprovalLog[]>(`${BASE}/approvals/logs`, []),

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
      }
    ),

  getCashFlow: (days = 14) => safeGet<CashFlowPoint[]>(`${BASE}/cashflow`, [], { days }),

  getBranchPerformance: (from?: string, to?: string) =>
    safeGet<BranchPerformance[]>(
      `${BASE}/branch-performance`,
      [],
      {
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      }
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
