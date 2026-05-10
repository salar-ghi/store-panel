export interface OrderItem {
  id: string;
  productId: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  // Inventory location this item is picked from
  spaceId?: number;
  spaceName?: string;
  zoneId?: number;
  zoneName?: string;
  shelfId?: number;
  shelfCode?: string;
}

export interface Order {
  id: string;
  customer: string;
  customerPhone?: string;
  customerAddress?: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "approved" | "rejected" | "shipped" | "delivered";
  date: string;
  notes?: string;
}

export interface CreateOrderRequest {
  customer: string;
  customerPhone?: string;
  customerAddress?: string;
  items: Omit<OrderItem, 'id'>[];
  notes?: string;
}
