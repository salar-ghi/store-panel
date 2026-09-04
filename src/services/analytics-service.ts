// Analytics service — powers the dashboard (home) and analytics pages.
//
// Preferred backend contract (single round-trip):
//   GET /api/Analytics/overview?range=daily|weekly|monthly|yearly&categoryId=&brandId=
//        -> AnalyticsOverview (all widgets in one payload)
//
// If that endpoint is missing (404), the service transparently falls back to
// per-widget endpoints so widgets can be delivered incrementally:
//   GET /api/Analytics/kpis
//   GET /api/Analytics/sales
//   GET /api/Analytics/revenue-comparison
//   GET /api/Analytics/profit-margin
//   GET /api/Analytics/growth-trend
//   GET /api/Analytics/category-distribution
//   GET /api/Analytics/top-products
//   GET /api/Analytics/brand-performance
//   GET /api/Analytics/supplier-stats
//   GET /api/Analytics/inventory-status
//   GET /api/Analytics/orders-heatmap
//   GET /api/Analytics/customer-segments
//   GET /api/Analytics/order-status
//   GET /api/Analytics/return-rate
//   GET /api/Analytics/targets
//   GET /api/Analytics/payment-methods
// All of them accept the same query string (range/categoryId/brandId).

import apiClient from '@/lib/api-client';
import { CategoryService } from '@/services/category-service';
import {
  AnalyticsKPIs,
  AnalyticsOverview,
  AnalyticsQuery,
  BrandPerformance,
  CustomerSegmentStat,
  GrowthTrendPoint,
  HeatmapRow,
  NamedValue,
  ProfitMarginPoint,
  ReturnRateRow,
  RevenueComparisonPoint,
  SalesPoint,
  SupplierStat,
  TargetRow,
  TopProduct,
} from '@/types/analytics';

const BASE = '/api/Analytics';

const PALETTE = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--accent))',
  'hsl(var(--secondary))',
  'hsl(var(--destructive))',
  'hsl(var(--muted-foreground))',
];

const EMPTY_KPIS: AnalyticsKPIs = {
  revenue: 0,
  orders: 0,
  customers: 0,
  avgOrder: 0,
  revenueChange: 0,
  ordersChange: 0,
  customersChange: 0,
  avgOrderChange: 0,
};

function isMissing(err: any) {
  const status = err?.response?.status;
  return status === 404 || status === 501 || err?.code === 'ERR_NETWORK';
}

async function safeGet<T>(url: string, fallback: T, params?: Record<string, unknown>): Promise<T> {
  try {
    const { data } = await apiClient.get<T>(url, { params });
    return (data ?? fallback) as T;
  } catch (err) {
    if (isMissing(err)) return fallback;
    throw err;
  }
}

function toParams(q: AnalyticsQuery) {
  const params: Record<string, unknown> = { range: q.range };
  if (q.categoryId && q.categoryId !== 'all') params.categoryId = q.categoryId;
  if (q.brandId && q.brandId !== 'all') params.brandId = q.brandId;
  return params;
}

/** Give every slice a stable colour so pie/donut charts always render. */
function withColors<T extends { name: string }>(items: T[]): (T & { color: string; fill: string })[] {
  return (items ?? []).map((item, i) => {
    const raw = item as Partial<NamedValue>;
    const color = raw.color ?? raw.fill ?? PALETTE[i % PALETTE.length];
    return { ...item, color, fill: raw.fill ?? color };
  });
}

function normalize(raw: Partial<AnalyticsOverview>): AnalyticsOverview {
  return {
    kpis: { ...EMPTY_KPIS, ...(raw.kpis ?? {}) },
    sales: raw.sales ?? [],
    revenueComparison: raw.revenueComparison ?? [],
    profitMargin: raw.profitMargin ?? [],
    growthTrend: raw.growthTrend ?? [],
    categoryDistribution: withColors(raw.categoryDistribution ?? []),
    topProducts: raw.topProducts ?? [],
    brandPerformance: raw.brandPerformance ?? [],
    supplierStats: raw.supplierStats ?? [],
    inventoryStatus: withColors(raw.inventoryStatus ?? []),
    ordersHeatmap: raw.ordersHeatmap ?? [],
    customerSegments: withColors(raw.customerSegments ?? []),
    orderStatus: withColors(raw.orderStatus ?? []),
    returnRate: raw.returnRate ?? [],
    monthlyTargets: raw.monthlyTargets ?? [],
    paymentMethods: withColors(raw.paymentMethods ?? []),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

async function fetchPerWidget(query: AnalyticsQuery): Promise<AnalyticsOverview> {
  const p = toParams(query);
  const [
    kpis,
    sales,
    revenueComparison,
    profitMargin,
    growthTrend,
    categoryDistribution,
    topProducts,
    brandPerformance,
    supplierStats,
    inventoryStatus,
    ordersHeatmap,
    customerSegments,
    orderStatus,
    returnRate,
    monthlyTargets,
    paymentMethods,
  ] = await Promise.all([
    safeGet<AnalyticsKPIs>(`${BASE}/kpis`, EMPTY_KPIS, p),
    safeGet<SalesPoint[]>(`${BASE}/sales`, [], p),
    safeGet<RevenueComparisonPoint[]>(`${BASE}/revenue-comparison`, [], p),
    safeGet<ProfitMarginPoint[]>(`${BASE}/profit-margin`, [], p),
    safeGet<GrowthTrendPoint[]>(`${BASE}/growth-trend`, [], p),
    safeGet<NamedValue[]>(`${BASE}/category-distribution`, [], p),
    safeGet<TopProduct[]>(`${BASE}/top-products`, [], p),
    safeGet<BrandPerformance[]>(`${BASE}/brand-performance`, [], p),
    safeGet<SupplierStat[]>(`${BASE}/supplier-stats`, [], p),
    safeGet<NamedValue[]>(`${BASE}/inventory-status`, [], p),
    safeGet<HeatmapRow[]>(`${BASE}/orders-heatmap`, [], p),
    safeGet<CustomerSegmentStat[]>(`${BASE}/customer-segments`, [], p),
    safeGet<NamedValue[]>(`${BASE}/order-status`, [], p),
    safeGet<ReturnRateRow[]>(`${BASE}/return-rate`, [], p),
    safeGet<TargetRow[]>(`${BASE}/targets`, [], p),
    safeGet<NamedValue[]>(`${BASE}/payment-methods`, [], p),
  ]);

  return normalize({
    kpis,
    sales,
    revenueComparison,
    profitMargin,
    growthTrend,
    categoryDistribution,
    topProducts,
    brandPerformance,
    supplierStats,
    inventoryStatus,
    ordersHeatmap,
    customerSegments,
    orderStatus,
    returnRate,
    monthlyTargets,
    paymentMethods,
  });
}

export const AnalyticsService = {
  async getOverview(query: AnalyticsQuery): Promise<AnalyticsOverview> {
    try {
      const { data } = await apiClient.get<Partial<AnalyticsOverview>>(`${BASE}/overview`, {
        params: toParams(query),
      });
      if (data && Object.keys(data).length > 0) return normalize(data);
    } catch (err) {
      if (!isMissing(err)) throw err;
    }
    return fetchPerWidget(query);
  },

  /** Category options for the analytics filter — reuses the real category tree. */
  async getFilterCategories(): Promise<{ id: string; name: string }[]> {
    try {
      const categories = await CategoryService.getAllCategories();
      return categories.map((c) => ({ id: String(c.id), name: c.name }));
    } catch {
      return [];
    }
  },
};

export default AnalyticsService;
