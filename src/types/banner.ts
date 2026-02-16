
export interface BannerPlacement {
  id: number;
  name: string;
  code: string;
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

export type BannerSize =
  | 0  // Small
  | 1  // Medium
  | 2  // Large
  | 3; // FullWidth

export type BannerType =
  | 0  // Advertisement
  | 1  // Informational
  | 2  // Seasonal
  | 3  // FeaturedProduct
  | 4; // CategoryHighlight

export const BannerSizeLabels: Record<BannerSize, string> = {
  0: "کوچک",
  1: "متوسط",
  2: "بزرگ",
  3: "تمام عرض",
};

export const BannerTypeLabels: Record<BannerType, string> = {
  0: "تبلیغاتی",
  1: "اطلاع‌رسانی",
  2: "فصلی",
  3: "محصول ویژه",
  4: "دسته‌بندی برجسته",
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

export interface CreatePlacementRequest {
  name: string;
  code: string;
  recommendedSize?: string;
}
