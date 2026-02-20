
export interface BannerPlacement {
  id: number;
  name: string;
  code: BannerPageCode;
  recommendedSize?: string;
  banners?: Banner[];
  createdDate?: string;
  modifiedDate?: string;
}

export interface Banner {
  id: number;
  name: string;
  description?: string;
  imageUrl: string;
  altText?: string;
  link?: string;
  callToActionText?: string;
  type: BannerType;
  startDate?: string;
  endDate?: string;
  size: BannerSize;
  priority: number;
  clickCount: number;
  viewCount: number;
  isActive: boolean;
  placements?: BannerPlacement[];
  createdDate?: string;
  modifiedDate?: string;
}

export type BannerPageCode =
  | 1  // HOME_TOP
  | 2  // HOME_BOTTOM
  | 3  // PRODUCT_MID
  | 4  // PRODUCT_TOP
  | 5; // PRODUCT_BOTTOM

export type BannerSize =
  | 1  // Small
  | 2  // Medium
  | 3  // Large
  | 4  // FullWidth
  | 5; // Custom

export type BannerType =
  | 1  // Advertisement
  | 2  // Notification
  | 3  // Seasonal
  | 4; // Promotion

export const BannerPageCodeLabels: Record<BannerPageCode, string> = {
  1: "بالای صفحه اصلی",
  2: "پایین صفحه اصلی",
  3: "وسط صفحه محصول",
  4: "بالای صفحه محصول",
  5: "پایین صفحه محصول",
};

export const BannerSizeLabels: Record<BannerSize, string> = {
  1: "کوچک",
  2: "متوسط",
  3: "بزرگ",
  4: "تمام عرض",
  5: "سفارشی",
};

export const BannerTypeLabels: Record<BannerType, string> = {
  1: "تبلیغاتی",
  2: "اطلاع‌رسانی",
  3: "فصلی",
  4: "تخفیف",
};

export interface CreateBannerRequest {
  name: string;
  description?: string;
  imageUrl: string;
  altText?: string;
  link?: string;
  callToActionText?: string;
  type: BannerType;
  startDate?: string;
  endDate?: string;
  size: BannerSize;
  priority?: number;
  isActive?: boolean;
  placementIds?: number[];
}
