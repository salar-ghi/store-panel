const translations: Record<string, string> = {
  "Logged in as admin": "با حساب مدیر وارد شدید",
  "Logged in successfully": "با موفقیت وارد شدید",
  "Logged out successfully": "با موفقیت خارج شدید",
  "Account created successfully": "حساب کاربری با موفقیت ایجاد شد",
  "Failed to create account": "ایجاد حساب کاربری ناموفق بود",
  "Network Error": "ارتباط با سرور برقرار نشد؛ اتصال اینترنت را بررسی کنید",
  "Failed to fetch": "دریافت اطلاعات از سرور ناموفق بود",
  "Token expired": "نشست شما منقضی شده است؛ دوباره وارد شوید",
};

export function persianNotification(value: string, fallback = "عملیات انجام نشد؛ لطفاً دوباره تلاش کنید"): string {
  if (translations[value]) return translations[value];
  if (/timeout/i.test(value)) return "زمان پاسخ‌گویی سرور به پایان رسید؛ دوباره تلاش کنید";
  if (/\b401\b|unauthorized/i.test(value)) return "برای ادامه دوباره وارد شوید";
  if (/\b403\b|forbidden/i.test(value)) return "شما اجازه انجام این عملیات را ندارید";
  if (/\b400\b|validation failed/i.test(value)) return "اطلاعات واردشده معتبر نیست؛ فیلدهای الزامی را بررسی کنید";
  if (/\b404\b|not found/i.test(value)) return "اطلاعات درخواستی پیدا نشد";
  if (/\b50[0234]\b|internal server/i.test(value)) return "سرور با خطا مواجه شد؛ بعداً دوباره تلاش کنید";
  // Preserve meaningful Persian messages, including product names, but not HTML or stack traces.
  return /[\u0600-\u06ff]/.test(value) && !/<[^>]+>|\bat \w+.*:\d+/i.test(value) ? value : fallback;
}