import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, FileText, TrendingUp } from "lucide-react";
import { formatCompact, formatCurrency } from "@/services/finance-service";
import { useFinanceTransactions } from "@/hooks/use-finance";
import { exportToCsv, printFinancialReport } from "@/lib/export-utils";
import { JalaliDateRangePicker } from "@/components/ui/jalali-date-range-picker";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--accent))", "hsl(var(--info))"];

export default function FinanceReports() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{ fromDate?: Date; toDate?: Date }>({});

  const { data: txData, isLoading } = useFinanceTransactions({ pageSize: 1000 });
  const allTx = txData?.items ?? [];

  const tx = useMemo(() => {
    return allTx.filter((t) => {
      const d = new Date(t.date).getTime();
      if (dateRange.fromDate && d < dateRange.fromDate.getTime()) return false;
      if (dateRange.toDate && d > dateRange.toDate.getTime() + 86400000) return false;
      return true;
    });
  }, [allTx, dateRange]);

  const byCategory = Object.entries(
    tx.reduce<Record<string, number>>((acc, t) => {
      const k = t.category ?? "متفرقه";
      acc[k] = (acc[k] ?? 0) + t.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const byMethod = Object.entries(
    tx.reduce<Record<string, number>>((acc, t) => {
      acc[t.method] = (acc[t.method] ?? 0) + t.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const methodLabels: Record<string, string> = { cash: "نقدی", card: "کارت", bank_transfer: "حواله", online_gateway: "درگاه آنلاین", cheque: "چک", wallet: "کیف پول" };

  const totalIncome = tx.filter((t) => ["sale", "refund", "income_other"].includes(t.type)).reduce((s, t) => s + t.amount, 0);
  const totalExpense = tx.filter((t) => ["purchase", "expense", "salary", "bill", "tax"].includes(t.type)).reduce((s, t) => s + t.amount, 0);

  const handleExportExcel = () => {
    if (tx.length === 0) {
      toast({ title: "داده‌ای برای خروجی گزارش وجود ندارد", variant: "destructive" });
      return;
    }
    const headers = ["سرفصل گزارش", "مبلغ (ریال)"];
    const rows = [
      ["درآمد کل", totalIncome],
      ["هزینه کل", totalExpense],
      ["سود خالص", totalIncome - totalExpense],
      ...byCategory.map((c) => [`دسته: ${c.name}`, c.value]),
      ...byMethod.map((m) => [`روش پرداخت: ${methodLabels[m.name] || m.name}`, m.value]),
    ];
    exportToCsv(`financial-report-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    toast({ title: "فایل گزارش با موفقیت استخراج شد" });
  };

  const handlePrintPdf = () => {
    printFinancialReport("گزارش جامع مالی");
  };

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">گزارش‌های مالی</h1>
          <p className="text-sm text-muted-foreground">سود و زیان، ترازنامه، گردش وجوه و گزارش‌های تخصصی</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <JalaliDateRangePicker
            fromDate={dateRange.fromDate}
            toDate={dateRange.toDate}
            onChange={setDateRange}
          />
          <Button variant="outline" onClick={handlePrintPdf}>
            <FileText className="h-4 w-4 ml-2" /> چاپ PDF
          </Button>
          <Button onClick={handleExportExcel}>
            <Download className="h-4 w-4 ml-2" /> دریافت Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-0 bg-gradient-to-br from-success/10 to-transparent">
          <div className="text-sm text-muted-foreground">کل درآمد</div>
          <div className="text-2xl font-bold mt-1 text-success">
            {isLoading ? "—" : formatCurrency(totalIncome)}
          </div>
        </Card>
        <Card className="p-5 border-0 bg-gradient-to-br from-destructive/10 to-transparent">
          <div className="text-sm text-muted-foreground">کل هزینه</div>
          <div className="text-2xl font-bold mt-1 text-destructive">
            {isLoading ? "—" : formatCurrency(totalExpense)}
          </div>
        </Card>
        <Card className="p-5 border-0 bg-gradient-to-br from-primary/10 to-transparent">
          <div className="text-sm text-muted-foreground">سود خالص</div>
          <div className="text-2xl font-bold mt-1 text-primary flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> {isLoading ? "—" : formatCurrency(totalIncome - totalExpense)}
          </div>
        </Card>
      </div>

      {isLoading ? (
        <Card className="p-5 border-0">
          <Skeleton className="h-80 w-full" />
        </Card>
      ) : (
        <Tabs defaultValue="category">
          <TabsList>
            <TabsTrigger value="category">به تفکیک دسته</TabsTrigger>
            <TabsTrigger value="method">به تفکیک روش پرداخت</TabsTrigger>
            <TabsTrigger value="pl">سود و زیان</TabsTrigger>
          </TabsList>

          <TabsContent value="category">
            <Card className="p-5 border-0">
              <h3 className="font-semibold mb-4">حجم تراکنش به تفکیک دسته</h3>
              <div className="h-80">
                <ResponsiveContainer>
                  <BarChart data={byCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={formatCompact} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} formatter={(v: number) => formatCompact(v)} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="method">
            <Card className="p-5 border-0">
              <h3 className="font-semibold mb-4">سهم روش‌های پرداخت</h3>
              <div className="h-80">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={byMethod} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={120} label={(e) => methodLabels[e.name] || e.name}>
                      {byMethod.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} formatter={(v: number) => formatCompact(v)} />
                    <Legend formatter={(v: string) => methodLabels[v] || v} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pl">
            <Card className="p-5 border-0">
              <h3 className="font-semibold mb-4">صورت سود و زیان</h3>
              <div className="space-y-2 max-w-2xl">
                <Row label="درآمد فروش" value={totalIncome} positive />
                <Row label="بهای تمام شده کالا" value={tx.filter((t) => t.type === "purchase").reduce((s, t) => s + t.amount, 0)} />
                <Row label="هزینه‌های عملیاتی" value={tx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)} />
                <Row label="حقوق و دستمزد" value={tx.filter((t) => t.type === "salary").reduce((s, t) => s + t.amount, 0)} />
                <Row label="قبوض" value={tx.filter((t) => t.type === "bill").reduce((s, t) => s + t.amount, 0)} />
                <div className="border-t pt-2 mt-2">
                  <Row label="سود خالص" value={totalIncome - totalExpense} positive bold />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function Row({ label, value, positive, bold }: { label: string; value: number; positive?: boolean; bold?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-2 px-3 rounded-lg hover:bg-muted/30 ${bold ? "text-lg" : "text-sm"}`}>
      <span className={bold ? "font-bold" : ""}>{label}</span>
      <span className={`${bold ? "font-bold" : "font-semibold"} ${positive ? "text-success" : "text-destructive"}`}>
        {positive ? "+" : "-"} {formatCurrency(value)}
      </span>
    </div>
  );
}
