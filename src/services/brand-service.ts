
import apiClient from '@/lib/api-client';
import { Brand, CreateBrandRequest } from '@/types/brand';

export const BrandService = {
  getAll: async (): Promise<Brand[]> => {
    const response = await apiClient.get<Brand[]>('/api/Brand/brands');
    return response.data;
  },
  
  getById: async (id: number): Promise<Brand> => {
    const response = await apiClient.get<Brand>(`/api/Brand/brands/${id}`);
    return response.data;
  },
  
  create: async (brand: CreateBrandRequest): Promise<Brand> => {
    const response = await apiClient.post<Brand>('/api/Brand/brands', brand);
    return response.data;
  },
  
  update: async (id: number, brand: CreateBrandRequest): Promise<Brand> => {
    const response = await apiClient.put<Brand>(`/api/Brand/brands/${id}`, brand);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/Brand/brands/${id}`);
  }
};
