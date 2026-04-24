import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Building2, MapPin, User, Plus, Wallet, Banknote, CreditCard, Smartphone, PiggyBank } from "lucide-react";
import { FinanceService, formatCurrency } from "@/services/finance-service";
import { Branch, BranchPerformance, FinancialAccount } from "@/types/finance";

const branchTypeLabels: Record<Branch["type"], string> = {
  supermarket: "سوپرمارکت",
  chain_store: "فروشگاه زنجیره‌ای",
  online: "فروشگاه آنلاین",
  warehouse: "انبار",
};

const accountIcons = {
  cash: Banknote,
  bank: Building2,
  gateway: CreditCard,
  wallet: Smartphone,
  petty_cash: PiggyBank,
};

export default function FinanceBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [perf, setPerf] = useState<BranchPerformance[]>([]);

  useEffect(() => {
    FinanceService.getBranches().then(setBranches);
    FinanceService.getAccounts().then(setAccounts);
    FinanceService.getBranchPerformance().then(setPerf);
  }, []);

  const maxIncome = Math.max(1, ...perf.map((p) => p.income));

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">شعبه‌ها و حساب‌های مالی</h1>
          <p className="text-sm text-muted-foreground">مدیریت مالی هر شعبه به‌صورت مستقل و گزارش تجمیعی</p>
        </div>
        <Button><Plus className="h-4 w-4 ml-2" /> افزودن شعبه</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((b) => {
          const p = perf.find((x) => x.branchId === b.id);
          const branchAccounts = accounts.filter((a) => a.branchId === b.id);
          const totalBalance = branchAccounts.reduce((s, a) => s + a.balance, 0);
          const incomePct = p ? (p.income / maxIncome) * 100 : 0;
          return (
            <Card key={b.id} className="p-5 border-0 hover-lift relative overflow-hidden bg-gradient-to-br from-card to-muted/20">
              <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{b.name}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {b.city}</span>
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {b.manager}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{branchTypeLabels[b.type]}</Badge>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-success/10">
                    <div className="text-xs text-muted-foreground">درآمد</div>
                    <div className="font-bold text-success text-sm mt-1">{p ? formatCurrency(p.income) : "—"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-destructive/10">
                    <div className="text-xs text-muted-foreground">هزینه</div>
                    <div className="font-bold text-destructive text-sm mt-1">{p ? formatCurrency(p.expense) : "—"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10">
                    <div className="text-xs text-muted-foreground">سود</div>
                    <div className="font-bold text-primary text-sm mt-1">{p ? formatCurrency(p.profit) : "—"}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">سهم از کل درآمد</span>
                    <span className="font-medium">{incomePct.toFixed(0)}%</span>
                  </div>
                  <Progress value={incomePct} className="h-2" />
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium flex items-center gap-1"><Wallet className="h-3 w-3" /> حساب‌ها ({branchAccounts.length})</div>
                    <div className="text-sm font-bold">{formatCurrency(totalBalance)}</div>
                  </div>
                  <div className="space-y-1.5">
                    {branchAccounts.map((a) => {
                      const Icon = accountIcons[a.type];
                      return (
                        <div key={a.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40">
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{a.name}</span>
                          </div>
                          <span className="font-medium">{formatCurrency(a.balance)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
