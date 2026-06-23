import apiClient from '@/lib/api-client';
import { CreateOrderRequest, CreateReturnRequest, Order } from '@/types/order';
import { FinanceService } from './finance-service';
import { Transaction } from '@/types/finance';

// Maps order payment method → finance transaction method.
function toFinanceMethod(method: string): Transaction['method'] {
  switch (method) {
    case 'cash':
      return 'cash';
    case 'card':
      return 'card';
    case 'bank_transfer':
      return 'bank_transfer';
    case 'online_gateway':
      return 'online_gateway';
    case 'wallet':
      return 'wallet';
    case 'cheque':
      return 'cheque';
    default:
      return 'cash';
  }
}

export const OrderService = {
  list: async (): Promise<Order[]> => {
    const res = await apiClient.get<Order[]>('/api/Order/orders');
    return res.data;
  },
  create: async (payload: CreateOrderRequest): Promise<Order> => {
    const res = await apiClient.post<Order>('/api/Order/orders', payload);
    return res.data;
  },
  update: async (id: string, payload: Partial<CreateOrderRequest>): Promise<Order> => {
    const res = await apiClient.put<Order>(`/api/Order/orders/${id}`, payload);
    return res.data;
  },
  createReturn: async (payload: CreateReturnRequest): Promise<void> => {
    await apiClient.post(`/api/Order/orders/${payload.orderId}/returns`, payload);
  },

  /**
   * Posts financial transactions that mirror an order's payment splits so the
   * finance / cashflow modules stay in sync. Credit splits are skipped because
   * no money has actually changed hands yet — they become receivables.
   */
  syncPaymentsToFinance: async (order: Order, branchId = 'br-1', accountId = 'ac-1') => {
    if (!order.payments?.length) return;
    await Promise.all(
      order.payments
        .filter((p) => p.method !== 'credit')
        .map((split) =>
          FinanceService.createTransaction({
            type: 'sale',
            status: 'completed',
            amount: split.amount,
            currency: 'IRR',
            method: toFinanceMethod(split.method),
            accountId,
            branchId,
            category: 'sales',
            reference: order.id,
            counterparty: order.customer,
            description: `پرداخت سفارش ${order.id} (${split.method})${
              split.gatewayTxnId ? ` - کد پیگیری: ${split.gatewayTxnId}` : ''
            }`,
            date: new Date().toISOString(),
          }),
        ),
    );
  },

  /** Posts refund transactions for the finance module on returns. */
  syncRefundsToFinance: async (
    orderId: string,
    customer: string,
    payload: CreateReturnRequest,
    branchId = 'br-1',
    accountId = 'ac-1',
  ) => {
    await Promise.all(
      payload.refunds.map((split) =>
        FinanceService.createTransaction({
          type: 'refund',
          status: 'completed',
          amount: split.amount,
          currency: 'IRR',
          method: toFinanceMethod(split.method),
          accountId,
          branchId,
          category: 'returns',
          reference: orderId,
          counterparty: customer,
          description: `بازگشت وجه سفارش ${orderId} (${split.method})${
            split.gatewayTxnId ? ` - کد پیگیری: ${split.gatewayTxnId}` : ''
          }`,
          date: new Date().toISOString(),
        }),
      ),
    );
  },
};
