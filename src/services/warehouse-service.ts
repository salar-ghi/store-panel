
import apiClient from '@/lib/api-client';
import { Warehouse, CreateWarehouseRequest, UpdateWarehouseRequest } from '@/types/warehouse';

export class WarehouseService {
  static async getAll(): Promise<Warehouse[]> {
    const response = await apiClient.get<Warehouse[]>('/api/warehouses');
    return response.data;
  }

  static async getById(id: number): Promise<Warehouse> {
    const response = await apiClient.get<Warehouse>(`/api/warehouses/${id}`);
    return response.data;
  }

  static async create(data: CreateWarehouseRequest): Promise<Warehouse> {
    const response = await apiClient.post<Warehouse>('/api/warehouses', data);
    return response.data;
  }

  static async update(id: number, data: UpdateWarehouseRequest): Promise<Warehouse> {
    const response = await apiClient.put<Warehouse>(`/api/warehouses/${id}`, data);
    return response.data;
  }

  static async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/warehouses/${id}`);
  }

  static async getAvailability(): Promise<{ id: number, name: string, availableSpace: number }[]> {
    const response = await apiClient.get<{ id: number, name: string, availableSpace: number }[]>('/api/warehouses/availability');
    return response.data;
  }
}
