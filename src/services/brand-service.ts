
import apiClient from '@/lib/api-client';
import { Brand, CreateBrandRequest } from '@/types/brand';
import { base64ToImageUrl } from '@/lib/image-upload';

export const BrandService = {
  getAll: async (): Promise<Brand[]> => {
    const response = await apiClient.get<Brand[]>('/api/Brand/brands');
    // Process logo images for display
    return response.data.map(brand => ({
      ...brand,
      logo: brand.logo ? base64ToImageUrl(brand.logo) : undefined
    }));
  },
  
  getById: async (id: number): Promise<Brand> => {
    const response = await apiClient.get<Brand>(`/api/Brand/brands/${id}`);
    return {
      ...response.data,
      logo: response.data.logo ? base64ToImageUrl(response.data.logo) : undefined
    };
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
  },

  getBrandsByCategory: async (categoryId: number): Promise<Brand[]> => {
    const response = await apiClient.get<Brand[]>(`/api/Brand/brands/category/${categoryId}`);
    return response.data.map(brand => ({
      ...brand,
      logo: brand.logo ? base64ToImageUrl(brand.logo) : undefined
    }));
  }
};
