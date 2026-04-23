// Storage service — currently uses in-memory mock data so the UI is fully usable
// before the backend endpoints are implemented. Swap mock helpers for apiClient
// calls once the real API is ready.

import {
  StorageSpace,
  StorageZone,
  Shelf,
  CreateStorageSpaceRequest,
  CreateStorageZoneRequest,
  CreateShelfRequest,
} from '@/types/storage';

let _spaces: StorageSpace[] = [
  {
    id: 1,
    name: 'سالن فروش اصلی',
    type: 'store_floor',
    code: 'MAIN',
    address: 'تهران، خیابان ولیعصر',
    capacity: 2000,
    used: 1200,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'زیرزمین فروشگاه',
    type: 'basement',
    code: 'BSMT',
    capacity: 1500,
    used: 800,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

let _zones: StorageZone[] = [
  { id: 1, spaceId: 1, name: 'راهرو نوشیدنی', code: 'A1' },
  { id: 2, spaceId: 1, name: 'راهرو خشکبار', code: 'A2' },
  { id: 3, spaceId: 2, name: 'بخش سرد', code: 'COLD' },
];

let _shelves: Shelf[] = [
  { id: 1, spaceId: 1, zoneId: 1, code: 'S-A1-01', name: 'قفسه نوشابه‌های گازدار', capacity: 200, used: 120, level: 1, isActive: true },
  { id: 2, spaceId: 1, zoneId: 1, code: 'S-A1-02', name: 'قفسه آبمیوه', capacity: 150, used: 90, level: 1, isActive: true },
  { id: 3, spaceId: 1, zoneId: 2, code: 'S-A2-01', name: 'قفسه برنج', capacity: 300, used: 250, level: 1, isActive: true },
  { id: 4, spaceId: 2, zoneId: 3, code: 'B-COLD-01', name: 'یخچال شماره ۱', capacity: 500, used: 200, level: 1, isActive: true },
];

let nextSpaceId = 3;
let nextZoneId = 4;
let nextShelfId = 5;

const delay = <T>(value: T, ms = 150): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export class StorageService {
  // ---- Spaces ----
  static getSpaces(): Promise<StorageSpace[]> {
    return delay([..._spaces]);
  }

  static createSpace(data: CreateStorageSpaceRequest): Promise<StorageSpace> {
    const created: StorageSpace = {
      id: nextSpaceId++,
      ...data,
      used: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    _spaces = [..._spaces, created];
    return delay(created);
  }

  static updateSpace(id: number, data: Partial<StorageSpace>): Promise<StorageSpace> {
    _spaces = _spaces.map((s) => (s.id === id ? { ...s, ...data } : s));
    return delay(_spaces.find((s) => s.id === id)!);
  }

  static deleteSpace(id: number): Promise<void> {
    _spaces = _spaces.filter((s) => s.id !== id);
    _zones = _zones.filter((z) => z.spaceId !== id);
    _shelves = _shelves.filter((sh) => sh.spaceId !== id);
    return delay(undefined);
  }

  // ---- Zones ----
  static getZones(spaceId?: number): Promise<StorageZone[]> {
    const list = spaceId ? _zones.filter((z) => z.spaceId === spaceId) : _zones;
    return delay([...list]);
  }

  static createZone(data: CreateStorageZoneRequest): Promise<StorageZone> {
    const created: StorageZone = { id: nextZoneId++, ...data };
    _zones = [..._zones, created];
    return delay(created);
  }

  static updateZone(id: number, data: Partial<StorageZone>): Promise<StorageZone> {
    _zones = _zones.map((z) => (z.id === id ? { ...z, ...data } : z));
    return delay(_zones.find((z) => z.id === id)!);
  }

  static deleteZone(id: number): Promise<void> {
    _zones = _zones.filter((z) => z.id !== id);
    _shelves = _shelves.map((sh) => (sh.zoneId === id ? { ...sh, zoneId: undefined } : sh));
    return delay(undefined);
  }

  // ---- Shelves ----
  static getShelves(filter?: { spaceId?: number; zoneId?: number }): Promise<Shelf[]> {
    let list = _shelves;
    if (filter?.spaceId) list = list.filter((s) => s.spaceId === filter.spaceId);
    if (filter?.zoneId) list = list.filter((s) => s.zoneId === filter.zoneId);
    return delay([...list]);
  }

  static createShelf(data: CreateShelfRequest): Promise<Shelf> {
    const created: Shelf = { id: nextShelfId++, ...data, used: 0, isActive: true };
    _shelves = [..._shelves, created];
    return delay(created);
  }

  static updateShelf(id: number, data: Partial<Shelf>): Promise<Shelf> {
    _shelves = _shelves.map((s) => (s.id === id ? { ...s, ...data } : s));
    return delay(_shelves.find((s) => s.id === id)!);
  }

  static deleteShelf(id: number): Promise<void> {
    _shelves = _shelves.filter((s) => s.id !== id);
    return delay(undefined);
  }
}
