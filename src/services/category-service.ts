
import apiClient from '@/lib/api-client';
import { Category, CreateCategoryRequest, CategoryBrandRelation } from '@/types/category';
import { base64ToImageUrl } from '@/lib/image-upload';

export class CategoryService {
  static async getAllCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/api/Category/categories');
    
    // Process base64 images for display
    return response.data.map(category => ({
      ...category,
      image: category.image ? base64ToImageUrl(category.image) : undefined
    }));
  }

  static async getCategoryById(id: number): Promise<Category> {
    const response = await apiClient.get<Category>(`/api/Category/categories/${id}`);
    
    // Process base64 image for display
    return {
      ...response.data,
      image: response.data.image ? base64ToImageUrl(response.data.image) : undefined
    };
  }

  static async createCategory(categoryData: CreateCategoryRequest): Promise<Category> {
    const response = await apiClient.post<Category>('/api/Category/categories', categoryData);
    return response.data;
  }

  static async updateCategory(id: number, categoryData: CreateCategoryRequest): Promise<Category> {
    const response = await apiClient.put<Category>(`/api/Category/categories/${id}`, categoryData);
    return response.data;
  }

  static async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(`/api/Category/categories/${id}`);
  }

  static async getCategoryBrandRelations(categoryId: number): Promise<CategoryBrandRelation[]> {
    const response = await apiClient.get<CategoryBrandRelation[]>(`/api/Category/categories/${categoryId}/brands`);
    return response.data;
  }
}
