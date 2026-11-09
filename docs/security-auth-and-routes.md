# مستندات امنیتی توکن و لاگین و قراردادهای نام‌گذاری Routeها

این مستند اقدامات امنیتی انجام‌شده در پنل ادمین (Frontend) و نیازمندی‌ها و اصلاحات ضروری مربوط به بک‌اند (.NET / ASP.NET Core) و وب‌سرور (Nginx / Linux) را تشریح می‌کند.

---

## ۱. چرخه حیات احراز هویت (Authentication Lifecycle) و امنیت توکن‌ها

### اقدامات انجام‌شده در فرانت‌اند (`src/lib/api-client.ts` و `src/lib/token.ts`):
1. **فعال‌سازی `withCredentials: true` در Axios:**
   - تنظیم `withCredentials: true` باعث ارسال خودکار کوکی‌های امن (`HttpOnly`, `SameSite`, `Secure`) در تمام درخواست‌های ارسالی به سرور بک‌اند می‌شود.
2. **مکانیزم هوشمند Refresh Token Rotation در Response Interceptor:**
   - در صورت بازگشت خطای ۴۰۱ از سرور، درخواست‌ها مسدود نشده و فورا کاربر را لاگ‌اوت نمی‌کنند.
   - درخواست Refresh Token به آدرس `/api/Auth/refresh` به صورت تک‌باره (با جلوگیری از ارسال مکرر درخواست‌های همزمان با استفاده از صف `failedQueue`) ارسال می‌شود.
   - در صورت موفقیت Refresh Token، اکسس‌توکن جدید بروزرسانی شده و درخواست‌های موجود در صف دوباره ارسال (Retry) می‌شوند.
   - در صورت ناموفق بودن عملیات رفرش توکن، کاربر با حفظ امنیت هدایت به `/login?expired=1` می‌شود.
3. **اعتبارسنجی انقضا بر اساس کلیم رسمی سرور (`exp`):**
   - تابع `parseJwtExpiry` کلیم استاندارد `exp` موجود در توکن JWT را استخراج کرده و به جای اتکا به حدس و زمان کلاینت، زمان انقضای رسمی تعیین‌شده توسط سرور را مبنا قرار می‌دهد.

### نیازمندی‌های ضروری در بک‌اند (.NET):
1. **فعال‌سازی کوکی HttpOnly برای Refresh Token:**
   - سرور بک‌اند باید Refresh Token را در پاسخ به لاگین یا رفرش به صورت کوکی با مشخصات زیر ست کند:
     ```csharp
     Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
     {
         HttpOnly = true,
         Secure = true, // در محیط Production بر روی HTTPS
         SameSite = SameSiteMode.Strict, // یا Lax در صورت نیاز به جریان‌های Redirect خاص
         Expires = DateTimeOffset.UtcNow.AddDays(7)
     });
     ```
2. **حذف کامنت و فعال‌سازی مجوزهای رول در کنترلرها (`FinanceController.cs`):**
   - کامنت بودن صفت اعتبارسنجی رول‌ها در کنترلر مالی، مانند:
     ```csharp
     // [Authorize(Roles = "Admin,FinanceManager")]
     ```
     یک آسیب‌پذیری امنیتی فوری است که امکان دسترسی غیرمجاز به اطلاعات حساس بانکی و مالی را می‌دهد.
   - **اصلاح الزامی:** باید کامنت برداشته شود و سطح دسترسی صریحا اعمال گردد:
     ```csharp
     [Authorize(Roles = "Admin,FinanceManager")]
     [ApiController]
     [Route("api/finance")]
     public class FinanceController : ControllerBase
     {
         // ...
     }
     ```

---

## ۲. قراردادهای نام‌گذاری و هماهنگی Case در Routeها

### مشکل شناسایی‌شده:
در وب‌سرورهای لینوکسی و Nginx، مسیرهای URL به‌صورت پیش‌فرض نسبت به بزرگی و کوچکی حروف حساس (Case-Sensitive) هستند. مغایرت مسیرها (مثلا تعریف `[Route("api/finance")]` در بک‌اند با حروف کوچک و ارسال درخواست به `/api/Finance` از فرانت‌اند) منجر به خطای `404 Not Found` در سرور Production لینوکسی می‌شد.

### اقدامات انجام‌شده در فرانت‌اند:
- در `src/services/finance-service.ts` بیس روت از `/api/Finance` به `/api/finance` اصلاح شد تا با کنترلر بک‌اند و سرور لینوکس کاملا همخوانی داشته باشد.

### استانداردسازی در بک‌اند (.NET):
برای جلوگیری از هرگونه ناهماهنگی در کنترلرهای مختلف (`/api/Product/`, `/api/Order/`, `/api/finance`):
1. **پیکربندی خودکار Lowercase URLs در `Program.cs` یا `Startup.cs`:**
   ```csharp
   builder.Services.AddRouting(options =>
   {
       options.LowercaseUrls = true;
       options.LowercaseQueryStrings = false;
   });
   ```
2. **تنظیم Nginx (در صورت نیاز):**
   در صورت تمایل به Case-Insensitive routing در Nginx، می‌توان از regex با فلگ `~*` استفاده کرد، اما بهترین روش استانداردسازی آدرس‌ها به فرم حروف کوچک (lowercase kebab-case یا lowercase) در تنظیمات ASP.NET Core است.
