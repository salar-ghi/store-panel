import { Order } from "@/types/order";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { Brand } from "@/types/brand";

export const mockCategories: Category[] = [
  { id: 1, name: "نوشیدنی‌ها", description: "انواع نوشیدنی", createdAt: "2024-01-01" },
  { id: 2, name: "پروتئین‌ها", description: "گوشت و مرغ و ماهی", createdAt: "2024-01-01" },
  { id: 3, name: "لبنیات", description: "شیر و ماست و پنیر", createdAt: "2024-01-01" },
  { id: 4, name: "الکترونیک", description: "لوازم الکترونیکی", createdAt: "2024-01-01" },
  { id: 5, name: "موبایل و تبلت", description: "گوشی و تبلت", createdAt: "2024-01-01" },
  { id: 6, name: "لوازم خانگی", description: "لوازم برقی خانه", createdAt: "2024-01-01" },
];

export const mockBrands: Brand[] = [
  { id: 1, name: "کوکاکولا", description: "نوشابه", createdTime: "2024-01-01", categoryIds: [1] },
  { id: 2, name: "پپسی", description: "نوشابه", createdTime: "2024-01-01", categoryIds: [1] },
  { id: 3, name: "کاله", description: "لبنیات", createdTime: "2024-01-01", categoryIds: [3] },
  { id: 4, name: "میهن", description: "لبنیات", createdTime: "2024-01-01", categoryIds: [3] },
  { id: 5, name: "سامسونگ", description: "الکترونیک", createdTime: "2024-01-01", categoryIds: [4, 5] },
  { id: 6, name: "اپل", description: "الکترونیک", createdTime: "2024-01-01", categoryIds: [4, 5] },
  { id: 7, name: "ال‌جی", description: "لوازم خانگی", createdTime: "2024-01-01", categoryIds: [6] },
  { id: 8, name: "بوش", description: "لوازم خانگی", createdTime: "2024-01-01", categoryIds: [6] },
];

// Helper to get current price from product prices array
export const getProductPrice = (product: Product): number => {
  if (product.price !== undefined) return product.price;
  if (product.prices && product.prices.length > 0) {
    return product.prices[0].amount;
  }
  return 0;
};

// Helper to get total stock from product
export const getProductStock = (product: Product): number => {
  if (product.stockQuantity !== undefined) return product.stockQuantity;
  if (product.prices && product.prices.length > 0) {
    return product.prices.reduce((sum, p) => sum + (p.quantity || 0) - (p.soldQuantity || 0), 0);
  }
  if (product.stock) return product.stock.quantity;
  return 0;
};

export const mockProducts: Product[] = [
  // Drinks
  { id: 1, name: "نوشابه کوکاکولا ۱.۵ لیتری", description: "", categoryId: 1, brandId: 1, supplierId: 1, categoryName: "نوشیدنی‌ها", brandName: "کوکاکولا", price: 35000, stockQuantity: 100, status: 'active', availability: 'available' },
  { id: 2, name: "نوشابه پپسی ۱.۵ لیتری", description: "", categoryId: 1, brandId: 2, supplierId: 1, categoryName: "نوشیدنی‌ها", brandName: "پپسی", price: 33000, stockQuantity: 80, status: 'active', availability: 'available' },
  { id: 3, name: "آب معدنی ۱ لیتری", description: "", categoryId: 1, brandId: 1, supplierId: 1, categoryName: "نوشیدنی‌ها", brandName: "کوکاکولا", price: 8000, stockQuantity: 200, status: 'active', availability: 'available' },
  // Proteins
  { id: 4, name: "سینه مرغ ۱ کیلو", description: "", categoryId: 2, brandId: 3, supplierId: 2, categoryName: "پروتئین‌ها", brandName: "کاله", price: 180000, stockQuantity: 50, status: 'active', availability: 'available' },
  { id: 5, name: "گوشت چرخ‌کرده ۵۰۰ گرم", description: "", categoryId: 2, brandId: 3, supplierId: 2, categoryName: "پروتئین‌ها", brandName: "کاله", price: 250000, stockQuantity: 30, status: 'active', availability: 'available' },
  // Dairy
  { id: 6, name: "شیر کاله ۱ لیتری", description: "", categoryId: 3, brandId: 3, supplierId: 3, categoryName: "لبنیات", brandName: "کاله", price: 45000, stockQuantity: 60, status: 'active', availability: 'available' },
  { id: 7, name: "ماست میهن ۹۰۰ گرم", description: "", categoryId: 3, brandId: 4, supplierId: 3, categoryName: "لبنیات", brandName: "میهن", price: 55000, stockQuantity: 40, status: 'inactive', availability: 'unavailable' },
  // Electronics
  { id: 8, name: "هدفون بی‌سیم سامسونگ", description: "", categoryId: 4, brandId: 5, supplierId: 4, categoryName: "الکترونیک", brandName: "سامسونگ", price: 2500000, stockQuantity: 20, status: 'active', availability: 'available' },
  { id: 9, name: "شارژر اپل ۲۰ وات", description: "", categoryId: 4, brandId: 6, supplierId: 4, categoryName: "الکترونیک", brandName: "اپل", price: 1200000, stockQuantity: 35, status: 'active', availability: 'available' },
  // Mobile
  { id: 10, name: "گوشی سامسونگ A54", description: "", categoryId: 5, brandId: 5, supplierId: 5, categoryName: "موبایل و تبلت", brandName: "سامسونگ", price: 15000000, stockQuantity: 15, status: 'active', availability: 'available' },
  { id: 11, name: "آیفون ۱۵", description: "", categoryId: 5, brandId: 6, supplierId: 5, categoryName: "موبایل و تبلت", brandName: "اپل", price: 55000000, stockQuantity: 8, status: 'active', availability: 'draft' },
  // Home Appliances
  { id: 12, name: "جاروبرقی ال‌جی", description: "", categoryId: 6, brandId: 7, supplierId: 6, categoryName: "لوازم خانگی", brandName: "ال‌جی", price: 8500000, stockQuantity: 12, status: 'active', availability: 'available' },
  { id: 13, name: "ماشین ظرفشویی بوش", description: "", categoryId: 6, brandId: 8, supplierId: 6, categoryName: "لوازم خانگی", brandName: "بوش", price: 35000000, stockQuantity: 5, status: 'inactive', availability: 'discontinued' },
];

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customer: "رضا محمدی",
    customerPhone: "09121234567",
    items: [
      { id: "1", productId: 1, productName: "نوشابه کوکاکولا ۱.۵ لیتری", categoryId: 1, categoryName: "نوشیدنی‌ها", brandId: 1, brandName: "کوکاکولا", quantity: 3, unitPrice: 35000, totalPrice: 105000 },
      { id: "2", productId: 8, productName: "هدفون بی‌سیم سامسونگ", categoryId: 4, categoryName: "الکترونیک", brandId: 5, brandName: "سامسونگ", quantity: 1, unitPrice: 2500000, totalPrice: 2500000 },
    ],
    total: 2605000,
    status: "pending",
    date: "۱۴۰۴/۰۲/۰۵",
  },
  {
    id: "ORD-002",
    customer: "مریم احمدی",
    customerPhone: "09129876543",
    items: [
      { id: "1", productId: 6, productName: "شیر کاله ۱ لیتری", categoryId: 3, categoryName: "لبنیات", brandId: 3, brandName: "کاله", quantity: 5, unitPrice: 45000, totalPrice: 225000 },
    ],
    total: 225000,
    status: "approved",
    date: "۱۴۰۴/۰۲/۰۵",
  },
  {
    id: "ORD-003",
    customer: "علی رضایی",
    customerPhone: "09123456789",
    items: [
      { id: "1", productId: 10, productName: "گوشی سامسونگ A54", categoryId: 5, categoryName: "موبایل و تبلت", brandId: 5, brandName: "سامسونگ", quantity: 1, unitPrice: 15000000, totalPrice: 15000000 },
      { id: "2", productId: 9, productName: "شارژر اپل ۲۰ وات", categoryId: 4, categoryName: "الکترونیک", brandId: 6, brandName: "اپل", quantity: 2, unitPrice: 1200000, totalPrice: 2400000 },
    ],
    total: 17400000,
    status: "shipped",
    date: "۱۴۰۴/۰۲/۰۴",
  },
];
