// Unified storage hierarchy for any retail/ecommerce scenario.
//
// Hierarchy:  StorageSpace → Zone (optional) → Shelf
//
// Examples:
// - Small FMCG super market with no extra room:
//     1 StorageSpace (type: store_floor) → multiple Shelves (S-A-1, S-A-2, ...)
// - Physical shop with basement:
//     2 StorageSpaces ("Showroom" + "Basement") → Shelves in each
// - Online ecommerce / dark store:
//     1+ StorageSpaces (type: warehouse) → Zones (Aisles) → Shelves with bin codes
// - Chain of multiple supermarkets:
//     N StorageSpaces (one per branch) → Zones → Shelves

export type StorageSpaceType =
  | 'store_floor'   // The shop floor itself (shelves customers can see)
  | 'back_room'     // Behind-the-counter / stock room
  | 'basement'      // Basement storage
  | 'warehouse'     // Dedicated warehouse building
  | 'dark_store'    // Online-only fulfillment center
  | 'other';

export interface StorageSpace {
  id: number;
  name: string;                // e.g. "Main Showroom", "Branch 3 Basement"
  type: StorageSpaceType;
  code?: string;               // short code, e.g. "MAIN", "BR3-BSMT"
  address?: string;            // optional postal address (for chains)
  description?: string;
  capacity: number;            // total unit capacity across all shelves
  used: number;                // currently used units
  isActive: boolean;
  createdAt: string;
}

export interface StorageZone {
  id: number;
  spaceId: number;
  name: string;                // e.g. "Aisle 3", "Cold Section", "Section A"
  code?: string;               // e.g. "A3", "COLD"
  description?: string;
}

export interface Shelf {
  id: number;
  spaceId: number;
  zoneId?: number;             // optional grouping
  code: string;                // unique pick code, e.g. "S-A-12", "B-COLD-04"
  name?: string;               // human label, e.g. "Top shelf, soft drinks"
  row?: number;                // optional grid position
  column?: number;
  level?: number;              // floor level on the rack (1 = bottom)
  capacity: number;            // unit capacity of this shelf
  used: number;                // units currently stored
  isActive: boolean;
}

export interface CreateStorageSpaceRequest {
  name: string;
  type: StorageSpaceType;
  code?: string;
  address?: string;
  description?: string;
  capacity: number;
}

export interface CreateStorageZoneRequest {
  spaceId: number;
  name: string;
  code?: string;
  description?: string;
}

export interface CreateShelfRequest {
  spaceId: number;
  zoneId?: number;
  code: string;
  name?: string;
  row?: number;
  column?: number;
  level?: number;
  capacity: number;
}

export const StorageSpaceTypeLabels: Record<StorageSpaceType, string> = {
  store_floor: 'فروشگاه (سالن فروش)',
  back_room: 'انباری پشت فروشگاه',
  basement: 'زیرزمین',
  warehouse: 'انبار اختصاصی',
  dark_store: 'انبار آنلاین (Dark Store)',
  other: 'سایر',
};

export const StorageSpaceTypeDescriptions: Record<StorageSpaceType, string> = {
  store_floor: 'قفسه‌هایی که مشتری مستقیم می‌بیند',
  back_room: 'فضای ذخیره پشت فروشگاه برای پر کردن قفسه‌ها',
  basement: 'زیرزمین برای نگهداری بلندمدت',
  warehouse: 'انبار جداگانه (مناسب فروشگاه زنجیره‌ای)',
  dark_store: 'انبار اختصاصی فروش آنلاین بدون دسترسی مشتری',
  other: 'هر فضای ذخیره‌سازی دیگر',
};
