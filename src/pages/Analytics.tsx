import { useState } from "react";
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
import {
  getSalesData,
  categoryDistribution,
  topProducts,
  brandPerformance,
  supplierStats,
  inventoryStatus,
  ordersHeatmap,
  customerSegments,
  getRevenueComparison,
  getKPIData,
  filterCategories,
  getProfitMarginData,
  orderStatusData,
  getGrowthTrendData,
  returnRateData,
  monthlyTargets,
  paymentMethodData,
} from "@/data/analyticsData";
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, Percent, RotateCcw, Target } from "lucide-react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [category, setCategory] = useState("all");

  const salesData = getSalesData(timeRange);
  const revenueComparison = getRevenueComparison(timeRange);
  const kpis = getKPIData(timeRange);
  const profitMarginData = getProfitMarginData(timeRange);
  const growthTrendData = getGrowthTrendData(timeRange);

  return (
    <div className="space-y-6 scrollbar-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">تحلیل‌ها و گزارشات</h2>
        <div className="flex flex-wrap items-center gap-3">
          <CategoryFilter
            value={category}
            onChange={setCategory}
            categories={filterCategories}
            className="w-40"
          />
          <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <KPICard
          title="درآمد کل"
          value={`${(kpis.revenue / 1000000).toFixed(1)}M`}
          change={kpis.revenueChange}
          trend="up"
          icon={<DollarSign className="h-5 w-5" />}
          variant="primary"
        />
        <KPICard
          title="سفارشات"
          value={kpis.orders.toLocaleString("fa-IR")}
          change={kpis.ordersChange}
          trend="up"
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <KPICard
          title="مشتریان"
          value={kpis.customers.toLocaleString("fa-IR")}
          change={kpis.customersChange}
          trend="up"
          icon={<Users className="h-5 w-5" />}
          variant="success"
        />
        <KPICard
          title="میانگین سفارش"
          value={`${(kpis.avgOrder / 1000).toFixed(0)}K`}
          change={kpis.avgOrderChange}
          trend="up"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KPICard
          title="محصولات فعال"
          value="۴۳۲"
          change={5.7}
          trend="up"
          icon={<Package className="h-5 w-5" />}
        />
        <KPICard
          title="نرخ تبدیل"
          value="۳.۲٪"
          change={0.5}
          trend="up"
          icon={<Percent className="h-5 w-5" />}
          variant="warning"
        />
        <KPICard
          title="نرخ مرجوعی"
          value="۲.۴٪"
          change={-0.3}
          trend="down"
          icon={<RotateCcw className="h-5 w-5" />}
        />
        <KPICard
          title="تحقق هدف"
          value="۸۵٪"
          change={8.2}
          trend="up"
          icon={<Target className="h-5 w-5" />}
          variant="success"
        />
      </div>

      {/* Sales & Revenue */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SalesOverviewChart data={salesData} timeRange={timeRange} />
        <RevenueComparisonChart data={revenueComparison} />
      </div>

      {/* Profit & Growth */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ProfitMarginChart data={profitMarginData} />
        <GrowthTrendChart data={growthTrendData} />
      </div>

      {/* Products & Categories */}
      <div className="grid gap-4 lg:grid-cols-3">
        <TopProductsChart data={topProducts} className="lg:col-span-2" />
        <CategoryDistributionChart data={categoryDistribution} />
      </div>

      {/* Order Status & Returns */}
      <div className="grid gap-4 lg:grid-cols-2">
        <OrderStatusChart data={orderStatusData} />
        <ReturnRateChart data={returnRateData} />
      </div>

      {/* Brand Performance */}
      <BrandPerformanceChart data={brandPerformance} />

      {/* Suppliers & Inventory */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SupplierStatsChart data={supplierStats} />
        <InventoryStatusChart data={inventoryStatus} />
      </div>

      {/* Targets & Payment */}
      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyTargetChart data={monthlyTargets} />
        <PaymentMethodChart data={paymentMethodData} />
      </div>

      {/* Customers & Orders */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CustomerSegmentsChart data={customerSegments} />
        <OrdersHeatmap data={ordersHeatmap} />
      </div>
    </div>
  );
}
