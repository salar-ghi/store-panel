
import { StatCard } from "@/components/dashboard/stat-card";
import { BarChart3, DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { ProductsChart } from "@/components/dashboard/products-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="$45,231.89"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="+20.1% from last month"
        />
        <StatCard
          title="Orders"
          value="2,345"
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          description="+12.3% from last month"
        />
        <StatCard
          title="Products"
          value="432"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          description="+5.7% new products"
        />
        <StatCard
          title="Customers"
          value="1,893"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="+18.2% new customers"
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
