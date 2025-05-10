
import apiClient from '@/lib/api-client';
import { Category, CreateCategoryRequest } from '@/types/category';

// Mock data for UI development
const mockCategories: Category[] = [
  {
    id: 1, 
    name: "Electronics", 
    description: "Electronic devices and accessories",
    createdAt: new Date(2023, 0, 15).toISOString(),
    productCount: 124,
    brandRelations: ["Samsung", "Apple", "Sony"]
  },
  {
    id: 2, 
    name: "Clothing", 
    description: "Apparel and fashion items",
    createdAt: new Date(2023, 1, 20).toISOString(),
    productCount: 89,
    brandRelations: ["Nike", "Adidas", "Zara"]
  },
  {
    id: 3, 
    name: "Home & Kitchen", 
    description: "Home appliances and kitchen essentials",
    createdAt: new Date(2023, 2, 5).toISOString(),
    productCount: 56,
    brandRelations: ["Ikea", "Philips", "Bosch"]
  },
  {
    id: 4, 
    name: "Books", 
    description: "Books, e-books and publications",
    createdAt: new Date(2023, 3, 10).toISOString(),
    productCount: 210,
    brandRelations: ["Penguin", "Random House", "Harper Collins"]
  },
  {
    id: 5, 
    name: "Beauty", 
    description: "Beauty products and cosmetics",
    createdAt: new Date(2023, 4, 1).toISOString(),
    productCount: 67,
    brandRelations: ["L'Oreal", "Nivea", "Maybelline"]
  },
  {
    id: 6, 
    name: "Men's Clothing", 
    description: "Clothing for men",
    createdAt: new Date(2023, 5, 15).toISOString(),
    productCount: 45,
    brandRelations: ["Nike", "Adidas"],
    parentId: 2,
    parentName: "Clothing"
  },
  {
    id: 7, 
    name: "Women's Clothing", 
    description: "Clothing for women",
    createdAt: new Date(2023, 5, 20).toISOString(),
    productCount: 62,
    brandRelations: ["Zara", "H&M"],
    parentId: 2,
    parentName: "Clothing"
  },
  {
    id: 8, 
    name: "Smartphones", 
    description: "Mobile phones and accessories",
    createdAt: new Date(2023, 6, 5).toISOString(),
    productCount: 78,
    brandRelations: ["Apple", "Samsung", "Xiaomi"],
    parentId: 1,
    parentName: "Electronics"
  }
];

export const CategoryService = {
  getAll: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get<Category[]>('/api/Category/categories');
      return response.data;
    } catch (error) {
      console.log('Using mock data due to API error:', error);
      return mockCategories;
    }
  },
  
  getById: async (id: number): Promise<Category> => {
    try {
      const response = await apiClient.get<Category>(`/api/Category/categories/${id}`);
      return response.data;
    } catch (error) {
      console.log('Using mock data due to API error:', error);
      const category = mockCategories.find(c => c.id === id);
      if (!category) throw new Error('Category not found');
      return category;
    }
  },
  
  create: async (category: CreateCategoryRequest): Promise<Category> => {
    try {
      const response = await apiClient.post<Category>('/api/Category/categories', category);
      return response.data;
    } catch (error) {
      console.log('Using mock data due to API error:', error);
      // For mock data, create a new category and add it to the list
      const newCategory: Category = {
        id: Math.max(...mockCategories.map(c => c.id)) + 1,
        name: category.name,
        description: category.description,
        createdAt: new Date().toISOString(),
        productCount: 0,
        brandRelations: []
      };
      
      // If parentId is provided, set the parent information
      if (category.parentId) {
        const parentCategory = mockCategories.find(c => c.id === category.parentId);
        if (parentCategory) {
          newCategory.parentId = parentCategory.id;
          newCategory.parentName = parentCategory.name;
        }
      }
      
      mockCategories.push(newCategory);
      return newCategory;
    }
  },
  
  update: async (id: number, category: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.put<Category>(`/api/Category/categories/${id}`, category);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/Category/categories/${id}`);
  }
};
