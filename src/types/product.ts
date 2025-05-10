
export interface ProductDimension {
  length: number;
  width: number;
  height: number;
  weight: number;
  unit: string;
}

export interface ProductStock {
  quantity: number;
  reorderThreshold: number;
  warehouseId: number;
  warehouseName?: string;
  location?: string;
}

export interface ProductPrice {
  amount: number;
  currency: string;
  pricingTier: 'retail' | 'wholesale' | 'discount' | 'premium';
  effectiveDate: string;
  expiryDate?: string;
}

export interface ProductAttribute {
  key: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  brandId: number;
  supplierId: number;
  categoryName?: string;
  brandName?: string;
  supplierName?: string;
  images?: string[]; // Add support for multiple images
  coverImage?: string; // Main product image
  tags?: string[]; // Add support for tags
  location?: string; // Storage location
  reorderLevel?: number; // Level at which to reorder
  lastRestocked?: Date; // When the product was last restocked
  status?: 'active' | 'discontinued' | 'seasonal'; // Product status
  dimensions?: ProductDimension;
  stock?: ProductStock;
  prices?: ProductPrice[];
  attributes?: ProductAttribute[];
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  brandId: number;
  supplierId: number;
  images?: string[]; // Add support for multiple images
  coverImage?: string; // Main product image
  tags?: string[]; // Add support for tags
  location?: string; // Storage location
  reorderLevel?: number; // Level at which to reorder
  dimensions?: ProductDimension;
  stock?: ProductStock;
  prices?: ProductPrice[];
  attributes?: ProductAttribute[];
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  brandId: number;
  supplierId: number;
  images?: string[]; // Add support for multiple images
  coverImage?: string; // Main product image
  tags?: string[]; // Add support for tags
  location?: string; // Storage location
  reorderLevel?: number; // Level at which to reorder
  status?: 'active' | 'discontinued' | 'seasonal'; // Product status
  dimensions?: ProductDimension;
  stock?: ProductStock;
  prices?: ProductPrice[];
  attributes?: ProductAttribute[];
}
