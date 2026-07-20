import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { OrderService } from "@/services/order-service";
import { Order } from "@/types/order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  DollarSign,
  Search,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { formatPrice, formatPersianNumber } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";

type RangeKey = "today" | "week" | "month" | "quarter" | "year" | "all";

const RANGE_LABELS: Record<RangeKey, string> = {
  today: "امروز",
  week: "هفته جاری",
  month: "ماه جاری",
  quarter: "سه ماه اخیر",
  year: "سال جاری",
  all: "کل زمان‌ها",
};

function startOfRange(range: RangeKey): Date | null {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (range) {
    case "today":
      return d;
    case "week": {
      // Start of week = Saturday for fa-IR practical needs; approximate w/ 7d rolling
      const w = new Date(d);
      w.setDate(w.getDate() - 6);
      return w;
    }
    case "month": {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    case "quarter": {
      const q = new Date(d);
      q.setMonth(q.getMonth() - 3);
      return q;
    }
    case "year":
      return new Date(now.getFullYear(), 0, 1);
    case "all":
    default:
      return null;
  }
}

const STATUS_COLORS: Record<Order["status"], string> = {
  pending: "hsl(var(--warning))",
  approved: "hsl(var(--success))",
  rejected: "hsl(var(--destructive))",
  shipped: "hsl(var(--info))",
  delivered: "hsl(var(--primary))",
};

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "در انتظار",
  approved: "تایید شده",
  rejected: "رد شده",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
};

export default function OrdersAnalytics() {
  const [range, setRange] = useState<RangeKey>("month");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => OrderService.list(),
  });

  const filtered = useMemo(() => {
    const start = startOfRange(range);
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const d = new Date(o.date);
      if (start && (isNaN(d.getTime()) || d < start)) return false;
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (
        q &&
        !o.id.toLowerCase().includes(q) &&
        !o.customer.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [orders, range, statusFilter, search]);

  const stats = useMemo(() => {
    const byStatus: Record<string, number> = {};
    let revenue = 0;
    let itemsSold = 0;
    filtered.forEach((o) => {
      byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
      if (o.status === "approved" || o.status === "shipped" || o.status === "delivered") {
        revenue += o.finalTotal ?? o.total ?? 0;
        itemsSold += o.items.reduce((s, i) => s + (i.quantity || 0), 0);
      }
    });
    const total = filtered.length;
    const successful =
      (byStatus.approved ?? 0) + (byStatus.shipped ?? 0) + (byStatus.delivered ?? 0);
    const failed = byStatus.rejected ?? 0;
    const pending = byStatus.pending ?? 0;
    const successRate = total ? Math.round((successful / total) * 100) : 0;
    const aov = successful ? Math.round(revenue / successful) : 0;
    return {
      total,
      successful,
      failed,
      pending,
      revenue,
      itemsSold,
      successRate,
      aov,
      byStatus,
    };
  }, [filtered]);

  const statusPie = useMemo(
    () =>
      (Object.keys(STATUS_LABELS) as Array<Order["status"]>)
        .map((s) => ({
          name: STATUS_LABELS[s],
          value: stats.byStatus[s] ?? 0,
          color: STATUS_COLORS[s],
        }))
        .filter((d) => d.value > 0),
    [stats],
  );

  const dailyBars = useMemo(() => {
    const map: Record<string, { day: string; orders: number; revenue: number }> = {};
    filtered.forEach((o) => {
      const d = new Date(o.date);
      if (isNaN(d.getTime())) return;
      const key = new Intl.DateTimeFormat("fa-IR", {
        month: "short",
        day: "numeric",
      }).format(d);
      const row = map[key] || { day: key, orders: 0, revenue: 0 };
      row.orders += 1;
      row.revenue += o.finalTotal ?? o.total ?? 0;
      map[key] = row;
    });
    return Object.values(map).slice(-14);
  }, [filtered]);

  const topCustomers = useMemo(() => {
    const map = new Map<string, { customer: string; count: number; total: number }>();
    filtered.forEach((o) => {
      const cur = map.get(o.customer) || { customer: o.customer, count: 0, total: 0 };
      cur.count += 1;
      cur.total += o.finalTotal ?? o.total ?? 0;
      map.set(o.customer, cur);
    });
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filtered]);

  return (
    <div className="space-y-6 py-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">تحلیل سفارشات</h2>
          <p className="text-sm text-muted-foreground">
            گزارش‌های تحلیلی، عملکرد فروش و وضعیت سفارش‌ها
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={range} onValueChange={(v) => setRange(v as RangeKey)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(RANGE_LABELS) as RangeKey[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {RANGE_LABELS[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              {(Object.keys(STATUS_LABELS) as Order["status"][]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pr-8 w-56"
              placeholder="جستجوی شناسه یا مشتری..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[50vh] items-center justify-center rounded-md border border-dashed">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPI
              icon={<ShoppingBag className="h-5 w-5" />}
              label="کل سفارشات"
              value={formatPersianNumber(stats.total)}
              hint={RANGE_LABELS[range]}
              tone="primary"
            />
            <KPI
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="سفارشات موفق"
              value={formatPersianNumber(stats.successful)}
              hint={`${formatPersianNumber(stats.successRate)}٪ نرخ موفقیت`}
              tone="success"
            />
            <KPI
              icon={<XCircle className="h-5 w-5" />}
              label="رد شده"
              value={formatPersianNumber(stats.failed)}
              hint="نیاز به بررسی"
              tone="destructive"
            />
            <KPI
              icon={<Clock className="h-5 w-5" />}
              label="در انتظار بررسی"
              value={formatPersianNumber(stats.pending)}
              hint="در صف تایید"
              tone="warning"
            />
            <KPI
              icon={<DollarSign className="h-5 w-5" />}
              label="مبلغ فروش"
              value={formatPrice(stats.revenue)}
              hint="از سفارشات موفق"
              tone="primary"
            />
            <KPI
              icon={<TrendingUp className="h-5 w-5" />}
              label="میانگین سفارش"
              value={formatPrice(stats.aov)}
              hint="ارزش هر سفارش موفق"
              tone="success"
            />
            <KPI
              icon={<ShoppingBag className="h-5 w-5" />}
              label="اقلام فروخته شده"
              value={formatPersianNumber(stats.itemsSold)}
              hint="مجموع تعداد اقلام"
            />
            <KPI
              icon={<RotateCcw className="h-5 w-5" />}
              label="مرجوعی‌ها"
              value={formatPersianNumber(0)}
              hint="محاسبه از ماژول مرجوعی"
            />
          </div>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">روند سفارشات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyBars}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                      <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                        }}
                      />
                      <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">توزیع وضعیت</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  {statusPie.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      داده‌ای برای نمایش وجود ندارد
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusPie}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {statusPie.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 8,
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top customers + recent orders */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">مشتریان برتر</CardTitle>
              </CardHeader>
              <CardContent>
                {topCustomers.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    مشتری‌ای یافت نشد
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {topCustomers.map((c, i) => (
                      <li
                        key={c.customer}
                        className="flex items-center justify-between rounded-md border p-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {formatPersianNumber(i + 1)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{c.customer}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatPersianNumber(c.count)} سفارش
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold">{formatPrice(c.total)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">سفارشات اخیر</CardTitle>
                <Badge variant="secondary">
                  {formatPersianNumber(filtered.length)} مورد
                </Badge>
              </CardHeader>
              <CardContent>
                {filtered.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    سفارشی در این بازه پیدا نشد
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>شناسه</TableHead>
                        <TableHead>مشتری</TableHead>
                        <TableHead>مبلغ</TableHead>
                        <TableHead>وضعیت</TableHead>
                        <TableHead>تاریخ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.slice(0, 8).map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-medium">{o.id}</TableCell>
                          <TableCell>{o.customer}</TableCell>
                          <TableCell>{formatPrice(o.finalTotal ?? o.total)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              style={{
                                color: STATUS_COLORS[o.status],
                                borderColor: STATUS_COLORS[o.status],
                              }}
                            >
                              {STATUS_LABELS[o.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {o.date}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

interface KPIProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: "primary" | "success" | "warning" | "destructive";
}
function KPI({ icon, label, value, hint, tone }: KPIProps) {
  const toneClass =
    tone === "success"
      ? "bg-success/10 text-success"
      : tone === "warning"
      ? "bg-warning/10 text-warning"
      : tone === "destructive"
      ? "bg-destructive/10 text-destructive"
      : "bg-primary/10 text-primary";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
          </div>
          <div className={`rounded-lg p-2 ${toneClass}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
