import { z } from "zod";

export const ACCESS_ACTIONS = [
  { id: "read", label: "مشاهده" },
  { id: "write", label: "ایجاد" },
  { id: "update", label: "ویرایش" },
  { id: "delete", label: "حذف" },
] as const;

export const ACCESS_MODULES = [
  { id: "dashboard", label: "داشبورد و تحلیل", features: [["overview", "داشبورد"], ["analytics", "گزارش‌های تحلیلی"]] },
  { id: "catalog", label: "کاتالوگ", features: [["products", "محصولات"], ["categories", "دسته‌بندی و ویژگی‌ها"], ["brands", "برندها"], ["tags", "برچسب‌ها"]] },
  { id: "orders", label: "سفارش‌ها", features: [["orders", "ثبت و مدیریت سفارش"], ["returns", "مرجوعی‌ها"], ["analytics", "تحلیل سفارش‌ها"]] },
  { id: "inventory", label: "انبار", features: [["stock", "موجودی"], ["storage", "فضا، منطقه و قفسه"], ["inputs", "ورود کالا"]] },
  { id: "users", label: "کاربران", features: [["users", "کاربران و مدیران"], ["roles", "نقش‌ها و دسترسی‌ها"], ["segments", "بخش‌بندی مشتریان"], ["baskets", "سبدهای خرید"]] },
  { id: "suppliers", label: "تأمین‌کنندگان", features: [["suppliers", "مدیریت تأمین‌کنندگان"]] },
  { id: "marketing", label: "بازاریابی", features: [["promotions", "تخفیف‌ها"], ["banners", "بنرها"]] },
  { id: "finance", label: "امور مالی", features: [["overview", "نمای کلی"], ["transactions", "تراکنش‌ها"], ["approvals", "تأییدها"], ["bills", "صورتحساب‌ها"], ["payroll", "حقوق و دستمزد"], ["branches", "شعب و حساب‌ها"], ["reports", "گزارش‌های مالی"]] },
  { id: "communications", label: "ارتباطات", features: [["notifications", "اعلان‌ها"], ["messages", "پیام‌ها"], ["settings", "تنظیمات اعلان"]] },
  { id: "settings", label: "تنظیمات", features: [["settings", "تنظیمات سیستم"]] },
] as const;

export function modulePermissionKeys(moduleId: string): string[] {
  const module = ACCESS_MODULES.find((item) => item.id === moduleId);
  return module?.features.flatMap(([feature]: readonly [string, string]) => ACCESS_ACTIONS.map(({ id }) => `${module.id}.${feature}.${id}`)) ?? [];
}

export const permissionSchema = z.string().refine(
  (value) => ACCESS_MODULES.some((module) => modulePermissionKeys(module.id).includes(value)),
  "دسترسی انتخاب‌شده معتبر نیست",
);
export const requiredPermissionsSchema = z.array(permissionSchema).min(1, "حداقل یک بخش و نوع دسترسی انتخاب کنید");

export function toggleAccess(current: string[], key: string, checked: boolean): string[] {
  return checked ? [...new Set([...current, key])] : current.filter((item) => item !== key);
}

export function adminPermissionPayload(isAdmin: boolean, permissions: string[]): string[] {
  return isAdmin ? requiredPermissionsSchema.parse(permissions) : [];
}

export function permissionLabel(key: string): string {
  const action = ACCESS_ACTIONS.find((item) => item.id === key);
  if (action) return action.label;
  if (key === "all") return "همه دسترسی‌ها (قدیمی)";
  for (const module of ACCESS_MODULES) {
    for (const [feature, label] of module.features) {
      for (const action of ACCESS_ACTIONS) {
        if (key === `${module.id}.${feature}.${action.id}`) return `${label} · ${action.label}`;
      }
    }
  }
  return "دسترسی تعریف‌شده در سرور";
}