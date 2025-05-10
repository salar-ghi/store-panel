
export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  productCount?: number;
  brandRelations?: string[];
  parentId?: number;
  parentName?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  parentId?: number;
}

export interface CategoryBrandRelation {
  brandId: number;
  brandName: string;
  productCount: number;
}
