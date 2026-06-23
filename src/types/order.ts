import { OrderDiscount, PaymentSplit, PaymentStatus } from './payment';

export interface OrderItem {
  id: string;
  productId: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  /** Quantity. Integer when saleUnit='piece', decimal when 'weight'. */
  quantity: number;
  /** How this line is priced: per piece or per weight unit. Defaults to 'piece'. */
  saleUnit?: 'piece' | 'weight';
  /** When saleUnit='weight', the weight unit being sold (e.g. 'kilogram'). */
  weightUnit?: 'gram' | 'kilogram';
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
  /** Linked user id (when picked from existing users). */
  customerId?: string;
  customer: string;
  customerPhone?: string;
  customerAddress?: string;
  items: OrderItem[];
  /** Items subtotal (sum of OrderItem.totalPrice). */
  total: number;
  /** Discount applied to the whole order. */
  discount?: OrderDiscount;
  discountAmount?: number;
  /** total - discountAmount. */
  finalTotal?: number;
  payments?: PaymentSplit[];
  paymentStatus?: PaymentStatus;
  status: 'pending' | 'approved' | 'rejected' | 'shipped' | 'delivered';
  date: string;
  notes?: string;
}

export interface CreateOrderRequest {
  customerId?: string;
  customer: string;
  customerPhone?: string;
  customerAddress?: string;
  items: Omit<OrderItem, 'id'>[];
  discount?: OrderDiscount;
  discountAmount?: number;
  total: number;
  finalTotal: number;
  payments: PaymentSplit[];
  paymentStatus: PaymentStatus;
  notes?: string;
}

export type ReturnReason =
  | 'damaged'
  | 'wrong_item'
  | 'changed_mind'
  | 'expired'
  | 'quality'
  | 'other';

export const ReturnReasonLabels: Record<ReturnReason, string> = {
  damaged: 'کالای آسیب‌دیده',
  wrong_item: 'محصول اشتباه',
  changed_mind: 'انصراف مشتری',
  expired: 'تاریخ گذشته',
  quality: 'کیفیت نامناسب',
  other: 'سایر',
};

export interface ReturnItem {
  orderItemId: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  reason: ReturnReason;
  note?: string;
}

export interface CreateReturnRequest {
  orderId: string;
  items: ReturnItem[];
  refunds: PaymentSplit[];
  totalRefund: number;
  notes?: string;
}
