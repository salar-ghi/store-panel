
import { StatCard } from "@/components/dashboard/stat-card";
import { BarChart3, DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { ProductsChart } from "@/components/dashboard/products-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";

export default function Dashboard() {
  return (
    <div className="space-y-6 scrollbar-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">داشبورد</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="درآمد کل"
          value="۴۵,۲۳۱.۸۹ تومان"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="۲۰.۱٪ افزایش نسبت به ماه قبل"
        />
        <StatCard
          title="سفارش‌ها"
          value="۲,۳۴۵"
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          description="۱۲.۳٪ افزایش نسبت به ماه قبل"
        />
        <StatCard
          title="محصولات"
          value="۴۳۲"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          description="۵.۷٪ محصولات جدید"
        />
        <StatCard
          title="مشتریان"
          value="۱,۸۹۳"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="۱۸.۲٪ مشتریان جدید"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <SalesChart />
        <ProductsChart />
      </div>
      
      <RecentOrders />
    </div>
  );
}
