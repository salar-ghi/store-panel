import { Discount, DiscountScope } from "@/types/promotion";
import { OrderItem } from "@/types/order";

export interface DiscountEvalContext {
  items: OrderItem[];
  subtotal: number;
  customerId?: string;
  customerRoleIds?: string[];
}

export interface DiscountEvalResult {
  eligible: boolean;
  reason?: string;
  /** Amount in toman deducted from the order subtotal. */
  amount: number;
  /** Which line items the discount applied to (for reporting). */
  matchedItemIds: string[];
}

/** Returns whether a discount is currently in its active window. */
export function isDiscountActive(d: Discount, now = new Date()): boolean {
  if (!d.isActive) return false;
  if (new Date(d.startDate) > now) return false;
  if (new Date(d.endDate) < now) return false;
  if (d.maxUsage && d.usedCount >= d.maxUsage) return false;
  return true;
}

function computeAmount(d: Discount, applicable: number): number {
  if (d.discountType === "percentage") {
    return Math.round((applicable * Math.min(100, Math.max(0, d.amount))) / 100);
  }
  return Math.min(applicable, Math.round(d.amount));
}

function scopeMatchesItems(scope: DiscountScope, items: OrderItem[]): OrderItem[] {
  switch (scope.type) {
    case "categories":
      return items.filter((i) => scope.categoryIds?.includes(i.categoryId));
    case "brands":
      return items.filter((i) => scope.brandIds?.includes(i.brandId));
    case "products":
      return items.filter((i) => scope.productIds?.includes(i.productId));
    default:
      return items;
  }
}

export function evaluateDiscount(
  d: Discount,
  ctx: DiscountEvalContext,
): DiscountEvalResult {
  if (!isDiscountActive(d)) {
    return { eligible: false, reason: "کد تخفیف فعال نیست یا منقضی شده", amount: 0, matchedItemIds: [] };
  }
  if (d.minimumOrder && ctx.subtotal < d.minimumOrder) {
    return {
      eligible: false,
      reason: `حداقل مبلغ سفارش برای این کد ${d.minimumOrder.toLocaleString("fa-IR")} تومان است`,
      amount: 0,
      matchedItemIds: [],
    };
  }

  const scope: DiscountScope = d.scope ?? { type: "all" };

  // Customer / role scoped
  if (scope.type === "users") {
    if (!ctx.customerId || !scope.userIds?.includes(ctx.customerId)) {
      return { eligible: false, reason: "این کد برای این مشتری معتبر نیست", amount: 0, matchedItemIds: [] };
    }
    const amount = computeAmount(d, ctx.subtotal);
    return { eligible: amount > 0, amount, matchedItemIds: ctx.items.map((i) => i.id) };
  }
  if (scope.type === "roles") {
    const has = scope.roleIds?.some((r) => ctx.customerRoleIds?.includes(r));
    if (!has) {
      return { eligible: false, reason: "این کد برای گروه کاربری این مشتری معتبر نیست", amount: 0, matchedItemIds: [] };
    }
    const amount = computeAmount(d, ctx.subtotal);
    return { eligible: amount > 0, amount, matchedItemIds: ctx.items.map((i) => i.id) };
  }

  // Product / category / brand scoped (or all)
  const matched = scopeMatchesItems(scope, ctx.items);
  if (scope.type !== "all" && matched.length === 0) {
    return {
      eligible: false,
      reason: "هیچ‌کدام از اقلام سفارش با محدوده این کد تخفیف مطابقت ندارند",
      amount: 0,
      matchedItemIds: [],
    };
  }
  const applicable =
    scope.type === "all"
      ? ctx.subtotal
      : matched.reduce((s, i) => s + i.totalPrice, 0);
  const amount = computeAmount(d, applicable);
  return {
    eligible: amount > 0,
    amount,
    matchedItemIds: (scope.type === "all" ? ctx.items : matched).map((i) => i.id),
  };
}

export const DiscountScopeLabels: Record<DiscountScope["type"], string> = {
  all: "همه سفارش‌ها (بدون محدودیت)",
  categories: "دسته‌بندی‌های خاص",
  brands: "برندهای خاص",
  products: "محصولات خاص",
  users: "کاربران خاص",
  roles: "گروه‌های کاربری",
};
