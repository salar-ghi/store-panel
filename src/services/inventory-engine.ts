// Inventory engine — single source of truth for "what is sellable, where".
// Seeds from real products (or falls back to mocks) and distributes each
// product's stock across the shelves defined in StorageService.

import { StorageService } from './storage-service';
import { mockProducts } from '@/data/ordersData';
import type { Product } from '@/types/product';

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
let _seededKey: string | null = null;

function keyForProducts(products: Product[]): string {
  return products
    .map((p) => `${p.id}:${p.stock?.quantity ?? p.stockQuantity ?? 0}`)
    .join('|');
}

async function ensureInit(productsOverride?: Product[]) {
  const source: Product[] =
    productsOverride && productsOverride.length > 0
      ? productsOverride
      : (mockProducts as unknown as Product[]);
  const key = keyForProducts(source);
  if (_stockMap && _seededKey === key) return;

  const [spaces, zones, shelves] = await Promise.all([
    StorageService.getSpaces(),
    StorageService.getZones(),
    StorageService.getShelves(),
  ]);

  _stockMap = new Map();
  _seededKey = key;
  if (shelves.length === 0) return;

  source.forEach((p, idx) => {
    const total = p.stock?.quantity ?? p.stockQuantity ?? 0;
    if (total <= 0) return;

    // Prefer the product's own configured shelf when available.
    const configuredShelf =
      p.stock?.shelfId != null
        ? shelves.find((s) => s.id === p.stock!.shelfId)
        : undefined;
    const primary = configuredShelf ?? shelves[idx % shelves.length];
    const useSecondary = !configuredShelf && total > 30 && shelves.length > 1;
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
  /** Seed the engine from a real product list (usually from the backend). */
  async seed(products: Product[]): Promise<void> {
    await ensureInit(products);
  },

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
