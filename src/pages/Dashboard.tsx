import { useState } from "react";
import { DollarSign, Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import {
  TimeRangeFilter,
  TimeRange,
  KPICard,
  SalesOverviewChart,
  CategoryDistributionChart,
  TopProductsChart,
  OrdersHeatmap,
  InventoryStatusChart,
} from "@/components/analytics";
import {
  getSalesData,
  categoryDistribution,
  topProducts,
  ordersHeatmap,
  inventoryStatus,
  getKPIData,
} from "@/data/analyticsData";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");
  const salesData = getSalesData(timeRange);
  const kpis = getKPIData(timeRange);

  return (
    <div className="space-y-6 scrollbar-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">داشبورد</h2>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="درآمد کل"
          value={`${(kpis.revenue / 1000000).toFixed(1)}M تومان`}
          change={kpis.revenueChange}
          trend="up"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPICard
          title="سفارش‌ها"
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
        />
        <KPICard
          title="میانگین سفارش"
          value={`${(kpis.avgOrder / 1000).toFixed(0)}K تومان`}
          change={kpis.avgOrderChange}
          trend="up"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SalesOverviewChart data={salesData} timeRange={timeRange} className="lg:col-span-2" />
        <CategoryDistributionChart data={categoryDistribution} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TopProductsChart data={topProducts} className="lg:col-span-2" />
        <InventoryStatusChart data={inventoryStatus} />
      </div>

      <OrdersHeatmap data={ordersHeatmap} />
    </div>
  );
}
