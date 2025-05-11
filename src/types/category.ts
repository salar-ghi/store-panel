
export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  productCount?: number;
  brandRelations?: string[];
  parentId?: number;
  parentName?: string;
  image?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  parentId?: number;
  image?: string;
}

export interface CategoryBrandRelation {
  brandId: number;
  brandName: string;
  productCount: number;
}
