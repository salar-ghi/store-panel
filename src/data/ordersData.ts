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

export const mockProducts: Product[] = [
  // Drinks
  { id: 1, name: "نوشابه کوکاکولا ۱.۵ لیتری", description: "", price: 35000, stockQuantity: 100, categoryId: 1, brandId: 1, supplierId: 1, categoryName: "نوشیدنی‌ها", brandName: "کوکاکولا" },
  { id: 2, name: "نوشابه پپسی ۱.۵ لیتری", description: "", price: 33000, stockQuantity: 80, categoryId: 1, brandId: 2, supplierId: 1, categoryName: "نوشیدنی‌ها", brandName: "پپسی" },
  { id: 3, name: "آب معدنی ۱ لیتری", description: "", price: 8000, stockQuantity: 200, categoryId: 1, brandId: 1, supplierId: 1, categoryName: "نوشیدنی‌ها", brandName: "کوکاکولا" },
  // Proteins
  { id: 4, name: "سینه مرغ ۱ کیلو", description: "", price: 180000, stockQuantity: 50, categoryId: 2, brandId: 3, supplierId: 2, categoryName: "پروتئین‌ها", brandName: "کاله" },
  { id: 5, name: "گوشت چرخ‌کرده ۵۰۰ گرم", description: "", price: 250000, stockQuantity: 30, categoryId: 2, brandId: 3, supplierId: 2, categoryName: "پروتئین‌ها", brandName: "کاله" },
  // Dairy
  { id: 6, name: "شیر کاله ۱ لیتری", description: "", price: 45000, stockQuantity: 60, categoryId: 3, brandId: 3, supplierId: 3, categoryName: "لبنیات", brandName: "کاله" },
  { id: 7, name: "ماست میهن ۹۰۰ گرم", description: "", price: 55000, stockQuantity: 40, categoryId: 3, brandId: 4, supplierId: 3, categoryName: "لبنیات", brandName: "میهن" },
  // Electronics
  { id: 8, name: "هدفون بی‌سیم سامسونگ", description: "", price: 2500000, stockQuantity: 20, categoryId: 4, brandId: 5, supplierId: 4, categoryName: "الکترونیک", brandName: "سامسونگ" },
  { id: 9, name: "شارژر اپل ۲۰ وات", description: "", price: 1200000, stockQuantity: 35, categoryId: 4, brandId: 6, supplierId: 4, categoryName: "الکترونیک", brandName: "اپل" },
  // Mobile
  { id: 10, name: "گوشی سامسونگ A54", description: "", price: 15000000, stockQuantity: 15, categoryId: 5, brandId: 5, supplierId: 5, categoryName: "موبایل و تبلت", brandName: "سامسونگ" },
  { id: 11, name: "آیفون ۱۵", description: "", price: 55000000, stockQuantity: 8, categoryId: 5, brandId: 6, supplierId: 5, categoryName: "موبایل و تبلت", brandName: "اپل" },
  // Home Appliances
  { id: 12, name: "جاروبرقی ال‌جی", description: "", price: 8500000, stockQuantity: 12, categoryId: 6, brandId: 7, supplierId: 6, categoryName: "لوازم خانگی", brandName: "ال‌جی" },
  { id: 13, name: "ماشین ظرفشویی بوش", description: "", price: 35000000, stockQuantity: 5, categoryId: 6, brandId: 8, supplierId: 6, categoryName: "لوازم خانگی", brandName: "بوش" },
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
