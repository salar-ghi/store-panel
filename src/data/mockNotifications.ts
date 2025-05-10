
import { NotificationType } from "@/types/notification";

// Mock data for notifications
export const mockNotifications: NotificationType[] = [
  {
    id: 1,
    title: "کمبود موجودی انبار",
    message: "موجودی محصول «گوشی سامسونگ A52» به کمتر از حد تعیین شده رسیده است",
    type: "inventory",
    priority: "high",
    read: false,
    date: "1402/02/23 13:45"
  },
  {
    id: 2,
    title: "سفارش جدید",
    message: "یک سفارش جدید به مبلغ 2,500,000 تومان دریافت شد",
    type: "order",
    priority: "medium",
    read: false,
    date: "1402/02/23 10:20"
  },
  {
    id: 3,
    title: "کاربر جدید",
    message: "کاربر جدیدی با ایمیل example@example.com ثبت نام کرد",
    type: "user",
    priority: "low",
    read: true,
    date: "1402/02/22 16:30"
  },
  {
    id: 4,
    title: "مرجوعی جدید",
    message: "یک درخواست مرجوعی برای سفارش RET-003 ثبت شده است",
    type: "return",
    priority: "medium",
    read: false,
    date: "1402/02/22 14:15"
  },
  {
    id: 5,
    title: "خطای سیستم",
    message: "خطایی در پردازش پرداخت برای سفارش ORD-7851 رخ داده است",
    type: "system",
    priority: "high",
    read: true,
    date: "1402/02/22 09:05"
  },
  {
    id: 6,
    title: "تغییر قیمت",
    message: "قیمت 5 محصول به‌روزرسانی شد. لطفا بررسی کنید.",
    type: "inventory",
    priority: "medium",
    read: true,
    date: "1402/02/21 17:40"
  },
  {
    id: 7,
    title: "تخفیف جدید",
    message: "کد تخفیف SUMMER30 با موفقیت ایجاد و فعال شد",
    type: "promotion",
    priority: "medium",
    read: true,
    date: "1402/02/21 11:55"
  },
];
