
export interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  targetLocation: BannerTargetLocation;
  size: BannerSize;
  type: BannerType;
  active: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type BannerTargetLocation = 
  | "homepage"
  | "product-list"
  | "category-page"
  | "checkout"
  | "all-pages";

export type BannerSize = 
  | "small"
  | "medium"
  | "large"
  | "full-width";

export type BannerType = 
  | "promotional"
  | "informational"
  | "seasonal"
  | "featured-product"
  | "category-highlight";

export interface CreateBannerRequest {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  targetLocation: BannerTargetLocation;
  size: BannerSize;
  type: BannerType;
  active?: boolean;
  startDate?: Date;
  endDate?: Date;
}
