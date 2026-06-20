# Inventory Restock & Batch Pricing

## Concept

Products are created **once**. Every restock = a new **Stock Input (batch)** attached to the existing product, with its own cost price, sale price, quantity, supplier, shelf, received date, optional expiry. Current stock = Σ (batch.quantity − batch.soldQuantity) of active batches.

Each product picks its own **pricing strategy** for how its multi-batch price is exposed: FIFO, Latest, or Weighted-Average.

## What gets built

### 1. Types & service (`src/types/inventory-input.ts`, `src/services/inventory-input-service.ts`)

- `StockInput` model: `id, productId, productName, batchNumber, quantity, soldQuantity, costPrice, salePrice, currency, supplierId, supplierName, shelfId, shelfCode, receivedDate, expiryDate, notes`.
- `CreateStockInputRequest` mirrors the create payload.
- Service wired to planned endpoints:
  - `GET  /api/Inventory/inputs` (filter: productId, supplierId, from, to)
  - `POST /api/Inventory/inputs`
  - `GET  /api/Inventory/inputs/recent`
  - `GET  /api/Inventory/inputs/expiring`
- All calls go through `apiClient`; UI handles 404/empty gracefully so it works before backend ships.

### 2. Product pricing strategy

- Extend `Product` and `CreateProductRequest` with `pricingStrategy?: 'fifo' | 'latest' | 'average'` (default `'fifo'`).
- Add a small select in `ProductForm.tsx` "Pricing & Stock" section, Persian labels:
  - اولین ورودی، اولین خروج (FIFO)
  - آخرین قیمت
  - میانگین وزنی
- Helper `getEffectivePrice(product, batches)` in `src/lib/pricing.ts` returns the display price based on the chosen strategy.

### 3. "Add Stock Input" dialog (`src/components/inventory/AddStockInputDialog.tsx`)

Single dialog reused everywhere. Fields:

- Product picker (searchable, existing products only — cannot create new product here)
- Quantity + unit (read from product)
- Cost price, Sale price, Currency
- Supplier picker
- Shelf picker (StorageLocationPicker)
- Batch number (auto-suggested: `B-{productId}-{yyyymmdd}-{n}`)
- Received date (PersianDatePicker)
- Expiry date (PersianDatePicker, optional)
- Notes

Uses `useMutation`, invalidates `["stock-inputs"]`, `["products"]`, toasts success in Persian, refreshes the list automatically.

### 4. Inventory landing redesign (`src/pages/Inventory.tsx`)

New layout, RTL, semantic tokens only:

```text
┌───────────────────────────────────────────────────────┐
│  مدیریت انبار                  [+ ثبت ورود کالا]      │  ← primary CTA opens AddStockInputDialog
├───────────────────────────────────────────────────────┤
│  KPI strip: کل موجودی · فضاهای انبار · ورودی‌ها · کمبود │
├───────────────────────────┬───────────────────────────┤
│  هشدار کمبود موجودی       │  آخرین ورودی‌ها             │
│  product · qty · [شارژ]  │  product · qty · supplier  │
│  …                        │  …                         │
├───────────────────────────┼───────────────────────────┤
│  نزدیک به انقضا             │  دسترسی سریع                │
│  product · batch · 7 روز  │  فضاها · زون‌ها · قفسه‌ها      │
└───────────────────────────┴───────────────────────────┘
```

- "هشدار کمبود موجودی" lists products where `stock < reorderLevel`; each row has a "شارژ" button that pre-fills AddStockInputDialog with that product selected.
- "آخرین ورودی‌ها" hits `/inputs/recent` (or filters from full list).
- "نزدیک به انقضا" hits `/inputs/expiring`, shows days-left badge colored by urgency.
- "دسترسی سریع" links to existing `/inventory/storage`, `/inventory/locations`, `/inventory/inputs`.
- All numbers via `toPersianDigits`, dates via `formatPersianDateShort`.

### 5. Inputs page (`src/pages/inventory/InventoryInputs.tsx`)

Replace existing placeholder content with a real table powered by the new service: columns product, batch, qty, sold, cost, sale, supplier, shelf, received, expiry. Filter bar (product, supplier, date range). Same "+ ثبت ورود کالا" button opens the dialog.

### 6. Product detail integration

In `ViewProductDialog.tsx`, add a "ورودی‌های انبار" tab/section listing all batches for the product (qty remaining, prices, dates) with a "+ ورود جدید" button — same dialog, product pre-selected.

## Non-goals (this round)

- No automatic FIFO sale deduction logic on the order side (data model supports it via `soldQuantity`; wiring the sale flow to decrement specific batches is a follow-up).
- No backend implementation — UI is built against the planned routes above.
- No bulk import.

## Files

**Create**: `src/types/inventory-input.ts`, `src/services/inventory-input-service.ts`, `src/lib/pricing.ts`, `src/components/inventory/AddStockInputDialog.tsx`, `src/components/inventory/LowStockAlerts.tsx`, `src/components/inventory/RecentInputsList.tsx`, `src/components/inventory/ExpiringBatchesList.tsx`.

**Edit**: `src/types/product.ts` (+ `pricingStrategy`), `src/components/products/ProductForm.tsx` (strategy select), `src/pages/Inventory.tsx` (redesign), `src/pages/inventory/InventoryInputs.tsx` (real table), `src/components/products/ViewProductDialog.tsx` (batches section).

Approve and I'll build it end-to-end.
