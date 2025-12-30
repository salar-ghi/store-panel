export interface Supplier {
  id: number;
  name: string;
  contactInfo: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: boolean;
  isApproved?: boolean;
  rating?: number;
  joinDate?: Date;
  userId?: string;
  description?: string;
  website?: string;
  categories?: number[];
}

export interface CreateSupplierRequest {
  name: string;
  contactInfo: string;
  email?: string;
  phone?: string;
  address?: string;
  userId?: string;
  description?: string;
  website?: string;
  categories?: number[];
}

export type UpdateSupplierRequest = CreateSupplierRequest;
