import apiClient from '@/lib/api-client';
import {
  CreateStockInputRequest,
  StockInput,
  StockInputFilter,
} from '@/types/inventory-input';

const BASE = '/api/Inventory/inputs';

import { notifyApiError } from '@/lib/notify-error';

async function safeGet<T>(url: string, params?: Record<string, unknown>, fallback: T = [] as unknown as T): Promise<T> {
  try {
    const { data } = await apiClient.get<T>(url, { params });
    return data ?? fallback;
  } catch (err: any) {
    console.error(`[inventory-input] GET ${url} failed:`, err);
    if (err?.response?.status === 404) {
      return fallback;
    }
    notifyApiError(err, 'خطا در دریافت اطلاعات ورودی انبار');
    return fallback;
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
