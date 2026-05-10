// Inventory engine — single source of truth for "what is sellable, where".
// Mock layer that distributes each product's stock across the shelves defined
// in StorageService. Replace `ensureInit` body with real API calls when the
// backend exists; the public API of this module should not need to change.

import { StorageService } from './storage-service';
import { mockProducts } from '@/data/ordersData';

export interface StockLocation {
  spaceId: number;
  spaceName: string;
  zoneId?: number;
  zoneName?: string;
  shelfId: number;
  shelfCode: string;
  shelfName?: string;
  available: number; // sellable units (already net of reserved)
  reserved: number;
}

export interface InventoryScope {
  spaceId?: number; // limit to a specific storage space (acts as "branch/warehouse")
  zoneId?: number;
}

let _stockMap: Map<number, StockLocation[]> | null = null;

async function ensureInit() {
  if (_stockMap) return;
  const [spaces, zones, shelves] = await Promise.all([
    StorageService.getSpaces(),
    StorageService.getZones(),
    StorageService.getShelves(),
  ]);

  _stockMap = new Map();
  if (shelves.length === 0) return;

  mockProducts.forEach((p, idx) => {
    const total = p.stockQuantity ?? 0;
    if (total <= 0) return;

    // distribute across 1–2 shelves so a product can live in multiple places
    const primary = shelves[idx % shelves.length];
    const useSecondary = total > 30 && shelves.length > 1;
    const secondary = useSecondary ? shelves[(idx + 1) % shelves.length] : null;

    const parts: Array<{ shelf: typeof primary; qty: number }> = secondary
      ? [
          { shelf: primary, qty: Math.ceil(total * 0.6) },
          { shelf: secondary, qty: Math.floor(total * 0.4) },
        ]
      : [{ shelf: primary, qty: total }];

    const locs: StockLocation[] = parts.map((part) => {
      const sp = spaces.find((s) => s.id === part.shelf.spaceId);
      const zn = zones.find((z) => z.id === part.shelf.zoneId);
      return {
        spaceId: part.shelf.spaceId,
        spaceName: sp?.name ?? `فضا ${part.shelf.spaceId}`,
        zoneId: part.shelf.zoneId,
        zoneName: zn?.name,
        shelfId: part.shelf.id,
        shelfCode: part.shelf.code,
        shelfName: part.shelf.name,
        available: part.qty,
        reserved: 0,
      };
    });

    _stockMap!.set(p.id, locs);
  });
}

function applyScope(locs: StockLocation[], scope?: InventoryScope) {
  let out = locs;
  if (scope?.spaceId) out = out.filter((l) => l.spaceId === scope.spaceId);
  if (scope?.zoneId) out = out.filter((l) => l.zoneId === scope.zoneId);
  return out;
}

export const InventoryEngine = {
  async getLocations(productId: number, scope?: InventoryScope): Promise<StockLocation[]> {
    await ensureInit();
    const list = _stockMap!.get(productId) ?? [];
    return applyScope(list, scope).map((l) => ({ ...l }));
  },

  async getAvailable(productId: number, scope?: InventoryScope): Promise<number> {
    const locs = await this.getLocations(productId, scope);
    return locs.reduce((sum, l) => sum + Math.max(0, l.available - l.reserved), 0);
  },

  async getAvailableMap(productIds: number[], scope?: InventoryScope): Promise<Record<number, number>> {
    await ensureInit();
    const out: Record<number, number> = {};
    for (const pid of productIds) {
      const list = _stockMap!.get(pid) ?? [];
      out[pid] = applyScope(list, scope).reduce(
        (s, l) => s + Math.max(0, l.available - l.reserved),
        0,
      );
    }
    return out;
  },

  /** Reserve stock for an order item from a specific shelf. */
  async reserve(productId: number, shelfId: number, qty: number): Promise<boolean> {
    await ensureInit();
    const list = _stockMap!.get(productId);
    if (!list) return false;
    const loc = list.find((l) => l.shelfId === shelfId);
    if (!loc || loc.available - loc.reserved < qty) return false;
    loc.reserved += qty;
    return true;
  },
};
