
import apiClient from '@/lib/api-client';
import { Banner, BannerPlacement, CreateBannerRequest, CreatePlacementRequest } from '@/types/banner';

export class BannerService {
  // Banner endpoints
  static async getAllBanners(): Promise<Banner[]> {
    const response = await apiClient.get<Banner[]>('/api/Banner');
    return response.data;
  }

  static async getBannerById(id: number): Promise<Banner> {
    const response = await apiClient.get<Banner>(`/api/Banner/${id}`);
    return response.data;
  }

  static async createBanner(bannerData: CreateBannerRequest): Promise<Banner> {
    const response = await apiClient.post<Banner>('/api/Banner', bannerData);
    return response.data;
  }

  static async updateBanner(id: number, bannerData: Partial<CreateBannerRequest>): Promise<Banner> {
    const response = await apiClient.put<Banner>(`/api/Banner/${id}`, bannerData);
    return response.data;
  }

  static async deleteBanner(id: number): Promise<void> {
    await apiClient.delete(`/api/Banner/${id}`);
  }

  static async toggleBannerStatus(id: number, isActive: boolean): Promise<Banner> {
    const response = await apiClient.patch<Banner>(`/api/Banner/${id}/status`, { isActive });
    return response.data;
  }

  // BannerPlacement endpoints
  static async getAllPlacements(): Promise<BannerPlacement[]> {
    const response = await apiClient.get<BannerPlacement[]>('/api/BannerPlacement');
    return response.data;
  }

  static async getPlacementById(id: number): Promise<BannerPlacement> {
    const response = await apiClient.get<BannerPlacement>(`/api/BannerPlacement/${id}`);
    return response.data;
  }

  static async createPlacement(data: CreatePlacementRequest): Promise<BannerPlacement> {
    const response = await apiClient.post<BannerPlacement>('/api/BannerPlacement', data);
    return response.data;
  }

  static async updatePlacement(id: number, data: Partial<CreatePlacementRequest>): Promise<BannerPlacement> {
    const response = await apiClient.put<BannerPlacement>(`/api/BannerPlacement/${id}`, data);
    return response.data;
  }

  static async deletePlacement(id: number): Promise<void> {
    await apiClient.delete(`/api/BannerPlacement/${id}`);
  }
}
