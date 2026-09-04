import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Percent,
  RotateCcw,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  TimeRangeFilter,
  TimeRange,
  KPICard,
  SalesOverviewChart,
  CategoryDistributionChart,
  TopProductsChart,
  OrdersHeatmap,
  InventoryStatusChart,
  ProfitMarginChart,
  OrderStatusChart,
  MonthlyTargetChart,
  PaymentMethodChart,
} from "@/components/analytics";
import { AnalyticsService } from "@/services/analytics-service";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function KPISkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-[104px] rounded-lg" />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["analytics", "overview", timeRange],
    queryFn: () => AnalyticsService.getOverview({ range: timeRange }),
    staleTime: 60_000,
  });

  const kpis = data?.kpis;

  return (
    <div className="space-y-6 scrollbar-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">داشبورد</h2>
          {data?.updatedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              آخرین به‌روزرسانی:{" "}
              {new Date(data.updatedAt).toLocaleTimeString("fa-IR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="به‌روزرسانی"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
          <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطا در دریافت اطلاعات</AlertTitle>
          <AlertDescription>
            ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <KPISkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KPICard
            title="درآمد کل"
            value={`${((kpis?.revenue ?? 0) / 1_000_000).toFixed(1)}M تومان`}
            change={kpis?.revenueChange}
            trend={(kpis?.revenueChange ?? 0) >= 0 ? "up" : "down"}
            icon={<DollarSign className="h-5 w-5" />}
            variant="primary"
          />
          <KPICard
            title="سفارش‌ها"
            value={(kpis?.orders ?? 0).toLocaleString("fa-IR")}
            change={kpis?.ordersChange}
            trend={(kpis?.ordersChange ?? 0) >= 0 ? "up" : "down"}
            icon={<ShoppingCart className="h-5 w-5" />}
          />
          <KPICard
            title="مشتریان"
            value={(kpis?.customers ?? 0).toLocaleString("fa-IR")}
            change={kpis?.customersChange}
            trend={(kpis?.customersChange ?? 0) >= 0 ? "up" : "down"}
            icon={<Users className="h-5 w-5" />}
            variant="success"
          />
          <KPICard
            title="میانگین سفارش"
            value={`${((kpis?.avgOrder ?? 0) / 1000).toFixed(0)}K تومان`}
            change={kpis?.avgOrderChange}
            trend={(kpis?.avgOrderChange ?? 0) >= 0 ? "up" : "down"}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KPICard
            title="نرخ تبدیل"
            value={`${(kpis?.conversionRate ?? 0).toLocaleString("fa-IR")}٪`}
            change={kpis?.conversionRateChange}
            trend={(kpis?.conversionRateChange ?? 0) >= 0 ? "up" : "down"}
            icon={<Percent className="h-5 w-5" />}
            variant="warning"
          />
          <KPICard
            title="نرخ مرجوعی"
            value={`${(kpis?.returnRate ?? 0).toLocaleString("fa-IR")}٪`}
            change={kpis?.returnRateChange}
            trend={(kpis?.returnRateChange ?? 0) <= 0 ? "down" : "up"}
            icon={<RotateCcw className="h-5 w-5" />}
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[340px] rounded-lg lg:col-span-2" />
          <Skeleton className="h-[340px] rounded-lg" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <SalesOverviewChart
              data={data?.sales ?? []}
              timeRange={timeRange}
              className="lg:col-span-2"
            />
            <CategoryDistributionChart data={data?.categoryDistribution ?? []} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ProfitMarginChart data={data?.profitMargin ?? []} className="lg:col-span-2" />
            <OrderStatusChart data={data?.orderStatus ?? []} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <TopProductsChart data={data?.topProducts ?? []} className="lg:col-span-2" />
            <InventoryStatusChart data={data?.inventoryStatus ?? []} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <MonthlyTargetChart data={data?.monthlyTargets ?? []} />
            <PaymentMethodChart data={data?.paymentMethods ?? []} />
          </div>

          <OrdersHeatmap data={data?.ordersHeatmap ?? []} />
        </>
      )}
    </div>
  );
}
