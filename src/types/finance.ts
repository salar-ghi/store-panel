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
  accountNumber?: string;
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

// Enterprise Double-Entry & General Ledger
export type AccountNature = "asset" | "liability" | "equity" | "revenue" | "expense";
export type AccountLevel = "group" | "general" | "subsidiary" | "detail"; // گروه، کل، معین، تفصیلی

export interface ChartOfAccount {
  id: string;
  code: string; // e.g. "10101"
  name: string;
  nature: AccountNature;
  level: AccountLevel;
  parentId?: string | null;
  debit: number;
  credit: number;
  balance: number;
  isActive: boolean;
  children?: ChartOfAccount[];
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  branchId?: string;
  isActive: boolean;
}

export interface JournalEntryLine {
  id?: string;
  accountId: string;
  accountCode?: string;
  accountName?: string;
  costCenterId?: string;
  costCenterName?: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string; // سند شماره
  date: string; // ISO
  description: string;
  branchId?: string;
  status: "draft" | "posted" | "approved";
  totalDebit: number;
  totalCredit: number;
  lines: JournalEntryLine[];
  createdBy?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface TrialBalanceItem {
  accountCode: string;
  accountName: string;
  level: AccountLevel;
  nature: AccountNature;
  openingDebit: number;
  openingCredit: number;
  turnoverDebit: number; // گردش بدهکار
  turnoverCredit: number; // گردش بستانکار
  closingDebit: number; // مانده بدهکار
  closingCredit: number; // مانده بستانکار
}
