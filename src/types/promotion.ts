export type DiscountType = "percentage" | "fixed";
export type DiscountStatus = "active" | "expired" | "used" | "inactive";

export interface Discount {
  id: string;
  code: string;
  discountType: DiscountType;
  amount: number;
  startDate: string;
  endDate: string;
  minimumOrder?: number;
  maxUsage?: number;
  usedCount: number;
  description?: string;
  isActive: boolean;
  status: DiscountStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDiscountRequest {
  code: string;
  discountType: DiscountType;
  amount: number;
  startDate: string;
  endDate: string;
  minimumOrder?: number;
  maxUsage?: number;
  description?: string;
  isActive: boolean;
}
