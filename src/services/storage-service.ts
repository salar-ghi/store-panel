// Storage service — talks to the backend Inventory API.
// Endpoints (ASP.NET InventoryController):
//   GET/POST/PUT/DELETE  /api/inventory/spaces[/{id}]
//   GET/POST/PUT/DELETE  /api/inventory/zones[/{id}]   (GET supports ?spaceId=)
//   GET/POST/PUT/DELETE  /api/inventory/shelves[/{id}] (GET supports ?spaceId=&zoneId=)

import apiClient from '@/lib/api-client';
import {
  StorageSpace,
  StorageZone,
  Shelf,
  CreateStorageSpaceRequest,
  CreateStorageZoneRequest,
  CreateShelfRequest,
} from '@/types/storage';

const BASE = '/api/inventory';

export class StorageService {
  // ---- Spaces ----
  static async getSpaces(): Promise<StorageSpace[]> {
    const { data } = await apiClient.get<StorageSpace[]>(`${BASE}/spaces`);
    return data ?? [];
  }

  static async createSpace(data: CreateStorageSpaceRequest): Promise<StorageSpace> {
    const res = await apiClient.post<StorageSpace>(`${BASE}/spaces`, data);
    return res.data;
  }

  static async updateSpace(id: number, data: Partial<StorageSpace>): Promise<StorageSpace> {
    const res = await apiClient.put<StorageSpace>(`${BASE}/spaces/${id}`, data);
    return res.data;
  }

  static async deleteSpace(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/spaces/${id}`);
  }

  // ---- Zones ----
  static async getZones(spaceId?: number): Promise<StorageZone[]> {
    const { data } = await apiClient.get<StorageZone[]>(`${BASE}/zones`, {
      params: spaceId ? { spaceId } : undefined,
    });
    return data ?? [];
  }

  static async createZone(data: CreateStorageZoneRequest): Promise<StorageZone> {
    const res = await apiClient.post<StorageZone>(`${BASE}/zones`, data);
    return res.data;
  }

  static async updateZone(id: number, data: Partial<StorageZone>): Promise<StorageZone> {
    const res = await apiClient.put<StorageZone>(`${BASE}/zones/${id}`, data);
    return res.data;
  }

  static async deleteZone(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/zones/${id}`);
  }

  // ---- Shelves ----
  static async getShelves(filter?: { spaceId?: number; zoneId?: number }): Promise<Shelf[]> {
    const { data } = await apiClient.get<Shelf[]>(`${BASE}/shelves`, {
      params: filter && (filter.spaceId || filter.zoneId) ? filter : undefined,
    });
    return data ?? [];
  }

  static async createShelf(data: CreateShelfRequest): Promise<Shelf> {
    const res = await apiClient.post<Shelf>(`${BASE}/shelves`, data);
    return res.data;
  }

  static async updateShelf(id: number, data: Partial<Shelf>): Promise<Shelf> {
    const res = await apiClient.put<Shelf>(`${BASE}/shelves/${id}`, data);
    return res.data;
  }

  static async deleteShelf(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/shelves/${id}`);
  }
}
