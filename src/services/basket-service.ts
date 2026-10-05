import apiClient from '@/lib/api-client';
import { Basket, UpdateBasketRequest } from '@/types/basket';


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
