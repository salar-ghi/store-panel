import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TimeRangeFilter,
  TimeRange,
  CategoryFilter,
  KPICard,
  SalesOverviewChart,
  CategoryDistributionChart,
  TopProductsChart,
  BrandPerformanceChart,
  SupplierStatsChart,
  InventoryStatusChart,
  OrdersHeatmap,
  CustomerSegmentsChart,
  RevenueComparisonChart,
  ProfitMarginChart,
  OrderStatusChart,
  GrowthTrendChart,
  ReturnRateChart,
  MonthlyTargetChart,
  PaymentMethodChart,
} from "@/components/analytics";
import { AnalyticsService } from "@/services/analytics-service";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Percent,
  RotateCcw,
  Target,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [category, setCategory] = useState("all");

  const { data: categories = [] } = useQuery({
    queryKey: ["analytics", "filter-categories"],
    queryFn: () => AnalyticsService.getFilterCategories(),
    staleTime: 5 * 60_000,
  });

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["analytics", "overview", timeRange, category],
    queryFn: () =>
      AnalyticsService.getOverview({ range: timeRange, categoryId: category }),
    staleTime: 60_000,
  });

  const kpis = data?.kpis;

  return (
    <div className="space-y-6 scrollbar-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">تحلیل‌ها و گزارشات</h2>
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
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="به‌روزرسانی"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
          <CategoryFilter
            value={category}
            onChange={setCategory}
            categories={categories}
            className="w-40"
          />
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

      {/* KPIs */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px] rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <KPICard
            title="درآمد کل"
            value={`${((kpis?.revenue ?? 0) / 1_000_000).toFixed(1)}M`}
            change={kpis?.revenueChange}
            trend={(kpis?.revenueChange ?? 0) >= 0 ? "up" : "down"}
            icon={<DollarSign className="h-5 w-5" />}
            variant="primary"
          />
          <KPICard
            title="سفارشات"
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
            value={`${((kpis?.avgOrder ?? 0) / 1000).toFixed(0)}K`}
            change={kpis?.avgOrderChange}
            trend={(kpis?.avgOrderChange ?? 0) >= 0 ? "up" : "down"}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KPICard
            title="محصولات فعال"
            value={(kpis?.activeProducts ?? 0).toLocaleString("fa-IR")}
            change={kpis?.activeProductsChange}
            trend={(kpis?.activeProductsChange ?? 0) >= 0 ? "up" : "down"}
            icon={<Package className="h-5 w-5" />}
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
          <KPICard
            title="تحقق هدف"
            value={`${(kpis?.targetAchievement ?? 0).toLocaleString("fa-IR")}٪`}
            change={kpis?.targetAchievementChange}
            trend={(kpis?.targetAchievementChange ?? 0) >= 0 ? "up" : "down"}
            icon={<Target className="h-5 w-5" />}
            variant="success"
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[340px] rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {/* Sales & Revenue */}
          <div className="grid gap-4 lg:grid-cols-2">
            <SalesOverviewChart data={data?.sales ?? []} timeRange={timeRange} />
            <RevenueComparisonChart data={data?.revenueComparison ?? []} />
          </div>

          {/* Profit & Growth */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ProfitMarginChart data={data?.profitMargin ?? []} />
            <GrowthTrendChart data={data?.growthTrend ?? []} />
          </div>

          {/* Products & Categories */}
          <div className="grid gap-4 lg:grid-cols-3">
            <TopProductsChart data={data?.topProducts ?? []} className="lg:col-span-2" />
            <CategoryDistributionChart data={data?.categoryDistribution ?? []} />
          </div>

          {/* Order Status & Returns */}
          <div className="grid gap-4 lg:grid-cols-2">
            <OrderStatusChart data={data?.orderStatus ?? []} />
            <ReturnRateChart data={data?.returnRate ?? []} />
          </div>

          {/* Brand Performance */}
          <BrandPerformanceChart data={data?.brandPerformance ?? []} />

          {/* Suppliers & Inventory */}
          <div className="grid gap-4 lg:grid-cols-2">
            <SupplierStatsChart data={data?.supplierStats ?? []} />
            <InventoryStatusChart data={data?.inventoryStatus ?? []} />
          </div>

          {/* Targets & Payment */}
          <div className="grid gap-4 lg:grid-cols-2">
            <MonthlyTargetChart data={data?.monthlyTargets ?? []} />
            <PaymentMethodChart data={data?.paymentMethods ?? []} />
          </div>

          {/* Customers & Orders */}
          <div className="grid gap-4 lg:grid-cols-2">
            <CustomerSegmentsChart data={data?.customerSegments ?? []} />
            <OrdersHeatmap data={data?.ordersHeatmap ?? []} />
          </div>
        </>
      )}
    </div>
  );
}
