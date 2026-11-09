// Finance service — talks to /api/finance/* endpoints on the backend.
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

const BASE = '/api/finance';

export interface ApprovalLog {
  transactionId: string;
  approver: string;
  action: 'approved' | 'rejected';
  note?: string;
  date: string;
}

import { notifyApiError } from '@/lib/notify-error';

export async function safeGet<T>(url: string, fallback: T, params?: Record<string, unknown>): Promise<T> {
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
    console.error(`[finance] GET ${url} failed:`, err);
    notifyApiError(err, 'خطا در دریافت اطلاعات مالی از سرور');
    return fallback;
  }
}

export const FinanceService = {
  getBranches: () => safeGet<Branch[]>(`${BASE}/branches`, []),
  getAccounts: () => safeGet<FinancialAccount[]>(`${BASE}/accounts`, []),
  getTransactions: async (params?: {
    pageIndex?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    type?: string;
    status?: string;
    branchId?: string;
  }): Promise<{ items: Transaction[]; totalCount: number; pageIndex: number; pageSize: number }> => {
    const pageIndex = params?.pageIndex ?? 1;
    const pageSize = params?.pageSize ?? 10;
    try {
      const cleanParams: Record<string, unknown> = {};
      if (params?.pageIndex != null) cleanParams.pageIndex = params.pageIndex;
      if (params?.pageSize != null) cleanParams.pageSize = params.pageSize;
      if (params?.search) cleanParams.search = params.search;
      if (params?.sortBy) cleanParams.sortBy = params.sortBy;
      if (params?.type && params.type !== 'all') cleanParams.type = params.type;
      if (params?.status && params.status !== 'all') cleanParams.status = params.status;
      if (params?.branchId && params.branchId !== 'all') cleanParams.branchId = params.branchId;

      const { data } = await apiClient.get<any>(`${BASE}/transactions`, { params: cleanParams });
      if (data == null) {
        return { items: [], totalCount: 0, pageIndex, pageSize };
      }
      if (Array.isArray(data)) {
        return { items: data, totalCount: data.length, pageIndex, pageSize };
      }
      const items = data.items ?? data.data ?? data.result ?? data.value ?? [];
      const totalCount = data.totalCount ?? data.total ?? data.count ?? (Array.isArray(items) ? items.length : 0);
      return {
        items: Array.isArray(items) ? items : [],
        totalCount: typeof totalCount === 'number' ? totalCount : 0,
        pageIndex: data.pageIndex ?? pageIndex,
        pageSize: data.pageSize ?? pageSize,
      };
    } catch (err: any) {
      console.error(`[finance] GET ${BASE}/transactions failed:`, err);
      notifyApiError(err, 'خطا در دریافت تراکنش‌های مالی');
      return { items: [], totalCount: 0, pageIndex, pageSize };
    }
  },
  createBranch: async (input: Omit<Branch, 'id'>): Promise<Branch> => {
    const { data } = await apiClient.post<Branch>(`${BASE}/branches`, input);
    return data;
  },

  updateBranch: async (id: string, patch: Partial<Branch>): Promise<Branch | null> => {
    try {
      const { data } = await apiClient.put<Branch>(`${BASE}/branches/${id}`, patch);
      return data;
    } catch {
      return null;
    }
  },

  createAccount: async (input: Omit<FinancialAccount, 'id'>): Promise<FinancialAccount> => {
    const { data } = await apiClient.post<FinancialAccount>(`${BASE}/accounts`, input);
    return data;
  },

  getBills: () => safeGet<RecurringBill[]>(`${BASE}/bills`, []),

  createBill: async (input: Omit<RecurringBill, 'id'>): Promise<RecurringBill> => {
    const { data } = await apiClient.post<RecurringBill>(`${BASE}/bills`, input);
    return data;
  },

  updateBill: async (id: string, patch: Partial<RecurringBill>): Promise<RecurringBill | null> => {
    try {
      const { data } = await apiClient.put<RecurringBill>(`${BASE}/bills/${id}`, patch);
      return data;
    } catch {
      return null;
    }
  },

  toggleBillAutoPay: async (id: string, autoPay: boolean): Promise<RecurringBill | null> => {
    try {
      const { data } = await apiClient.patch<RecurringBill>(`${BASE}/bills/${id}/auto-pay`, { autoPay });
      return data;
    } catch {
      return null;
    }
  },

  payBill: async (id: string, input: { accountId: string; note?: string; paymentDate?: string }): Promise<{ success: boolean; transactionId?: string }> => {
    const { data } = await apiClient.post<{ success: boolean; transactionId?: string }>(`${BASE}/bills/${id}/pay`, input);
    return data;
  },

  getPayroll: () => safeGet<PayrollEntry[]>(`${BASE}/payroll`, []),

  createPayrollEntry: async (input: Omit<PayrollEntry, 'id'>): Promise<PayrollEntry> => {
    const { data } = await apiClient.post<PayrollEntry>(`${BASE}/payroll`, input);
    return data;
  },

  payPayrollEntry: async (id: string, input: { accountId: string; note?: string }): Promise<{ success: boolean; transactionId?: string }> => {
    const { data } = await apiClient.post<{ success: boolean; transactionId?: string }>(`${BASE}/payroll/${id}/pay`, input);
    return data;
  },

  runPayrollCycle: async (input: { period: string; branchId?: string; accountId: string }): Promise<{ success: boolean; processedCount: number; totalAmount: number }> => {
    const { data } = await apiClient.post<{ success: boolean; processedCount: number; totalAmount: number }>(`${BASE}/payroll/run-cycle`, input);
    return data;
  },
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

  // General Ledger, Double-Entry & Chart of Accounts
  getChartOfAccounts: () => safeGet<ChartOfAccount[]>(`${BASE}/chart-of-accounts`, []),

  createChartOfAccount: async (input: Omit<ChartOfAccount, 'id' | 'debit' | 'credit' | 'balance'>): Promise<ChartOfAccount> => {
    const { data } = await apiClient.post<ChartOfAccount>(`${BASE}/chart-of-accounts`, input);
    return data;
  },

  getCostCenters: () => safeGet<CostCenter[]>(`${BASE}/cost-centers`, []),

  createCostCenter: async (input: Omit<CostCenter, 'id'>): Promise<CostCenter> => {
    const { data } = await apiClient.post<CostCenter>(`${BASE}/cost-centers`, input);
    return data;
  },

  getJournalEntries: async (params?: {
    pageIndex?: number;
    pageSize?: number;
    search?: string;
    branchId?: string;
  }): Promise<{ items: JournalEntry[]; totalCount: number; pageIndex: number; pageSize: number }> => {
    const pageIndex = params?.pageIndex ?? 1;
    const pageSize = params?.pageSize ?? 20;
    try {
      const cleanParams: Record<string, unknown> = {};
      if (params?.pageIndex != null) cleanParams.pageIndex = params.pageIndex;
      if (params?.pageSize != null) cleanParams.pageSize = params.pageSize;
      if (params?.search) cleanParams.search = params.search;
      if (params?.branchId && params.branchId !== 'all') cleanParams.branchId = params.branchId;

      const { data } = await apiClient.get<any>(`${BASE}/journal-entries`, { params: cleanParams });
      if (data == null) {
        return { items: [], totalCount: 0, pageIndex, pageSize };
      }
      if (Array.isArray(data)) {
        return { items: data, totalCount: data.length, pageIndex, pageSize };
      }
      const items = data.items ?? data.data ?? data.result ?? data.value ?? [];
      const totalCount = data.totalCount ?? data.total ?? data.count ?? (Array.isArray(items) ? items.length : 0);
      return {
        items: Array.isArray(items) ? items : [],
        totalCount: typeof totalCount === 'number' ? totalCount : 0,
        pageIndex: data.pageIndex ?? pageIndex,
        pageSize: data.pageSize ?? pageSize,
      };
    } catch (err: any) {
      console.error(`[finance] GET ${BASE}/journal-entries failed:`, err);
      notifyApiError(err, 'خطا در دریافت اسناد حسابداری');
      return { items: [], totalCount: 0, pageIndex, pageSize };
    }
  },

  createJournalEntry: async (input: Omit<JournalEntry, 'id' | 'createdAt'>): Promise<JournalEntry> => {
    const { data } = await apiClient.post<JournalEntry>(`${BASE}/journal-entries`, input);
    return data;
  },

  getTrialBalance: (params?: { branchId?: string; from?: string; to?: string }) =>
    safeGet<TrialBalanceItem[]>(`${BASE}/trial-balance`, [], params as Record<string, unknown>),

  getSummary: (params?: { branchId?: string; from?: string; to?: string }) => {
    const query: Record<string, unknown> = {};
    if (params?.branchId && params.branchId !== 'all') query.branchId = params.branchId;
    if (params?.from) query.from = params.from;
    if (params?.to) query.to = params.to;

    return safeGet<FinanceSummary>(
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
      Object.keys(query).length > 0 ? query : undefined,
    );
  },

  getCashFlow: (params?: { branchId?: string; from?: string; to?: string }) => {
    const query: Record<string, unknown> = {};
    if (params?.branchId && params.branchId !== 'all') query.branchId = params.branchId;
    if (params?.from) query.from = params.from;
    if (params?.to) query.to = params.to;
    return safeGet<CashFlowPoint[]>(`${BASE}/cashflow`, [], Object.keys(query).length > 0 ? query : undefined);
  },

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
