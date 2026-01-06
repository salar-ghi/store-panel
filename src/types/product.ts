
export type WeightUnit = 'gram' | 'kilogram' | 'mithqal' | 'ounce' | 'pound';
export type QuantityUnit = 'piece' | 'box' | 'pack' | 'carton' | 'dozen' | 'pair' | 'set' | 'liter' | 'milliliter';
export type DimensionUnit = 'cm' | 'm' | 'mm' | 'inch' | 'ft';

export interface ProductDimension {
  length: number;
  width: number;
  height: number;
  weight: number;
  dimensionUnit: DimensionUnit;
  weightUnit: WeightUnit;
}

export interface ProductStock {
  quantity: number;
  reorderThreshold: number;
  warehouseId: number;
  warehouseName?: string;
  location?: string;
  quantityUnit: QuantityUnit;
}

export interface ProductPrice {
  id?: number;
  batchNumber?: string;
  amount: number;
  costPrice: number;
  currency: string;
  pricingTier: 'retail' | 'wholesale' | 'discount' | 'premium';
  effectiveDate: string;
  expiryDate?: string;
  quantity: number;
  soldQuantity?: number;
  notes?: string;
}

export interface ProductAttribute {
  key: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  brandId: number;
  supplierId: number;
  categoryName?: string;
  brandName?: string;
  supplierName?: string;
  images?: string[];
  coverImage?: string;
  tags?: string[];
  location?: string;
  reorderLevel?: number;
  lastRestocked?: Date;
  status?: 'active' | 'discontinued' | 'seasonal';
  dimensions?: ProductDimension;
  stock?: ProductStock;
  // Computed helper properties for backward compatibility
  price?: number;
  stockQuantity?: number;
  prices?: ProductPrice[];
  attributes?: ProductAttribute[];
}

export interface CreateProductRequest {
  name: string;
  description: string;
  categoryId: number;
  brandId: number;
  supplierId: number;
  images?: string[];
  coverImage?: string;
  tags?: string[];
  location?: string;
  reorderLevel?: number;
  dimensions?: ProductDimension;
  stock?: ProductStock;
  prices?: ProductPrice[];
  attributes?: ProductAttribute[];
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  categoryId: number;
  brandId: number;
  supplierId: number;
  images?: string[];
  coverImage?: string;
  tags?: string[];
  location?: string;
  reorderLevel?: number;
  status?: 'active' | 'discontinued' | 'seasonal';
  dimensions?: ProductDimension;
  stock?: ProductStock;
  prices?: ProductPrice[];
  attributes?: ProductAttribute[];
}
