import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { FinanceService, ApprovalLog } from "@/services/finance-service";
import {
  Branch,
  CashFlowPoint,
  FinanceSummary,
  FinancialAccount,
  PayrollEntry,
  RecurringBill,
  Transaction,
  BranchPerformance,
} from "@/types/finance";

export interface TransactionQueryParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  type?: string;
  status?: string;
  branchId?: string;
}

export interface FinanceOverviewFilterParams {
  branchId?: string;
  from?: string;
  to?: string;
}

export const financeKeys = {
  all: ["finance"] as const,
  branches: () => [...financeKeys.all, "branches"] as const,
  accounts: () => [...financeKeys.all, "accounts"] as const,
  summary: (params?: FinanceOverviewFilterParams) => [...financeKeys.all, "summary", params ?? {}] as const,
  transactions: (params?: TransactionQueryParams) => [...financeKeys.all, "transactions", params ?? {}] as const,
  bills: () => [...financeKeys.all, "bills"] as const,
  payroll: () => [...financeKeys.all, "payroll"] as const,
  approvalLogs: () => [...financeKeys.all, "approvalLogs"] as const,
  chartOfAccounts: () => [...financeKeys.all, "chartOfAccounts"] as const,
  costCenters: () => [...financeKeys.all, "costCenters"] as const,
  journalEntries: (params?: Record<string, unknown>) => [...financeKeys.all, "journalEntries", params ?? {}] as const,
  trialBalance: (params?: Record<string, unknown>) => [...financeKeys.all, "trialBalance", params ?? {}] as const,
  cashFlow: (params?: FinanceOverviewFilterParams) => [...financeKeys.all, "cashFlow", params ?? {}] as const,
  branchPerformance: () => [...financeKeys.all, "branchPerformance"] as const,
};

export function useFinanceBranches() {
  return useQuery<Branch[]>({
    queryKey: financeKeys.branches(),
    queryFn: () => FinanceService.getBranches(),
  });
}

export function useFinanceAccounts() {
  return useQuery<FinancialAccount[]>({
    queryKey: financeKeys.accounts(),
    queryFn: () => FinanceService.getAccounts(),
  });
}

export function useFinanceSummary(params?: FinanceOverviewFilterParams | string) {
  const normalizedParams: FinanceOverviewFilterParams | undefined =
    typeof params === "string"
      ? { branchId: params === "all" ? undefined : params }
      : params
      ? {
          ...params,
          branchId: params.branchId === "all" ? undefined : params.branchId,
        }
      : undefined;

  return useQuery<FinanceSummary>({
    queryKey: financeKeys.summary(normalizedParams),
    queryFn: () => FinanceService.getSummary(normalizedParams),
  });
}

export function useFinanceCashFlow(params?: FinanceOverviewFilterParams) {
  const normalizedParams: FinanceOverviewFilterParams | undefined = params
    ? {
        ...params,
        branchId: params.branchId === "all" ? undefined : params.branchId,
      }
    : undefined;

  return useQuery<CashFlowPoint[]>({
    queryKey: financeKeys.cashFlow(normalizedParams),
    queryFn: () => FinanceService.getCashFlow(normalizedParams),
  });
}

export function useFinanceTransactions(params?: TransactionQueryParams) {
  return useQuery<{ items: Transaction[]; totalCount: number; pageIndex: number; pageSize: number }>({
    queryKey: financeKeys.transactions(params),
    queryFn: () => FinanceService.getTransactions(params),
  });
}

export function useFinanceChartOfAccounts() {
  return useQuery({
    queryKey: financeKeys.chartOfAccounts(),
    queryFn: () => FinanceService.getChartOfAccounts(),
  });
}

export function useFinanceCostCenters() {
  return useQuery({
    queryKey: financeKeys.costCenters(),
    queryFn: () => FinanceService.getCostCenters(),
  });
}

export function useFinanceJournalEntries(params?: {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  branchId?: string;
}) {
  return useQuery({
    queryKey: financeKeys.journalEntries(params),
    queryFn: () => FinanceService.getJournalEntries(params),
  });
}

export function useFinanceTrialBalance(params?: { branchId?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: financeKeys.trialBalance(params),
    queryFn: () => FinanceService.getTrialBalance(params),
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof FinanceService.createJournalEntry>[0]) =>
      FinanceService.createJournalEntry(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...financeKeys.all, "journalEntries"] });
      queryClient.invalidateQueries({ queryKey: [...financeKeys.all, "chartOfAccounts"] });
      queryClient.invalidateQueries({ queryKey: [...financeKeys.all, "trialBalance"] });
      queryClient.invalidateQueries({ queryKey: [...financeKeys.all, "summary"] });
    },
  });
}

export function usePayBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accountId, note, paymentDate }: { id: string; accountId: string; note?: string; paymentDate?: string }) =>
      FinanceService.payBill(id, { accountId, note, paymentDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.bills() });
      invalidateFinanceTransactions(queryClient);
    },
  });
}

export function useCreatePayrollEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<PayrollEntry, "id">) => FinanceService.createPayrollEntry(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.payroll() });
      queryClient.invalidateQueries({ queryKey: [...financeKeys.all, "summary"] });
    },
  });
}

export function usePayPayrollEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accountId, note }: { id: string; accountId: string; note?: string }) =>
      FinanceService.payPayrollEntry(id, { accountId, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.payroll() });
      invalidateFinanceTransactions(queryClient);
    },
  });
}

export function useRunPayrollCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { period: string; branchId?: string; accountId: string }) =>
      FinanceService.runPayrollCycle(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.payroll() });
      invalidateFinanceTransactions(queryClient);
    },
  });
}

export function useCreateChartOfAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof FinanceService.createChartOfAccount>[0]) =>
      FinanceService.createChartOfAccount(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.chartOfAccounts() });
      queryClient.invalidateQueries({ queryKey: [...financeKeys.all, "trialBalance"] });
    },
  });
}

export function useFinanceBills() {
  return useQuery<RecurringBill[]>({
    queryKey: financeKeys.bills(),
    queryFn: () => FinanceService.getBills(),
  });
}

export function useFinancePayroll() {
  return useQuery<PayrollEntry[]>({
    queryKey: financeKeys.payroll(),
    queryFn: () => FinanceService.getPayroll(),
  });
}

export function useFinanceApprovalLogs() {
  return useQuery<ApprovalLog[]>({
    queryKey: financeKeys.approvalLogs(),
    queryFn: () => FinanceService.getApprovalLogs(),
  });
}


export function useFinanceBranchPerformance() {
  return useQuery<BranchPerformance[]>({
    queryKey: financeKeys.branchPerformance(),
    queryFn: () => FinanceService.getBranchPerformance(),
  });
}

// Invalidation helper
export function invalidateFinanceTransactions(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [...financeKeys.all, "transactions"] });
  queryClient.invalidateQueries({ queryKey: [...financeKeys.all, "summary"] });
  queryClient.invalidateQueries({ queryKey: financeKeys.cashFlow() });
  queryClient.invalidateQueries({ queryKey: financeKeys.branchPerformance() });
  queryClient.invalidateQueries({ queryKey: financeKeys.approvalLogs() });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Branch, "id">) => FinanceService.createBranch(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.branches() });
      queryClient.invalidateQueries({ queryKey: [...financeKeys.all, "summary"] });
      queryClient.invalidateQueries({ queryKey: financeKeys.branchPerformance() });
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Branch> }) =>
      FinanceService.updateBranch(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.branches() });
    },
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<FinancialAccount, "id">) => FinanceService.createAccount(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: [...financeKeys.all, "summary"] });
    },
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<RecurringBill, "id">) => FinanceService.createBill(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.bills() });
      queryClient.invalidateQueries({ queryKey: [...financeKeys.all, "summary"] });
    },
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<RecurringBill> }) =>
      FinanceService.updateBill(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.bills() });
      queryClient.invalidateQueries({ queryKey: [...financeKeys.all, "summary"] });
    },
  });
}

export function useToggleBillAutoPay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, autoPay }: { id: string; autoPay: boolean }) =>
      FinanceService.toggleBillAutoPay(id, autoPay),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.bills() });
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Transaction, "id" | "code">) => FinanceService.createTransaction(input),
    onSuccess: () => {
      invalidateFinanceTransactions(queryClient);
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Transaction> }) =>
      FinanceService.updateTransaction(id, patch),
    onSuccess: () => {
      invalidateFinanceTransactions(queryClient);
    },
  });
}

export function useApproveTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approver, note }: { id: string; approver: string; note?: string }) =>
      FinanceService.approveTransaction(id, approver, note),
    onSuccess: () => {
      invalidateFinanceTransactions(queryClient);
    },
  });
}

export function useRejectTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approver, note }: { id: string; approver: string; note?: string }) =>
      FinanceService.rejectTransaction(id, approver, note),
    onSuccess: () => {
      invalidateFinanceTransactions(queryClient);
    },
  });
}
