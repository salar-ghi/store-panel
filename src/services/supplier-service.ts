
import apiClient from '@/lib/api-client';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '@/types/supplier';

export class SupplierService {
  static async getAll(): Promise<Supplier[]> {
    const response = await apiClient.get<Supplier[]>('/api/Supplier/suppliers');
    return response.data;
  }

  static async getById(id: number): Promise<Supplier> {
    const response = await apiClient.get<Supplier>(`/api/Supplier/suppliers/${id}`);
    return response.data;
  }

  static async create(data: CreateSupplierRequest): Promise<Supplier> {
    const response = await apiClient.post<Supplier>('/api/Supplier/suppliers', data);
    return response.data;
  }

  static async update(id: number, data: UpdateSupplierRequest): Promise<Supplier> {
    const response = await apiClient.put<Supplier>(`/api/Supplier/suppliers/${id}`, data);
    return response.data;
  }

  static async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/Supplier/suppliers/${id}`);
  }
  
  static async getByUserId(userId: string): Promise<Supplier | null> {
    try {
      const response = await apiClient.get<Supplier>(`/api/Supplier/suppliers/user/${userId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
  
  static async approve(id: number): Promise<Supplier> {
    const response = await apiClient.put<Supplier>(`/api/Supplier/suppliers/${id}/approve`, {});
    return response.data;
  }
  
  static async getSupplierProducts(supplierId: number): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/api/Supplier/suppliers/${supplierId}/products`);
    return response.data;
  }
}
