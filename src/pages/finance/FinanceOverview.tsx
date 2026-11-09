import { useState, useMemo } from "react";
import { Wallet, TrendingUp, TrendingDown, Banknote, Clock, CalendarClock, Building2, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { FinanceStatCard } from "@/components/finance/FinanceStatCard";
import { CashFlowChart } from "@/components/finance/CashFlowChart";
import { BranchComparisonChart } from "@/components/finance/BranchComparisonChart";
import { JalaliDateRangePicker } from "@/components/ui/jalali-date-range-picker";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/services/finance-service";
import { useFinanceBranches, useFinanceSummary, useFinanceTransactions, FinanceOverviewFilterParams } from "@/hooks/use-finance";
import { TransactionStatusBadge, TransactionTypeBadge } from "@/components/finance/TransactionBadges";
import { Link } from "react-router-dom";

export default function FinanceOverview() {
  const [branchId, setBranchId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ fromDate?: Date; toDate?: Date }>({});

  const filterParams: FinanceOverviewFilterParams = useMemo(() => {
    return {
      branchId: branchId === "all" ? undefined : branchId,
      from: dateRange.fromDate ? dateRange.fromDate.toISOString() : undefined,
      to: dateRange.toDate ? dateRange.toDate.toISOString() : undefined,
    };
  }, [branchId, dateRange]);

  const { data: branches = [] } = useFinanceBranches();
  const { data: summary, isLoading: isSummaryLoading } = useFinanceSummary(filterParams);
  const { data: transactionsData, isLoading: isTxLoading } = useFinanceTransactions({ pageSize: 6 });
  const recent = transactionsData?.items.slice(0, 6) ?? [];

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-accent text-primary-foreground p-6 md:p-8 shadow-lg">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Sparkles className="h-4 w-4" /> ماژول مدیریت مالی هوشمند
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-2">داشبورد مالی</h1>
            <p className="opacity-90 mt-1 max-w-xl text-sm">
              کنترل کامل درآمد، هزینه، حقوق، قبوض و تراکنش‌ها برای فروشگاه‌های تک شعبه، زنجیره‌ای و فروشگاه‌های آنلاین — همراه با اتوماسیون پرداخت و گردش کار تایید.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger className="w-[180px] bg-white/15 border-white/20 text-primary-foreground">
                <SelectValue placeholder="انتخاب شعبه" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه شعب</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button asChild variant="secondary">
              <Link to="/finance/transactions">مشاهده تراکنش‌ها</Link>
            </Button>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-primary-foreground">
          <div className="flex items-center gap-2">
            <JalaliDateRangePicker
              fromDate={dateRange.fromDate}
              toDate={dateRange.toDate}
              onChange={setDateRange}
              className="text-foreground bg-card/90 p-1.5 rounded-xl backdrop-blur-md"
            />
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinanceStatCard
          title="کل درآمد"
          value={isSummaryLoading ? "—" : summary ? formatCurrency(summary.totalIncome) : "—"}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={12.4}
          gradient="from-success/15 via-success/5 to-transparent"
          accent="bg-success/20 text-success"
        />
        <FinanceStatCard
          title="کل هزینه"
          value={isSummaryLoading ? "—" : summary ? formatCurrency(summary.totalExpense) : "—"}
          icon={<TrendingDown className="h-5 w-5" />}
          trend={-4.2}
          gradient="from-destructive/15 via-destructive/5 to-transparent"
          accent="bg-destructive/20 text-destructive"
        />
        <FinanceStatCard
          title="سود خالص"
          value={isSummaryLoading ? "—" : summary ? formatCurrency(summary.netProfit) : "—"}
          icon={<Banknote className="h-5 w-5" />}
          trend={8.7}
          gradient="from-primary/15 via-primary/5 to-transparent"
          accent="bg-primary/20 text-primary"
        />
        <FinanceStatCard
          title="موجودی نقد"
          value={isSummaryLoading ? "—" : summary ? formatCurrency(summary.cashOnHand) : "—"}
          icon={<Wallet className="h-5 w-5" />}
          hint={summary ? `${summary.branchCount} شعبه فعال` : ""}
          gradient="from-accent/15 via-accent/5 to-transparent"
          accent="bg-accent/20 text-accent"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CashFlowChart filterParams={filterParams} />
        <BranchComparisonChart />
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-0 bg-gradient-to-br from-warning/10 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-warning/20 text-warning flex items-center justify-center"><Clock className="h-5 w-5" /></div>
            <div>
              <div className="text-sm text-muted-foreground">در انتظار تایید</div>
              <div className="text-2xl font-bold">{summary?.pendingApprovals ?? 0}</div>
            </div>
          </div>
          <Button size="sm" variant="outline" asChild className="w-full mt-2">
            <Link to="/finance/transactions">بررسی و تایید</Link>
          </Button>
        </Card>
        <Card className="p-5 border-0 bg-gradient-to-br from-info/10 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-info/20 text-info flex items-center justify-center"><CalendarClock className="h-5 w-5" /></div>
            <div>
              <div className="text-sm text-muted-foreground">پرداخت‌های زمان‌بندی شده</div>
              <div className="text-2xl font-bold">{summary?.scheduledPayments ?? 0}</div>
            </div>
          </div>
          <Button size="sm" variant="outline" asChild className="w-full mt-2">
            <Link to="/finance/bills">مدیریت قبوض</Link>
          </Button>
        </Card>
        <Card className="p-5 border-0 bg-gradient-to-br from-primary/10 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center"><Building2 className="h-5 w-5" /></div>
            <div>
              <div className="text-sm text-muted-foreground">شعبه‌ها و حساب‌ها</div>
              <div className="text-2xl font-bold">{summary?.branchCount ?? 0}</div>
            </div>
          </div>
          <Button size="sm" variant="outline" asChild className="w-full mt-2">
            <Link to="/finance/branches">مدیریت شعب</Link>
          </Button>
        </Card>
      </div>

      {/* Recent activity & automation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5 border-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">تراکنش‌های اخیر</h3>
            <Button asChild size="sm" variant="ghost"><Link to="/finance/transactions">مشاهده همه</Link></Button>
          </div>
          <div className="space-y-2">
            {isTxLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-3">
                  <Skeleton className="h-10 w-full" />
                </div>
              ))
            ) : recent.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                تراکنشی یافت نشد
              </div>
            ) : (
              recent.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-xs text-muted-foreground font-mono shrink-0">{t.code}</div>
                    <TransactionTypeBadge type={t.type} />
                    <div className="text-sm truncate">{t.counterparty}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <TransactionStatusBadge status={t.status} />
                    <div className={`text-sm font-semibold ${["sale", "refund", "income_other"].includes(t.type) ? "text-success" : "text-destructive"}`}>
                      {formatCurrency(t.amount)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-5 border-0 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">اتوماسیون مالی</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-card">
              <ShieldCheck className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">پرداخت خودکار قبوض</div>
                <div className="text-muted-foreground text-xs">قبوض در سررسید و پس از تایید مدیر، خودکار پرداخت می‌شوند.</div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-card">
              <ShieldCheck className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">پرداخت حقوق دوره‌ای</div>
                <div className="text-muted-foreground text-xs">حقوق پرسنل به‌صورت ماهیانه و گروهی پردازش می‌گردد.</div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-card">
              <ShieldCheck className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">ثبت خودکار فروش آنلاین</div>
                <div className="text-muted-foreground text-xs">سفارشات سایت به‌صورت آنی به دفتر مالی منتقل می‌شوند.</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
