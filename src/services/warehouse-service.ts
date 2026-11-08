
import apiClient from '@/lib/api-client';
import { Warehouse, CreateWarehouseRequest, UpdateWarehouseRequest } from '@/types/warehouse';
import { PaginationParams, PagedResult } from '@/types/pagination';
import { notifyApiError } from '@/lib/notify-error';

export class WarehouseService {
  static async getAll(): Promise<Warehouse[]> {
    const res = await this.getPaged({ pageIndex: 1, pageSize: 1000 });
    return res.items;
  }

  static async getPaged(params?: PaginationParams): Promise<PagedResult<Warehouse>> {
    const pageIndex = params?.pageIndex ?? 1;
    const pageSize = params?.pageSize ?? 10;
    try {
      const cleanParams: Record<string, unknown> = {};
      if (params?.pageIndex != null) cleanParams.pageIndex = params.pageIndex;
      if (params?.pageSize != null) cleanParams.pageSize = params.pageSize;
      if (params?.search) cleanParams.search = params.search;
      if (params?.sortBy) cleanParams.sortBy = params.sortBy;

      const response = await apiClient.get<any>('/api/warehouses', { params: cleanParams });
      const data = response.data;

      if (Array.isArray(data)) {
        return {
          items: data,
          totalCount: data.length,
          pageIndex,
          pageSize,
        };
      }

      const items = data?.items ?? data?.data ?? data?.result ?? data?.value ?? [];
      const totalCount = data?.totalCount ?? data?.total ?? data?.count ?? (Array.isArray(items) ? items.length : 0);

      return {
        items: Array.isArray(items) ? items : [],
        totalCount: typeof totalCount === 'number' ? totalCount : 0,
        pageIndex: data?.pageIndex ?? pageIndex,
        pageSize: data?.pageSize ?? pageSize,
      };
    } catch (error) {
      console.error('[warehouse] GET /api/warehouses failed:', error);
      notifyApiError(error, 'خطا در دریافت مکان‌های انبار');
      return { items: [], totalCount: 0, pageIndex, pageSize };
    }
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
