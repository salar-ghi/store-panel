export interface BasketItem {
  id: string;
  productId: number;
  productName: string;
  productImage?: string;
  quantity: number;
  saleUnit?: 'piece' | 'weight';
  weightUnit?: 'gram' | 'kilogram';
  unitPrice: number;
  totalPrice: number;
  /** Whether the product is still purchasable / in stock. */
  available?: boolean;
}

export type BasketStatus = 'active' | 'abandoned' | 'converted' | 'merged';

export interface Basket {
  id: string;
  userId?: string;
  customerName: string;
  customerPhone?: string;
  /** Where the basket was created: storefront or this admin panel. */
  channel?: 'online' | 'panel';
  items: BasketItem[];
  total: number;
  status: BasketStatus;
  /** ISO date strings */
  createdAt: string;
  updatedAt: string;
  notes?: string;
  /** Set when the basket turned into an order. */
  orderId?: string;
}

export interface UpdateBasketRequest {
  items: Omit<BasketItem, 'id'>[];
  notes?: string;
  status?: BasketStatus;
}

export const BasketStatusLabels: Record<BasketStatus, string> = {
  active: 'فعال',
  abandoned: 'رهاشده',
  converted: 'تبدیل به سفارش',
  merged: 'ادغام‌شده',
};
