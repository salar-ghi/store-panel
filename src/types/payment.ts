// Payment splits used by orders & returns. Supports hybrid payment
// (e.g. half cash, half card, remainder as credit/debt).

export type OrderPaymentMethod =
  | 'cash'
  | 'card'
  | 'bank_transfer'
  | 'online_gateway'
  | 'wallet'
  | 'cheque'
  | 'credit'; // طلب / قسط — paid later

export interface PaymentSplit {
  id: string;
  method: OrderPaymentMethod;
  amount: number;
  /** Card / bank ref / cheque number / gateway txn id. Required for card & online_gateway. */
  gatewayTxnId?: string;
  reference?: string;
  /** When method === 'credit', the date the customer should pay by. */
  dueDate?: string;
  note?: string;
}

export const PaymentMethodLabels: Record<OrderPaymentMethod, string> = {
  cash: 'نقدی',
  card: 'کارت‌خوان',
  bank_transfer: 'انتقال بانکی',
  online_gateway: 'درگاه پرداخت',
  wallet: 'کیف پول',
  cheque: 'چک',
  credit: 'بدهی (پرداخت در آینده)',
};

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  paid: 'پرداخت شده',
  partial: 'پرداخت ناقص',
  unpaid: 'پرداخت نشده',
};

export interface OrderDiscount {
  type: 'percent' | 'amount';
  value: number;
}
