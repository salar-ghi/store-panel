
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
}
