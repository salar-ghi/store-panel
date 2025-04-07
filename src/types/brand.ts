
export interface Brand {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export interface CreateBrandRequest {
  name: string;
  description: string;
}
