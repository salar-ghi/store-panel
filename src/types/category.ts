
export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}
