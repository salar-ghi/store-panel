export type Currency = "IRR" | "USD" | "EUR";

export type TransactionType =
  | "sale"
  | "purchase"
  | "expense"
  | "salary"
  | "bill"
  | "refund"
  | "transfer"
  | "income_other"
  | "tax";

export type TransactionStatus = "pending" | "approved" | "completed" | "rejected" | "scheduled";

export type PaymentMethod = "cash" | "card" | "bank_transfer" | "online_gateway" | "cheque" | "wallet";

export type AccountType = "cash" | "bank" | "gateway" | "wallet" | "petty_cash";

export interface Branch {
  id: string;
  name: string;
  code: string;
  type: "supermarket" | "chain_store" | "online" | "warehouse";
  city?: string;
  manager?: string;
  isActive: boolean;
}

export interface FinancialAccount {
  id: string;
  name: string;
  type: AccountType;
  branchId?: string;
  currency: Currency;
  balance: number;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  code: string; // e.g. TX-2025-0001
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  accountId: string;
  branchId: string;
  category?: string;
  reference?: string; // order id, supplier id, etc.
  description?: string;
  counterparty?: string; // supplier / customer / employee name
  date: string; // ISO
  createdBy?: string;
  approvedBy?: string;
  isAutomated?: boolean;
  attachments?: string[];
}

export interface RecurringBill {
  id: string;
  name: string;
  category: "utility" | "rent" | "internet" | "tax" | "insurance" | "other";
  amount: number;
  currency: Currency;
  branchId: string;
  accountId: string;
  cycle: "monthly" | "quarterly" | "yearly" | "weekly";
  nextDueDate: string;
  autoPay: boolean;
  vendor?: string;
  isActive: boolean;
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  position?: string;
  branchId: string;
  baseSalary: number;
  bonus?: number;
  deductions?: number;
  netPay: number;
  currency: Currency;
  period: string; // e.g. "1404-02"
  status: "pending" | "paid" | "scheduled";
  paymentDate?: string;
  autoPay?: boolean;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  cashOnHand: number;
  pendingApprovals: number;
  scheduledPayments: number;
  branchCount: number;
  currency: Currency;
}

export interface BranchPerformance {
  branchId: string;
  branchName: string;
  income: number;
  expense: number;
  profit: number;
  orders: number;
}

export interface CashFlowPoint {
  date: string; // jalali label e.g. "۱۴۰۴/۰۲/۰۱"
  income: number;
  expense: number;
}
