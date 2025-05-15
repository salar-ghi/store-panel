
import apiClient from '@/lib/api-client';
import { CreateProductRequest, Product, UpdateProductRequest } from '@/types/product';

export class ProductService {
  static async getAll(): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/api/Product/products');
    return response.data;
  }

  static async getById(id: number): Promise<Product> {
    const response = await apiClient.get<Product>(`/api/Product/products/${id}`);
    return response.data;
  }

  static async create(data: CreateProductRequest): Promise<Product> {
    const response = await apiClient.post<Product>('/api/Product/products', data);
    return response.data;
  }

  static async update(id: number, data: UpdateProductRequest): Promise<Product> {
    const response = await apiClient.put<Product>(`/api/Product/products/${id}`, data);
    return response.data;
  }

  static async delete(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }

  static async getLowStockProducts(): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/products/low-stock');
    return response.data;
  }

  static async bulkUpdateStock(updates: { id: number, quantity: number }[]): Promise<void> {
    await apiClient.post('/products/stock/bulk-update', { updates });
  }

  static async transferStock(data: { 
    productId: number, 
    fromLocation: string, 
    toLocation: string, 
    quantity: number 
  }): Promise<void> {
    await apiClient.post('/products/stock/transfer', data);
  }

  static async adjustStock(data: {
    productId: number,
    quantity: number,
    reason: string,
    location?: string
  }): Promise<void> {
    await apiClient.post('/products/stock/adjust', data);
  }
}
