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

export const financeKeys = {
  all: ["finance"] as const,
  branches: () => [...financeKeys.all, "branches"] as const,
  accounts: () => [...financeKeys.all, "accounts"] as const,
  summary: (branchId?: string) => [...financeKeys.all, "summary", branchId ?? "all"] as const,
  transactions: (params?: TransactionQueryParams) => [...financeKeys.all, "transactions", params ?? {}] as const,
  bills: () => [...financeKeys.all, "bills"] as const,
  payroll: () => [...financeKeys.all, "payroll"] as const,
  approvalLogs: () => [...financeKeys.all, "approvalLogs"] as const,
  cashFlow: () => [...financeKeys.all, "cashFlow"] as const,
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

export function useFinanceSummary(branchId?: string) {
  const normalizedBranchId = !branchId || branchId === "all" ? undefined : branchId;
  return useQuery<FinanceSummary>({
    queryKey: financeKeys.summary(normalizedBranchId),
    queryFn: () => FinanceService.getSummary(normalizedBranchId),
  });
}

export function useFinanceTransactions(params?: TransactionQueryParams) {
  return useQuery<{ items: Transaction[]; totalCount: number; pageIndex: number; pageSize: number }>({
    queryKey: financeKeys.transactions(params),
    queryFn: () => FinanceService.getTransactions(params),
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

export function useFinanceCashFlow() {
  return useQuery<CashFlowPoint[]>({
    queryKey: financeKeys.cashFlow(),
    queryFn: () => FinanceService.getCashFlow(),
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
