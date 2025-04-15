
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTagRequest {
  name: string;
  description?: string;
  color?: string;
}
