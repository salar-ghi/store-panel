
export interface Supplier {
  id: number;
  name: string;
  contactInfo: string;
  email?: string;
  phone?: string;
  address?: string;
  isApproved?: boolean;
  rating?: number;
  joinDate?: Date;
  userId?: string; // Link to a user account
  description?: string;
  website?: string;
  categories?: number[]; // Categories they supply
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

// UpdateSupplierRequest is the same as CreateSupplierRequest
export type UpdateSupplierRequest = CreateSupplierRequest;
