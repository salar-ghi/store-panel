
export interface Brand {
  id: number;
  name: string;
  description: string;
  createdTime: string;
}

export interface CreateBrandRequest {
  name: string;
  description: string;
}
