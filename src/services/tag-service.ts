
import apiClient from '@/lib/api-client';
import { Tag, CreateTagRequest } from '@/types/tag';

export class TagService {
  static async getAllTags(): Promise<Tag[]> {
    const response = await apiClient.get<Tag[]>('/api/Catalog/tags');
    return response.data;
  }

  static async getTagById(id: string): Promise<Tag> {
    const response = await apiClient.get<Tag>(`/api/Catalog/tags/${id}`);
    return response.data;
  }

  static async createTag(tagData: CreateTagRequest): Promise<Tag> {
    const response = await apiClient.post<Tag>('/api/Catalog/tags', tagData);
    return response.data;
  }

  static async updateTag(id: string, tagData: Partial<CreateTagRequest>): Promise<Tag> {
    const response = await apiClient.put<Tag>(`/api/Catalog/tags/${id}`, tagData);
    return response.data;
  }

  static async deleteTag(id: string): Promise<void> {
    await apiClient.delete(`/api/Catalog/tags/${id}`);
  }
}
