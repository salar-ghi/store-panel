
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
  tags?: number[]; // Add support for tags
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
  tags?: number[]; // Add support for tags
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
  tags?: number[]; // Add support for tags
}
