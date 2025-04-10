
export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  productCount?: number;
  brandRelations?: string[];
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface CategoryBrandRelation {
  brandId: number;
  brandName: string;
  productCount: number;
}
