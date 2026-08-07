import apiClient from '@/lib/api-client';
import { Basket, UpdateBasketRequest } from '@/types/basket';

/**
 * Backend endpoints expected for the basket (cart) module:
 *
 *   GET    /api/Basket/baskets                    → Basket[]  (supports ?status=&userId=)
 *   GET    /api/Basket/baskets/{id}               → Basket
 *   PUT    /api/Basket/baskets/{id}               → Basket    (edit items / notes / status)
 *   DELETE /api/Basket/baskets/{id}               → 204       (clear a basket)
 *   POST   /api/Basket/baskets/{id}/convert       → { orderId }  (turn basket into an order)
 *   POST   /api/Basket/baskets/{id}/remind        → 204       (send abandoned-cart reminder)
 */
export const BasketService = {
  list: async (): Promise<Basket[]> => {
    const res = await apiClient.get<Basket[]>('/api/Basket/baskets');
    return Array.isArray(res.data) ? res.data : [];
  },
  getById: async (id: string): Promise<Basket> => {
    const res = await apiClient.get<Basket>(`/api/Basket/baskets/${id}`);
    return res.data;
  },
  update: async (id: string, payload: UpdateBasketRequest): Promise<Basket> => {
    const res = await apiClient.put<Basket>(`/api/Basket/baskets/${id}`, payload);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/Basket/baskets/${id}`);
  },
  convertToOrder: async (id: string): Promise<{ orderId: string }> => {
    const res = await apiClient.post<{ orderId: string }>(`/api/Basket/baskets/${id}/convert`, {});
    return res.data;
  },
  remind: async (id: string): Promise<void> => {
    await apiClient.post(`/api/Basket/baskets/${id}/remind`, {});
  },
};
