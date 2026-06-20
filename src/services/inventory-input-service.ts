// Inventory Input service — talks to the planned backend endpoints
//   GET  /api/Inventory/inputs           (filter: productId, supplierId, from, to)
//   POST /api/Inventory/inputs
//   GET  /api/Inventory/inputs/recent
//   GET  /api/Inventory/inputs/expiring  (?days=30)
//
// All calls degrade gracefully so the UI keeps working before the backend
// ships these routes.

import apiClient from '@/lib/api-client';
import {
  CreateStockInputRequest,
  StockInput,
  StockInputFilter,
} from '@/types/inventory-input';

const BASE = '/api/Inventory/inputs';

async function safeGet<T>(url: string, params?: Record<string, unknown>, fallback: T = [] as unknown as T): Promise<T> {
  try {
    const { data } = await apiClient.get<T>(url, { params });
    return data ?? fallback;
  } catch (err: any) {
    // Treat missing endpoints as "no data yet" so the UI doesn't crash.
    if (err?.response?.status === 404 || err?.code === 'ERR_NETWORK') {
      return fallback;
    }
    throw err;
  }
}

export class InventoryInputService {
  static async getAll(filter?: StockInputFilter): Promise<StockInput[]> {
    return safeGet<StockInput[]>(BASE, filter as Record<string, unknown>, []);
  }

  static async getByProduct(productId: number): Promise<StockInput[]> {
    return safeGet<StockInput[]>(BASE, { productId }, []);
  }

  static async getRecent(limit = 10): Promise<StockInput[]> {
    return safeGet<StockInput[]>(`${BASE}/recent`, { limit }, []);
  }

  static async getExpiring(days = 30): Promise<StockInput[]> {
    return safeGet<StockInput[]>(`${BASE}/expiring`, { days }, []);
  }

  static async create(data: CreateStockInputRequest): Promise<StockInput> {
    const res = await apiClient.post<StockInput>(BASE, data);
    return res.data;
  }

  /** Suggested batch code: B-{productId}-YYYYMMDD-{rand} */
  static suggestBatchNumber(productId: number): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const rnd = Math.floor(Math.random() * 900 + 100);
    return `B-${productId || 'X'}-${date}-${rnd}`;
  }
}
