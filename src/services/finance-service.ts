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

// ----- Mock data -----
const branches: Branch[] = [
  { id: "br-1", name: "شعبه مرکزی", code: "MAIN", type: "supermarket", city: "تهران", manager: "علی رضایی", isActive: true },
  { id: "br-2", name: "شعبه ونک", code: "VNK", type: "chain_store", city: "تهران", manager: "زهرا کریمی", isActive: true },
  { id: "br-3", name: "شعبه اصفهان", code: "ISF", type: "chain_store", city: "اصفهان", manager: "مهدی صادقی", isActive: true },
  { id: "br-4", name: "انبار آنلاین", code: "ECOM", type: "online", city: "تهران", manager: "نرگس احمدی", isActive: true },
];

const accounts: FinancialAccount[] = [
  { id: "ac-1", name: "صندوق نقدی مرکزی", type: "cash", branchId: "br-1", currency: "IRR", balance: 245_000_000, isActive: true },
  { id: "ac-2", name: "حساب بانک ملت", type: "bank", branchId: "br-1", currency: "IRR", balance: 1_820_500_000, isActive: true },
  { id: "ac-3", name: "درگاه پرداخت زرین‌پال", type: "gateway", branchId: "br-4", currency: "IRR", balance: 612_400_000, isActive: true },
  { id: "ac-4", name: "تنخواه شعبه ونک", type: "petty_cash", branchId: "br-2", currency: "IRR", balance: 18_500_000, isActive: true },
  { id: "ac-5", name: "کیف پول دیجیتال", type: "wallet", branchId: "br-4", currency: "IRR", balance: 92_000_000, isActive: true },
];

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);
const types: Transaction["type"][] = ["sale", "purchase", "expense", "salary", "bill", "refund"];
const methods: Transaction["method"][] = ["cash", "card", "bank_transfer", "online_gateway"];
const statuses: Transaction["status"][] = ["completed", "completed", "completed", "pending", "scheduled", "approved"];

const counterparties = ["شرکت کوکاکولا", "تامین‌کننده مینو", "مشتری آنلاین", "علی محمدی", "اداره برق", "شرکت همراه اول", "بیمه ایران"];
const categories = ["خوراکی", "نوشیدنی", "بهداشتی", "قبوض", "حقوق", "حمل و نقل", "بازاریابی"];

const transactions: Transaction[] = Array.from({ length: 40 }).map((_, i) => {
  const type = types[i % types.length];
  const isIncome = type === "sale" || type === "refund";
  const amount = rand(500_000, 250_000_000);
  const date = new Date(Date.now() - i * 86400000 * 0.6).toISOString();
  return {
    id: `tx-${i + 1}`,
    code: `TX-1404-${String(1000 + i)}`,
    type,
    status: statuses[i % statuses.length],
    amount,
    currency: "IRR",
    method: methods[i % methods.length],
    accountId: accounts[i % accounts.length].id,
    branchId: branches[i % branches.length].id,
    category: categories[i % categories.length],
    counterparty: counterparties[i % counterparties.length],
    description: isIncome ? "فروش / بازگشت وجه" : "خرید یا پرداخت",
    date,
    isAutomated: i % 3 === 0,
    reference: `REF-${rand(1000, 9999)}`,
  };
});

const bills: RecurringBill[] = [
  { id: "bl-1", name: "قبض برق شعبه مرکزی", category: "utility", amount: 12_500_000, currency: "IRR", branchId: "br-1", accountId: "ac-2", cycle: "monthly", nextDueDate: new Date(Date.now() + 5 * 86400000).toISOString(), autoPay: true, vendor: "اداره برق", isActive: true },
  { id: "bl-2", name: "اجاره فروشگاه ونک", category: "rent", amount: 85_000_000, currency: "IRR", branchId: "br-2", accountId: "ac-2", cycle: "monthly", nextDueDate: new Date(Date.now() + 12 * 86400000).toISOString(), autoPay: false, vendor: "موجر", isActive: true },
  { id: "bl-3", name: "اینترنت اختصاصی انبار", category: "internet", amount: 4_200_000, currency: "IRR", branchId: "br-4", accountId: "ac-2", cycle: "monthly", nextDueDate: new Date(Date.now() + 2 * 86400000).toISOString(), autoPay: true, vendor: "شاتل", isActive: true },
  { id: "bl-4", name: "بیمه مسئولیت", category: "insurance", amount: 28_000_000, currency: "IRR", branchId: "br-1", accountId: "ac-2", cycle: "quarterly", nextDueDate: new Date(Date.now() + 22 * 86400000).toISOString(), autoPay: false, vendor: "بیمه ایران", isActive: true },
  { id: "bl-5", name: "مالیات بر ارزش افزوده", category: "tax", amount: 145_000_000, currency: "IRR", branchId: "br-1", accountId: "ac-2", cycle: "quarterly", nextDueDate: new Date(Date.now() + 30 * 86400000).toISOString(), autoPay: false, vendor: "سازمان امور مالیاتی", isActive: true },
];

const payroll: PayrollEntry[] = [
  { id: "pr-1", employeeId: "emp-1", employeeName: "علی رضایی", position: "مدیر شعبه", branchId: "br-1", baseSalary: 95_000_000, bonus: 8_000_000, deductions: 5_000_000, netPay: 98_000_000, currency: "IRR", period: "1404-02", status: "scheduled", autoPay: true },
  { id: "pr-2", employeeId: "emp-2", employeeName: "زهرا کریمی", position: "مدیر شعبه", branchId: "br-2", baseSalary: 88_000_000, bonus: 5_000_000, deductions: 4_000_000, netPay: 89_000_000, currency: "IRR", period: "1404-02", status: "pending", autoPay: false },
  { id: "pr-3", employeeId: "emp-3", employeeName: "مهدی صادقی", position: "مدیر شعبه", branchId: "br-3", baseSalary: 82_000_000, bonus: 4_000_000, deductions: 3_500_000, netPay: 82_500_000, currency: "IRR", period: "1404-02", status: "paid", paymentDate: new Date().toISOString(), autoPay: true },
  { id: "pr-4", employeeId: "emp-4", employeeName: "نرگس احمدی", position: "سرپرست انبار", branchId: "br-4", baseSalary: 72_000_000, bonus: 6_000_000, deductions: 3_000_000, netPay: 75_000_000, currency: "IRR", period: "1404-02", status: "scheduled", autoPay: true },
  { id: "pr-5", employeeId: "emp-5", employeeName: "حسین نوری", position: "صندوق‌دار", branchId: "br-1", baseSalary: 38_000_000, bonus: 1_500_000, deductions: 2_000_000, netPay: 37_500_000, currency: "IRR", period: "1404-02", status: "pending", autoPay: false },
  { id: "pr-6", employeeId: "emp-6", employeeName: "سارا محمدی", position: "بسته‌بند", branchId: "br-4", baseSalary: 32_000_000, bonus: 2_000_000, deductions: 1_500_000, netPay: 32_500_000, currency: "IRR", period: "1404-02", status: "scheduled", autoPay: true },
];

// ----- API -----
const delay = <T>(data: T, ms = 200) => new Promise<T>((res) => setTimeout(() => res(data), ms));

// Approval audit log
export interface ApprovalLog {
  transactionId: string;
  approver: string;
  action: "approved" | "rejected";
  note?: string;
  date: string;
}
const approvalLogs: ApprovalLog[] = [];

export const FinanceService = {
  getBranches: () => delay(branches),
  getAccounts: () => delay(accounts),
  getTransactions: () => delay([...transactions]),
  getBills: () => delay(bills),
  getPayroll: () => delay(payroll),
  getApprovalLogs: () => delay([...approvalLogs]),

  createTransaction: async (input: Omit<Transaction, "id" | "code">): Promise<Transaction> => {
    const tx: Transaction = {
      ...input,
      id: `tx-${transactions.length + 1}-${Date.now()}`,
      code: `TX-1404-${String(2000 + transactions.length)}`,
    };
    transactions.unshift(tx);
    return delay(tx, 150);
  },

  updateTransaction: async (id: string, patch: Partial<Transaction>): Promise<Transaction | null> => {
    const idx = transactions.findIndex((t) => t.id === id);
    if (idx === -1) return delay(null);
    transactions[idx] = { ...transactions[idx], ...patch };
    return delay(transactions[idx], 120);
  },

  approveTransaction: async (id: string, approver: string, note?: string): Promise<Transaction | null> => {
    const idx = transactions.findIndex((t) => t.id === id);
    if (idx === -1) return delay(null);
    transactions[idx] = { ...transactions[idx], status: "completed", approvedBy: approver };
    approvalLogs.unshift({ transactionId: id, approver, action: "approved", note, date: new Date().toISOString() });
    return delay(transactions[idx], 150);
  },

  rejectTransaction: async (id: string, approver: string, note?: string): Promise<Transaction | null> => {
    const idx = transactions.findIndex((t) => t.id === id);
    if (idx === -1) return delay(null);
    transactions[idx] = { ...transactions[idx], status: "rejected", approvedBy: approver };
    approvalLogs.unshift({ transactionId: id, approver, action: "rejected", note, date: new Date().toISOString() });
    return delay(transactions[idx], 150);
  },

  getSummary: async (branchId?: string): Promise<FinanceSummary> => {
    const list = branchId ? transactions.filter((t) => t.branchId === branchId) : transactions;
    const income = list.filter((t) => t.type === "sale" || t.type === "income_other").reduce((s, t) => s + t.amount, 0);
    const expense = list.filter((t) => ["purchase", "expense", "salary", "bill", "tax"].includes(t.type)).reduce((s, t) => s + t.amount, 0);
    const cashOnHand = accounts.filter((a) => !branchId || a.branchId === branchId).reduce((s, a) => s + a.balance, 0);
    return delay({
      totalIncome: income,
      totalExpense: expense,
      netProfit: income - expense,
      cashOnHand,
      pendingApprovals: list.filter((t) => t.status === "pending").length,
      scheduledPayments: list.filter((t) => t.status === "scheduled").length,
      branchCount: branches.length,
      currency: "IRR" as const,
    });
  },

  getCashFlow: async (): Promise<CashFlowPoint[]> => {
    const days = 14;
    const fa = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    const toFa = (n: number) => String(n).split("").map((d) => fa[+d] || d).join("");
    const points: CashFlowPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      points.push({
        date: `${toFa(1404)}/۰۲/${toFa(days - i).padStart(2, "۰")}`,
        income: rand(80_000_000, 480_000_000),
        expense: rand(40_000_000, 320_000_000),
      });
    }
    return delay(points);
  },

  getBranchPerformance: async (): Promise<BranchPerformance[]> => {
    return delay(
      branches.map((b) => {
        const list = transactions.filter((t) => t.branchId === b.id);
        const income = list.filter((t) => t.type === "sale").reduce((s, t) => s + t.amount, 0);
        const expense = list.filter((t) => ["purchase", "expense", "salary", "bill"].includes(t.type)).reduce((s, t) => s + t.amount, 0);
        return {
          branchId: b.id,
          branchName: b.name,
          income,
          expense,
          profit: income - expense,
          orders: list.filter((t) => t.type === "sale").length * (b.type === "online" ? 120 : 18),
        };
      })
    );
  },
};

export const formatCurrency = (n: number, currency = "IRR") => {
  if (currency === "IRR") {
    return new Intl.NumberFormat("fa-IR").format(n) + " ﷼";
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
};

export const formatCompact = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
};
