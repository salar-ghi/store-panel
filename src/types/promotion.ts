export type DiscountType = "percentage" | "fixed";
export type DiscountStatus = "active" | "expired" | "used" | "inactive";

/**
 * Where the discount can be applied.
 * - `all`: any order, any product, any customer.
 * - `categories` | `brands` | `products`: at least one line item must match.
 * - `users`: only listed customers can use.
 * - `roles`: only customers with one of the listed roles (e.g. VIP) can use.
 */
export type DiscountScopeType =
  | "all"
  | "categories"
  | "brands"
  | "products"
  | "users"
  | "roles";

export interface DiscountScope {
  type: DiscountScopeType;
  categoryIds?: number[];
  brandIds?: number[];
  productIds?: number[];
  userIds?: string[];
  roleIds?: string[];
}

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
  scope?: DiscountScope;
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
  scope?: DiscountScope;
}
