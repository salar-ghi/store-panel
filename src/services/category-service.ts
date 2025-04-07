
import apiClient from '@/lib/api-client';
import { Category, CreateCategoryRequest } from '@/types/category';

export const CategoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/api/Category/categories');
    return response.data;
  },
  
  getById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<Category>(`/api/Category/categories/${id}`);
    return response.data;
  },
  
  create: async (category: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post<Category>('/api/Category/categories', category);
    return response.data;
  },
  
  update: async (id: number, category: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.put<Category>(`/api/Category/categories/${id}`, category);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/Category/categories/${id}`);
  }
};
