import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FinanceService } from "@/services/finance-service";
import {
  financeKeys,
} from "@/hooks/use-finance";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children),
  };
}

describe("Finance React Query hooks", () => {
  let originalGetBranches: typeof FinanceService.getBranches;
  let originalGetSummary: typeof FinanceService.getSummary;
  let originalGetTransactions: typeof FinanceService.getTransactions;
  let originalCreateTransaction: typeof FinanceService.createTransaction;
  let originalApproveTransaction: typeof FinanceService.approveTransaction;
  let originalRejectTransaction: typeof FinanceService.rejectTransaction;

  beforeEach(() => {
    originalGetBranches = FinanceService.getBranches;
    originalGetSummary = FinanceService.getSummary;
    originalGetTransactions = FinanceService.getTransactions;
    originalCreateTransaction = FinanceService.createTransaction;
    originalApproveTransaction = FinanceService.approveTransaction;
    originalRejectTransaction = FinanceService.rejectTransaction;
  });

  afterEach(() => {
    FinanceService.getBranches = originalGetBranches;
    FinanceService.getSummary = originalGetSummary;
    FinanceService.getTransactions = originalGetTransactions;
    FinanceService.createTransaction = originalCreateTransaction;
    FinanceService.approveTransaction = originalApproveTransaction;
    FinanceService.rejectTransaction = originalRejectTransaction;
  });

  it("queries branches using React Query client", async () => {
    const mockBranches = [
      { id: "b1", name: "شعبه مرکزی", city: "تهران", address: "خیابان ولیعصر", manager: "مدیر", phone: "123", type: "supermarket" as const },
    ];
    FinanceService.getBranches = mock(() => Promise.resolve(mockBranches));

    const { queryClient } = createWrapper();
    const data = await queryClient.fetchQuery({
      queryKey: financeKeys.branches(),
      queryFn: () => FinanceService.getBranches(),
    });

    expect(data).toEqual(mockBranches);
    expect(FinanceService.getBranches).toHaveBeenCalled();
  });

  it("invalidates transactions and summary on useCreateTransaction", async () => {
    const { queryClient } = createWrapper();
    const invalidateSpy = mock((_args?: any) => Promise.resolve());
    queryClient.invalidateQueries = invalidateSpy as any;

    const mockCreated = {
      id: "tx-new",
      code: "TX-999",
      type: "sale" as const,
      amount: 500000,
      currency: "IRR" as const,
      date: new Date().toISOString(),
      method: "cash" as const,
      status: "completed" as const,
      branchId: "b1",
      accountId: "a1",
      createdBy: "کاربر تست",
    };
    FinanceService.createTransaction = mock(() => Promise.resolve(mockCreated));

    const mutationFn = (input: any) => FinanceService.createTransaction(input);
    const result = await mutationFn(mockCreated);
    expect(result).toEqual(mockCreated);

    const { invalidateFinanceTransactions } = await import("@/hooks/use-finance");
    invalidateFinanceTransactions(queryClient);

    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("invalidates transactions on approve and reject mutations", async () => {
    const { queryClient } = createWrapper();
    const invalidateSpy = mock((_args?: any) => Promise.resolve());
    queryClient.invalidateQueries = invalidateSpy as any;

    FinanceService.approveTransaction = mock(() => Promise.resolve({ id: "tx-1" } as any));
    FinanceService.rejectTransaction = mock(() => Promise.resolve({ id: "tx-1" } as any));

    await FinanceService.approveTransaction("tx-1", "مدیر");
    const { invalidateFinanceTransactions } = await import("@/hooks/use-finance");
    invalidateFinanceTransactions(queryClient);
    expect(invalidateSpy).toHaveBeenCalled();

    invalidateSpy.mockClear();
    await FinanceService.rejectTransaction("tx-1", "مدیر");
    invalidateFinanceTransactions(queryClient);
    expect(invalidateSpy).toHaveBeenCalled();
  });
});
