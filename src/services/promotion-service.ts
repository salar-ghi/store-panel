import apiClient from "@/lib/api-client";
import { Discount, CreateDiscountRequest } from "@/types/promotion";

export class PromotionService {
  static async getAllDiscounts(): Promise<Discount[]> {
    const response = await apiClient.get<Discount[]>("/api/Promotion/discounts");
    return response.data;
  }

  static async getDiscountById(id: string): Promise<Discount> {
    const response = await apiClient.get<Discount>(`/api/Promotion/discounts/${id}`);
    return response.data;
  }

  static async createDiscount(data: CreateDiscountRequest): Promise<Discount> {
    const response = await apiClient.post<Discount>("/api/Promotion/discounts", data);
    return response.data;
  }

  static async updateDiscount(
    id: string,
    data: Partial<CreateDiscountRequest>
  ): Promise<Discount> {
    const response = await apiClient.put<Discount>(`/api/Promotion/discounts/${id}`, data);
    return response.data;
  }

  static async deleteDiscount(id: string): Promise<void> {
    await apiClient.delete(`/api/Promotion/discounts/${id}`);
  }
}
