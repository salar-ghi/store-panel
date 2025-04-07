
import apiClient from '@/lib/api-client';
import { Supplier } from '@/types/supplier';

export class SupplierService {
  static async getAll(): Promise<Supplier[]> {
    const response = await apiClient.get<Supplier[]>('/api/Supplier/suppliers');
    return response.data;
  }
}
