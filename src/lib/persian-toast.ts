import { toast } from "sonner";
import { persianNotification } from "@/lib/notification-message";

const fix = (v: unknown, fallback?: string) => (typeof v === "string" ? persianNotification(v, fallback) : v);
const fixOpts = (o: any) => (o && typeof o.description === "string" ? { ...o, description: fix(o.description, "") || undefined } : o);
const fallbacks: Record<string, string> = {
  success: "عملیات با موفقیت انجام شد",
  error: "عملیات انجام نشد؛ لطفاً دوباره تلاش کنید",
  warning: "لطفاً موارد را بررسی کنید",
  info: "اطلاع‌رسانی",
  message: "اطلاع‌رسانی",
  loading: "در حال پردازش…",
};

// Sanitize every sonner notification app-wide so users only see Persian text.
const t = toast as any;
if (!t.__persian) {
  for (const key of Object.keys(fallbacks)) {
    const orig = t[key];
    if (typeof orig === "function") t[key] = (msg: unknown, opts?: any) => orig(fix(msg, fallbacks[key]), fixOpts(opts));
  }
  t.__persian = true;
}
