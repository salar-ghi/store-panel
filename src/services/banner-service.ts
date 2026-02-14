
import apiClient from '@/lib/api-client';
import { Banner, CreateBannerRequest } from '@/types/banner';

export class BannerService {
  static async getAllBanners(): Promise<Banner[]> {
    const response = await apiClient.get<Banner[]>('/api/Banner');
    return response.data;
  }

  static async getBannerById(id: string): Promise<Banner> {
    const response = await apiClient.get<Banner>(`/api/Banner/banners/${id}`);
    return response.data;
  }

  static async createBanner(bannerData: CreateBannerRequest): Promise<Banner> {
    const response = await apiClient.post<Banner>('/api/Banner', bannerData);
    return response.data;
  }

  static async updateBanner(id: string, bannerData: Partial<CreateBannerRequest>): Promise<Banner> {
    const response = await apiClient.put<Banner>(`/api/Banner/banners/${id}`, bannerData);
    return response.data;
  }

  static async deleteBanner(id: string): Promise<void> {
    await apiClient.delete(`/api/Banner/banners/${id}`);
  }

  static async toggleBannerStatus(id: string, active: boolean): Promise<Banner> {
    const response = await apiClient.patch<Banner>(`/api/Banner/banners/${id}/status`, { active });
    return response.data;
  }
}
