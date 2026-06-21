
export type WeightUnit = 'gram' | 'kilogram' | 'mithqal' | 'ounce' | 'pound';
export type QuantityUnit = 'piece' | 'box' | 'pack' | 'carton' | 'dozen' | 'pair' | 'set' | 'liter' | 'milliliter';
export type DimensionUnit = 'cm' | 'm' | 'mm' | 'inch' | 'ft';

/**
 * How a product is sold to customers.
 *  - piece  : countable, integer quantity (e.g. mobile phones)
 *  - weight : sold by weight, decimal quantity (e.g. meat, beans by kg)
 *  - both   : prepacked AND loose-by-weight (e.g. 35kg pack of beans OR 2.5kg loose)
 */
export type SalesMode = 'piece' | 'weight' | 'both';

export interface SalesUnitConfig {
  mode: SalesMode;
  /** Unit used when selling by weight (kg, gram, ...) */
  weightUnit?: WeightUnit;
  /** Price per single weight unit (e.g. 15,000 toman per kg). */
  pricePerWeightUnit?: number;
  /** For pack mode: weight of one pack (e.g. 35 kg per sack of beans). */
  packWeight?: number;
  /** Optional human label for the pack form ("کیسه ۳۵ کیلویی"). */
  packLabel?: string;
}

// Product status - whether product is active or inactive
export type ProductStatus = 'active' | 'inactive';

// Product availability - detailed availability states
export type ProductAvailability = 'available' | 'unavailable' | 'discontinued' | 'draft' | 'out_of_stock';

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
  // New unified storage hierarchy (StorageSpace → Zone → Shelf)
  spaceId?: number;
  spaceName?: string;
  zoneId?: number;
  zoneName?: string;
  shelfId?: number;
  shelfCode?: string;
  // Legacy field (kept for backward compatibility with old warehouse API)
  warehouseId?: number;
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

// Product variant option (e.g., color: red, blue, green)
export interface ProductVariantOption {
  id?: number;
  name: string; // e.g., "قرمز" (red)
  value: string; // e.g., "red" or hex color
  priceAdjustment?: number; // additional price for this option
  stockQuantity?: number; // specific stock for this variant option
  sku?: string; // unique SKU for this variant
  isAvailable?: boolean;
}

// Product variant type (e.g., color, size)
export interface ProductVariant {
  id?: number;
  name: string; // e.g., "رنگ" (color), "سایز" (size)
  type: 'color' | 'size' | 'material' | 'style' | 'capacity' | 'custom';
  options: ProductVariantOption[];
  required?: boolean; // is selecting this variant required?
  displayOrder?: number;
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
  // Status and availability
  status: ProductStatus;
  availability: ProductAvailability;
  // Legacy status field for backward compatibility
  legacyStatus?: 'active' | 'discontinued' | 'seasonal';
  dimensions?: ProductDimension;
  stock?: ProductStock;
  // Computed helper properties for backward compatibility
  price?: number;
  stockQuantity?: number;
  prices?: ProductPrice[];
  attributes?: ProductAttribute[];
  // Product variants
  variants?: ProductVariant[];
  // Multi-batch pricing strategy: how to display sale price when the product
  // has multiple active stock batches with different prices.
  pricingStrategy?: 'fifo' | 'latest' | 'average';
  /** How this product is sold (piece / by weight / both). Default 'piece'. */
  salesUnit?: SalesUnitConfig;
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
  status?: ProductStatus;
  availability?: ProductAvailability;
  dimensions?: ProductDimension;
  stock?: ProductStock;
  prices?: ProductPrice[];
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  pricingStrategy?: 'fifo' | 'latest' | 'average';
  salesUnit?: SalesUnitConfig;
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
  status?: ProductStatus;
  availability?: ProductAvailability;
  dimensions?: ProductDimension;
  stock?: ProductStock;
  prices?: ProductPrice[];
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  pricingStrategy?: 'fifo' | 'latest' | 'average';
}
