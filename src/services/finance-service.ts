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
    const { data } = await apiClient.get<T>(url, { params });
    return (data ?? fallback) as T;
  } catch (err: any) {
    if (err?.response?.status === 404 || err?.code === 'ERR_NETWORK') return fallback;
    throw err;
  }
}

export const FinanceService = {
  getBranches: () => safeGet<Branch[]>(`${BASE}/branches`, []),
  getAccounts: () => safeGet<FinancialAccount[]>(`${BASE}/accounts`, []),
  getTransactions: () => safeGet<Transaction[]>(`${BASE}/transactions`, []),
  getBills: () => safeGet<RecurringBill[]>(`${BASE}/bills`, []),
  getPayroll: () => safeGet<PayrollEntry[]>(`${BASE}/payroll`, []),
  getApprovalLogs: () => safeGet<ApprovalLog[]>(`${BASE}/approvals/logs`, []),

  createTransaction: async (input: Omit<Transaction, 'id' | 'code'>): Promise<Transaction> => {
    const { data } = await apiClient.post<Transaction>(`${BASE}/transactions`, input);
    return data;
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

  getSummary: (branchId?: string) =>
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
      branchId ? { branchId } : undefined,
    ),

  getCashFlow: () => safeGet<CashFlowPoint[]>(`${BASE}/cashflow`, []),

  getBranchPerformance: () => safeGet<BranchPerformance[]>(`${BASE}/branch-performance`, []),
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
