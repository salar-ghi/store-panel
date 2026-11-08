import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginationParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
  [key: string]: unknown;
}

/**
 * Executes a GET request with graceful degradation and visible user feedback
 * whenever a network error or server failure occurs.
 */
export async function safeGet<T>(
  url: string,
  fallback: T,
  params?: Record<string, unknown>,
  errorMessage?: string
): Promise<T> {
  try {
    const { data } = await apiClient.get<any>(url, { params });
    if (data == null) return fallback;

    // Normalise wrapped list responses ({ items }, { data }, { result })
    if (Array.isArray(fallback)) {
      if (Array.isArray(data)) return data as T;
      const inner = data.items ?? data.data ?? data.result ?? data.value;
      return (Array.isArray(inner) ? inner : fallback) as T;
    }

    if (typeof data !== 'object' || Array.isArray(data)) return fallback;
    return { ...(fallback as any), ...(data.data && typeof data.data === 'object' ? data.data : data) } as T;
  } catch (err: any) {
    const status = err?.response?.status;
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.title ||
      err?.message ||
      'خطای ارتباط با سرور';

    console.warn(`[API] GET ${url} failed (${status || 'Network'}):`, msg);

    // Provide user feedback without crashing the page
    if (status >= 500) {
      toast.error('خطای سرور', {
        description: errorMessage || `ارتباط با سرویس ${url} با خطا مواجه شد (${status}). داده‌های پیش‌فرض نمایش داده می‌شوند.`,
      });
    } else if (!status || err.code === 'ERR_NETWORK') {
      toast.error('خطای اتصال به شبکه', {
        description: 'امکان برقراری تماس با سرور پشتیبان وجود ندارد. اتصال اینترنت خود را بررسی کنید.',
      });
    } else if (status === 403) {
      toast.error('عدم دسترسی', {
        description: 'شما دسترسی لازم برای مشاهده این بخش را ندارید.',
      });
    }

    return fallback;
  }
}
