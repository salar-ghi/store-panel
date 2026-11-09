# مشخصات و نیازمندی‌های توسعه بک‌اند بخش مالی (Finance Module Backend Specification)
## راهنمای پیاده‌سازی برای پروژه `salar-ghi/RetailEcommerce` (.NET Core / ASP.NET Web API)

این سند راهنمای جامع برای پیاده‌سازی متدها، اندپوینت‌ها و مدل‌های بخش مالی در کنترلر `FinanceController.cs` و سرویس‌های مالی `RetailEcommerce` است تا هماهنگی کامل (Symmetry) با پنل فرانت‌اند برقرار گردد.

---

### ۱. معماری کلی و مسیر پایه (Route Convention)
کلیه اندپوینت‌ها بر اساس قوانین Nginx و سرورهای لینوکسی باید با حروف کوچک (lowercase) تعریف شوند:
- **Base Route:** `[Route("api/finance")]`
- احراز هویت: `[Authorize(Roles = "Admin,FinanceManager,Accountant,BranchManager")]`

---

### ۲. اندپوینت‌های CRUD شعب و حساب‌ها (Branches & Financial Accounts)

#### الف) مدیریت شعب:
- `GET /api/finance/branches`
  - خروجی: `List<BranchDto>`
- `POST /api/finance/branches`
  - ورودی: `CreateBranchDto` (`name`, `code`, `type`, `city`, `manager`, `isActive`)
  - خروجی: `BranchDto` (201 Created)
- `PUT /api/finance/branches/{id}`
  - ورودی: `UpdateBranchDto`
  - خروجی: `BranchDto`

#### ب) مدیریت حساب‌های بانکی و صندوق‌ها:
- `GET /api/finance/accounts`
  - خروجی: `List<FinancialAccountDto>`
- `POST /api/finance/accounts`
  - ورودی: `CreateAccountDto` (`name`, `accountNumber`, `type`, `branchId`, `currency`, `balance`, `isActive`)
  - خروجی: `FinancialAccountDto`

---

### ۳. مدیریت قبوض دوره‌ای و تسویه دستی/خودکار (Recurring Bills)

- `GET /api/finance/bills`
  - خروجی: `List<RecurringBillDto>`
- `POST /api/finance/bills`
  - ورودی: `CreateBillDto` (`name`, `category`, `amount`, `currency`, `branchId`, `accountId`, `cycle`, `nextDueDate`, `vendor`, `autoPay`)
- `PUT /api/finance/bills/{id}`
  - ویرایش مشخصات یا مبلغ قبض
- `PATCH /api/finance/bills/{id}/auto-pay`
  - ورودی: `{ autoPay: bool }`
- `POST /api/finance/bills/{id}/pay`
  - **منطق عملیاتی:** کسر مبلغ قبض از حساب منتخب، ثبت تراکنش هزینه (`Transaction` با نوع `bill`)، ثبت سند حسابداری هزینه در صورت فعال بودن دفاتر دوبل، و محاسبه موعد بعدی (`nextDueDate`) بر مبنای چرخه (`cycle`).
  - ورودی: `{ accountId: Guid/string, note?: string, paymentDate?: DateTime }`
  - خروجی: `{ success: true, transactionId: string }`

---

### ۴. حقوق و دستمزد و پرداخت گروهی (Payroll Execution)

- `GET /api/finance/payroll`
  - خروجی: `List<PayrollEntryDto>`
- `POST /api/finance/payroll`
  - ورودی: `CreatePayrollEntryDto` (`employeeName`, `employeeId`, `position`, `branchId`, `baseSalary`, `bonus`, `deductions`, `netPay`, `period`, `currency`)
- `POST /api/finance/payroll/{id}/pay`
  - **منطق عملیاتی:** کسر از حساب بانکی، ثبت وضعیت فیش به `paid`، ثبت لاگ تراکنش حقوق (`salary`).
  - ورودی: `{ accountId: string, note?: string }`
- `POST /api/finance/payroll/run-cycle`
  - **اجرای دسته جمعی (Batch Run):**
  - ورودی: `{ period: string, branchId?: string, accountId: string }`
  - **تراکنش اتمیک (Database Transaction):** تمام فیش‌های `pending` مربوط به آن دوره در یک `using var transaction = await _dbContext.Database.BeginTransactionAsync()` به `paid` تغییر کرده و تراکنش بانکی تجمیعی یا تفکیکی ثبت می‌شود.
  - خروجی: `{ success: true, processedCount: int, totalAmount: decimal }`

---

### ۵. دفتر کل دوطرفه، اسناد دوبل و تراز آزمایشی (General Ledger & Double-Entry)

#### الف) درخت سرفصل حساب‌ها (Chart of Accounts):
- `GET /api/finance/chart-of-accounts`
  - خروجی سلسله‌مراتبی یا فلت: `List<ChartOfAccountDto>` (`code`, `name`, `nature` [asset/liability/equity/revenue/expense], `level` [group/general/subsidiary/detail], `debit`, `credit`, `balance`)
- `POST /api/finance/chart-of-accounts`
  - ایجاد سرفصل حساب جدید

#### ب) مراکز هزینه (Cost Centers):
- `GET /api/finance/cost-centers`
- `POST /api/finance/cost-centers`

#### ج) اسناد حسابداری دوبل (Journal Entries):
- `GET /api/finance/journal-entries?pageIndex=1&pageSize=20&search=...&branchId=...`
  - خروجی صفحه‌بندی شده اسناد دوبل.
- `POST /api/finance/journal-entries`
  - **قانون توازن (Strict Balance Validation):**
    ```csharp
    if (dto.Lines.Sum(l => l.Debit) != dto.Lines.Sum(l => l.Credit))
    {
        return BadRequest(new { message = "سند حسابداری تراز نیست. مجموع بدهکار باید برابر با مجموع بستانکار باشد." });
    }
    ```
  - **کنترل همزمانی و قفل خوش‌بینانه (Concurrency):** استفاده از ستون `byte[] RowVersion` یا وضعیت اتمیک روی موجودی حساب‌های مربوطه.

#### د) تراز آزمایشی ۴ ستونی (Trial Balance):
- `GET /api/finance/trial-balance?branchId=...&from=...&to=...`
  - خروجی: گردش بدهکار/بستانکار و مانده نهایی کلیه حساب‌ها در بازه تاریخی مشخص شده.

---

### ۶. فیلتر بازه تاریخی شمسی / میلادی در داشبورد و جریان وجوه (Overview & CashFlow)

- `GET /api/finance/summary?branchId=...&from=2025-01-01T00:00:00Z&to=2025-03-30T23:59:59Z`
- `GET /api/finance/cashflow?branchId=...&from=...&to=...`
  - پذیرش پارامترهای اختیاری `from` و `to` (فرمت ISO-8601 UTC) جهت محاسبه داینامیک درآمدها و هزینه‌های رخ داده در بازه مشخص.

---

### ۷. تاییدات مالی چند سطحی (Approvals & Roles)
- در مدل `Transaction`:
  - `ApprovedBy`: نام و نقش کاربر تاییدکننده
  - متدهای `POST /api/finance/transactions/{id}/approve` و `reject`
  - کنترل سقف مبالغ متناسب با Claims یا Role کاربر در صورت لزوم.
