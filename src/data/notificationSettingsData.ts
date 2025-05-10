
import { AlertCircle, MessageSquare, Package, ShoppingCart, User } from "lucide-react";

export interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  icon: React.ElementType;
}

export const initialSettings: NotificationSetting[] = [
  {
    id: "order_status",
    title: "وضعیت سفارش",
    description: "اطلاع‌رسانی در مورد تغییر وضعیت سفارشات",
    email: true,
    push: true,
    sms: true,
    inApp: true,
    icon: ShoppingCart,
  },
  {
    id: "inventory_alerts",
    title: "هشدار موجودی کالا",
    description: "اطلاع‌رسانی در مورد کمبود موجودی محصولات",
    email: true,
    push: true,
    sms: false,
    inApp: true,
    icon: Package,
  },
  {
    id: "customer_messages",
    title: "پیام‌های مشتریان",
    description: "دریافت پیام‌های جدید از مشتریان",
    email: true,
    push: true,
    sms: false,
    inApp: true,
    icon: MessageSquare,
  },
  {
    id: "user_registration",
    title: "ثبت‌نام کاربران",
    description: "اطلاع‌رسانی درباره کاربران جدید ثبت‌نام شده",
    email: true,
    push: false,
    sms: false,
    inApp: true,
    icon: User,
  },
  {
    id: "system_alerts",
    title: "هشدارهای سیستمی",
    description: "خطاها و مشکلات سیستم",
    email: true,
    push: true,
    sms: true,
    inApp: true,
    icon: AlertCircle,
  },
];
