import { TimeRange } from "@/components/analytics/TimeRangeFilter";

// Sales data by time range
export const getSalesData = (timeRange: TimeRange) => {
  const baseData: Record<TimeRange, { name: string; sales: number; orders: number; profit: number }[]> = {
    daily: [
      { name: "۰۶:۰۰", sales: 2400000, orders: 12, profit: 480000 },
      { name: "۰۹:۰۰", sales: 4800000, orders: 24, profit: 960000 },
      { name: "۱۲:۰۰", sales: 8200000, orders: 41, profit: 1640000 },
      { name: "۱۵:۰۰", sales: 6100000, orders: 30, profit: 1220000 },
      { name: "۱۸:۰۰", sales: 9800000, orders: 49, profit: 1960000 },
      { name: "۲۱:۰۰", sales: 5400000, orders: 27, profit: 1080000 },
    ],
    weekly: [
      { name: "شنبه", sales: 24000000, orders: 120, profit: 4800000 },
      { name: "یکشنبه", sales: 18000000, orders: 90, profit: 3600000 },
      { name: "دوشنبه", sales: 32000000, orders: 160, profit: 6400000 },
      { name: "سه‌شنبه", sales: 28000000, orders: 140, profit: 5600000 },
      { name: "چهارشنبه", sales: 35000000, orders: 175, profit: 7000000 },
      { name: "پنج‌شنبه", sales: 42000000, orders: 210, profit: 8400000 },
      { name: "جمعه", sales: 15000000, orders: 75, profit: 3000000 },
    ],
    monthly: [
      { name: "هفته ۱", sales: 120000000, orders: 600, profit: 24000000 },
      { name: "هفته ۲", sales: 145000000, orders: 725, profit: 29000000 },
      { name: "هفته ۳", sales: 138000000, orders: 690, profit: 27600000 },
      { name: "هفته ۴", sales: 162000000, orders: 810, profit: 32400000 },
    ],
    yearly: [
      { name: "فروردین", sales: 450000000, orders: 2250, profit: 90000000 },
      { name: "اردیبهشت", sales: 520000000, orders: 2600, profit: 104000000 },
      { name: "خرداد", sales: 480000000, orders: 2400, profit: 96000000 },
      { name: "تیر", sales: 610000000, orders: 3050, profit: 122000000 },
      { name: "مرداد", sales: 580000000, orders: 2900, profit: 116000000 },
      { name: "شهریور", sales: 540000000, orders: 2700, profit: 108000000 },
      { name: "مهر", sales: 620000000, orders: 3100, profit: 124000000 },
      { name: "آبان", sales: 590000000, orders: 2950, profit: 118000000 },
      { name: "آذر", sales: 670000000, orders: 3350, profit: 134000000 },
      { name: "دی", sales: 720000000, orders: 3600, profit: 144000000 },
      { name: "بهمن", sales: 680000000, orders: 3400, profit: 136000000 },
      { name: "اسفند", sales: 850000000, orders: 4250, profit: 170000000 },
    ],
  };
  return baseData[timeRange];
};

// Category distribution data
export const categoryDistribution = [
  { name: "الکترونیک", value: 35000000, color: "hsl(var(--primary))" },
  { name: "پوشاک", value: 28000000, color: "hsl(var(--secondary))" },
  { name: "خانه و آشپزخانه", value: 22000000, color: "hsl(var(--accent))" },
  { name: "زیبایی و سلامت", value: 18000000, color: "hsl(var(--warning))" },
  { name: "ورزش و سفر", value: 12000000, color: "hsl(var(--success))" },
];

// Top products data
export const topProducts = [
  { name: "آیفون ۱۵ پرو مکس", sales: 45000000, quantity: 120 },
  { name: "لپ‌تاپ ایسوس ROG", sales: 38000000, quantity: 45 },
  { name: "ساعت هوشمند سامسونگ", sales: 28000000, quantity: 180 },
  { name: "هدفون سونی WH-1000", sales: 22000000, quantity: 95 },
  { name: "تبلت آیپد پرو", sales: 18000000, quantity: 35 },
  { name: "کنسول PS5", sales: 15000000, quantity: 28 },
  { name: "دوربین کانن EOS", sales: 12000000, quantity: 15 },
  { name: "اسپیکر JBL", sales: 8500000, quantity: 210 },
];

// Brand performance data
export const brandPerformance = [
  { name: "اپل", sales: 85000000, orders: 450, products: 25 },
  { name: "سامسونگ", sales: 72000000, orders: 380, products: 42 },
  { name: "سونی", sales: 45000000, orders: 220, products: 18 },
  { name: "ایسوس", sales: 38000000, orders: 180, products: 35 },
  { name: "شیائومی", sales: 32000000, orders: 410, products: 52 },
  { name: "ال‌جی", sales: 28000000, orders: 145, products: 22 },
];

// Supplier stats data
export const supplierStats = [
  { id: "1", name: "پخش الکترونیک", totalProducts: 145, totalSales: 85000000, ordersFulfilled: 420, performance: 94, trend: "up" as const },
  { id: "2", name: "توزیع دیجیتال", totalProducts: 89, totalSales: 62000000, ordersFulfilled: 310, performance: 88, trend: "up" as const },
  { id: "3", name: "شرکت آریا", totalProducts: 67, totalSales: 45000000, ordersFulfilled: 225, performance: 82, trend: "neutral" as const },
  { id: "4", name: "پارس تجارت", totalProducts: 52, totalSales: 38000000, ordersFulfilled: 190, performance: 76, trend: "down" as const },
  { id: "5", name: "ایران کالا", totalProducts: 38, totalSales: 28000000, ordersFulfilled: 140, performance: 91, trend: "up" as const },
];

// Inventory status data
export const inventoryStatus = [
  { name: "موجود", value: 68, fill: "hsl(var(--success))" },
  { name: "کم موجودی", value: 18, fill: "hsl(var(--warning))" },
  { name: "ناموجود", value: 14, fill: "hsl(var(--destructive))" },
];

// Orders heatmap data
export const ordersHeatmap = [
  { day: "شنبه", hours: [2, 5, 12, 28, 45, 52, 38, 15] },
  { day: "یکشنبه", hours: [1, 3, 8, 22, 38, 42, 32, 12] },
  { day: "دوشنبه", hours: [3, 6, 15, 35, 52, 58, 45, 18] },
  { day: "سه‌شنبه", hours: [2, 5, 12, 30, 48, 55, 40, 16] },
  { day: "چهارشنبه", hours: [4, 8, 18, 38, 55, 62, 48, 20] },
  { day: "پنج‌شنبه", hours: [5, 10, 22, 45, 68, 75, 58, 25] },
  { day: "جمعه", hours: [1, 2, 5, 12, 25, 28, 18, 8] },
];

// Customer segments data
export const customerSegments = [
  { name: "مشتری وفادار", size: 1250, color: "hsl(var(--primary))" },
  { name: "مشتری جدید", size: 890, color: "hsl(var(--secondary))" },
  { name: "مشتری فعال", size: 650, color: "hsl(var(--accent))" },
  { name: "مشتری غیرفعال", size: 420, color: "hsl(var(--warning))" },
  { name: "مشتری VIP", size: 180, color: "hsl(var(--success))" },
];

// Revenue comparison data
export const getRevenueComparison = (timeRange: TimeRange) => {
  const data: Record<TimeRange, { name: string; current: number; previous: number }[]> = {
    daily: [
      { name: "۰۶:۰۰", current: 2400000, previous: 2100000 },
      { name: "۰۹:۰۰", current: 4800000, previous: 4200000 },
      { name: "۱۲:۰۰", current: 8200000, previous: 7500000 },
      { name: "۱۵:۰۰", current: 6100000, previous: 5800000 },
      { name: "۱۸:۰۰", current: 9800000, previous: 8900000 },
      { name: "۲۱:۰۰", current: 5400000, previous: 4800000 },
    ],
    weekly: [
      { name: "شنبه", current: 24000000, previous: 22000000 },
      { name: "یکشنبه", current: 18000000, previous: 16500000 },
      { name: "دوشنبه", current: 32000000, previous: 28000000 },
      { name: "سه‌شنبه", current: 28000000, previous: 25000000 },
      { name: "چهارشنبه", current: 35000000, previous: 31000000 },
      { name: "پنج‌شنبه", current: 42000000, previous: 38000000 },
      { name: "جمعه", current: 15000000, previous: 14000000 },
    ],
    monthly: [
      { name: "هفته ۱", current: 120000000, previous: 108000000 },
      { name: "هفته ۲", current: 145000000, previous: 130000000 },
      { name: "هفته ۳", current: 138000000, previous: 125000000 },
      { name: "هفته ۴", current: 162000000, previous: 148000000 },
    ],
    yearly: [
      { name: "فروردین", current: 450000000, previous: 400000000 },
      { name: "اردیبهشت", current: 520000000, previous: 465000000 },
      { name: "خرداد", current: 480000000, previous: 435000000 },
      { name: "تیر", current: 610000000, previous: 545000000 },
      { name: "مرداد", current: 580000000, previous: 520000000 },
      { name: "شهریور", current: 540000000, previous: 490000000 },
    ],
  };
  return data[timeRange];
};

// KPI data by time range
export const getKPIData = (timeRange: TimeRange) => {
  const kpis: Record<TimeRange, { revenue: number; orders: number; customers: number; avgOrder: number; revenueChange: number; ordersChange: number; customersChange: number; avgOrderChange: number }> = {
    daily: {
      revenue: 36700000,
      orders: 183,
      customers: 142,
      avgOrder: 200546,
      revenueChange: 12.5,
      ordersChange: 8.3,
      customersChange: 15.2,
      avgOrderChange: 3.8,
    },
    weekly: {
      revenue: 194000000,
      orders: 970,
      customers: 756,
      avgOrder: 200000,
      revenueChange: 18.2,
      ordersChange: 14.5,
      customersChange: 22.1,
      avgOrderChange: 3.2,
    },
    monthly: {
      revenue: 565000000,
      orders: 2825,
      customers: 2198,
      avgOrder: 200000,
      revenueChange: 24.8,
      ordersChange: 19.4,
      customersChange: 28.6,
      avgOrderChange: 4.5,
    },
    yearly: {
      revenue: 7310000000,
      orders: 36550,
      customers: 28468,
      avgOrder: 200000,
      revenueChange: 32.4,
      ordersChange: 26.8,
      customersChange: 35.2,
      avgOrderChange: 4.4,
    },
  };
  return kpis[timeRange];
};

// Categories for filter
export const filterCategories = [
  { id: "electronics", name: "الکترونیک" },
  { id: "clothing", name: "پوشاک" },
  { id: "home", name: "خانه و آشپزخانه" },
  { id: "beauty", name: "زیبایی و سلامت" },
  { id: "sports", name: "ورزش و سفر" },
];

// Brands for filter
export const filterBrands = [
  { id: "apple", name: "اپل" },
  { id: "samsung", name: "سامسونگ" },
  { id: "sony", name: "سونی" },
  { id: "asus", name: "ایسوس" },
  { id: "xiaomi", name: "شیائومی" },
];
