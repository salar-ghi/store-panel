
export interface Brand {
  id: number;
  name: string;
  description: string;
  createdTime: string;
  logo?: string;
  categoryIds?: number[];
  categories?: { id: number; name: string }[];
}

export interface CreateBrandRequest {
  name: string;
  description: string;
  logo?: string;
  categoryIds?: number[];
}
