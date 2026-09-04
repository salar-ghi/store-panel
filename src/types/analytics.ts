import { TimeRange } from "@/components/analytics/TimeRangeFilter";

export type { TimeRange };

export interface AnalyticsQuery {
  range: TimeRange;
  categoryId?: string | number;
  brandId?: string | number;
}

export interface SalesPoint {
  name: string;
  sales: number;
  orders: number;
  profit: number;
}

export interface RevenueComparisonPoint {
  name: string;
  current: number;
  previous: number;
}

export interface ProfitMarginPoint {
  name: string;
  margin: number;
  revenue: number;
  cost: number;
}

export interface GrowthTrendPoint {
  name: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface NamedValue {
  name: string;
  value: number;
  color: string;
  fill: string;
}

export interface TopProduct {
  name: string;
  sales: number;
  quantity: number;
}

export interface BrandPerformance {
  name: string;
  sales: number;
  orders: number;
  products: number;
}

export interface SupplierStat {
  id: string;
  name: string;
  totalProducts: number;
  totalSales: number;
  ordersFulfilled: number;
  performance: number;
  trend: "up" | "down" | "neutral";
}

export interface HeatmapRow {
  day: string;
  hours: number[];
}

export interface CustomerSegmentStat {
  name: string;
  size: number;
  color: string;
}

export interface ReturnRateRow {
  category: string;
  rate: number;
  returns: number;
}

export interface TargetRow {
  name: string;
  current: number;
  target: number;
  unit: string;
}

export interface AnalyticsKPIs {
  revenue: number;
  orders: number;
  customers: number;
  avgOrder: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  avgOrderChange: number;
  activeProducts?: number;
  activeProductsChange?: number;
  conversionRate?: number;
  conversionRateChange?: number;
  returnRate?: number;
  returnRateChange?: number;
  targetAchievement?: number;
  targetAchievementChange?: number;
}

/** Aggregate payload for the dashboard/analytics screens. */
export interface AnalyticsOverview {
  kpis: AnalyticsKPIs;
  sales: SalesPoint[];
  revenueComparison: RevenueComparisonPoint[];
  profitMargin: ProfitMarginPoint[];
  growthTrend: GrowthTrendPoint[];
  categoryDistribution: NamedValue[];
  topProducts: TopProduct[];
  brandPerformance: BrandPerformance[];
  supplierStats: SupplierStat[];
  inventoryStatus: NamedValue[];
  ordersHeatmap: HeatmapRow[];
  customerSegments: CustomerSegmentStat[];
  orderStatus: NamedValue[];
  returnRate: ReturnRateRow[];
  monthlyTargets: TargetRow[];
  paymentMethods: NamedValue[];
  updatedAt?: string;
}
